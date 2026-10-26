// Map worker (D-036): downloads the tiles of a chosen area from the hosted country archive by HTTP
// range requests and keeps them in the Origin Private File System, one SQLite file per area, in
// its own pool (separate from the knowledge pack). Answers tile lookups for the map.
//
// A download is a plan (the area's tiles and the merged byte ranges, recomputed from the shape and
// the map version) plus a resume point (the next range). Each range is stored in one transaction
// together with the new resume point, so an interruption at any moment loses at most one range.

import sqlite3InitModule from '@sqlite.org/sqlite-wasm';
import { coverTiles, mergeRanges, type ByteRange, type Shape } from './area.ts';
import { partReader, validateManifest, type MapManifest } from './manifest.ts';
import { Archive, type Located } from './pmtiles.ts';
import type { AreaInfo, AreaShape, Home, MapProgress, MapReply, MapRequest, MapSummary } from './protocol.ts';

// The small part of the sqlite-wasm API used here.
interface Stmt {
  bind(values: unknown[]): Stmt;
  step(): boolean;
  get(index: number): unknown;
  stepReset(): Stmt;
  reset(): Stmt;
  finalize(): void;
}
interface Db {
  exec(sql: string, opts?: { bind?: unknown[] }): unknown;
  selectValue(sql: string, bind?: unknown[]): unknown;
  selectObjects(sql: string, bind?: unknown[]): Record<string, unknown>[];
  prepare(sql: string): Stmt;
  close(): void;
}
interface Pool {
  getFileNames(): string[];
  unlink(name: string): boolean;
  reserveMinimumCapacity(n: number): Promise<number>;
  OpfsSAHPoolDb: new (name: string) => unknown;
}

const DETAIL_MIN_ZOOM = 9; // below this the bundled overview is used

let pool: Pool;
let meta: Db;
let mapUrl = '';
const areaDbs = new Map<string, { db: Db; lookup: Stmt }>();
const pauseRequested = new Set<string>();
const running = new Map<string, Promise<void>>();

function openDb(name: string): Db {
  return new pool.OpfsSAHPoolDb(name) as Db;
}

async function init(url: string) {
  mapUrl = url;
  if (!pool) {
    const sqlite3 = await sqlite3InitModule();
    pool = (await sqlite3.installOpfsSAHPoolVfs({ name: 'stead-maps', initialCapacity: 8 })) as unknown as Pool;
    meta = openDb('/maps.db');
    meta.exec(`CREATE TABLE IF NOT EXISTS areas (
      id TEXT PRIMARY KEY, label TEXT NOT NULL, shape TEXT NOT NULL, bounds TEXT NOT NULL, version TEXT NOT NULL,
      planned_tiles INTEGER NOT NULL, planned_bytes INTEGER NOT NULL, done_bytes INTEGER NOT NULL,
      next_range INTEGER NOT NULL, state TEXT NOT NULL, error TEXT, created_at TEXT NOT NULL)`);
    meta.exec('CREATE TABLE IF NOT EXISTS home (id INTEGER PRIMARY KEY CHECK (id = 1), lon REAL NOT NULL, lat REAL NOT NULL)');
    // A download that was running when the app closed is paused; the user resumes it.
    meta.exec("UPDATE areas SET state = 'paused' WHERE state = 'downloading'");
    // Remove area files whose row is gone (e.g. deleted while the file was open).
    const known = new Set(listAreas().map((a) => fileOf(a.id)));
    for (const name of pool.getFileNames()) if (name.startsWith('/area-') && !known.has(name)) pool.unlink(name);
  }
  const home = meta.selectObjects('SELECT lon, lat FROM home WHERE id = 1')[0] as Home | undefined;
  return { areas: listAreas(), home: home ?? null };
}

const fileOf = (id: string) => `/area-${id}.db`;

function rowToArea(r: Record<string, unknown>): AreaInfo {
  return {
    id: String(r.id),
    label: String(r.label),
    shape: JSON.parse(String(r.shape)) as AreaShape,
    bounds: JSON.parse(String(r.bounds)) as AreaInfo['bounds'],
    version: String(r.version),
    plannedTiles: Number(r.planned_tiles),
    plannedBytes: Number(r.planned_bytes),
    doneBytes: Number(r.done_bytes),
    state: r.state as AreaInfo['state'],
    error: (r.error as string | null) ?? null,
    createdAt: String(r.created_at),
  };
}

