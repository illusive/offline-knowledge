// Builds a country map archive for the offline map (D-036) from a pinned Protomaps daily build
// (OpenStreetMap data, ODbL), cut to the country outline. Only the tiles inside the outline are
// downloaded, by HTTP range requests.
//
//   node scripts/map/build-map.ts --date 20261024 --maxzoom 15 --out dist-map/dk
//       → <out>/manifest.json and <out>/dk-<date>.<nnn> parts (≤ 64 MB each, for GitHub Pages)
//   node scripts/map/build-map.ts --date 20261024 --maxzoom 8 --overview public/map/overview.pmtiles
//       → one small archive bundled with the app
//
// Boundaries: content/map/boundaries (geoBoundaries, CC BY 4.0): ADM0 outline, ADM1 regions.

import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { parseArgs } from 'node:util';
import { coverTiles, mergeRanges, type MultiPolygon } from '../../src/map/area.ts';
import type { MapManifest } from '../../src/map/manifest.ts';
import { Archive, type Located } from '../../src/map/pmtiles.ts';
import { writePmtiles, type TileInput } from './write-pmtiles.ts';

const { values: args } = parseArgs({
  options: {
    date: { type: 'string' },
    maxzoom: { type: 'string', default: '15' },
    out: { type: 'string' },
    overview: { type: 'string' },
    'part-mb': { type: 'string', default: '64' },
  },
});
if (!args.date || !/^\d{8}$/.test(args.date)) throw new Error('--date YYYYMMDD (a Protomaps daily build) is required');
const maxZoom = Number(args.maxzoom);
const source = `https://build.protomaps.com/${args.date}.pmtiles`;
const boundaries = new URL('../../../content/map/boundaries/', import.meta.url).pathname;

interface GeoFeature {
  properties: { shapeName: string; shapeISO?: string };
  geometry: { type: 'Polygon' | 'MultiPolygon'; coordinates: unknown };
}
const polygonsOf = (g: GeoFeature['geometry']): MultiPolygon =>
  (g.type === 'MultiPolygon' ? g.coordinates : [g.coordinates]) as MultiPolygon;
// Four decimals (about 10 m) are plenty for choosing tiles and keep the manifest small.
const round = (p: MultiPolygon): MultiPolygon =>
  p.map((poly) => poly.map((ring) => ring.map(([x, y]) => [Math.round(x * 1e4) / 1e4, Math.round(y * 1e4) / 1e4] as [number, number])));
const country = (JSON.parse(readFileSync(join(boundaries, 'dnk-ADM0.geojson'), 'utf8')) as { features: GeoFeature[] }).features[0];
const regions = (JSON.parse(readFileSync(join(boundaries, 'dnk-ADM1.geojson'), 'utf8')) as { features: GeoFeature[] }).features;
if (!country) throw new Error('No country outline');
const outline = round(polygonsOf(country.geometry));

