// Search terms (D-071): everyday phrases ("kan ikke få luft") that find several guides, kept by
// hand in content/search/terms.json. They are search data only and never shown, so they add no
// words of our own to a guide (D-027). The app reads them from the pack's meta table.

import { readFile } from 'node:fs/promises';

export interface SearchTermEntry {
  phrases: string[];
  guides: string[];
}

export const SEARCH_TERMS_FILE = new URL('../search/terms.json', import.meta.url);

export async function loadSearchTerms(file: URL | string = SEARCH_TERMS_FILE): Promise<SearchTermEntry[]> {
  const raw = JSON.parse(await readFile(file, 'utf8')) as { entries?: SearchTermEntry[] };
  return raw.entries ?? [];
}

// Every guide exists; phrases are lower case, trimmed, at least 3 characters (the index's
// trigrams) and in one entry only; an entry has phrases and guides, each listed once.
export function validateSearchTerms(entries: SearchTermEntry[], guideIds: Set<string>): string[] {
  const problems: string[] = [];
  const seen = new Map<string, number>();
  entries.forEach((entry, i) => {
    const at = `search term entry ${i + 1}`;
    if (!Array.isArray(entry.phrases) || entry.phrases.length === 0) problems.push(`${at}: no phrases`);
    if (!Array.isArray(entry.guides) || entry.guides.length === 0) problems.push(`${at}: no guides`);
    for (const phrase of entry.phrases ?? []) {
      if (phrase !== phrase.trim() || phrase.length < 3 || phrase !== phrase.toLocaleLowerCase('da')) problems.push(`${at}: phrase '${phrase}' must be lower case, trimmed and at least 3 characters`);
      const before = seen.get(phrase);
      if (before !== undefined) problems.push(`${at}: phrase '${phrase}' is also in entry ${before + 1}`);
      seen.set(phrase, i);
    }
    for (const id of entry.guides ?? []) if (!guideIds.has(id)) problems.push(`${at}: no guide '${id}'`);
    if (new Set(entry.guides).size !== (entry.guides ?? []).length) problems.push(`${at}: a guide is listed twice`);
  });
  return problems;
}

// The phrases that find each guide, for its search text.
export function phrasesByGuide(entries: SearchTermEntry[]): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const entry of entries) for (const id of entry.guides) map.set(id, [...(map.get(id) ?? []), ...entry.phrases]);
  return map;
}
