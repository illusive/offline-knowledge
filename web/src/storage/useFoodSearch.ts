// Food search used by Home and the "Storing food" page: all foods sorted by name when the
// query is empty, a prefix filter for 1–2 characters, trigram full-text search from 3.

import { useEffect, useMemo, useState } from 'react';
import type { DbClient } from '../db/client';
import type { ItemRow } from '../db/queries';
import type { Lang } from '../i18n/strings';
import { MIN_FTS_QUERY_LENGTH, prefixFilter, rankResults } from './search';

export const displayName = (item: ItemRow, lang: Lang) => (lang === 'da' ? item.name_da : item.name_en);

// Loads the food list once the pack is open (db is null until then).
export function useAllFoods(db: DbClient | null): ItemRow[] | null {
  const [all, setAll] = useState<ItemRow[] | null>(null);
  useEffect(() => {
    if (db) void db.call({ type: 'list' }).then(setAll);
  }, [db]);
  return all;
}

// Returns null while results are loading.
export function useFoodSearch(db: DbClient, all: ItemRow[] | null, query: string, lang: Lang): ItemRow[] | null {
  const [matches, setMatches] = useState<{ query: string; rows: ItemRow[] } | null>(null);
  const trimmed = query.trim();

  useEffect(() => {
    if (trimmed.length < MIN_FTS_QUERY_LENGTH) return;
    let current = true;
    void db.call({ type: 'search', query: trimmed }).then((rows) => {
      if (current) setMatches({ query: trimmed, rows });
    });
    return () => {
      current = false;
    };
  }, [db, trimmed]);

  return useMemo(() => {
    if (!all) return null;
    if (trimmed === '') return [...all].sort((a, b) => displayName(a, lang).localeCompare(displayName(b, lang), lang));
    if (trimmed.length < MIN_FTS_QUERY_LENGTH) return rankResults(prefixFilter(all, trimmed), trimmed, lang);
    return matches?.query === trimmed ? rankResults(matches.rows, trimmed, lang) : null;
  }, [all, matches, trimmed, lang]);
}
