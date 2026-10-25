/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  // Relative paths: the app works from any sub-path (GitHub Pages) and any static host (D-023).
  base: './',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      registerType: 'prompt',
      injectRegister: false,
      injectManifest: {
        // Everything the app needs offline, including the SQLite WebAssembly build and the pack.
        globPatterns: ['**/*.{html,js,css,wasm,sqlite,json,png,webmanifest,woff2,txt}'],
        maximumFileSizeToCacheInBytes: 20 * 1024 * 1024,
      },
      manifest: {
        name: 'Offline Knowledge',
        short_name: 'Offline',
        description: 'Practical knowledge that works without a connection.',
        lang: 'da',
        start_url: './',
        scope: './',
        display: 'standalone',
        background_color: '#f8f8f5',
        theme_color: '#1e5c48',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
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
