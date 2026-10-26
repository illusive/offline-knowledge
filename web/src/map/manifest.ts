// The map manifest published next to a country archive (D-036): parts with checksums, the outline
// and regions used to choose an area, and the attribution the map must show.

import type { MultiPolygon } from './area.ts';

export interface MapManifest {
  schema: 1;
  id: string; // e.g. 'dk'
  name: { da: string; en: string };
  version: string; // Protomaps build date, YYYYMMDD
  createdAt: string;
  minZoom: number;
  maxZoom: number;
  bounds: [number, number, number, number];
  attribution: string;
  license: string;
  source: string;
  boundaries: string;
  archive: { size: number; sha256: string; parts: { file: string; size: number; sha256: string }[] };
  outline: MultiPolygon;
  regions: { id: string; name: string; polygons: MultiPolygon }[]; // may be empty: then only country and radius
}

export function validateManifest(value: unknown): MapManifest {
  const m = value as Partial<MapManifest>;
  const problems: string[] = [];
  if (m.schema !== 1) problems.push('schema must be 1');
  if (!m.id || !m.version || !m.attribution) problems.push('id, version and attribution are required');
  if (typeof m.maxZoom !== 'number' || m.maxZoom > 15) problems.push('maxZoom must be ≤ 15');
  const parts = m.archive?.parts ?? [];
  if (parts.length === 0) problems.push('archive has no parts');
  if (parts.reduce((s, p) => s + p.size, 0) !== m.archive?.size) problems.push('part sizes do not add up to the archive size');
  if (parts.some((p) => !/^[0-9a-f]{64}$/.test(p.sha256))) problems.push('every part needs a SHA-256');
  if (!Array.isArray(m.outline) || m.outline.length === 0) problems.push('outline is required');
  if (!Array.isArray(m.regions)) problems.push('regions must be a list (possibly empty)');
  if (problems.length > 0) throw new Error(`Invalid map manifest: ${problems.join('; ')}`);
  return m as MapManifest;
}

// Reads a byte range of the archive that is split into parts; a range may span two parts.
export function partReader(manifest: MapManifest, baseUrl: string, fetchRange: (url: string, start: number, end: number) => Promise<Uint8Array>) {
  const starts: number[] = [];
  let at = 0;
  for (const p of manifest.archive.parts) {
    starts.push(at);
    at += p.size;
  }
  return async (offset: number, length: number): Promise<Uint8Array> => {
    const out = new Uint8Array(length);
    let filled = 0;
    while (filled < length) {
      const pos = offset + filled;
      let i = starts.length - 1;
      while (i > 0 && (starts[i] as number) > pos) i--;
      const part = manifest.archive.parts[i];
      const start = starts[i];
      if (!part || start === undefined || pos >= start + part.size) throw new Error(`Offset ${pos} is outside the archive`);
      const end = Math.min(start + part.size, offset + length);
      const bytes = await fetchRange(new URL(part.file, baseUrl).href, pos - start, end - start - 1);
      if (bytes.length !== end - pos) throw new Error(`Short read from ${part.file}`);
      out.set(bytes, filled);
      filled += bytes.length;
    }
    return out;
  };
}
