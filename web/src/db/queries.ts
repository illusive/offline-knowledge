// Read-only queries against the pack (schema: content/lib/pack.ts).
// Takes a minimal database interface so the same code runs in the OPFS worker and in tests.

import { longestKeeping, type Location, type PeriodRow } from '../storage/format';
import { ftsPhrase, MIN_FTS_QUERY_LENGTH } from '../storage/search';

export const SUPPORTED_PACK_SCHEMA_VERSION = 9;

type Bind = (string | number | null)[];

export interface SqlDb {
  selectObjects(sql: string, bind?: Bind): Record<string, unknown>[];
}

export interface ItemRow {
  id: string;
  category: 'fresh-fruits' | 'fresh-vegetables';
  name_da: string;
  subtitle_da: string | null;
  name_en: string;
  subtitle_en: string | null;
  source_id: string;
  longest?: PeriodRow | null; // where it keeps longest (lists only)
}

export interface NoteRow {
  location: Location;
  lang: 'da' | 'en';
  text: string;                    // source text
  text_da: string | null;          // Danish translation (D-031)
  text_da_checked: 0 | 1;
}

export interface SourceRow {
  id: string;
  title: string;
  publisher: string;
  url: string;
  license: string;
  attribution: string;
  retrieved_at: string;
  data_version: string | null;
}

export type GuideSectionKey = 'about' | 'prefers' | 'avoid' | 'together' | 'coolStorage' | 'drying' | 'pickling' | 'canning';

export interface GuideBlockRow {
  text: string;         // Danish
  quote: string;        // original passage
  source_id: string;
  locator: string;
  recipe: Recipe | null;  // a step-by-step method (D-035)
}

export interface Recipe {
  title: string;
  intro?: string;
  facts?: Partial<Record<'time' | 'keeps' | 'yield', string>>;
  ingredients?: string[];
  steps: string[];
}

export interface GuideSectionRow {
  section: GuideSectionKey;
  verdict: string | null;
  blocks: GuideBlockRow[];
}

export interface RelatedItem {
  id: string;
  name_da: string;
  subtitle_da: string | null;
  name_en: string;
  subtitle_en: string | null;
}

export interface Ethylene {
  producer: boolean;
  sensitive: boolean;
  apart: RelatedItem[];
  with: RelatedItem[];
}

export interface ItemDetail {
  item: ItemRow;
  periods: PeriodRow[];
  notes: NoteRow[];
  source: SourceRow;                          // source of the storage times (FoodKeeper)
  guide: GuideSectionRow[];                   // empty when the food has no guide yet (D-033)
  ethylene: Ethylene | null;                  // null when the food is not in Handbook 66 Table 1
  sources: (SourceRow & { lang: 'da' | 'en'; short_name: string })[]; // every source used on the page
}

// Guides (D-037): verbatim blocks from one source, with images and second-authority checks.
export interface GuideRow {
  id: string;
  category: 'first-aid' | 'growing';
  title: string;
  summary: string | null;
  abbreviations: { short: string; long: string }[];
  name: string | null;     // growing: plain name, e.g. 'Radiser'
  season: string | null;   // growing: the growing period
}

const GUIDE_COLUMNS = 'g.id, g.category, g.title, g.summary, g.abbreviations, g.name, g.season';
const guideRows = (db: SqlDb, sql: string, bind?: Bind) =>
  rows<Omit<GuideRow, 'abbreviations'> & { abbreviations: string }>(db, sql, bind).map((g) => ({ ...g, abbreviations: JSON.parse(g.abbreviations) as GuideRow['abbreviations'] }));

export interface GuideImage {
  id: string;
  mime: string;
  data: Uint8Array;
}

export type GuideBlock =
  | { kind: 'heading' | 'text'; text: string; page: number }
  | { kind: 'section'; key: GrowingSection; page: number }
  | { kind: 'steps'; title: string | null; items: string[]; images: { after: number; imageId: string; alt: string; page: number }[]; page: number }
  | { kind: 'list'; title: string | null; items: string[]; page: number }
  | { kind: 'warning'; title: string | null; text: string | null; items: string[]; page: number }
  | { kind: 'image'; imageId: string; alt: string; caption: string | null; page: number };

export type GrowingSection = 'sowing' | 'conditions' | 'care' | 'harvest' | 'seeds' | 'neighbours';

export interface GuideCheck {
  source: SourceRow & { short_name: string };
  locator: string;
  quote: string;
}

export interface GuideDetail {
  guide: GuideRow & { owner_checked: boolean; food_id: string | null };
  blocks: GuideBlock[];
  blockSources: (SourceRow & { short_name: string })[]; // sources of single blocks, other than the guide's
  images: GuideImage[];
  source: SourceRow & { short_name: string };
  checks: GuideCheck[];
  related: GuideRow[];
}

const SOURCE_COLUMNS = 'id, title, short_name, publisher, url, license, attribution, retrieved_at, data_version';

