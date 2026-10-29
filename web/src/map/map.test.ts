import { describe, expect, it } from 'vitest';
import { serializeDirectory, writePmtiles } from '../../scripts/map/write-pmtiles.ts';
import { coverTiles, lonLatToTile, mergeRanges, tileRect } from './area.ts';
import { partReader, validateManifest, type MapManifest } from './manifest.ts';
import { Archive, parseDirectory, zxyToTileId, type Entry } from './pmtiles.ts';

describe('PMTiles', () => {
  it('numbers tiles along the Hilbert curve, zoom by zoom (spec examples)', () => {
    expect(zxyToTileId(0, 0, 0)).toBe(0);
    expect([zxyToTileId(1, 0, 0), zxyToTileId(1, 0, 1), zxyToTileId(1, 1, 1), zxyToTileId(1, 1, 0)]).toEqual([1, 2, 3, 4]);
    expect(zxyToTileId(2, 0, 0)).toBe(5);
    expect(zxyToTileId(20, 0, 0)).toBe(366503875925);
  });

  it('reads back a directory it wrote, including consecutive offsets', () => {
    const entries: Entry[] = [
      { tileId: 0, offset: 0, length: 10, runLength: 1 },
      { tileId: 1, offset: 10, length: 20, runLength: 3 },
      { tileId: 9, offset: 500, length: 7, runLength: 0 },
    ];
    expect(parseDirectory(serializeDirectory(entries))).toEqual(entries);
  });

  it('writes an archive whose tiles, runs and duplicates read back correctly', async () => {
    const sea = new Uint8Array([1, 2, 3]);
    const tiles = [
      { z: 0, x: 0, y: 0, data: new Uint8Array([9]), key: 'a' },
      { z: 1, x: 0, y: 0, data: sea, key: 'sea' },
      { z: 1, x: 0, y: 1, data: sea, key: 'sea' },
      { z: 1, x: 1, y: 1, data: new Uint8Array([7, 7]), key: 'b' },
    ];
    const bytes = writePmtiles(tiles, { minZoom: 0, maxZoom: 1, bounds: [-180, -85, 180, 85], center: [0, 0, 0], metadata: {} });
    const archive = await Archive.open(async (offset, length) => bytes.subarray(offset, offset + length));
    expect(archive.header.maxZoom).toBe(1);
    expect(await archive.getTile(0, 0, 0)).toEqual(new Uint8Array([9]));
    expect(await archive.getTile(1, 0, 1)).toEqual(sea);
    expect(await archive.getTile(1, 1, 1)).toEqual(new Uint8Array([7, 7]));
    expect(await archive.getTile(1, 1, 0)).toBeNull();
    const a = await archive.locate(1, 0, 0);
    const b = await archive.locate(1, 0, 1);
    expect(a?.offset).toBe(b?.offset); // the duplicate is stored once
  });
});

describe('area', () => {
  it('converts between coordinates and tiles', () => {
    const { x, y } = lonLatToTile(12.568, 55.676, 10);
    const r = tileRect(10, x, y);
    expect(12.568).toBeGreaterThanOrEqual(r.w);
    expect(12.568).toBeLessThan(r.e);
    expect(55.676).toBeLessThanOrEqual(r.n);
    expect(55.676).toBeGreaterThan(r.s);
  });

  it('covers a circle with the centre tile at every zoom and nothing far away', () => {
    const tiles = coverTiles({ kind: 'circle', lon: 12.568, lat: 55.676, radiusKm: 10 }, 0, 12);
    for (let z = 0; z <= 12; z++) {
      const c = lonLatToTile(12.568, 55.676, z);
      expect(tiles.some((t) => t.z === z && t.x === c.x && t.y === c.y)).toBe(true);
    }
    const far = lonLatToTile(9.4, 56.45, 12); // Viborg, ~200 km away
    expect(tiles.some((t) => t.z === 12 && t.x === far.x && t.y === far.y)).toBe(false);
    expect(new Set(tiles.map((t) => `${t.z}/${t.x}/${t.y}`)).size).toBe(tiles.length); // no duplicates
  });

  it('covers a polygon, including tiles fully inside and on the edge', () => {
    const square: [number, number][] = [[10, 55], [11, 55], [11, 56], [10, 56], [10, 55]];
    const tiles = coverTiles({ kind: 'polygon', polygons: [[square]] }, 8, 10);
    const inside = lonLatToTile(10.5, 55.5, 10);
    const edge = lonLatToTile(10.001, 55.5, 10);
    const outside = lonLatToTile(12, 55.5, 10);
    const has = (t: { x: number; y: number }) => tiles.some((u) => u.z === 10 && u.x === t.x && u.y === t.y);
    expect(has(inside)).toBe(true);
    expect(has(edge)).toBe(true);
    expect(has(outside)).toBe(false);
    expect(tiles.every((t) => t.z >= 8 && t.z <= 10)).toBe(true);
  });

  it('merges neighbouring byte ranges and fetches identical tiles once', () => {
    const ranges = mergeRanges(
      [
        { offset: 0, length: 100 },
        { offset: 100, length: 50 },
        { offset: 100, length: 50 },
        { offset: 1_000_000, length: 10 },
      ],
      1000,
    );
    expect(ranges).toEqual([
      { offset: 0, length: 150 },
      { offset: 1_000_000, length: 10 },
    ]);
  });
});