function listAreas(): AreaInfo[] {
  return meta.selectObjects('SELECT * FROM areas ORDER BY created_at').map(rowToArea);
}

function getArea(id: string): AreaInfo {
  const row = meta.selectObjects('SELECT * FROM areas WHERE id = ?', [id])[0];
  if (!row) throw new Error(`Unknown area ${id}`);
  return rowToArea(row);
}

function report() {
  const message: MapProgress = { event: 'areas', areas: listAreas() };
  self.postMessage(message);
}

// The hosted archive: manifest, then directories read by range requests across the part files.
let remote: Promise<{ manifest: MapManifest; archive: Archive; read: (o: number, l: number) => Promise<Uint8Array> }> | null = null;

async function fetchRange(url: string, start: number, end: number): Promise<Uint8Array> {
  for (let attempt = 1; ; attempt++) {
    try {
      const response = await fetch(url, { headers: { Range: `bytes=${start}-${end}` }, cache: 'no-store' });
      if (response.status !== 206) throw new Error(`HTTP ${response.status}`);
      const bytes = new Uint8Array(await response.arrayBuffer());
      if (bytes.length !== end - start + 1) throw new Error('Short read');
      return bytes;
    } catch (error) {
      if (attempt >= 3) throw error;
      await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
  }
}

function openRemote() {
  remote ??= (async () => {
    const response = await fetch(new URL('manifest.json', mapUrl), { cache: 'no-store' });
    if (!response.ok) throw new Error(`Map manifest unavailable (HTTP ${response.status})`);
    const manifest = validateManifest(await response.json());
    const read = partReader(manifest, mapUrl, fetchRange);
    const archive = await Archive.open(read);
    return { manifest, archive, read };
  })();
  remote.catch(() => {
    remote = null; // try again next time (e.g. back online)
  });
  return remote;
}

async function summary(): Promise<MapSummary> {
  const { manifest } = await openRemote();
  return { version: manifest.version, name: manifest.name, maxZoom: manifest.maxZoom, regions: manifest.regions.map((r) => ({ id: r.id, name: r.name })) };
}

function resolveShape(manifest: MapManifest, shape: AreaShape): Shape {
  if (shape.kind === 'circle') return shape;
  if (shape.kind === 'country') return { kind: 'polygon', polygons: manifest.outline };
  const region = manifest.regions.find((r) => r.id === shape.id);
  if (!region) throw new Error(`Unknown region ${shape.id}`);
  return { kind: 'polygon', polygons: region.polygons };
}

function boundsOf(shape: Shape): AreaInfo['bounds'] {
  if (shape.kind === 'circle') {
    const dLat = shape.radiusKm / 111.32;
    const dLon = shape.radiusKm / (111.32 * Math.cos((shape.lat * Math.PI) / 180));
    return [shape.lon - dLon, shape.lat - dLat, shape.lon + dLon, shape.lat + dLat];
  }
  const points = shape.polygons.flat(2);
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
}

async function plan(shape: AreaShape): Promise<{ tiles: Located[]; ranges: ByteRange[]; version: string; bounds: AreaInfo['bounds'] }> {
  const { manifest, archive } = await openRemote();
  const resolved = resolveShape(manifest, shape);
  const wanted = coverTiles(resolved, DETAIL_MIN_ZOOM, manifest.maxZoom);
  const tiles: Located[] = [];
  for (let i = 0; i < wanted.length; i += 2000) {
    const batch = await Promise.all(wanted.slice(i, i + 2000).map((t) => archive.locate(t.z, t.x, t.y)));
    for (const t of batch) if (t) tiles.push(t);
  }
  tiles.sort((a, b) => a.offset - b.offset);
  return { tiles, ranges: mergeRanges(tiles), version: manifest.version, bounds: boundsOf(resolved) };
}

async function estimate(shape: AreaShape) {
  const { tiles, ranges } = await plan(shape);
  return { tiles: tiles.length, bytes: ranges.reduce((s, r) => s + r.length, 0) };
}

function areaDb(id: string) {
  let entry = areaDbs.get(id);
  if (!entry) {
    const db = openDb(fileOf(id));
    db.exec('CREATE TABLE IF NOT EXISTS tiles (z INTEGER NOT NULL, x INTEGER NOT NULL, y INTEGER NOT NULL, data BLOB NOT NULL, PRIMARY KEY (z, x, y)) WITHOUT ROWID');
    entry = { db, lookup: db.prepare('SELECT data FROM tiles WHERE z = ? AND x = ? AND y = ?') };
    areaDbs.set(id, entry);
  }
  return entry;
}

async function run(id: string): Promise<void> {
  const area = getArea(id);
  pauseRequested.delete(id);
  meta.exec("UPDATE areas SET state = 'downloading', error = NULL WHERE id = ?", { bind: [id] });
  report();
  try {
    const { tiles, ranges, version } = await plan(area.shape);
    if (version !== area.version) throw new Error('Kortet er blevet opdateret siden download startede. Slet området, og hent det igen.');
    const { read } = await openRemote();
    const { db } = areaDb(id);
    const insert = db.prepare('INSERT OR REPLACE INTO tiles (z, x, y, data) VALUES (?, ?, ?, ?)');
    try {
      let next = Number(meta.selectValue('SELECT next_range FROM areas WHERE id = ?', [id]));
      let t = 0;
      const first = ranges[next];
      if (first) while (tiles[t] && (tiles[t] as Located).offset < first.offset) t++;
      for (; next < ranges.length; next++) {
        if (pauseRequested.has(id)) {
          meta.exec("UPDATE areas SET state = 'paused' WHERE id = ?", { bind: [id] });
          report();
          return;
        }
        const range = ranges[next] as ByteRange;
        const bytes = await read(range.offset, range.length);
        db.exec('BEGIN');
        while (tiles[t] && (tiles[t] as Located).offset + (tiles[t] as Located).length <= range.offset + range.length) {
          const tile = tiles[t] as Located;
          insert.bind([tile.z, tile.x, tile.y, bytes.subarray(tile.offset - range.offset, tile.offset - range.offset + tile.length)]).stepReset();
          t++;
        }
        db.exec('COMMIT');
        meta.exec('UPDATE areas SET next_range = ?, done_bytes = done_bytes + ? WHERE id = ?', { bind: [next + 1, range.length, id] });
        report();
      }
    } finally {
      insert.finalize();
    }
    // Check before the area counts as ready: every planned tile is stored.
    const stored = Number(db.selectValue('SELECT count(*) FROM tiles'));
    if (stored !== tiles.length) throw new Error(`Only ${stored} of ${tiles.length} tiles were stored`);
    meta.exec("UPDATE areas SET state = 'ready', done_bytes = planned_bytes WHERE id = ?", { bind: [id] });
  } catch (error) {
    meta.exec("UPDATE areas SET state = 'paused', error = ? WHERE id = ?", { bind: [error instanceof Error ? error.message : String(error), id] });
  } finally {
    report();
  }
}

function start(id: string): AreaInfo {
  if (!running.has(id)) {
    const job = run(id).finally(() => running.delete(id));
    running.set(id, job);
  }
  return getArea(id);
}

async function download(label: string, shape: AreaShape): Promise<AreaInfo> {
  const { tiles, ranges, version, bounds } = await plan(shape);
  const id = crypto.randomUUID().slice(0, 8);
  await pool.reserveMinimumCapacity(listAreas().length + 2);
  meta.exec(
    `INSERT INTO areas (id, label, shape, bounds, version, planned_tiles, planned_bytes, done_bytes, next_range, state, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, 'paused', ?)`,
    { bind: [id, label, JSON.stringify(shape), JSON.stringify(bounds), version, tiles.length, ranges.reduce((s, r) => s + r.length, 0), new Date().toISOString()] },
  );
  return start(id);
}

async function remove(id: string) {
  pauseRequested.add(id);
  await running.get(id);
  const entry = areaDbs.get(id);
  if (entry) {
    entry.lookup.finalize();
    entry.db.close();
    areaDbs.delete(id);
  }
  pool.unlink(fileOf(id));
  meta.exec('DELETE FROM areas WHERE id = ?', { bind: [id] });
  report();
}

// Detail tiles: the first area that has the tile (areas still downloading count too).
function storedTile(z: number, x: number, y: number): Uint8Array | null {
  if (z < DETAIL_MIN_ZOOM) return null;
  for (const area of listAreas()) {
    const { lookup } = areaDb(area.id);
    lookup.bind([z, x, y]);
    const found = lookup.step() ? (lookup.get(0) as Uint8Array) : null;
    lookup.reset();
    if (found) return found;
  }
  return null;
}

// While online, tiles outside the downloaded areas come straight from the hosted map, so the map
// shows detail everywhere. They are kept in memory only (never stored): offline, only downloaded
// areas have detail, and the map says so.
const ONLINE_CACHE = 400;
const onlineTiles = new Map<string, Uint8Array | null>();

async function onlineTile(z: number, x: number, y: number): Promise<Uint8Array | null> {
  if (z < DETAIL_MIN_ZOOM || !navigator.onLine) return null;
  const key = `${z}/${x}/${y}`;
  if (onlineTiles.has(key)) return onlineTiles.get(key) ?? null;
  try {
    const { archive } = await openRemote();
    const bytes = await archive.getTile(z, x, y);
    onlineTiles.set(key, bytes);
    if (onlineTiles.size > ONLINE_CACHE) onlineTiles.delete(onlineTiles.keys().next().value as string);
    return bytes;
  } catch {
    return null; // offline or the host is unreachable
  }
}

async function tile(z: number, x: number, y: number): Promise<{ data: Uint8Array | null; stored: boolean }> {
  const stored = storedTile(z, x, y);
  if (stored) return { data: stored, stored: true };
  return { data: await onlineTile(z, x, y), stored: false };
}

// Is this point inside a downloaded (ready) area? Checked on the zoom-14 tile under it.
function covered(lon: number, lat: number): boolean {
  const z = 14;
  const n = 2 ** z;
  const x = Math.floor(((lon + 180) / 360) * n);
  const r = (lat * Math.PI) / 180;
  const y = Math.floor(((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * n);
  return listAreas().some((area) => {
    if (area.state !== 'ready') return false;
    const { lookup } = areaDb(area.id);
    lookup.bind([z, x, y]);
    const found = lookup.step();
    lookup.reset();
    return found;
  });
}

// Requests are handled concurrently, so everything else waits until init has set up the pool.
let initialised: Promise<unknown> | null = null;

async function handle(request: MapRequest): Promise<unknown> {
  if (request.type !== 'init') {
    if (!initialised) throw new Error('Map worker not initialised');
    await initialised;
  }
  switch (request.type) {
    case 'init':
      initialised = init(request.mapUrl);
      return initialised;
    case 'summary':
      return summary();
    case 'estimate':
      return estimate(request.shape);
    case 'download':
      return download(request.label, request.shape);
    case 'resume':
      return start(request.id);
    case 'pause':
      pauseRequested.add(request.id);
      return null;
    case 'delete':
      await remove(request.id);
      return null;
    case 'tile':
      return tile(request.z, request.x, request.y);
    case 'covered':
      return covered(request.lon, request.lat);
    case 'setHome':
      if (request.home) meta.exec('INSERT OR REPLACE INTO home (id, lon, lat) VALUES (1, ?, ?)', { bind: [request.home.lon, request.home.lat] });
      else meta.exec('DELETE FROM home');
      return null;
  }
}

self.onmessage = async (event: MessageEvent<{ id: number; request: MapRequest }>) => {
  const { id, request } = event.data;
  let reply: MapReply;
  try {
    reply = { id, ok: true, result: await handle(request) };
  } catch (error) {
    reply = { id, ok: false, error: error instanceof Error ? error.message : String(error) };
  }
  self.postMessage(reply);
};
