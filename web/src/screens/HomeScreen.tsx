// Home (design brief, D-025): search everything offline, then the available categories and the
// emergency card. Only categories with content are shown.

import { Asterisk, ArrowUpRight, Cross, Package, Sprout, Zap } from 'lucide-react';
import type { ReactNode } from 'react';
import { EmergencyCard } from '../components/EmergencyCard';
import { DownloadCard, OFFLINE_DISABLED } from '../components/OfflineStatus';
import { SavedLink } from '../bookmarks/BookmarkButton';
import { FoodList } from '../components/FoodList';
import { Page, SearchField } from '../components/ui';
import type { DbClient } from '../db/client';
import type { GuideRow, ItemRow } from '../db/queries';
import { GuideList, useGuideSearch } from './FirstAidScreen';
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
  guides: GuideRow[] | null;
  crops: GuideRow[] | null;
  prepare: GuideRow[] | null;
  query: string;
  onQueryChange: (q: string) => void;
}) {
  const { db, foods, lang, s, offlineReady, precache, guides, crops, prepare, query, onQueryChange } = props;
  const results = useFoodSearch(db, foods, query, lang);
  const guideResults = useGuideSearch(db, guides, query);
  const cropResults = useGuideSearch(db, crops, query);
  const prepareResults = useGuideSearch(db, prepare, query);
  const guideCount = guides?.length ?? null;
  const searching = query.trim() !== '';

  return (
    <Page>
      <header className="flex flex-wrap items-center justify-between gap-x-[12px] gap-y-1 py-2">
        <p className="flex items-center gap-1 text-[min(1.875rem,9vw)] font-normal tracking-tight">
          {s.appTitle}
          {/* Green when the app works offline (owner 2026-10-27); the state is spoken, not shown as text. */}
          <Asterisk aria-hidden="true" className={`size-6 transition-colors ${offlineReady ? 'text-ok' : ''}`} strokeWidth={offlineReady ? 2.75 : 2} />
          <span className="sr-only" role="status">
            {OFFLINE_DISABLED ? '' : offlineReady ? s.offlineReadyStatus : s.preparingOffline}
          </span>
        </p>
        <SavedLink s={s} />
      </header>

      {offlineReady || OFFLINE_DISABLED ? null : <DownloadCard progress={precache} s={s} />}

      <section className="mt-4 rounded-hero bg-accent px-[20px] py-5 text-on-accent">
        <div className="mb-6 flex items-start justify-between gap-[12px]">
          <h1 className="text-[min(2.5rem,11vw)] leading-[1.05] font-normal tracking-tight">{s.homeTitle}</h1>
          <ArrowUpRight aria-hidden="true" className="mt-1 size-7 shrink-0" strokeWidth={1.5} />
        </div>
        <SearchField id="home-search" value={query} onChange={onQueryChange} placeholder={s.homeSearchPlaceholder} label={s.homeSearchLabel} clearLabel={s.clearSearch} />
      </section>

      {searching ? (
        <div className="mt-6 flex flex-col gap-3">
          <GuideResults id="prepare-results" title={s.prepare} guides={prepareResults} />
          <GuideResults id="guide-results" title={s.firstAid} guides={guideResults} />
          <GuideResults id="crop-results" title={s.growing} guides={cropResults} />
          <FoodList items={results} query={query} lang={lang} s={s} />
        </div>
      ) : (
        <div className="mt-8 flex flex-col gap-3">
          <div className="flex items-baseline justify-between gap-[12px] px-1">
            <h2 className="text-xl font-semibold">{s.startHere}</h2>
            {foods && guideCount !== null ? <p className="text-sm text-muted">{s.totalTopics(foods.length + guideCount + (crops?.length ?? 0) + (prepare?.length ?? 0))}</p> : null}
          </div>
          {guideCount ? (
            <a href={hrefs.firstAid} className="flex items-center gap-[16px] rounded-card bg-ink px-[20px] py-6 text-on-ink">
              <span aria-hidden="true" className="grid size-14 shrink-0 place-items-center rounded-full bg-accent text-on-accent">
                <Cross className="size-7" strokeWidth={1.75} />
              </span>
              <span className="flex-1">
                <span className="block text-2xl">{s.firstAid}</span>
                <span className="block text-sm text-ink-muted">{s.firstAidSubtitle(guideCount)}</span>
              </span>
              <ArrowUpRight aria-hidden="true" className="size-6 shrink-0" />
            </a>
          ) : null}
          {/* Category tiles; only categories with content are shown (D-025). One tile fills the row. */}
          <div className="grid grid-cols-2 gap-3">
            <CategoryTile href={hrefs.storage} icon={<Package className="size-7" strokeWidth={1.5} />} title={s.storingFood} count={foods ? s.foodCount(foods.length) : null} />
            {prepare?.length ? <CategoryTile href={hrefs.prepare} icon={<Zap className="size-7" strokeWidth={1.5} />} title={s.prepare} count={s.prepareCount(prepare.length)} /> : null}
            {crops?.length ? <CategoryTile href={hrefs.growing} icon={<Sprout className="size-7" strokeWidth={1.5} />} title={s.growing} count={s.growingCount(crops.length)} /> : null}
          </div>
          <div className="mt-3">
            <EmergencyCard s={s} />
          </div>
        </div>
      )}
    </Page>
  );
}

function CategoryTile({ href, icon, title, count }: { href: string; icon: ReactNode; title: string; count: string | null }) {
  return (
    <a href={href} className="flex min-h-36 flex-col justify-between gap-6 rounded-card bg-surface px-[20px] py-5 only:col-span-2">
      <span className="flex items-start justify-between gap-[8px]">
        <span aria-hidden="true">{icon}</span>
        {count ? <span className="text-sm text-muted">{count}</span> : null}
      </span>
      <span className="text-xl font-semibold">{title}</span>
    </a>
  );
}

function GuideResults({ id, title, guides }: { id: string; title: string; guides: GuideRow[] }) {
  if (guides.length === 0) return null;
  return (
    <section aria-labelledby={id} className="flex flex-col gap-2">
      <h2 id={id} className="px-1 text-lg font-semibold">
        {title}
      </h2>
      <GuideList guides={guides} numbered={false} />
    </section>
  );
}
