// Home (design brief, D-025): search everything offline, then the available categories and the
// emergency card. Only categories with content are shown.

import { Asterisk, ArrowUpRight, Package } from 'lucide-react';
import { EmergencyCard } from '../components/EmergencyCard';
import { DownloadCard, OfflineStatus } from '../components/OfflineStatus';
import { FoodList } from '../components/FoodList';
import { Page, SearchField } from '../components/ui';
import type { DbClient } from '../db/client';
import type { ItemRow } from '../db/queries';
import type { Lang, Strings } from '../i18n/strings';
import { hrefs } from '../router';
import type { PrecacheProgress } from '../pwa/usePrecacheProgress';
import { useFoodSearch } from '../storage/useFoodSearch';

export function HomeScreen(props: {
  db: DbClient;
  foods: ItemRow[] | null;
  lang: Lang;
  s: Strings;
  offlineReady: boolean;
  precache: PrecacheProgress | null;
  query: string;
  onQueryChange: (q: string) => void;
}) {
  const { db, foods, lang, s, offlineReady, precache, query, onQueryChange } = props;
  const results = useFoodSearch(db, foods, query, lang);
  const searching = query.trim() !== '';

  return (
    <Page>
      <header className="flex flex-wrap items-center justify-between gap-x-[12px] gap-y-1 py-2">
        <p className="flex items-center gap-1 text-[min(1.875rem,9vw)] font-normal tracking-tight">
          {s.appTitle}
          <Asterisk aria-hidden="true" className="size-6" />
        </p>
        <OfflineStatus ready={offlineReady} s={s} />
      </header>

      {offlineReady ? null : <DownloadCard progress={precache} s={s} />}

      <section className="mt-4 rounded-hero bg-accent px-[20px] py-5 text-on-accent">
        <h1 className="mb-6 text-[min(2.5rem,11vw)] leading-[1.05] font-normal tracking-tight">{s.homeTitle}</h1>
        <SearchField id="home-search" value={query} onChange={onQueryChange} placeholder={s.homeSearchPlaceholder} label={s.homeSearchLabel} clearLabel={s.clearSearch} />
      </section>

      {searching ? (
        <div className="mt-6">
          <FoodList items={results} query={query} lang={lang} s={s} />
        </div>
      ) : (
        <div className="mt-8 flex flex-col gap-3">
          <h2 className="px-1 text-xl font-semibold">{s.startHere}</h2>
          <a href={hrefs.storage} className="flex items-center gap-[16px] rounded-card bg-ink px-[20px] py-5 text-on-ink">
            <span aria-hidden="true" className="grid size-12 shrink-0 place-items-center rounded-full bg-accent text-on-accent">
              <Package className="size-6" />
            </span>
            <span className="flex-1">
              <span className="block text-xl">{s.storingFood}</span>
              <span className="block text-sm text-ink-muted">{foods ? s.storingFoodSubtitle(foods.length) : ' '}</span>
            </span>
            <ArrowUpRight aria-hidden="true" className="size-6 shrink-0" />
          </a>
          <div className="mt-3">
            <EmergencyCard s={s} />
          </div>
        </div>
      )}
    </Page>
  );
}
