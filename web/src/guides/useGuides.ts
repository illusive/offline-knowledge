// The guides of a category (D-037, D-038, D-040), and searching them: titles only for one or two
// letters, the full text from three (D-018). Used by Home and the category pages.

import type { DbClient } from '../db/client';
import type { GuideRow } from '../db/queries';
import { useDbQuery } from '../db/useDbQuery';
import { MIN_FTS_QUERY_LENGTH } from '../food/search';

// Null while loading; an empty list if the pack could not answer (the category then shows none).
export function useGuides(db: DbClient | null, category: GuideRow['category'] = 'first-aid'): GuideRow[] | null {
  const { data, error } = useDbQuery(db, { type: 'guides', category });
  return error ? [] : (data ?? null);
}

// Guides from `guides` matching a query; null while the full-text search runs.
export function useGuideSearch(db: DbClient, guides: GuideRow[] | null, query: string): GuideRow[] | null {
  const q = query.trim();
  const fullText = q.length >= MIN_FTS_QUERY_LENGTH;
  const { data, error } = useDbQuery(db, fullText ? { type: 'searchGuides', query: q } : null);
  if (q === '') return [];
  if (!guides) return null;
  if (!fullText) {
    const lower = q.toLocaleLowerCase('da'); // the guides are in Danish
    return guides.filter((g) => (g.name ?? g.title).toLocaleLowerCase('da').split(/[\s-]+/).some((w) => w.startsWith(lower)));
  }
  if (error) return [];
  const ids = new Set(guides.map((g) => g.id));
  return data ? data.filter((g) => ids.has(g.id)) : null;
}