describe('manifest', () => {
  const manifest = {
    schema: 1,
    id: 'dk',
    name: { da: 'Danmark', en: 'Denmark' },
    version: '20261024',
    createdAt: '',
    minZoom: 0,
    maxZoom: 15,
    bounds: [8, 54, 15, 58],
    attribution: '© OpenStreetMap contributors',
    license: 'ODbL-1.0',
    source: '',
    boundaries: '',
    archive: { size: 10, sha256: 'a'.repeat(64), parts: [{ file: 'p0', size: 6, sha256: 'b'.repeat(64) }, { file: 'p1', size: 4, sha256: 'c'.repeat(64) }] },
    outline: [[[[8, 54], [9, 54], [9, 55], [8, 54]]]],
    regions: [],
  } as MapManifest;

  it('accepts a valid manifest and rejects parts that do not add up', () => {
    expect(validateManifest(manifest).id).toBe('dk');
    expect(() => validateManifest({ ...manifest, archive: { ...manifest.archive, size: 11 } })).toThrow(/do not add up/);
  });

  it('reads a range that spans two parts', async () => {
    const data: Record<string, Uint8Array> = { p0: Uint8Array.from([0, 1, 2, 3, 4, 5]), p1: Uint8Array.from([6, 7, 8, 9]) };
    const read = partReader(manifest, 'https://example.test/map/dk/', async (url, start, end) => {
      const part = data[url.split('/').pop() ?? ''];
      if (!part) throw new Error(url);
      return part.slice(start, end + 1);
    });
    expect(await read(4, 4)).toEqual(Uint8Array.from([4, 5, 6, 7]));
    expect(await read(0, 10)).toEqual(Uint8Array.from([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]));
  });
});

describe('places on the map (pois.ts)', () => {
  it('draws only the chosen groups; "other" means every kind not in a group', async () => {
    const { poiFilter, defaultGroups, groupOf } = await import('./pois');
    expect(defaultGroups()).toEqual(['emergency', 'water', 'supplies', 'transport']);
    expect(JSON.stringify(poiFilter(['emergency']))).toContain('"pharmacy"');
    expect(JSON.stringify(poiFilter(['emergency']))).not.toContain('"supermarket"');
    expect(JSON.stringify(poiFilter(['other']))).toContain('"!"');
    expect(JSON.stringify(poiFilter([]))).toContain('false');
    expect(groupOf('fuel')).toBe('supplies');
    expect(groupOf('tree')).toBe('other');
  });
});

describe('map date', () => {
  it('reads the build date at the start of the map version', async () => {
    const { formatMapDate } = await import('./format');
    expect(formatMapDate('20261024', 'da')).toBe('24. oktober 2026');
    expect(formatMapDate('20261024-test', 'en')).toBe('24 October 2026');
    expect(formatMapDate('latest', 'da')).toBe('latest');
  });
});
