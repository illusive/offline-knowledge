// Builds the core knowledge pack into content/dist/core/ (pack.sqlite + manifest.json).
// Pack version = content/package.json "version".

import { readFile } from 'node:fs/promises';
import { buildPack } from '../lib/pack.ts';
import { loadRegistry, readClearedSnapshot } from '../lib/registry.ts';
import type { StorageDataset } from '../schema/storage.ts';

const root = new URL('../', import.meta.url);
const { version } = JSON.parse(await readFile(new URL('package.json', root), 'utf8')) as { version: string };
const sources = await loadRegistry();
const storage = [JSON.parse(await readFile(new URL('storage/foodkeeper-produce.json', root), 'utf8')) as StorageDataset];

// Re-verify each used source's snapshot checksum at build time.
for (const dataset of storage) {
  const source = sources.find((s) => s.id === dataset.sourceId);
  if (source) await readClearedSnapshot(source);
}

const outDir = new URL('dist/core/', root).pathname;
const manifest = await buildPack({ packId: 'core', version, storage, sources }, outDir);
console.log(`Built pack '${manifest.packId}' ${manifest.version}: ${manifest.counts.storageItems} storage items, ${manifest.counts.guides} guides, ${manifest.counts.sources} sources.`);
console.log(`${outDir}${manifest.file}: ${manifest.sizeBytes} bytes, sha256 ${manifest.sha256}`);
