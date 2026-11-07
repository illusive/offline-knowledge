// The frame every guide category shares (Førstehjælp, Når det sker, Dyrkning): back and the saved
// list, the title, search at the top (D-039), then either the search results or the category's own
// overview, given as `children`.

import type { ReactNode } from 'react';
import { SavedLink } from '../bookmarks/BookmarkButton';
import { GuideList } from '../components/GuideList';
import { MessageState, Page, SearchField, SubPageHeader } from '../components/ui';
import type { DbClient } from '../db/client';
import type { GuideRow } from '../db/queries';
import type { Strings } from '../i18n/strings';
import { usePageTitle } from '../lib/usePageTitle';
import { hrefs, type SavedSection } from '../router';
import { useGuideSearch } from './useGuides';

export function GuideCategoryScreen(props: {
  db: DbClient;
  guides: GuideRow[] | null;
  section: SavedSection;
  title: string;
  intro: string;
  search: { placeholder: string; label: string };
  query: string;
  onQueryChange: (q: string) => void;
  resultCount?: (n: number) => string; // a spoken count above the results (Dyrkning)
  renderResults?: (guides: GuideRow[]) => ReactNode; // the results' own layout (Dyrkning's groups); a plain list otherwise
  searchFooter?: ReactNode; // shown under the results while searching, also when nothing matches (first aid: the 112 card, D-071)
  s: Strings;
  children: ReactNode; // the overview when not searching
}) {
  const { db, guides, section, title, intro, search, query, onQueryChange, resultCount, renderResults, searchFooter, s, children } = props;
  const results = useGuideSearch(db, guides, query);
  const searching = query.trim() !== '';
  usePageTitle(title, s.appTitle);

  return (
    <Page>
      <SubPageHeader backLabel={s.back} backTo={hrefs.home} title={title} subtitle={intro} action={<SavedLink section={section} s={s} />} />
      <div className="mb-3">
        <SearchField id={`${section}-search`} value={query} onChange={onQueryChange} placeholder={search.placeholder} label={search.label} clearLabel={s.clearSearch} />
      </div>
      {!searching ? (
        guides === null ? <MessageState title={s.loading} /> : children
      ) : results === null ? (
        <MessageState title={s.loading} />
      ) : (
        <div>
          {resultCount ? (
            <p className="px-1 pb-2 text-sm text-muted" aria-live="polite">
              {resultCount(results.length)}
            </p>
          ) : null}
          {results.length === 0 ? <MessageState title={s.noGuideResults(query.trim())} /> : renderResults ? renderResults(results) : <GuideList guides={results} numbered={false} />}
          {searchFooter ? <div className="mt-3">{searchFooter}</div> : null}
        </div>
      )}
    </Page>
  );
}
