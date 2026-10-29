// Builds the knowledge pack: one SQLite file plus manifest.json.
// Validation happens before anything is written; the build refuses content
// that breaks docs/CONTENT_POLICY.md rather than leaving it out silently.

import { createHash } from 'node:crypto';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { PACK_SCHEMA_VERSION, type PackManifest } from '../schema/pack.ts';
import type { Guide } from '../schema/guide.ts';
import { SECTION_ORDER, type ProduceGuide } from '../schema/produce.ts';
import type { StorageDataset } from '../schema/storage.ts';
import { shownTexts } from './guides.ts';
import type { EthyleneProfile } from './produce.ts';
import type { RegistrySource } from './registry.ts';

export const PACK_DB_FILE = 'pack.sqlite';

const SCHEMA_SQL = `
CREATE TABLE meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);

CREATE TABLE sources (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  short_name TEXT NOT NULL,
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
  text_da TEXT,
  text_da_checked INTEGER NOT NULL DEFAULT 0,
  source_field TEXT NOT NULL,
  PRIMARY KEY (item_id, ord)
);

-- Trigram index so that Danish compound words match ('kål' finds 'Hvidkål').
-- Queries need at least 3 characters; shorter queries need a prefix fallback in the app.
-- Food guides (D-033): sections with a verdict, sourced blocks, and Handbook 66 storage relations.
CREATE TABLE produce_sections (
  item_id TEXT NOT NULL REFERENCES storage_items(id),
  ord INTEGER NOT NULL,
  section TEXT NOT NULL,
  verdict TEXT,
  PRIMARY KEY (item_id, section)
);

CREATE TABLE produce_blocks (
  item_id TEXT NOT NULL REFERENCES storage_items(id),
  section TEXT NOT NULL,
  ord INTEGER NOT NULL,
  text TEXT NOT NULL,
  quote TEXT NOT NULL,
  source_id TEXT NOT NULL REFERENCES sources(id),
  locator TEXT NOT NULL,
  recipe TEXT,
  PRIMARY KEY (item_id, section, ord)
);

CREATE TABLE produce_ethylene (
  item_id TEXT PRIMARY KEY REFERENCES storage_items(id),
  storage_groups TEXT NOT NULL,
  producer INTEGER NOT NULL,
  sensitive INTEGER NOT NULL
);

CREATE TABLE produce_relations (
  item_id TEXT NOT NULL REFERENCES storage_items(id),
  other_id TEXT NOT NULL REFERENCES storage_items(id),
  relation TEXT NOT NULL CHECK (relation IN ('apart', 'with')),
  PRIMARY KEY (item_id, other_id)
);

-- Guides (D-037): verbatim blocks from one primary source, images, and second-authority checks.
CREATE TABLE guides (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  ord INTEGER NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  summary_original TEXT, -- the source's words behind a rewritten summary (D-042)
  source_id TEXT NOT NULL REFERENCES sources(id),
  risk TEXT NOT NULL,
  owner_checked INTEGER NOT NULL,
  related TEXT NOT NULL, -- JSON array of guide ids
  abbreviations TEXT NOT NULL, -- JSON [{short, long}]
  food_id TEXT REFERENCES storage_items(id), -- growing: the food page this crop links to
  name TEXT,         -- plain name for lists and titles (growing)
  season TEXT,       -- growing period shown as subtitle
  grp TEXT           -- preparedness: 'situation' or 'supplies' (D-040)
);

-- Search over guide titles, summaries and shown text (trigram, like storage_search).
CREATE VIRTUAL TABLE guide_search USING fts5(
  guide_id UNINDEXED,
  title,
  body,
  tokenize = 'trigram remove_diacritics 1'
);

CREATE TABLE guide_blocks (
  guide_id TEXT NOT NULL REFERENCES guides(id),
  ord INTEGER NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('heading', 'section', 'text', 'steps', 'list', 'checklist', 'warning', 'image')),
  title TEXT,
  text TEXT,
  items TEXT,        -- JSON array: strings for steps, lists and warnings; {id, text} for checklists
  step_images TEXT,  -- JSON [{after, imageId, alt, page}] for steps with photos
  image_id TEXT REFERENCES guide_images(id),
  alt TEXT,
  caption TEXT,
  page INTEGER NOT NULL,
  source_id TEXT REFERENCES sources(id), -- when not the guide's own source
  original TEXT,     -- JSON {lang, title?, text?, items?}: the source's words of a translated block (D-041)
  PRIMARY KEY (guide_id, ord)
);

CREATE TABLE guide_images (
  id TEXT PRIMARY KEY,   -- file name
  mime TEXT NOT NULL,
  data BLOB NOT NULL
);

CREATE TABLE guide_checks (
  guide_id TEXT NOT NULL REFERENCES guides(id),
  ord INTEGER NOT NULL,
  source_id TEXT NOT NULL REFERENCES sources(id),
  locator TEXT NOT NULL,
  quote TEXT NOT NULL,
  note TEXT NOT NULL,
  PRIMARY KEY (guide_id, ord)
);

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
  // Food guides and Handbook 66 relations (D-033); validated by lib/produce.ts before the build.
  guides?: ProduceGuide[];
  ethylene?: Map<string, EthyleneProfile>;
  relations?: { itemId: string; otherId: string; relation: 'apart' | 'with' }[];
  // Sources referenced only by guides and relations, e.g. Handbook 66 for Table 1.
  extraSourceIds?: string[];
  // Guides (D-037), validated by lib/guides.ts before the build; images by file name.
  guideSet?: { guides: Guide[]; images: Map<string, { mime: string; data: Uint8Array }> };
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
      // Licence status is recorded but not enforced while the project is private (D-028).
      if (source.snapshotSha256 !== dataset.generatedFrom.sha256) problems.push(`${source.id}: dataset was generated from a different snapshot than the registry lists`);
      if (!source.publisher || !source.title) problems.push(`${source.id}: no publisher or title`);
      if (!source.retrievedAt) problems.push(`${source.id}: no retrieval date`);
    }
    for (const item of dataset.items) {
      if (ids.has(item.id)) problems.push(`${item.id}: duplicate id`);
      ids.add(item.id);
      if (item.sourceRef.sourceId !== dataset.sourceId) problems.push(`${item.id}: source reference does not match its dataset`);
      if (!item.names.da) problems.push(`${item.id}: no Danish name`);
      else if (!item.names.da.checked) problems.push(`${item.id}: Danish name not checked`);
      if (item.periods.length === 0 && item.notes.length === 0) problems.push(`${item.id}: no storage times or notes`);
      for (const note of item.notes) {
        if (note.lang !== 'da' && !note.translation) problems.push(`${item.id}: note without Danish translation: "${note.text}"`);
      }
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

  const usedSourceIds = new Set([
    ...input.storage.map((d) => d.sourceId),
    ...(input.guides ?? []).flatMap((g) => g.sections.flatMap((s) => s.blocks.map((b) => b.sourceRef.sourceId))),
    ...(input.extraSourceIds ?? []),
    ...(input.guideSet?.guides ?? []).flatMap((g) => [g.sourceId, ...g.checks.map((c) => c.sourceId), ...g.blocks.flatMap((b) => (b.sourceId ? [b.sourceId] : []))]),
  ]);
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
      'INSERT INTO sources (id, title, short_name, publisher, url, lang, license, license_url, attribution, retrieved_at, data_version) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    );
    for (const s of usedSources) {
      insertSource.run(s.id, s.title, s.shortName ?? s.publisher, s.publisher, s.url, s.lang, s.license, s.licenseUrl ?? null, s.attribution || `${s.publisher}: ${s.title}`, s.retrievedAt, dataVersions.get(s.id) ?? null);
    }

    const insertItem = db.prepare(
      'INSERT INTO storage_items (id, category, name_en, subtitle_en, name_da, subtitle_da, source_id, source_record_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    );
    const insertPeriod = db.prepare(
      'INSERT INTO storage_periods (item_id, ord, location, basis, kind, min_value, max_value, unit, source_field) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    );
    const insertNote = db.prepare(
      'INSERT INTO storage_notes (item_id, ord, location, lang, text, text_da, text_da_checked, source_field) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    );
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
        item.notes.forEach((n, ord) =>
          insertNote.run(item.id, ord, n.location, n.lang, n.text, n.translation?.text ?? null, n.translation?.checked ? 1 : 0, n.sourceField),
        );
        insertSearch.run(item.id, 'en', en.name, en.subtitle ?? '', item.keywords.join(' '));
        insertSearch.run(item.id, 'da', da.name, da.subtitle ?? '', '');
      }
    }

    const insertSection = db.prepare('INSERT INTO produce_sections (item_id, ord, section, verdict) VALUES (?, ?, ?, ?)');
    const insertBlock = db.prepare('INSERT INTO produce_blocks (item_id, section, ord, text, quote, source_id, locator, recipe) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    for (const guide of input.guides ?? []) {
      for (const section of guide.sections) {
        insertSection.run(guide.id, SECTION_ORDER.indexOf(section.key), section.key, section.verdict ?? null);
        section.blocks.forEach((b, ord) => insertBlock.run(guide.id, section.key, ord, b.text ?? '', b.sourceRef.quote, b.sourceRef.sourceId, b.sourceRef.locator, b.recipe ? JSON.stringify(b.recipe) : null));
      }
    }
    const insertEthylene = db.prepare('INSERT INTO produce_ethylene (item_id, storage_groups, producer, sensitive) VALUES (?, ?, ?, ?)');
    for (const [itemId, p] of input.ethylene ?? []) insertEthylene.run(itemId, p.groups.join(','), p.producer ? 1 : 0, p.sensitive ? 1 : 0);
    const insertRelation = db.prepare('INSERT INTO produce_relations (item_id, other_id, relation) VALUES (?, ?, ?)');
    for (const r of input.relations ?? []) insertRelation.run(r.itemId, r.otherId, r.relation);

    if (input.guideSet) {
      const { guides, images } = input.guideSet;
      const insertImage = db.prepare('INSERT INTO guide_images (id, mime, data) VALUES (?, ?, ?)');
      const usedImages = new Set(guides.flatMap((g) => g.blocks.flatMap((b) => (b.kind === 'image' ? [b.file] : b.kind === 'steps' ? (b.images ?? []).map((i) => i.file) : []))));
      for (const file of usedImages) {
        const image = images.get(file);
        if (!image) throw new Error(`Missing image ${file}`);
        insertImage.run(file, image.mime, image.data);
      }
      const insertGuide = db.prepare('INSERT INTO guides (id, category, ord, title, summary, summary_original, source_id, risk, owner_checked, related, abbreviations, food_id, name, season, grp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
      const insertGuideSearch = db.prepare('INSERT INTO guide_search (guide_id, title, body) VALUES (?, ?, ?)');
      const insertGuideBlock = db.prepare(
        'INSERT INTO guide_blocks (guide_id, ord, kind, title, text, items, step_images, image_id, alt, caption, page, source_id, original) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      );
      const insertCheck = db.prepare('INSERT INTO guide_checks (guide_id, ord, source_id, locator, quote, note) VALUES (?, ?, ?, ?, ?, ?)');
      for (const g of guides) {
        insertGuide.run(g.id, g.category, g.order, g.title, g.summary ?? null, g.originalSummary ?? null, g.sourceId, g.risk, g.ownerChecked ? 1 : 0, JSON.stringify(g.related ?? []), JSON.stringify(g.abbreviations ?? []), g.foodId ?? null, g.name ?? null, g.season?.text ?? null, g.group ?? null);
        // The source's words of rewritten blocks are searchable too (D-042), so a search for the source's term still finds the guide.
        const originals = g.blocks.flatMap((b) => (b.original ? [b.original.title ?? '', b.original.text ?? '', ...(b.original.items ?? [])] : []));
        const body = [g.summary ?? '', g.originalSummary ?? '', ...g.blocks.flatMap((b) => [...('title' in b && b.title ? [b.title] : []), ...shownTexts(b)]), ...originals, ...(g.abbreviations ?? []).map((a) => a.long)];
        insertGuideSearch.run(g.id, [g.name, g.title].filter(Boolean).join(' '), body.join('\n'));
        g.blocks.forEach((b, ord) => {
          const title = 'title' in b ? (b.title ?? null) : null;
          const text = 'text' in b ? (b.text ?? null) : b.kind === 'section' ? b.key : null;
          const items = 'items' in b && b.items ? JSON.stringify(b.items) : null;
          const stepImages = b.kind === 'steps' && b.images?.length ? JSON.stringify(b.images.map((i) => ({ after: i.after, imageId: i.file, alt: i.alt, page: i.page }))) : null;
          insertGuideBlock.run(g.id, ord, b.kind, title, text, items, stepImages, b.kind === 'image' ? b.file : null, b.kind === 'image' ? b.alt : null, b.kind === 'image' ? (b.caption ?? null) : null, b.page, b.sourceId ?? null, b.original ? JSON.stringify(b.original) : null);
        });
        g.checks.forEach((c, ord) => insertCheck.run(g.id, ord, c.sourceId, c.locator, c.quote, c.note));
      }
    }

    db.exec('COMMIT');
    db.exec("INSERT INTO storage_search (storage_search) VALUES ('optimize')");
    db.exec("INSERT INTO guide_search (guide_search) VALUES ('optimize')");
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
      guides: input.guideSet?.guides.length ?? 0,
      produceGuides: input.guides?.length ?? 0,
      storageItems: input.storage.reduce((n, d) => n + d.items.length, 0),
      sources: usedSources.length,
    },
    sources: usedSources.map((s) => {
      const dataVersion = dataVersions.get(s.id);
      const entry = { id: s.id, license: s.license, licenseStatus: s.status };
      return dataVersion ? { ...entry, dataVersion } : entry;
    }),
  };
  await writeFile(join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  return manifest;
}
