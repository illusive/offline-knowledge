// "Når det sker" (D-040, D-043): one card per kind of weather (before, during and after), situations
// (what to do when power, water or heat disappears) and stock lists (what to keep at home, ticked off
// on the device). Search at the top (D-039).

import { useEffect } from 'react';
import { SavedLink } from '../bookmarks/BookmarkButton';
import { BackButton, MessageState, Page, SearchField } from '../components/ui';
import type { DbClient } from '../db/client';
import type { GuideRow } from '../db/queries';
import type { Strings } from '../i18n/strings';
import { goBack, hrefs } from '../router';
import { GuideList, useGuideSearch } from './FirstAidScreen';

const PREPARE_GROUPS = ['weather', 'situation', 'supplies'] as const;
type PrepareGroup = (typeof PREPARE_GROUPS)[number];

export function PrepareScreen({ db, guides, s, query, onQueryChange }: { db: DbClient; guides: GuideRow[] | null; s: Strings; query: string; onQueryChange: (q: string) => void }) {
  const results = useGuideSearch(db, guides, query);
  const searching = query.trim() !== '';

  useEffect(() => {
    document.title = `${s.prepare} – ${s.appTitle}`;
  }, [s]);

  const group = (grp: PrepareGroup) => (guides ?? []).filter((g) => g.grp === grp);
  const heading: Record<PrepareGroup, string> = { weather: s.prepareWeather, situation: s.prepareSituations, supplies: s.prepareSupplies };
  return (
    <Page>
      <div className="flex items-center justify-between gap-[12px]">
        <BackButton label={s.back} onClick={() => goBack(hrefs.home)} />
        <SavedLink section="prepare" s={s} />
      </div>
      <header className="mt-4 mb-4 px-1">
        <h1 className="text-3xl font-normal tracking-tight">{s.prepare}</h1>
        <p className="mt-1 text-muted">{s.prepareIntro}</p>
      </header>
      <div className="mb-3">
        <SearchField id="prepare-search" value={query} onChange={onQueryChange} placeholder={s.prepareSearchPlaceholder} label={s.prepareSearchLabel} clearLabel={s.clearSearch} />
      </div>
      {guides === null ? (
        <MessageState title={s.loading} />
      ) : searching ? (
        results.length > 0 ? <GuideList guides={results} numbered={false} /> : <MessageState title={s.noGuideResults(query.trim())} />
      ) : (
        <div className="flex flex-col gap-6">
          {PREPARE_GROUPS.filter((grp) => group(grp).length > 0).map((grp) => (
            <section key={grp} aria-labelledby={`prepare-${grp}`} className="flex flex-col gap-2">
              <h2 id={`prepare-${grp}`} className="px-1 text-xl font-semibold">
                {heading[grp]}
              </h2>
              <GuideList guides={group(grp)} numbered={false} />
            </section>
          ))}
        </div>
      )}
    </Page>
  );
}
