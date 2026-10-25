// Search helpers for the storage table. Pure; no React Native imports.
// The pack's FTS5 index uses the trigram tokenizer (docs/DECISIONS.md D-018).

import type { Lang } from '../i18n/strings';

export const MIN_FTS_QUERY_LENGTH = 3;

// Folds case and the diacritics the index also folds (å -> a, é -> e).
// æ and ø are separate Danish letters and are kept, as in the index.
export function fold(text: string): string {
  return text
    .toLocaleLowerCase('da')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .normalize('NFC');
}

// Wraps user input as one FTS5 string so that operators and quotes in it are not interpreted.
export function ftsPhrase(query: string): string {
  return `"${query.trim().replace(/"/g, '""')}"`;
}

export interface SearchCandidate {
  id: string;
  name_da: string;
  name_en: string;
}

// Matches on the display-language name rank first (exact, then prefix, then word prefix),
// then the same tiers on the other language's name, then the rest (e.g. compound words).
// Alphabetical within each tier. Folding å -> a means 'kål' also prefixes English 'Kale',
// which is why the display language takes precedence.
export function rankResults<T extends SearchCandidate>(rows: T[], query: string, lang: Lang): T[] {
  const q = fold(query.trim());
  const display = (row: T) => (lang === 'da' ? row.name_da : row.name_en);
  const other = (row: T) => (lang === 'da' ? row.name_en : row.name_da);
  const nameTier = (name: string) => {
    const n = fold(name);
    if (n === q) return 0;
    if (n.startsWith(q)) return 1;
    if (n.split(/[\s,/()-]+/).some((w) => w.startsWith(q))) return 2;
    return undefined;
  };
  const tier = (row: T) => nameTier(display(row)) ?? (nameTier(other(row)) ?? 3) + 3;
  return [...rows].sort((a, b) => tier(a) - tier(b) || display(a).localeCompare(display(b), lang));
}

// For queries shorter than the trigram minimum: prefix match on names.
export function prefixFilter<T extends SearchCandidate>(rows: T[], query: string): T[] {
  const q = fold(query.trim());
  if (q === '') return rows;
  return rows.filter((row) => [row.name_da, row.name_en].some((n) => fold(n).split(/[\s,/()-]+/).some((w) => w.startsWith(q))));
}
