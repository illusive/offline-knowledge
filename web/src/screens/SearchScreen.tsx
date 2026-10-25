// Food storage lookup (D-014): search a food, open it to see storage times.

import { useEffect, useMemo, useState } from 'react';
import { SearchField, MessageState } from '../components/ui';
import type { DbClient } from '../db/client';
import type { ItemRow } from '../db/queries';
import type { Lang, Strings } from '../i18n/strings';
import { foodHref } from '../router';
import { MIN_FTS_QUERY_LENGTH, prefixFilter, rankResults } from '../storage/search';

const displayName = (item: ItemRow, lang: Lang) => (lang === 'da' ? item.name_da : item.name_en);

export function SearchScreen({ db, lang, s, query, onQueryChange }: {
  db: DbClient;
  lang: Lang;
  s: Strings;
  query: string;
  onQueryChange: (q: string) => void;
}) {
  const [all, setAll] = useState<ItemRow[] | null>(null);
  const [matches, setMatches] = useState<{ query: string; rows: ItemRow[] } | null>(null);
  const trimmed = query.trim();

  useEffect(() => {
    void db.call({ type: 'list' }).then(setAll);
  }, [db]);

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

  const results = useMemo(() => {
    if (!all) return null;
    if (trimmed === '') return [...all].sort((a, b) => displayName(a, lang).localeCompare(displayName(b, lang), lang));
    if (trimmed.length < MIN_FTS_QUERY_LENGTH) return rankResults(prefixFilter(all, trimmed), trimmed, lang);
    return matches?.query === trimmed ? rankResults(matches.rows, trimmed, lang) : null;
  }, [all, matches, trimmed, lang]);

  return (
    <main className="mx-auto max-w-2xl pb-[max(2rem,env(safe-area-inset-bottom))]">
      <header className="px-4 pt-[max(1.5rem,env(safe-area-inset-top))]">
        <h1 className="mb-3 text-3xl font-bold">{s.storageTitle}</h1>
        <SearchField value={query} onChange={onQueryChange} placeholder={s.searchPlaceholder} label={s.searchLabel} clearLabel={s.clearSearch} />
        <p className="mt-2 text-sm text-muted" aria-live="polite">
          {results ? s.itemCount(results.length) : ' '}
        </p>
      </header>

      {results && results.length === 0 && trimmed !== '' ? <MessageState title={s.noResults(trimmed)} /> : null}

      <ul className="mt-1 divide-y divide-border">
        {(results ?? []).map((item) => {
          const subtitle = lang === 'da' ? item.subtitle_da : item.subtitle_en;
          const otherName = lang === 'da' ? item.name_en : item.name_da;
          return (
            <li key={item.id}>
              <a href={foodHref(item.id)} className="block px-4 py-3 active:bg-surface">
                <span className="block">{displayName(item, lang)}</span>
                {subtitle ? <span className="block text-sm text-muted">{subtitle}</span> : null}
                <span className="block text-sm text-muted" lang={lang === 'da' ? 'en' : 'da'}>
                  {otherName}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