export function listGuides(db: SqlDb, category: GuideRow['category']): GuideRow[] {
  return guideRows(db, `SELECT ${GUIDE_COLUMNS} FROM guides g WHERE g.category = ? ORDER BY g.ord`, [category]);
}

// Full-text search over guide titles and text; title matches first, then emergency order.
// Only for queries of at least MIN_FTS_QUERY_LENGTH characters.
export function searchGuides(db: SqlDb, query: string): GuideRow[] {
  if (query.trim().length < MIN_FTS_QUERY_LENGTH) throw new Error('Query too short for trigram search');
  const found = guideRows(db, `SELECT ${GUIDE_COLUMNS} FROM guide_search s JOIN guides g ON g.id = s.guide_id WHERE guide_search MATCH ? ORDER BY g.ord`, [ftsPhrase(query)]);
  const q = query.trim().toLocaleLowerCase('da');
  const inTitle = (g: GuideRow) => (g.title.toLocaleLowerCase('da').includes(q) ? 0 : 1);
  return found.sort((a, b) => inTitle(a) - inTitle(b)); // stable: emergency order within each group
}

export function getGuide(db: SqlDb, id: string): GuideDetail | null {
  const [row] = rows<Omit<GuideRow, 'abbreviations'> & { abbreviations: string; owner_checked: number; source_id: string; related: string; food_id: string | null }>(
    db,
    'SELECT id, category, title, summary, abbreviations, name, season, owner_checked, source_id, related, food_id FROM guides WHERE id = ?',
    [id],
  );
  if (!row) return null;
  const g = { ...row, abbreviations: JSON.parse(row.abbreviations) as GuideRow['abbreviations'] };
  const source = (sid: string) => {
    const [s] = rows<SourceRow & { short_name: string }>(db, `SELECT ${SOURCE_COLUMNS} FROM sources WHERE id = ?`, [sid]);
    if (!s) throw new Error(`Pack is missing source ${sid}`);
    return s;
  };
  type BlockRow = { kind: GuideBlock['kind']; title: string | null; text: string | null; items: string | null; step_images: string | null; image_id: string | null; alt: string | null; caption: string | null; page: number };
  const blocks = rows<BlockRow>(db, 'SELECT kind, title, text, items, step_images, image_id, alt, caption, page FROM guide_blocks WHERE guide_id = ? ORDER BY ord', [id]).map(
    (b): GuideBlock => {
      const items = b.items ? (JSON.parse(b.items) as string[]) : [];
      switch (b.kind) {
        case 'heading':
        case 'text':
          return { kind: b.kind, text: b.text ?? '', page: b.page };
        case 'section':
          return { kind: 'section', key: b.text as GrowingSection, page: b.page };
        case 'steps':
          return { kind: 'steps', title: b.title, items, images: b.step_images ? JSON.parse(b.step_images) : [], page: b.page };
        case 'list':
          return { kind: 'list', title: b.title, items, page: b.page };
        case 'warning':
          return { kind: 'warning', title: b.title, text: b.text, items, page: b.page };
        case 'image':
          return { kind: 'image', imageId: b.image_id ?? '', alt: b.alt ?? '', caption: b.caption, page: b.page };
      }
    },
  );
  const imageIds = [...new Set(blocks.flatMap((b) => (b.kind === 'image' ? [b.imageId] : b.kind === 'steps' ? b.images.map((i) => i.imageId) : [])))];
  const images = imageIds.flatMap((imageId) => rows<GuideImage>(db, 'SELECT id, mime, data FROM guide_images WHERE id = ?', [imageId]));
  const checks = rows<{ source_id: string; locator: string; quote: string }>(db, 'SELECT source_id, locator, quote FROM guide_checks WHERE guide_id = ? ORDER BY ord', [id]).map(
    (c) => ({ source: source(c.source_id), locator: c.locator, quote: c.quote }),
  );
  const relatedIds = JSON.parse(g.related) as string[];
  const related = relatedIds.flatMap((rid) => guideRows(db, `SELECT ${GUIDE_COLUMNS} FROM guides g WHERE g.id = ?`, [rid]));
  return {
    guide: { id: g.id, category: g.category, title: g.title, summary: g.summary, abbreviations: g.abbreviations, name: g.name, season: g.season, owner_checked: g.owner_checked === 1, food_id: g.food_id },
    blockSources: rows<{ source_id: string }>(db, 'SELECT DISTINCT source_id FROM guide_blocks WHERE guide_id = ? AND source_id IS NOT NULL', [id]).map((r) => source(r.source_id)),
    blocks,
    images,
    source: source(g.source_id),
    checks,
    related,
  };
}

const ITEM_COLUMNS ='i.id, i.category, i.name_da, i.subtitle_da, i.name_en, i.subtitle_en, i.source_id';

function rows<T>(db: SqlDb, sql: string, bind?: Bind): T[] {
  return db.selectObjects(sql, bind) as T[];
}

