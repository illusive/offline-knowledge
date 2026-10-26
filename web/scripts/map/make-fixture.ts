// Makes the small map archive the offline tests download (D-036): central Copenhagen, z0–15,
// cut from a local full build (web/dist-map/dk, see build-map.ts), split into two parts so reads
// across a part boundary are exercised.
//
//   node scripts/map/make-fixture.ts   → e2e/fixtures/stead-maps/dk/

import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { coverTiles, type MultiPolygon } from '../../src/map/area.ts';
import type { MapManifest } from '../../src/map/manifest.ts';
import { Archive } from '../../src/map/pmtiles.ts';
import { writePmtiles, type TileInput } from './write-pmtiles.ts';

const web = new URL('../../', import.meta.url).pathname;
const source = join(web, 'dist-map/dk');
const out = join(web, 'e2e/fixtures/stead-maps/dk');

const full = JSON.parse(readFileSync(join(source, 'manifest.json'), 'utf8')) as MapManifest;
const bytes = Buffer.concat(full.archive.parts.map((p) => readFileSync(join(source, p.file))));
const archive = await Archive.open(async (o, l) => bytes.subarray(o, o + l));

// A small square over central Copenhagen as "the country", with one region inside it.
const square = (w: number, s: number, e: number, n: number): MultiPolygon => [[[[w, s], [e, s], [e, n], [w, n], [w, s]]]];
const outline = square(12.54, 55.66, 12.6, 55.7);
const region = square(12.565, 55.675, 12.59, 55.69);

const tiles: TileInput[] = [];
for (const t of coverTiles({ kind: 'polygon', polygons: outline }, 0, 15)) {
  const located = await archive.locate(t.z, t.x, t.y);
  if (located) tiles.push({ ...t, data: bytes.subarray(located.offset, located.offset + located.length), key: String(located.offset) });
}
const written = writePmtiles(tiles, { minZoom: 0, maxZoom: 15, bounds: [12.54, 55.66, 12.6, 55.7], center: [12.57, 55.68, 13], metadata: { attribution: full.attribution, test: true } });

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
const half = Math.ceil(written.length / 2);
const sha256 = (b: Uint8Array) => createHash('sha256').update(b).digest('hex');
const parts = [written.subarray(0, half), written.subarray(half)].map((part, i) => {
  const file = `dk-test.${String(i).padStart(3, '0')}`;
  writeFileSync(join(out, file), part);
  return { file, size: part.length, sha256: sha256(part) };
});
const manifest: MapManifest = {
  ...full,
  version: `${full.version}-test`,
  createdAt: new Date().toISOString(),
  bounds: [12.54, 55.66, 12.6, 55.7],
  archive: { size: written.length, sha256: sha256(written), parts },
  outline,
  regions: [{ id: 'testregion', name: 'Testregion', polygons: region }],
};
writeFileSync(join(out, 'manifest.json'), JSON.stringify(manifest));
console.log(`${out}: ${tiles.length} tiles, ${(written.length / 1e6).toFixed(1)} MB`);
