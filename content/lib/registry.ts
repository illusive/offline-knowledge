// Reads content/sources/registry.json and verifies source snapshots.

import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export interface RegistrySource {
  id: string;
  status: 'cleared' | 'needs-review' | 'request-needed' | 'requested' | 'excluded';
  license: string;
  snapshot: string | null;
  snapshotSha256: string | null;
  dataVersion?: string;
}

export const SOURCES_DIR = new URL('../sources/', import.meta.url).pathname;

export async function loadSource(id: string): Promise<RegistrySource> {
  const registry = JSON.parse(await readFile(join(SOURCES_DIR, 'registry.json'), 'utf8')) as { sources: RegistrySource[] };
  const source = registry.sources.find((s) => s.id === id);
  if (!source) throw new Error(`Source not in registry: ${id}`);
  return source;
}

// Returns the snapshot bytes after checking that the source is cleared and the checksum matches.
export async function readClearedSnapshot(source: RegistrySource): Promise<Buffer> {
  if (source.status !== 'cleared') throw new Error(`Source ${source.id} is not cleared (status: ${source.status})`);
  if (!source.snapshot || !source.snapshotSha256) throw new Error(`Source ${source.id} has no snapshot`);
  const bytes = await readFile(join(SOURCES_DIR, source.snapshot));
  const sha256 = createHash('sha256').update(bytes).digest('hex');
  if (sha256 !== source.snapshotSha256) {
    throw new Error(`Snapshot checksum mismatch for ${source.id}: expected ${source.snapshotSha256}, got ${sha256}`);
  }
  return bytes;
}