async function readRange(offset: number, length: number): Promise<Uint8Array> {
  for (let attempt = 1; ; attempt++) {
    try {
      const response = await fetch(source, { headers: { Range: `bytes=${offset}-${offset + length - 1}` } });
      if (response.status !== 206) throw new Error(`HTTP ${response.status}`);
      const bytes = new Uint8Array(await response.arrayBuffer());
      if (bytes.length !== length) throw new Error(`Short read: ${bytes.length} of ${length}`);
      return bytes;
    } catch (error) {
      if (attempt >= 4) throw error;
      await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
  }
}

const archive = await Archive.open(readRange);
const tiles = coverTiles({ kind: 'polygon', polygons: outline }, 0, maxZoom);
const located: Located[] = [];
for (let i = 0; i < tiles.length; i += 4000) {
  const batch = await Promise.all(tiles.slice(i, i + 4000).map((t) => archive.locate(t.z, t.x, t.y)));
  for (const t of batch) if (t) located.push(t);
}
const ranges = mergeRanges(located);
const total = ranges.reduce((s, r) => s + r.length, 0);
console.log(`${located.length} tiles, ${ranges.length} ranges, ${(total / 1e6).toFixed(1)} MB to download from ${source}`);

// Download the ranges, four at a time, keeping each tile's bytes.
const byOffset = new Map<number, Uint8Array>();
const wanted = [...new Map(located.map((t) => [t.offset, t.length])).entries()].sort((a, b) => a[0] - b[0]);
let next = 0;
let done = 0;
const worker = async () => {
  for (let i = next++; i < ranges.length; i = next++) {
    const r = ranges[i];
    if (!r) break;
    const bytes = await readRange(r.offset, r.length);
    for (const [offset, length] of wanted) {
      if (offset >= r.offset && offset + length <= r.offset + r.length) byOffset.set(offset, bytes.slice(offset - r.offset, offset - r.offset + length));
    }
    done += r.length;
    process.stdout.write(`\r${((done / total) * 100).toFixed(0)} %`);
  }
};
await Promise.all([worker(), worker(), worker(), worker()]);
process.stdout.write('\n');

const inputs: TileInput[] = located.map((t) => {
  const data = byOffset.get(t.offset);
  if (!data) throw new Error(`Missing tile ${t.z}/${t.x}/${t.y}`);
  return { z: t.z, x: t.x, y: t.y, data, key: String(t.offset) };
});
const xs = outline.flat(2).map((p) => p[0]);
const ys = outline.flat(2).map((p) => p[1]);
const bounds: [number, number, number, number] = [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
const attribution = '© OpenStreetMap contributors';
const bytes = writePmtiles(inputs, {
  minZoom: 0,
  maxZoom,
  bounds,
  center: [(bounds[0] + bounds[2]) / 2, (bounds[1] + bounds[3]) / 2, 6],
  metadata: { name: 'Danmark', attribution, source, license: 'ODbL-1.0', generator: 'stead build-map.ts' },
});
const sha256 = (b: Uint8Array) => createHash('sha256').update(b).digest('hex');

if (args.overview) {
  mkdirSync(dirname(args.overview), { recursive: true });
  writeFileSync(args.overview, bytes);
  console.log(`Overview ${args.overview}: ${(bytes.length / 1e6).toFixed(1)} MB, z0–${maxZoom}, sha256 ${sha256(bytes)}`);
} else {
  if (!args.out) throw new Error('--out or --overview is required');
  mkdirSync(args.out, { recursive: true });
  const partSize = Number(args['part-mb']) * 1024 * 1024;
  const parts: MapManifest['archive']['parts'] = [];
  for (let at = 0, n = 0; at < bytes.length; at += partSize, n++) {
    const part = bytes.subarray(at, Math.min(at + partSize, bytes.length));
    const file = `dk-${args.date}.${String(n).padStart(3, '0')}`;
    writeFileSync(join(args.out, file), part);
    parts.push({ file, size: part.length, sha256: sha256(part) });
  }
  const manifest: MapManifest = {
    schema: 1,
    id: 'dk',
    name: { da: 'Danmark', en: 'Denmark' },
    version: args.date,
    createdAt: new Date().toISOString(),
    minZoom: 0,
    maxZoom,
    bounds,
    attribution,
    license: 'ODbL-1.0',
    source,
    boundaries: 'geoBoundaries (CC BY 4.0)',
    archive: { size: bytes.length, sha256: sha256(bytes), parts },
    outline,
    regions: regions.map((f) => ({
      id: f.properties.shapeName.toLowerCase().replace(/[^a-zæøå]+/g, '-'),
      name: f.properties.shapeName,
      polygons: round(polygonsOf(f.geometry)),
    })),
  };
  writeFileSync(join(args.out, 'manifest.json'), JSON.stringify(manifest));
  console.log(`${args.out}: ${parts.length} parts, ${(bytes.length / 1e6).toFixed(1)} MB, manifest ${(JSON.stringify(manifest).length / 1e3).toFixed(0)} kB`);
}
