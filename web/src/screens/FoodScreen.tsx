// Storage details for one food: times per location, source notes and attribution.

import { useEffect, useRef, useState } from 'react';
import { SensesPill } from '../components/SensesPill';
import { BackButton, Card, MessageState, Page, SourceNote } from '../components/ui';
import type { DbClient } from '../db/client';
import type { ItemDetail } from '../db/queries';
import type { Lang, Strings } from '../i18n/strings';
import { goBack, hrefs } from '../router';
import { formatBasis, formatDuration, LOCATION_ORDER } from '../storage/format';

export function FoodScreen({ db, id, lang, s }: { db: DbClient; id: string; lang: Lang; s: Strings }) {
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

  // Move focus to the new page's heading so screen readers announce it.
  useEffect(() => {
    if (name) {
      document.title = `${name} – ${s.appTitle}`;
      heading.current?.focus();
    }
  }, [name, s.appTitle]);

  const back = <BackButton label={s.back} onClick={() => goBack(hrefs.storage)} />;

  if (loaded === undefined) return <Page>{back}<MessageState title={s.loading} /></Page>;
  if (loaded === null) return <Page>{back}<MessageState title={s.notFound} /></Page>;

  const { item, periods, notes, source } = loaded;
  const subtitle = lang === 'da' ? item.subtitle_da : item.subtitle_en;
  const otherLang: Lang = lang === 'da' ? 'en' : 'da';
  // In the Danish interface, notes are shown in Danish translation, with the source text one tap away (D-031).
  const translatable = lang === 'da' && notes.some((n) => n.lang !== 'da' && n.text_da);

  return (
    <Page>
      {back}
      <div className="mt-4 flex flex-col gap-3">
        <header className="mb-2 px-1">
          <h1 ref={heading} tabIndex={-1} className="text-3xl font-normal tracking-tight outline-none">
            {name}
          </h1>
          {subtitle ? <p className="text-muted">{subtitle}</p> : null}
          <p className="text-sm text-muted" lang={otherLang}>
            {otherLang === 'en' ? item.name_en : item.name_da}
          </p>
        </header>

        {translatable ? (
          <div className="flex flex-wrap items-center justify-between gap-x-[12px] gap-y-1 px-1">
            <p className="text-sm text-muted">{showOriginal ? s.notesOriginal : s.notesTranslated}</p>
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

        {LOCATION_ORDER.map((location) => {
          const here = periods.filter((p) => p.location === location);
          const hereNotes = notes.filter((n) => n.location === location);
          if (here.length === 0 && hereNotes.length === 0) return null;
          return (
            <Card key={location} className="flex flex-col gap-2" aria-labelledby={`loc-${location}`}>
              <h2 id={`loc-${location}`} className="text-lg font-semibold">
                {s.locations[location]}
              </h2>
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
              {/* One line above the cards says whether notes are translated; no label per note. */}
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

        <div className="mt-2">
          <SensesPill s={s} />
        </div>

        <section className="mt-2 flex flex-col gap-1 border-t border-border px-1 pt-4" aria-labelledby="source-heading">
          <h2 id="source-heading" className="text-lg font-semibold">
            {s.sourceHeading}
          </h2>
          <p className="text-muted">{source.publisher}</p>
          <p className="text-muted">
            {source.title} · {source.license}
          </p>
          {source.data_version ? <p className="text-sm text-muted">{s.dataDate(source.data_version)}</p> : null}
          <p className="text-sm text-muted" lang="en">
            {source.attribution}
          </p>
          <p className="break-all text-sm text-muted">{source.url}</p>
        </section>
      </div>
    </Page>
  );
}
