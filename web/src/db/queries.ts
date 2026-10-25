// Read-only queries against the pack (schema: content/lib/pack.ts).
// Takes a minimal database interface so the same code runs in the OPFS worker and in tests.

import type { Location, PeriodRow } from '../storage/format';
import { ftsPhrase, MIN_FTS_QUERY_LENGTH } from '../storage/search';

export const SUPPORTED_PACK_SCHEMA_VERSION = 2;

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

export interface ItemDetail {
  item: ItemRow;
  periods: PeriodRow[];
  notes: NoteRow[];
  source: SourceRow;
}

const ITEM_COLUMNS = 'i.id, i.category, i.name_da, i.subtitle_da, i.name_en, i.subtitle_en, i.source_id';

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
  return rows<ItemRow>(db, `SELECT ${ITEM_COLUMNS} FROM storage_items i`);
}

// Full-text search; only for queries of at least MIN_FTS_QUERY_LENGTH characters.
export function searchItems(db: SqlDb, query: string): ItemRow[] {
  if (query.trim().length < MIN_FTS_QUERY_LENGTH) throw new Error('Query too short for trigram search');
  return rows<ItemRow>(
    db,
    `SELECT DISTINCT ${ITEM_COLUMNS} FROM storage_search s JOIN storage_items i ON i.id = s.item_id WHERE storage_search MATCH ?`,
    [ftsPhrase(query)],
  );
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
  return { item, periods, notes, source };
}
