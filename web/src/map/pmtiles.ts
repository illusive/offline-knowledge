// Minimal reader for PMTiles v3 archives (https://github.com/protomaps/PMTiles/blob/main/spec/v3/spec.md),
// used to download only the tiles of a chosen area by HTTP range requests (D-036).
// Pure functions plus one fetch-based reader; runs in a worker, the browser and Node.

export interface Header {
  rootDirectoryOffset: number;
  rootDirectoryLength: number;
  leafDirectoryOffset: number;
  tileDataOffset: number;
  internalCompression: number; // 1 none, 2 gzip
  tileCompression: number;
  tileType: number; // 1 = vector (MVT)
  minZoom: number;
  maxZoom: number;
  bounds: [number, number, number, number]; // minLon, minLat, maxLon, maxLat
}

export interface Entry {
  tileId: number;
  offset: number;
  length: number;
  runLength: number; // 0: points to a leaf directory
}

export const HEADER_LENGTH = 127;
export const COMPRESSION_NONE = 1;
export const COMPRESSION_GZIP = 2;

function u64(view: DataView, at: number): number {
  return view.getUint32(at, true) + view.getUint32(at + 4, true) * 2 ** 32;
}

export function parseHeader(bytes: Uint8Array): Header {
  const magic = new TextDecoder().decode(bytes.subarray(0, 7));
  if (magic !== 'PMTiles') throw new Error('Not a PMTiles archive');
  if (bytes[7] !== 3) throw new Error(`Unsupported PMTiles version ${bytes[7]}`);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return {
    rootDirectoryOffset: u64(view, 8),
    rootDirectoryLength: u64(view, 16),
    leafDirectoryOffset: u64(view, 40),
    tileDataOffset: u64(view, 56),
    internalCompression: view.getUint8(97),
    tileCompression: view.getUint8(98),
    tileType: view.getUint8(99),
    minZoom: view.getUint8(100),
    maxZoom: view.getUint8(101),
    bounds: [view.getInt32(102, true) / 1e7, view.getInt32(106, true) / 1e7, view.getInt32(110, true) / 1e7, view.getInt32(114, true) / 1e7],
  };
}

// Directory: entry count, then tile id deltas, run lengths, lengths and offsets, all as varints.
export function parseDirectory(bytes: Uint8Array): Entry[] {
  let pos = 0;
  const varint = (): number => {
    let result = 0;
    let shift = 1;
    for (;;) {
      const b = bytes[pos++];
      if (b === undefined) throw new Error('Truncated PMTiles directory');
      result += (b & 0x7f) * shift;
      if (b < 0x80) return result;
      shift *= 128;
    }
  };
  const count = varint();
  const entries: Entry[] = Array.from({ length: count }, () => ({ tileId: 0, offset: 0, length: 0, runLength: 0 }));
  let last = 0;
  for (const e of entries) {
    last += varint();
    e.tileId = last;
  }
  for (const e of entries) e.runLength = varint();
  for (const e of entries) e.length = varint();
  entries.forEach((e, i) => {
    const v = varint();
    const prev = entries[i - 1];
    e.offset = v === 0 && prev ? prev.offset + prev.length : v - 1;
  });
  return entries;
}

// Tile id: tiles of all lower zoom levels, then the position on the zoom level's Hilbert curve.
export function zxyToTileId(z: number, x: number, y: number): number {
  if (z > 26) throw new Error('Zoom above 26');
  const n = 2 ** z;
  if (x < 0 || y < 0 || x >= n || y >= n) throw new Error(`Tile outside zoom ${z}: ${x}/${y}`);
  let acc = 0;
  for (let i = 0; i < z; i++) acc += 4 ** i;
  let d = 0;
  let px = x;
  let py = y;
  for (let s = n / 2; s >= 1; s /= 2) {
    const rx = (px & s) > 0 ? 1 : 0;
    const ry = (py & s) > 0 ? 1 : 0;
    d += s * s * ((3 * rx) ^ ry);
    if (ry === 0) {
      if (rx === 1) {
        px = s - 1 - (px % s);
        py = s - 1 - (py % s);
      }
      [px, py] = [py, px];
    }
    px %= s;
    py %= s;
  }
  return acc + d;
}

// The entry that covers tileId: a tile entry, a leaf directory pointer, or nothing.
export function findEntry(entries: Entry[], tileId: number): Entry | null {
  let lo = 0;
  let hi = entries.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const e = entries[mid] as Entry;
    if (e.tileId === tileId) return e;
    if (e.tileId < tileId) lo = mid + 1;
    else hi = mid - 1;
  }
  const e = entries[hi];
  if (!e) return null;
  if (e.runLength === 0) return e; // leaf directory covering the range
  return tileId - e.tileId < e.runLength ? e : null;
}

export async function decompress(bytes: Uint8Array, compression: number): Promise<Uint8Array> {
  if (compression === COMPRESSION_NONE || compression === 0) return bytes;
  if (compression !== COMPRESSION_GZIP) throw new Error(`Unsupported PMTiles compression ${compression}`);
  const stream = new Blob([bytes as BlobPart]).stream().pipeThrough(new DecompressionStream('gzip'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

// Reads byte ranges of one archive. `read(offset, length)` hides where the bytes come from
// (one remote file, several part files, or a local file).
export type RangeReader = (offset: number, length: number) => Promise<Uint8Array>;

export interface Located {
  z: number;
  x: number;
  y: number;
  offset: number; // absolute, in the archive
  length: number;
}

// Resolves tiles to byte ranges, fetching leaf directories on demand (each once).
export class Archive {
  readonly header: Header;
  private readonly root: Entry[];
  private readonly read: RangeReader;
  private leaves = new Map<number, Promise<Entry[]>>();
  private constructor(header: Header, root: Entry[], read: RangeReader) {
    this.header = header;
    this.root = root;
    this.read = read;
  }

  static async open(read: RangeReader): Promise<Archive> {
    const start = await read(0, 16384);
    const header = parseHeader(start);
    const rootBytes =
      header.rootDirectoryOffset + header.rootDirectoryLength <= start.length
        ? start.subarray(header.rootDirectoryOffset, header.rootDirectoryOffset + header.rootDirectoryLength)
        : await read(header.rootDirectoryOffset, header.rootDirectoryLength);
    const root = parseDirectory(await decompress(rootBytes, header.internalCompression));
    return new Archive(header, root, read);
  }

  private leaf(entry: Entry): Promise<Entry[]> {
    const offset = this.header.leafDirectoryOffset + entry.offset;
    let dir = this.leaves.get(offset);
    if (!dir) {
      dir = this.read(offset, entry.length).then(async (b) => parseDirectory(await decompress(b, this.header.internalCompression)));
      this.leaves.set(offset, dir);
    }
    return dir;
  }

  async locate(z: number, x: number, y: number): Promise<Located | null> {
    const tileId = zxyToTileId(z, x, y);
    let entries = this.root;
    for (let depth = 0; depth < 4; depth++) {
      const e = findEntry(entries, tileId);
      if (!e) return null;
      if (e.runLength > 0) return { z, x, y, offset: this.header.tileDataOffset + e.offset, length: e.length };
      entries = await this.leaf(e);
    }
    throw new Error('PMTiles directory too deep');
  }

  // The tile's stored bytes (still compressed as the header says), or null if the archive has none.
  async getTile(z: number, x: number, y: number): Promise<Uint8Array | null> {
    const located = await this.locate(z, x, y);
    return located ? this.read(located.offset, located.length) : null;
  }
}
