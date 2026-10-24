// Builds the knowledge pack: one SQLite file plus manifest.json.
// Validation happens before anything is written; the build refuses content
// that breaks docs/CONTENT_POLICY.md rather than leaving it out silently.

import { createHash } from 'node:crypto';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { PACK_SCHEMA_VERSION, type PackManifest } from '../schema/pack.ts';
import type { StorageDataset } from '../schema/storage.ts';
import type { RegistrySource } from './registry.ts';

export const PACK_DB_FILE = 'pack.sqlite';

const SCHEMA_SQL = `
CREATE TABLE meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);

CREATE TABLE sources (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  publisher TEXT NOT NULL,
  url TEXT NOT NULL,
  lang TEXT NOT NULL,
  license TEXT NOT NULL,
  license_url TEXT,
  attribution TEXT NOT NULL,
  retrieved_at TEXT NOT NULL,
  data_version TEXT
);

CREATE TABLE storage_items (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  name_en TEXT NOT NULL,
  subtitle_en TEXT,
  name_da TEXT NOT NULL,
  subtitle_da TEXT,
  source_id TEXT NOT NULL REFERENCES sources(id),
  source_record_id TEXT NOT NULL
);

CREATE TABLE storage_periods (
  item_id TEXT NOT NULL REFERENCES storage_items(id),
  ord INTEGER NOT NULL,
  location TEXT NOT NULL CHECK (location IN ('pantry', 'fridge', 'freezer')),
  basis TEXT NOT NULL CHECK (basis IN ('fromPurchase', 'afterOpening', 'afterThawing', 'unspecified')),
  kind TEXT NOT NULL CHECK (kind IN ('range', 'notRecommended', 'indefinitely', 'untilRipe', 'packageUseByDate')),
  min_value INTEGER,
  max_value INTEGER,
  unit TEXT CHECK (unit IN ('hours', 'days', 'weeks', 'months', 'years')),
  source_field TEXT NOT NULL,
  PRIMARY KEY (item_id, ord)
);

CREATE TABLE storage_notes (
  item_id TEXT NOT NULL REFERENCES storage_items(id),
  ord INTEGER NOT NULL,
  location TEXT NOT NULL CHECK (location IN ('pantry', 'fridge', 'freezer')),
  lang TEXT NOT NULL,
  text TEXT NOT NULL,
  source_field TEXT NOT NULL,
  PRIMARY KEY (item_id, ord)
);

-- Trigram index so that Danish compound words match ('kål' finds 'Hvidkål').
-- Queries need at least 3 characters; shorter queries need a prefix fallback in the app.
CREATE VIRTUAL TABLE storage_search USING fts5(
  item_id UNINDEXED,
  lang UNINDEXED,
  name,
  subtitle,
  keywords,
  tokenize = 'trigram remove_diacritics 1'
);
`;

export interface PackInput {
  packId: string;
  version: string;
  storage: StorageDataset[];
  sources: RegistrySource[];
}

// Returns a list of problems; an empty list means the input may be published.
export function validatePackInput(input: PackInput): string[] {
  const problems: string[] = [];
  const sources = new Map(input.sources.map((s) => [s.id, s]));
  const ids = new Set<string>();

  for (const dataset of input.storage) {
    const source = sources.get(dataset.sourceId);
    if (!source) problems.push(`${dataset.sourceId}: source not in registry`);
    else {
      if (source.status !== 'cleared') problems.push(`${source.id}: source status is '${source.status}', not 'cleared'`);
      if (source.snapshotSha256 !== dataset.generatedFrom.sha256) problems.push(`${source.id}: dataset was generated from a different snapshot than the registry lists`);
      if (!source.attribution) problems.push(`${source.id}: no attribution text`);
      if (!source.retrievedAt) problems.push(`${source.id}: no retrieval date`);
    }
    for (const item of dataset.items) {
      if (ids.has(item.id)) problems.push(`${item.id}: duplicate id`);
      ids.add(item.id);
      if (item.sourceRef.sourceId !== dataset.sourceId) problems.push(`${item.id}: source reference does not match its dataset`);
      if (!item.names.da) problems.push(`${item.id}: no Danish name`);
      else if (!item.names.da.checked) problems.push(`${item.id}: Danish name not checked`);
      if (item.periods.length === 0 && item.notes.length === 0) problems.push(`${item.id}: no storage times or notes`);
    }
  }
  return problems;
}

