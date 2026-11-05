// Food search used by Home and the "Storing food" page: all foods sorted by name when the
// query is empty, a prefix filter for 1–2 characters, trigram full-text search from 3.

import { useMemo } from 'react';
import type { DbClient } from '../db/client';
import type { ItemRow } from '../db/queries';
import { useDbQuery } from '../db/useDbQuery';
import type { Lang } from '../i18n/strings';
import { MIN_FTS_QUERY_LENGTH, prefixFilter, rankResults } from './search';

export const displayName = (item: ItemRow, lang: Lang) => (lang === 'da' ? item.name_da : item.name_en);

// Loads the food list once the pack is open (db is null until then); empty if the pack fails.
export function useAllFoods(db: DbClient | null): ItemRow[] | null {
  const { data, error } = useDbQuery(db, { type: 'list' });
  return error ? [] : (data ?? null);
}

// Returns null while results are loading.
export function useFoodSearch(db: DbClient, all: ItemRow[] | null, query: string, lang: Lang): ItemRow[] | null {
  const trimmed = query.trim();
  const fullText = trimmed.length >= MIN_FTS_QUERY_LENGTH;
  const { data: matches, error } = useDbQuery(db, fullText ? { type: 'search', query: trimmed } : null);

  return useMemo(() => {
    if (!all) return null;
    if (trimmed === '') return [...all].sort((a, b) => displayName(a, lang).localeCompare(displayName(b, lang), lang));
    if (!fullText) return rankResults(prefixFilter(all, trimmed), trimmed, lang);
    if (error) return [];
    return matches ? rankResults(matches, trimmed, lang) : null;
  }, [all, matches, error, trimmed, fullText, lang]);
}
