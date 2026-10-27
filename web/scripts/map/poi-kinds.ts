// Counts the kinds of points of interest (POIs) in the local Denmark archive (web/dist-map/dk),
// for one z15 tile block around a given point. Usage: node scripts/map/poi-kinds.ts [lon lat radiusTiles]
import { openSync, readSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { gunzipSync } from 'node:zlib';
import { VectorTile } from '@mapbox/vector-tile';
import { PbfReader as Protobuf } from 'pbf';
import { findEntry, parseDirectory, parseHeader, zxyToTileId, type Entry } from '../../src/map/pmtiles.ts';

const dir = new URL('../../dist-map/dk/', import.meta.url).pathname;
const parts = readdirSync(dir).filter((f) => /\.\d{3}$/.test(f)).sort().map((f) => join(dir, f));
const PART = 64 * 1024 * 1024;
const fds = parts.map((p) => openSync(p, 'r'));
function read(offset: number, length: number): Uint8Array {
  const out = new Uint8Array(length);
  let done = 0;
  while (done < length) {
    const at = offset + done;
    const i = Math.floor(at / PART);
    const n = Math.min(length - done, PART - (at % PART));
    readSync(fds[i]!, out, done, n, at % PART);
    done += n;
  }
  return out;
}
const header = parseHeader(read(0, 127));
const dirBytes = (o: number, l: number) => parseDirectory(header.internalCompression === 2 ? gunzipSync(read(o, l)) : read(o, l));
function tile(z: number, x: number, y: number): Uint8Array | null {
  const id = zxyToTileId(z, x, y);
  let entries: Entry[] = dirBytes(header.rootDirectoryOffset, header.rootDirectoryLength);
  for (let depth = 0; depth < 4; depth++) {
    const e = findEntry(entries, id);
    if (!e) return null;
    if (e.runLength > 0) return gunzipSync(read(header.tileDataOffset + e.offset, e.length));
    entries = dirBytes(header.leafDirectoryOffset + e.offset, e.length);
  }
  return null;
}
const [lon, lat, r] = [Number(process.argv[2] ?? 12.5683), Number(process.argv[3] ?? 55.6761), Number(process.argv[4] ?? 4)];
const z = 15, n = 2 ** z;
const cx = Math.floor(((lon + 180) / 360) * n);
const cy = Math.floor(((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) * n);
const kinds = new Map<string, number>();
for (let x = cx - r; x <= cx + r; x++) for (let y = cy - r; y <= cy + r; y++) {
  const bytes = tile(z, x, y);
  if (!bytes) continue;
  const layer = new VectorTile(new Protobuf(bytes)).layers['pois'];
  for (let i = 0; i < (layer?.length ?? 0); i++) {
    const k = String(layer!.feature(i).properties['kind']);
    kinds.set(k, (kinds.get(k) ?? 0) + 1);
  }
}
console.log([...kinds].sort((a, b) => b[1] - a[1]).map(([k, c]) => `${k} ${c}`).join('\n'));
