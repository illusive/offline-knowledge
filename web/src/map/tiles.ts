// Where map tiles come from (D-036): the overview archive bundled with the app (z0–8) and, for
// the 'detail' source beyond z8, the areas downloaded by the map worker. Tiles are stored
// gzip-compressed and handed to MapLibre uncompressed.

import { mapClient } from './client.ts';
import { Archive, decompress } from './pmtiles';

export type TileSource = 'overview' | 'detail';

const OVERVIEW_MAX_ZOOM = 8;

let overview: Promise<Archive> | null = null;

// The overview is small (about 3 MB) and precached, so it is read once into memory.
function openOverview(base: string): Promise<Archive> {
  overview ??= fetch(`${base}map/overview.pmtiles`)
    .then((r) => {
      if (!r.ok) throw new Error(`Overview map missing (${r.status})`);
      return r.arrayBuffer();
    })
    .then((buffer) => {
      const bytes = new Uint8Array(buffer);
      return Archive.open(async (offset, length) => bytes.subarray(offset, offset + length));
    });
  return overview;
}

export async function getTile(base: string, source: TileSource, z: number, x: number, y: number): Promise<Uint8Array | null> {
  // Detail beyond the overview comes from the downloaded areas (all stored gzip-compressed).
  if (source === 'detail' && z > OVERVIEW_MAX_ZOOM) {
    const client = mapClient();
    await client.ready;
    const stored = await client.call({ type: 'tile', z, x, y });
    return stored ? decompress(stored, 2) : null;
  }
  const archive = await openOverview(base);
  if (z > archive.header.maxZoom) return null;
  const stored = await archive.getTile(z, x, y);
  return stored ? decompress(stored, archive.header.tileCompression) : null;
}
