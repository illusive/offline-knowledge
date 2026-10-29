// "Førstehjælp" category (D-037): search, the 112 card, the three main points as their own
// section, then the other guides in the order of an emergency.

import { ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { EmergencyCard } from '../components/EmergencyCard';
import { SavedLink } from '../bookmarks/BookmarkButton';
import { BackButton, MessageState, Page, SearchField } from '../components/ui';
import type { DbClient } from '../db/client';
import type { GuideDetail, GuideRow } from '../db/queries';
import type { Strings } from '../i18n/strings';
import { goBack, hrefs } from '../router';
import { MIN_FTS_QUERY_LENGTH } from '../storage/search';

// The guide shown as the section at the top of Førstehjælp.
export const MAIN_POINTS_ID = 'tre-hovedpunkter';

export function useGuides(db: DbClient | null, category: GuideRow['category'] = 'first-aid') {
  const [guides, setGuides] = useState<GuideRow[] | null>(null);
  useEffect(() => {
    if (!db) return;
    let current = true;
    void db.call({ type: 'guides', category }).then((rows) => {
      if (current) setGuides(rows);
    });
    return () => {
      current = false;
    };
  }, [db, category]);
  return guides;
}

// Guides from `guides` matching a query: titles only for one or two letters, full text from three.
export function useGuideSearch(db: DbClient, guides: GuideRow[] | null, query: string): GuideRow[] {
  const q = query.trim();
  const [found, setFound] = useState<{ query: string; rows: GuideRow[] } | null>(null);
  useEffect(() => {
    if (q.length < MIN_FTS_QUERY_LENGTH) return;
    let current = true;
    void db.call({ type: 'searchGuides', query: q }).then((rows) => {
      if (current) setFound({ query: q, rows });
    });
    return () => {
      current = false;
    };
  }, [db, q]);
  if (q === '' || !guides) return [];
  if (q.length < MIN_FTS_QUERY_LENGTH) {
    const lower = q.toLocaleLowerCase('da');
    return guides.filter((g) => (g.name ?? g.title).toLocaleLowerCase('da').split(/[\s-]+/).some((w) => w.startsWith(lower)));
  }
  const ids = new Set(guides.map((g) => g.id));
  return found?.query === q ? found.rows.filter((g) => ids.has(g.id)) : [];
}

export function FirstAidScreen({ db, guides, s, query, onQueryChange }: { db: DbClient; guides: GuideRow[] | null; s: Strings; query: string; onQueryChange: (q: string) => void }) {
  const results = useGuideSearch(db, guides, query);
  const mainPoints = useMainPoints(db);
  const searching = query.trim() !== '';

  useEffect(() => {
    document.title = `${s.firstAid} – ${s.appTitle}`;
  }, [s]);

  return (
    <Page>
      <div className="flex items-center justify-between gap-[12px]">
        <BackButton label={s.back} onClick={() => goBack(hrefs.home)} />
        <SavedLink section="first-aid" s={s} />
      </div>
      <header className="mt-4 mb-4 px-1">
        <h1 className="text-3xl font-normal tracking-tight">{s.firstAid}</h1>
        <p className="mt-1 text-muted">{s.firstAidIntro}</p>
      </header>
      <div className="mb-3">
        <SearchField id="first-aid-search" value={query} onChange={onQueryChange} placeholder={s.firstAidSearchPlaceholder} label={s.firstAidSearchLabel} clearLabel={s.clearSearch} />
      </div>
      {searching ? (
        results.length > 0 ? (
          <GuideList guides={results} numbered={false} />
        ) : (
          <MessageState title={s.noGuideResults(query.trim())} />
        )
      ) : (
        <div className="flex flex-col gap-3">
          <EmergencyCard s={s} />
          {mainPoints ? <MainPoints guide={mainPoints} s={s} /> : null}
          <h2 className="mt-3 px-1 text-xl font-semibold">{s.allGuides}</h2>
          {guides === null ? <MessageState title={s.loading} /> : <GuideList guides={guides.filter((g) => g.id !== MAIN_POINTS_ID)} />}
        </div>
      )}
    </Page>
  );
}

function useMainPoints(db: DbClient) {
  const [guide, setGuide] = useState<GuideDetail | null>(null);
  useEffect(() => {
    let current = true;
    void db.call({ type: 'guide', id: MAIN_POINTS_ID }).then((g) => {
      if (current) setGuide(g);
    });
    return () => {
      current = false;
    };
  }, [db]);
  return guide;
}

// The three main points, shown in full: the first thing to remember in any emergency.
function MainPoints({ guide, s }: { guide: GuideDetail; s: Strings }) {
  const steps = guide.blocks.find((b) => b.kind === 'steps');
  return (
    <section aria-labelledby="main-points" className="flex flex-col gap-3 rounded-card bg-accent px-[20px] py-5 text-on-accent" lang="da">
      <h2 id="main-points" className="text-xl font-semibold">
        {guide.guide.name ?? guide.guide.title}
      </h2>
      {steps?.kind === 'steps' ? (
        <ol className="flex flex-col gap-2">
          {steps.items.map((item, i) => (
            <li key={i} className="flex items-center gap-[12px] text-lg">
              <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-full bg-ink font-semibold text-on-ink">
                {i + 1}
              </span>
              {item}
            </li>
          ))}
        </ol>
      ) : null}
      {guide.guide.summary ? <p>{guide.guide.summary}</p> : null}
      <a href={hrefs.guide(guide.guide.id)} className="flex min-h-11 items-center gap-1 self-start font-semibold underline underline-offset-4">
        {s.readMore}
        <ChevronRight aria-hidden="true" className="size-5" />
      </a>
    </section>
  );
}

export function GuideList({ guides, numbered = true }: { guides: GuideRow[]; numbered?: boolean }) {
  return (
    <ol className="flex flex-col divide-y divide-border rounded-card bg-surface" lang="da">
      {guides.map((g, i) => (
        <li key={g.id}>
          <a href={hrefs.guide(g.id)} className="flex min-h-14 items-center gap-[12px] px-[20px] py-3">
            {numbered ? (
              <span aria-hidden="true" className="grid size-7 shrink-0 place-items-center rounded-full bg-background text-sm font-semibold text-muted">
                {i + 1}
              </span>
            ) : null}
            <span className="flex-1">
              <span className="block font-medium">{g.name ?? g.title}</span>
              <TitleAbbreviations guide={g} />
              {g.season ? <span className="block text-sm text-muted">{g.season}</span> : g.summary ? <span className="line-clamp-2 block text-sm text-muted">{g.summary}</span> : null}
            </span>
            <ChevronRight aria-hidden="true" className="size-5 shrink-0 text-muted" />
          </a>
        </li>
      ))}
    </ol>
  );
}

// Abbreviations in a title, explained right under it (e.g. "HLR: hjertelungeredning").
function TitleAbbreviations({ guide }: { guide: GuideRow }) {
  const used = guide.abbreviations.filter((a) => guide.title.includes(a.short));
  if (used.length === 0) return null;
  return <span className="block text-sm text-muted">{used.map((a) => `${a.short}: ${a.long}`).join(' · ')}</span>;
}