export async function buildPack(input: PackInput, outDir: string, now = new Date()): Promise<PackManifest> {
  const problems = validatePackInput(input);
  if (problems.length > 0) throw new Error(`Pack validation failed:\n- ${problems.join('\n- ')}`);

  await mkdir(outDir, { recursive: true });
  const dbPath = join(outDir, PACK_DB_FILE);
  await rm(dbPath, { force: true });

  const usedSourceIds = new Set(input.storage.map((d) => d.sourceId));
  const usedSources = input.sources.filter((s) => usedSourceIds.has(s.id));
  const dataVersions = new Map(input.storage.map((d) => [d.sourceId, d.sourceDataVersion]));

  const db = new DatabaseSync(dbPath);
  try {
    db.exec('PRAGMA journal_mode = DELETE;');
    db.exec(SCHEMA_SQL);
    db.exec('BEGIN');

    const meta = db.prepare('INSERT INTO meta (key, value) VALUES (?, ?)');
    meta.run('packId', input.packId);
    meta.run('version', input.version);
    meta.run('schemaVersion', String(PACK_SCHEMA_VERSION));
    meta.run('createdAt', now.toISOString());

    const insertSource = db.prepare(
      'INSERT INTO sources (id, title, publisher, url, lang, license, license_url, attribution, retrieved_at, data_version) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    );
    for (const s of usedSources) {
      insertSource.run(s.id, s.title, s.publisher, s.url, s.lang, s.license, s.licenseUrl ?? null, s.attribution, s.retrievedAt, dataVersions.get(s.id) ?? null);
    }

    const insertItem = db.prepare(
      'INSERT INTO storage_items (id, category, name_en, subtitle_en, name_da, subtitle_da, source_id, source_record_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    );
    const insertPeriod = db.prepare(
      'INSERT INTO storage_periods (item_id, ord, location, basis, kind, min_value, max_value, unit, source_field) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    );
    const insertNote = db.prepare('INSERT INTO storage_notes (item_id, ord, location, lang, text, source_field) VALUES (?, ?, ?, ?, ?, ?)');
    const insertSearch = db.prepare('INSERT INTO storage_search (item_id, lang, name, subtitle, keywords) VALUES (?, ?, ?, ?, ?)');

    for (const dataset of input.storage) {
      for (const item of dataset.items) {
        const { en, da } = item.names;
        if (!da) throw new Error(`${item.id}: no Danish name`); // unreachable after validation; narrows the type
        insertItem.run(item.id, item.category, en.name, en.subtitle ?? null, da.name, da.subtitle ?? null, item.sourceRef.sourceId, item.sourceRef.recordId);
        item.periods.forEach((p, ord) => {
          const d = p.duration;
          insertPeriod.run(item.id, ord, p.location, p.basis, d.kind, d.kind === 'range' ? d.min : null, d.kind === 'range' ? d.max : null, d.kind === 'range' ? d.unit : null, p.sourceField);
        });
        item.notes.forEach((n, ord) => insertNote.run(item.id, ord, n.location, n.lang, n.text, n.sourceField));
        insertSearch.run(item.id, 'en', en.name, en.subtitle ?? '', item.keywords.join(' '));
        insertSearch.run(item.id, 'da', da.name, da.subtitle ?? '', '');
      }
    }

    db.exec('COMMIT');
    db.exec("INSERT INTO storage_search (storage_search) VALUES ('optimize')");
    db.exec('VACUUM');
    const integrity = db.prepare('PRAGMA integrity_check').get() as { integrity_check: string };
    if (integrity.integrity_check !== 'ok') throw new Error(`SQLite integrity check failed: ${integrity.integrity_check}`);
  } finally {
    db.close();
  }

  const bytes = await readFile(dbPath);
  const manifest: PackManifest = {
    packId: input.packId,
    version: input.version,
    schemaVersion: PACK_SCHEMA_VERSION,
    createdAt: now.toISOString(),
    file: PACK_DB_FILE,
    sizeBytes: bytes.byteLength,
    sha256: createHash('sha256').update(bytes).digest('hex'),
    dependencies: [],
    languages: ['da', 'en'],
    counts: {
      guides: 0,
      storageItems: input.storage.reduce((n, d) => n + d.items.length, 0),
      sources: usedSources.length,
    },
    sources: usedSources.map((s) => {
      const dataVersion = dataVersions.get(s.id);
      return dataVersion ? { id: s.id, license: s.license, dataVersion } : { id: s.id, license: s.license };
    }),
  };
  await writeFile(join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  return manifest;
}
