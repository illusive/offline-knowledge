/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { join, normalize } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// Answers /stead-maps/… locally, with HTTP range support, as GitHub Pages does for the published
// map (D-036): the dev server from a local full build (dist-map/, see scripts/map/build-map.ts),
// the preview server used by the offline tests from the small fixture (scripts/map/make-fixture.ts).
function localMaps(): Plugin {
  const serveFrom = (dir: string) => (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    const url = new URL(req.url ?? '/', 'http://localhost');
    const file = normalize(join(dir, decodeURIComponent(url.pathname)));
    if (!file.startsWith(dir) || !existsSync(file) || !statSync(file).isFile()) return next();
    const size = statSync(file).size;
    const type = file.endsWith('.json') ? 'application/json' : 'application/octet-stream';
    const range = /^bytes=(\d+)-(\d+)?$/.exec(req.headers.range ?? '');
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Content-Type', type);
    if (range) {
      const start = Number(range[1]);
      const end = Math.min(range[2] ? Number(range[2]) : size - 1, size - 1);
      if (start > end) {
        res.statusCode = 416;
        return res.end();
      }
      res.statusCode = 206;
      res.setHeader('Content-Range', `bytes ${start}-${end}/${size}`);
      res.setHeader('Content-Length', end - start + 1);
      return createReadStream(file, { start, end }).pipe(res);
    }
    res.setHeader('Content-Length', size);
    createReadStream(file).pipe(res);
  };
  return {
    name: 'local-maps',
    configureServer(server) {
      server.middlewares.use('/stead-maps', serveFrom(join(__dirname, 'dist-map')));
    },
    configurePreviewServer(server) {
      // Test-only switch (the tests run against the preview server): GET /stead-maps/__fail?file=…
      // makes that file answer 503, as during an outage; GET /stead-maps/__fail clears it.
      // Playwright cannot intercept requests made by a worker in WebKit, so the server does it.
      const failing = new Set<string>();
      let versionOverride: string | null = null;
      server.middlewares.use('/stead-maps', (req, res, next) => {
        const url = new URL(req.url ?? '/', 'http://localhost');
        // Test-only: GET /stead-maps/__version?v=20991231 makes the manifest announce a newer map
        // (same tiles), so the update flow can be tested; without v it goes back to normal.
        if (url.pathname === '/__version') {
          versionOverride = url.searchParams.get('v');
          return res.end('ok');
        }
        if (versionOverride && url.pathname.endsWith('/manifest.json')) {
          const manifest = JSON.parse(readFileSync(join(__dirname, 'e2e/fixtures/stead-maps', url.pathname), 'utf8')) as { version: string };
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ ...manifest, version: versionOverride }));
        }
        if (url.pathname === '/__fail') {
          failing.clear();
          const file = url.searchParams.get('file');
          if (file) failing.add(file);
          return res.end('ok');
        }
        if ([...failing].some((f) => url.pathname.endsWith(`/${f}`))) {
          res.statusCode = 503;
          return res.end();
        }
        next();
      });
      server.middlewares.use('/stead-maps', serveFrom(join(__dirname, 'e2e/fixtures/stead-maps')));
    },
  };
}

export default defineConfig({
  // Relative paths: the app works from any sub-path (GitHub Pages) and any static host (D-023).
  base: './',
  plugins: [
    localMaps(),
    react(),
    tailwindcss(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      registerType: 'prompt',
      injectRegister: false,
      injectManifest: {
        // Everything the app needs offline, including the SQLite WebAssembly build, the pack and the
        // map overview with its fonts and icons (D-036). Downloaded map areas are not precached.
        globPatterns: ['**/*.{html,js,mjs,css,wasm,sqlite,json,png,svg,webmanifest,woff2,txt,pbf,pmtiles}'],
        maximumFileSizeToCacheInBytes: 20 * 1024 * 1024,
      },
      manifest: {
        name: 'stead',
        short_name: 'stead',
        description: 'Practical knowledge that works without a connection.',
        lang: 'da',
        start_url: './',
        scope: './',
        display: 'standalone',
        background_color: '#f3f3ef',
        theme_color: '#f3f3ef',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
  worker: { format: 'es' },
  // The SQLite WebAssembly package locates its .wasm file relative to itself; do not pre-bundle it.
  optimizeDeps: { exclude: ['@sqlite.org/sqlite-wasm'] },
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
});
