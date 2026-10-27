// One food, split into sub-pages (D-034): Om (about), Holdbarhed (storage, the default),
// Konservering (drying, pickling, canning) and Kilder (sources). Every sub-page ends with the
// "use your senses" pill.

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { EthyleneLists, GuideCard } from '../components/FoodGuide';
import { SensesPill } from '../components/SensesPill';
import { SaveButton } from '../bookmarks/BookmarkButton';
import { BackButton, Card, MessageState, Page, SourceNote, SubNav } from '../components/ui';
import type { DbClient } from '../db/client';
import type { GuideSectionKey, ItemDetail } from '../db/queries';
import type { Lang, Strings } from '../i18n/strings';
import { FOOD_TABS, goBack, hrefs, replaceRoute, type FoodTab } from '../router';
import { formatBasis, formatDuration, LOCATION_ORDER } from '../storage/format';

const TAB_SECTIONS: Record<FoodTab, GuideSectionKey[]> = {
  about: ['about', 'prefers', 'avoid'],
  storage: ['coolStorage', 'together'],
  preserving: ['drying', 'pickling', 'canning'],
  sources: [],
};

export function FoodScreen({ db, id, tab, lang, s }: { db: DbClient; id: string; tab: FoodTab; lang: Lang; s: Strings }) {
  const [detail, setDetail] = useState<{ id: string; value: ItemDetail | null } | null>(null);
  const [showOriginal, setShowOriginal] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    let current = true;
    void db.call({ type: 'detail', id }).then((value) => {
      if (current) setDetail({ id, value });
    });
    return () => {
      current = false;
    };
  }, [db, id]);

  const loaded = detail?.id === id ? detail.value : undefined;
  const name = loaded ? (lang === 'da' ? loaded.item.name_da : loaded.item.name_en) : null;

  // Move focus to the new page's heading so screen readers announce it (not on sub-page switches).
  useEffect(() => {
    if (name) {
      document.title = `${name} – ${s.appTitle}`;
      heading.current?.focus();
    }
  }, [name, s.appTitle]);

  const back = <BackButton label={s.back} onClick={() => goBack(hrefs.storage)} />;

  if (loaded === undefined) return <Page>{back}<MessageState title={s.loading} /></Page>;
  if (loaded === null) return <Page>{back}<MessageState title={s.notFound} /></Page>;

  const { item, periods, notes, guide, ethylene, sources } = loaded;
  const subtitle = lang === 'da' ? item.subtitle_da : item.subtitle_en;
  const section = (key: GuideSectionKey) => guide.find((g) => g.section === key);
  const hasBlocks = (keys: GuideSectionKey[]) => keys.some((k) => (section(k)?.blocks.length ?? 0) > 0);
  const translatedNotes = notes.some((n) => n.lang !== 'da' && n.text_da);
  // Danish interface: text is shown in Danish, the original wording one tap away (D-031, D-033).
  const translatable = lang === 'da' && (hasBlocks(TAB_SECTIONS[tab]) || (tab === 'storage' && translatedNotes));
  const verdictText = (key: 'drying' | 'pickling' | 'canning') => {
    const v = section(key)?.verdict;
    return v ? ((s.verdicts[key] as Record<string, string>)[v] ?? null) : null;
  };
  const card = (key: GuideSectionKey, verdict?: string | null, children?: ReactNode) => (
    <GuideCard
      id={`guide-${key}`}
      title={s.guideSections[key]}
      verdict={verdict}
      blocks={section(key)?.blocks ?? []}
      showOriginal={showOriginal}
      sources={sources}
      s={s}
    >
      {children}
    </GuideCard>
  );

  let content: ReactNode;
  if (tab === 'about') {
    content = hasBlocks(TAB_SECTIONS.about) ? (
      <>
        {card('about')}
        {card('prefers')}
        {card('avoid')}
      </>
    ) : (
      <Card><p className="text-muted">{s.noAboutYet}</p></Card>
    );
  } else if (tab === 'preserving') {
    content = TAB_SECTIONS.preserving.some((k) => section(k)) ? (
      <>
        {section('drying') ? card('drying', verdictText('drying')) : null}
        {section('pickling') ? card('pickling', verdictText('pickling')) : null}
        {section('canning') ? card('canning', verdictText('canning')) : null}
      </>
    ) : (
      <Card><p className="text-muted">{s.noPreservingYet}</p></Card>
    );
  } else if (tab === 'sources') {
    content = (
      <section className="flex flex-col gap-3" aria-labelledby="source-heading">
        <h2 id="source-heading" className="sr-only">
          {sources.length > 1 ? s.sourcesHeading : s.sourceHeading}
        </h2>
        {sources.map((src) => (
          <Card key={src.id} className="flex flex-col gap-0.5">
            <p className="font-medium">{src.short_name}</p>
            <p className="text-sm text-muted" lang={src.lang}>
              {src.title} · {src.publisher}
            </p>
            {/* Licence line hidden while reuse terms are set aside (D-028, D-033). */}
            {src.data_version ? <p className="text-sm text-muted">{s.dataDate(src.data_version)}</p> : null}
            <p className="break-all text-sm text-muted">{src.url}</p>
          </Card>
        ))}
      </section>
    );
  } else {
    content = (
      <>
        <h2 className="mt-1 px-1 text-xl font-semibold">{s.kitchenTimes}</h2>
        {LOCATION_ORDER.map((location) => {
          const here = periods.filter((p) => p.location === location);
          const hereNotes = notes.filter((n) => n.location === location);
          if (here.length === 0 && hereNotes.length === 0) return null;
          return (
            <Card key={location} className="flex flex-col gap-2" aria-labelledby={`loc-${location}`}>
              <h3 id={`loc-${location}`} className="text-lg font-semibold">
                {s.locations[location]}
              </h3>
              {here.length === 0 ? <p className="text-muted">{s.noTimeGiven}</p> : null}
              {here.map((p, i) => {
                const basis = formatBasis(p, s);
                return (
                  <p key={i}>
                    <span className="font-semibold">{formatDuration(p, s)}</span>
                    {basis ? <span className="text-muted"> {basis}</span> : null}
                  </p>
                );
              })}
              {/* One line above the cards says whether text is translated; no label per note. */}
              {hereNotes.map((n, i) =>
                translatable && n.text_da && !showOriginal ? (
                  <SourceNote key={i} text={n.text_da} lang="da" label={null} />
                ) : (
                  <SourceNote key={i} text={n.text} lang={n.lang} label={null} />
                ),
              )}
            </Card>
          );
        })}
        {card('coolStorage')}
        {ethylene || section('together')?.blocks.length
          ? card('together', null, ethylene ? <EthyleneLists ethylene={ethylene} lang={lang} s={s} /> : null)
          : null}
      </>
    );
  }

  return (
    <Page>
      <div className="flex items-center justify-between gap-[12px]">
        {back}
        <SaveButton kind="food" id={item.id} section="storage" s={s} />
      </div>
      <div className="mt-4 flex flex-col gap-3">
        <header className="mb-1 px-1">
          <h1 ref={heading} tabIndex={-1} className="text-3xl font-normal tracking-tight outline-none">
            {name}
          </h1>
          {subtitle ? <p className="text-muted">{subtitle}</p> : null}
        </header>

        <SubNav
          label={s.foodTabsLabel}
          current={tab}
          onSelect={replaceRoute}
          items={FOOD_TABS.map((key) => ({ key, label: s.foodTabs[key], href: hrefs.food(item.id, key) }))}
        />

        {translatable ? (
          <div className="flex flex-wrap items-center justify-between gap-x-[12px] gap-y-1 px-1">
            <p className="text-sm text-muted">{showOriginal ? s.textOriginal : s.textTranslated}</p>
            <button
              type="button"
              aria-pressed={showOriginal}
              onClick={() => setShowOriginal((v) => !v)}
              className="min-h-11 rounded-full bg-surface px-[16px] text-sm font-medium"
            >
              {showOriginal ? s.showTranslation : s.showOriginal}
            </button>
          </div>
        ) : null}

        {content}

        <div className="mt-2">
          <SensesPill s={s} />
        </div>
      </div>
    </Page>
  );
}