// Throws if the pack cannot be used by this app version, or if FTS5 trigram search is unavailable.
export function verifyPack(db: SqlDb): void {
  const [schema] = rows<{ value: string }>(db, "SELECT value FROM meta WHERE key = 'schemaVersion'");
  if (Number(schema?.value) !== SUPPORTED_PACK_SCHEMA_VERSION) {
    throw new Error(`Unsupported pack schema version: ${schema?.value ?? 'missing'}`);
  }
  rows(db, 'SELECT item_id FROM storage_search WHERE storage_search MATCH ? LIMIT 1', ['"kal"']);
}

export function listItems(db: SqlDb): ItemRow[] {
  return withLongest(db, rows<ItemRow>(db, `SELECT ${ITEM_COLUMNS} FROM storage_items i`));
}

// Adds each item's longest-keeping storage period (shown under its name in lists).
function withLongest(db: SqlDb, items: ItemRow[]): ItemRow[] {
  const periods = rows<PeriodRow & { item_id: string }>(db, 'SELECT item_id, location, basis, kind, min_value, max_value, unit FROM storage_periods ORDER BY item_id, ord');
  const byItem = new Map<string, PeriodRow[]>();
  for (const p of periods) byItem.set(p.item_id, [...(byItem.get(p.item_id) ?? []), p]);
  return items.map((i) => ({ ...i, longest: longestKeeping(byItem.get(i.id) ?? []) }));
}

// Full-text search; only for queries of at least MIN_FTS_QUERY_LENGTH characters.
export function searchItems(db: SqlDb, query: string): ItemRow[] {
  if (query.trim().length < MIN_FTS_QUERY_LENGTH) throw new Error('Query too short for trigram search');
  return withLongest(db, rows<ItemRow>(
    db,
    `SELECT DISTINCT ${ITEM_COLUMNS} FROM storage_search s JOIN storage_items i ON i.id = s.item_id WHERE storage_search MATCH ?`,
    [ftsPhrase(query)],
  ));
}

export function getItemDetail(db: SqlDb, id: string): ItemDetail | null {
  const [item] = rows<ItemRow>(db, `SELECT ${ITEM_COLUMNS} FROM storage_items i WHERE i.id = ?`, [id]);
  if (!item) return null;
  const periods = rows<PeriodRow>(db, 'SELECT location, basis, kind, min_value, max_value, unit FROM storage_periods WHERE item_id = ? ORDER BY ord', [id]);
  const notes = rows<NoteRow>(db, 'SELECT location, lang, text, text_da, text_da_checked FROM storage_notes WHERE item_id = ? ORDER BY ord', [id]);
  const [source] = rows<SourceRow>(
    db,
    'SELECT id, title, publisher, url, license, attribution, retrieved_at, data_version FROM sources WHERE id = ?',
    [item.source_id],
  );
  if (!source) throw new Error(`Pack is missing source ${item.source_id}`);

  const sectionRows = rows<{ section: GuideSectionKey; verdict: string | null }>(db, 'SELECT section, verdict FROM produce_sections WHERE item_id = ? ORDER BY ord', [id]);
  const blockRows = rows<Omit<GuideBlockRow, 'recipe'> & { section: GuideSectionKey; recipe: string | null }>(
    db,
    'SELECT section, text, quote, source_id, locator, recipe FROM produce_blocks WHERE item_id = ? ORDER BY section, ord',
    [id],
  ).map((b) => ({ ...b, recipe: b.recipe ? (JSON.parse(b.recipe) as Recipe) : null }));
  const guide = sectionRows.map((s) => ({ ...s, blocks: blockRows.filter((b) => b.section === s.section) }));

  const [eth] = rows<{ producer: number; sensitive: number }>(db, 'SELECT producer, sensitive FROM produce_ethylene WHERE item_id = ?', [id]);
  const related = (relation: 'apart' | 'with') =>
    rows<RelatedItem>(
      db,
      `SELECT i.id, i.name_da, i.subtitle_da, i.name_en, i.subtitle_en FROM produce_relations r JOIN storage_items i ON i.id = r.other_id
       WHERE r.item_id = ? AND r.relation = ? ORDER BY i.name_da`,
      [id, relation],
    );
  const ethylene = eth ? { producer: eth.producer === 1, sensitive: eth.sensitive === 1, apart: related('apart'), with: related('with') } : null;

  const sourceIds = [...new Set([item.source_id, ...blockRows.map((b) => b.source_id), ...(eth ? ['us-ars-ah66-2016'] : [])])];
  const sources = sourceIds.flatMap((sid) =>
    rows<SourceRow & { lang: 'da' | 'en'; short_name: string }>(db, 'SELECT id, title, short_name, publisher, url, license, attribution, retrieved_at, data_version, lang FROM sources WHERE id = ?', [sid]),
  );
  return { item, periods, notes, source, guide, ethylene, sources };
}
