// Everyday phrases that find guides (D-071), kept in the content pack (content/search/terms.json).
// A query finds an entry's guides when one of its phrases appears in the query as whole words
// ("jeg kan ikke få luft" holds "kan ikke få luft"), or while it is being typed (the query starts a
// phrase). Each entry leads to several guides; nothing here picks one diagnosis. Pure.

import { fold } from '../food/search';

export interface SearchTermEntry {
  phrases: string[];
  guides: string[];
}

// Words only, separated by single spaces, folded as the index folds them.
const words = (text: string) => fold(text).replace(/[^\p{L}\p{N}]+/gu, ' ').trim();

export function curatedGuides(query: string, entries: SearchTermEntry[]): string[] {
  const q = words(query);
  if (q.length < 3) return [];
  const found = new Set<string>();
  for (const entry of entries) {
    const hit = entry.phrases.some((phrase) => {
      const p = words(phrase);
      return ` ${q} `.includes(` ${p} `) || p.startsWith(q);
    });
    if (hit) entry.guides.forEach((id) => found.add(id));
  }
  return [...found];
}

// The kept list as stored in the pack's meta table; an older pack without it has none.
export function parseSearchTerms(json: string | undefined): SearchTermEntry[] {
  if (!json) return [];
  try {
    const raw = JSON.parse(json) as unknown;
    if (!Array.isArray(raw)) return [];
    return raw.filter(
      (e): e is SearchTermEntry =>
        typeof e === 'object' && e !== null && Array.isArray((e as SearchTermEntry).phrases) && Array.isArray((e as SearchTermEntry).guides) && [...(e as SearchTermEntry).phrases, ...(e as SearchTermEntry).guides].every((x) => typeof x === 'string'),
    );
  } catch {
    return [];
  }
}
