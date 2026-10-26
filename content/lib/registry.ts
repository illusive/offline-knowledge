// Reads content/sources/registry.json and verifies source snapshots.

import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export interface RegistrySource {
  id: string;
  status: 'cleared' | 'needs-review' | 'request-needed' | 'requested' | 'excluded';
  title: string;
  shortName?: string;   // short label shown next to content, e.g. 'USDA Handbook 66'
  publisher: string;
  url: string;
  lang: 'da' | 'en';
  license: string;
  licenseUrl?: string;
  attribution: string;
  retrievedAt: string | null;
  snapshot: string | null;
  snapshotSha256: string | null;
  dataVersion?: string;
}

export const SOURCES_DIR = new URL('../sources/', import.meta.url).pathname;

export async function loadRegistry(): Promise<RegistrySource[]> {
  const registry = JSON.parse(await readFile(join(SOURCES_DIR, 'registry.json'), 'utf8')) as { sources: RegistrySource[] };
  return registry.sources;
}

export async function loadSource(id: string): Promise<RegistrySource> {
  const source = (await loadRegistry()).find((s) => s.id === id);
  if (!source) throw new Error(`Source not in registry: ${id}`);
  return source;
}

// Returns the snapshot bytes after checking that the checksum matches the registry.
// Licence status is not checked while the project is private (D-028).
export async function readSnapshot(source: RegistrySource): Promise<Buffer> {
  if (!source.snapshot || !source.snapshotSha256) throw new Error(`Source ${source.id} has no snapshot`);
  const bytes = await readFile(join(SOURCES_DIR, source.snapshot));
  const sha256 = createHash('sha256').update(bytes).digest('hex');
  if (sha256 !== source.snapshotSha256) {
    throw new Error(`Snapshot checksum mismatch for ${source.id}: expected ${source.snapshotSha256}, got ${sha256}`);
  }
  return bytes;
}
