// "Dyrkning" category (D-038): growing guides for easy crops in the Danish climate, laid out like
// "Opbevaring af mad": search at the top (design rule for category pages), then the crops with
// their growing period.

import { useEffect } from 'react';
import { BackButton, MessageState, Page, SearchField } from '../components/ui';
import type { DbClient } from '../db/client';
import type { GuideRow } from '../db/queries';
import type { Strings } from '../i18n/strings';
import { goBack, hrefs } from '../router';
import { GuideList, useGuideSearch } from './FirstAidScreen';

export function GrowingScreen({ db, guides, s, query, onQueryChange }: { db: DbClient; guides: GuideRow[] | null; s: Strings; query: string; onQueryChange: (q: string) => void }) {
  const results = useGuideSearch(db, guides, query);
  const shown = query.trim() === '' ? guides : results;

  useEffect(() => {
    document.title = `${s.growing} – ${s.appTitle}`;
  }, [s]);

  return (
    <Page>
      <BackButton label={s.back} onClick={() => goBack(hrefs.home)} />
      <header className="mt-4 mb-4 px-1">
        <h1 className="text-3xl font-normal tracking-tight">{s.growing}</h1>
        <p className="mt-1 text-muted">{s.growingIntro}</p>
      </header>
      <div className="mb-3">
        <SearchField id="growing-search" value={query} onChange={onQueryChange} placeholder={s.growingSearchPlaceholder} label={s.growingSearchLabel} clearLabel={s.clearSearch} />
      </div>
      {shown === null ? (
        <MessageState title={s.loading} />
      ) : (
        <div>
          <p className="px-1 pb-2 text-sm text-muted" aria-live="polite">
            {s.growingCount(shown.length)}
          </p>
          {shown.length === 0 ? <MessageState title={s.noGuideResults(query.trim())} /> : <GuideList guides={shown} numbered={false} />}
        </div>
      )}
    </Page>
  );
}
