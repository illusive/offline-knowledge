// Writes a PMTiles v3 archive (D-036): header, root directory, metadata, leaf directories, tile data.
// Tiles must be given with their (already gzip-compressed) bytes; identical neighbouring tiles
// (e.g. open sea) become one run.

import { gzipSync } from 'node:zlib';
import { COMPRESSION_GZIP, HEADER_LENGTH, zxyToTileId, type Entry } from '../../src/map/pmtiles.ts';

export interface TileInput {
  z: number;
  x: number;
  y: number;
  data: Uint8Array;
  key: string; // equal keys mean identical content (stored once)
}

export interface ArchiveInfo {
  minZoom: number;
  maxZoom: number;
  bounds: [number, number, number, number];
  center: [number, number, number]; // lon, lat, zoom
  metadata: Record<string, unknown>;
}

function varints(values: number[]): number[] {
  const out: number[] = [];
  for (let v of values) {
    while (v >= 0x80) {
      out.push((v % 0x80) | 0x80);
      v = Math.floor(v / 0x80);
    }
    out.push(v);
  }
  return out;
}

export function serializeDirectory(entries: Entry[]): Uint8Array {
  const values: number[] = [entries.length];
  let last = 0;
  for (const e of entries) {
    values.push(e.tileId - last);
    last = e.tileId;
  }
  for (const e of entries) values.push(e.runLength);
  for (const e of entries) values.push(e.length);
  entries.forEach((e, i) => {
    const prev = entries[i - 1];
    values.push(prev && e.offset === prev.offset + prev.length ? 0 : e.offset + 1);
  });
  return Uint8Array.from(varints(values));
}

const ROOT_LIMIT = 16384 - HEADER_LENGTH;

// Root directory alone if it fits; otherwise leaves of growing size until the root fits.
function buildDirectories(entries: Entry[]): { root: Uint8Array; leaves: Uint8Array } {
  const root = gzipSync(serializeDirectory(entries));
  if (root.length <= ROOT_LIMIT) return { root, leaves: new Uint8Array(0) };
  for (let leafSize = 4096; ; leafSize *= 2) {
    const leafChunks: Buffer[] = [];
    const pointers: Entry[] = [];
    let offset = 0;
    for (let i = 0; i < entries.length; i += leafSize) {
      const chunk = entries.slice(i, i + leafSize);
      const bytes = gzipSync(serializeDirectory(chunk));
      pointers.push({ tileId: (chunk[0] as Entry).tileId, offset, length: bytes.length, runLength: 0 });
      leafChunks.push(bytes);
      offset += bytes.length;
    }
    const rootBytes = gzipSync(serializeDirectory(pointers));
    if (rootBytes.length <= ROOT_LIMIT) return { root: rootBytes, leaves: Buffer.concat(leafChunks) };
  }
}

export function writePmtiles(tiles: TileInput[], info: ArchiveInfo): Uint8Array {
  const sorted = tiles.map((t) => ({ ...t, tileId: zxyToTileId(t.z, t.x, t.y) })).sort((a, b) => a.tileId - b.tileId);
  const contentOffset = new Map<string, { offset: number; length: number }>();
  const dataChunks: Uint8Array[] = [];
  let dataLength = 0;
  const entries: Entry[] = [];
  for (const t of sorted) {
    let stored = contentOffset.get(t.key);
    if (!stored) {
      stored = { offset: dataLength, length: t.data.length };
      contentOffset.set(t.key, stored);
      dataChunks.push(t.data);
      dataLength += t.data.length;
    }
    const last = entries[entries.length - 1];
    if (last && last.offset === stored.offset && last.tileId + last.runLength === t.tileId) last.runLength++;
    else entries.push({ tileId: t.tileId, offset: stored.offset, length: stored.length, runLength: 1 });
  }

  const { root, leaves } = buildDirectories(entries);
  const metadata = gzipSync(JSON.stringify(info.metadata));
  const rootOffset = HEADER_LENGTH;
  const metadataOffset = rootOffset + root.length;
  const leafOffset = metadataOffset + metadata.length;
  const dataOffset = leafOffset + leaves.length;

  const header = new Uint8Array(HEADER_LENGTH);
  const view = new DataView(header.buffer);
  header.set(new TextEncoder().encode('PMTiles'), 0);
  header[7] = 3;
  const u64 = (at: number, v: number) => {
    view.setUint32(at, v % 2 ** 32, true);
    view.setUint32(at + 4, Math.floor(v / 2 ** 32), true);
  };
  u64(8, rootOffset);
  u64(16, root.length);
  u64(24, metadataOffset);
  u64(32, metadata.length);
  u64(40, leafOffset);
  u64(48, leaves.length);
  u64(56, dataOffset);
  u64(64, dataLength);
  u64(72, sorted.length); // addressed tiles
  u64(80, entries.length);
  u64(88, contentOffset.size);
  view.setUint8(96, 1); // clustered
  view.setUint8(97, COMPRESSION_GZIP);
  view.setUint8(98, COMPRESSION_GZIP);
  view.setUint8(99, 1); // vector tiles
  view.setUint8(100, info.minZoom);
  view.setUint8(101, info.maxZoom);
  const deg = (at: number, v: number) => view.setInt32(at, Math.round(v * 1e7), true);
  deg(102, info.bounds[0]);
  deg(106, info.bounds[1]);
  deg(110, info.bounds[2]);
  deg(114, info.bounds[3]);
  view.setUint8(118, info.center[2]);
  deg(119, info.center[0]);
  deg(123, info.center[1]);

  const out = new Uint8Array(dataOffset + dataLength);
  out.set(header, 0);
  out.set(root, rootOffset);
  out.set(metadata, metadataOffset);
  out.set(leaves, leafOffset);
  let at = dataOffset;
  for (const chunk of dataChunks) {
    out.set(chunk, at);
    at += chunk.length;
  }
  return out;
}
