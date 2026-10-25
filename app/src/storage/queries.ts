// Read-only queries against the pack's storage tables (content/lib/pack.ts defines the schema).

import type { SQLiteDatabase } from 'expo-sqlite';
import type { Location, PeriodRow } from './format';
import { ftsPhrase, MIN_FTS_QUERY_LENGTH } from './search';

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
  text: string;
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

const ITEM_COLUMNS = 'i.id, i.category, i.name_da, i.subtitle_da, i.name_en, i.subtitle_en, i.source_id';

export function listItems(db: SQLiteDatabase): Promise<ItemRow[]> {
  return db.getAllAsync<ItemRow>(`SELECT ${ITEM_COLUMNS} FROM storage_items i`);
}

// Full-text search; only for queries of at least MIN_FTS_QUERY_LENGTH characters.
export function searchItems(db: SQLiteDatabase, query: string): Promise<ItemRow[]> {
  if (query.trim().length < MIN_FTS_QUERY_LENGTH) throw new Error('Query too short for trigram search');
  return db.getAllAsync<ItemRow>(
    `SELECT DISTINCT ${ITEM_COLUMNS} FROM storage_search s JOIN storage_items i ON i.id = s.item_id WHERE storage_search MATCH ?`,
    [ftsPhrase(query)],
  );
}

export async function getItemDetail(db: SQLiteDatabase, id: string) {
  const item = await db.getFirstAsync<ItemRow>(`SELECT ${ITEM_COLUMNS} FROM storage_items i WHERE i.id = ?`, [id]);
  if (!item) return null;
  const [periods, notes, source] = await Promise.all([
    db.getAllAsync<PeriodRow>('SELECT location, basis, kind, min_value, max_value, unit FROM storage_periods WHERE item_id = ? ORDER BY ord', [id]),
    db.getAllAsync<NoteRow>('SELECT location, lang, text FROM storage_notes WHERE item_id = ? ORDER BY ord', [id]),
    db.getFirstAsync<SourceRow>('SELECT id, title, publisher, url, license, attribution, retrieved_at, data_version FROM sources WHERE id = ?', [item.source_id]),
  ]);
  if (!source) throw new Error(`Pack is missing source ${item.source_id}`);
  return { item, periods, notes, source };
}
