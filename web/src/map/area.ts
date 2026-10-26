// Which map tiles cover an area (D-036): a circle around a point, a region or a country outline.
// Works top-down from zoom 0: a tile fully outside is skipped, a tile fully inside takes all its
// sub-tiles without more tests, and only tiles on the boundary are split further.

export type Ring = [number, number][]; // [lon, lat]
export type MultiPolygon = Ring[][]; // polygons, each an outer ring followed by holes

export interface Rect {
  w: number; // west lon
  s: number; // south lat
  e: number;
  n: number;
}

export type Shape =
  | { kind: 'circle'; lon: number; lat: number; radiusKm: number }
  | { kind: 'polygon'; polygons: MultiPolygon };

export interface Tile {
  z: number;
  x: number;
  y: number;
}

export function tileRect(z: number, x: number, y: number): Rect {
  const n = 2 ** z;
  const lon = (tx: number) => (tx / n) * 360 - 180;
  const lat = (ty: number) => (Math.atan(Math.sinh(Math.PI * (1 - (2 * ty) / n))) * 180) / Math.PI;
  return { w: lon(x), e: lon(x + 1), n: lat(y), s: lat(y + 1) };
}

export function lonLatToTile(lon: number, lat: number, z: number): { x: number; y: number } {
  const n = 2 ** z;
  const r = (lat * Math.PI) / 180;
  const x = Math.floor(((lon + 180) / 360) * n);
  const y = Math.floor(((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * n);
  return { x: Math.min(n - 1, Math.max(0, x)), y: Math.min(n - 1, Math.max(0, y)) };
}

const KM_PER_DEG_LAT = 111.32;

type Class = 'in' | 'out' | 'partial';

function classifyCircle(c: { lon: number; lat: number; radiusKm: number }, r: Rect): Class {
  const kx = KM_PER_DEG_LAT * Math.cos((c.lat * Math.PI) / 180);
  const dx = (lon: number) => (lon - c.lon) * kx;
  const dy = (lat: number) => (lat - c.lat) * KM_PER_DEG_LAT;
  // Nearest point of the rectangle to the centre, and the farthest corner.
  const nx = Math.max(dx(r.w), Math.min(0, dx(r.e)));
  const ny = Math.max(dy(r.s), Math.min(0, dy(r.n)));
  if (Math.hypot(nx, ny) > c.radiusKm) return 'out';
  const fx = Math.max(Math.abs(dx(r.w)), Math.abs(dx(r.e)));
  const fy = Math.max(Math.abs(dy(r.s)), Math.abs(dy(r.n)));
  return Math.hypot(fx, fy) <= c.radiusKm ? 'in' : 'partial';
}

type Edge = [number, number, number, number]; // lon1, lat1, lon2, lat2

function edgesOf(polygons: MultiPolygon): Edge[] {
  const edges: Edge[] = [];
  for (const polygon of polygons)
    for (const ring of polygon)
      for (let i = 0; i < ring.length; i++) {
        const a = ring[i] as [number, number];
        const b = ring[(i + 1) % ring.length] as [number, number];
        if (a[0] !== b[0] || a[1] !== b[1]) edges.push([a[0], a[1], b[0], b[1]]);
      }
  return edges;
}

// Cohen–Sutherland style test: does the segment touch the rectangle?
function segmentHitsRect([x1, y1, x2, y2]: Edge, r: Rect): boolean {
  if (Math.max(x1, x2) < r.w || Math.min(x1, x2) > r.e || Math.max(y1, y2) < r.s || Math.min(y1, y2) > r.n) return false;
  const inside = (x: number, y: number) => x >= r.w && x <= r.e && y >= r.s && y <= r.n;
  if (inside(x1, y1) || inside(x2, y2)) return true;
  const side = (px: number, py: number) => Math.sign((x2 - x1) * (py - y1) - (y2 - y1) * (px - x1));
  const corners = [side(r.w, r.s), side(r.e, r.s), side(r.e, r.n), side(r.w, r.n)];
  return corners.some((c) => c !== corners[0]) || corners[0] === 0;
}

// Even–odd rule over all rings (holes included).
function pointInPolygons(lon: number, lat: number, edges: Edge[]): boolean {
  let inside = false;
  for (const [x1, y1, x2, y2] of edges) {
    if (y1 > lat !== y2 > lat && lon < ((x2 - x1) * (lat - y1)) / (y2 - y1) + x1) inside = !inside;
  }
  return inside;
}

// Returns every tile from minZoom to maxZoom that touches the shape.
export function coverTiles(shape: Shape, minZoom: number, maxZoom: number): Tile[] {
  const out: Tile[] = [];
  const allEdges = shape.kind === 'polygon' ? edgesOf(shape.polygons) : [];

  const addAll = (z: number, x: number, y: number) => {
    for (let zz = Math.max(z, minZoom); zz <= maxZoom; zz++) {
      const f = 2 ** (zz - z);
      for (let xx = x * f; xx < (x + 1) * f; xx++) for (let yy = y * f; yy < (y + 1) * f; yy++) out.push({ z: zz, x: xx, y: yy });
    }
  };

  const visit = (z: number, x: number, y: number, edges: Edge[]) => {
    const r = tileRect(z, x, y);
    let cls: Class;
    let near = edges;
    if (shape.kind === 'circle') cls = classifyCircle(shape, r);
    else {
      near = edges.filter((e) => segmentHitsRect(e, r));
      cls = near.length > 0 ? 'partial' : pointInPolygons((r.w + r.e) / 2, (r.s + r.n) / 2, allEdges) ? 'in' : 'out';
    }
    if (cls === 'out') return;
    if (cls === 'in') return addAll(z, x, y);
    if (z >= minZoom) out.push({ z, x, y });
    if (z === maxZoom) return;
    for (const [dx, dy] of [[0, 0], [1, 0], [0, 1], [1, 1]] as const) visit(z + 1, 2 * x + dx, 2 * y + dy, near);
  };

  visit(0, 0, 0, allEdges);
  return out;
}

// Byte ranges to download (at most 1 MB each: little to redo after an interruption, little memory):
// tiles sorted by archive offset, neighbours merged when the gap is small,
// identical tiles (same offset, e.g. open sea) fetched once.
export interface ByteRange {
  offset: number;
  length: number;
}

export function mergeRanges(tiles: { offset: number; length: number }[], maxGap = 64 * 1024, maxLength = 1024 * 1024): ByteRange[] {
  const unique = [...new Map(tiles.map((t) => [t.offset, t.length])).entries()].sort((a, b) => a[0] - b[0]);
  const ranges: ByteRange[] = [];
  for (const [offset, length] of unique) {
    const last = ranges[ranges.length - 1];
    const end = offset + length;
    if (last && offset - (last.offset + last.length) <= maxGap && end - last.offset <= maxLength) {
      last.length = Math.max(last.length, end - last.offset);
    } else ranges.push({ offset, length });
  }
  return ranges;
}
