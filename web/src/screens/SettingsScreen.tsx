// Settings (D-044): what is on the phone, language, appearance, text size, the sources and About.
// Everything here works offline: the counts come from the pack's manifest, the sources from the pack.

import { ArrowUpRight, Check } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { BackButton, Card, Choice, MessageState, Page } from '../components/ui';
import type { DbClient } from '../db/client';
import type { PackInfo } from '../db/protocol';
import type { SourceRow } from '../db/queries';
import type { Lang, Strings } from '../i18n/strings';
import { mapClient } from '../map/client';
import { formatBytes } from '../map/format';
import type { AreaInfo } from '../map/protocol';
import { goBack, hrefs } from '../router';
import { setPreference, usePreferences, type LangPref, type ThemePref } from '../settings/preferences';
import { HouseholdSettings } from '../forraad/HouseholdSettings';

type Source = SourceRow & { short_name: string };

export function SettingsScreen({ db, pack, lang, s, offlineReady }: { db: DbClient; pack: PackInfo | null; lang: Lang; s: Strings; offlineReady: boolean }) {
  const prefs = usePreferences();
  const t = s.settings;

  useEffect(() => {
    document.title = `${s.settingsTitle} – ${s.appTitle}`;
  }, [s]);

  return (
    <Page>
      <BackButton label={s.back} onClick={() => goBack(hrefs.home)} />
      <h1 className="mt-4 mb-4 px-1 text-3xl font-normal tracking-tight">{s.settingsTitle}</h1>
      <div className="flex flex-col gap-4">
        <Library pack={pack} lang={lang} s={s} offlineReady={offlineReady} />

        <Card aria-labelledby="settings-display" className="flex flex-col gap-5">
          <h2 id="settings-display" className="sr-only">
            {t.language} · {t.appearance}
          </h2>
          <Choice<LangPref>
            name="lang"
            legend={t.language}
            value={prefs.lang}
            onChange={(v) => setPreference('lang', v)}
            options={[
              { value: 'system', label: t.followPhone },
              { value: 'da', label: 'Dansk', lang: 'da' },
              { value: 'en', label: 'English', lang: 'en' },
            ]}
          />
          <Choice<ThemePref>
            name="theme"
            legend={t.appearance}
            value={prefs.theme}
            onChange={(v) => setPreference('theme', v)}
            options={[
              { value: 'system', label: t.followPhone },
              { value: 'light', label: t.light },
              { value: 'dark', label: t.dark },
            ]}
          />
          <div>
            <h3 className="font-semibold">{t.textSize}</h3>
            <p className="mt-1 text-muted">{t.textSizeBody}</p>
          </div>
        </Card>

        <HouseholdSettings lang={lang} s={s} />

        <Sources db={db} s={s} />

        <Card aria-labelledby="settings-about">
          <h2 id="settings-about" className="text-xl font-semibold">
            {t.about}
          </h2>
          {t.aboutBody.map((p) => (
            <p key={p} className="mt-2">
              {p}
            </p>
          ))}
        </Card>
      </div>
    </Page>
  );
}

function Library({ pack, lang, s, offlineReady }: { pack: PackInfo | null; lang: Lang; s: Strings; offlineReady: boolean }) {
  const t = s.settings;
  const [areas, setAreas] = useState<AreaInfo[] | null>(null);
  const [used, setUsed] = useState<number | null>(null);

  useEffect(() => {
    let live = true;
    mapClient().ready.then(
      (r) => live && setAreas(r.areas),
      () => live && setAreas([]),
    );
    navigator.storage?.estimate?.().then(
      (e) => live && setUsed(e.usage ?? null),
      () => undefined,
    );
    return () => {
      live = false;
    };
  }, []);

  const date = pack?.createdAt ? new Date(pack.createdAt).toLocaleDateString(lang === 'da' ? 'da-DK' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : null;
  const ready = (areas ?? []).filter((a) => a.state === 'ready');
  const mapBytes = ready.reduce((sum, a) => sum + a.doneBytes, 0);
  const counts = pack?.counts;

  return (
    <Card aria-labelledby="settings-library">
      <h2 id="settings-library" className="text-xl font-semibold">
        {t.library}
      </h2>
      {offlineReady ? (
        <p className="mt-1 flex items-center gap-1 font-medium text-ok">
          <Check aria-hidden="true" className="size-5 shrink-0" strokeWidth={2.75} />
          {s.offlineReadyStatus}
        </p>
      ) : null}
      {pack ? (
        <p className="mt-1 text-muted">
          {date ? t.content(pack.version, date) : pack.version}
          {pack.sizeBytes ? ` · ${formatBytes(pack.sizeBytes, lang)}` : ''}
        </p>
      ) : null}
      <dl className="mt-4 flex flex-col divide-y divide-border">
        {counts ? (
          <>
            <Row label={t.guides} value={String(counts.guides)} />
            <Row label={t.foodGuides} value={String(counts.produceGuides)} />
            <Row label={t.foods} value={String(counts.storageItems)} />
            <Row label={t.sources} value={String(counts.sources)} />
          </>
        ) : null}
        <Row
          label={t.maps}
          value={
            areas === null ? '…' : (
              <a href={hrefs.map} className="inline-flex items-center gap-1 underline underline-offset-4">
                {ready.length === 0 ? t.mapsNone : t.mapsSummary(ready.length, formatBytes(mapBytes, lang))}
              </a>
            )
          }
        />
        {used !== null ? <Row label={t.used} value={formatBytes(used, lang)} /> : null}
      </dl>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-[12px] py-2">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}

// One choice as a radio group shaped like the sub-page pills (SubNav): wraps at large text sizes.
function Sources({ db, s }: { db: DbClient; s: Strings }) {
  const t = s.settings;
  const [sources, setSources] = useState<Source[] | null>(null);
  useEffect(() => {
    let live = true;
    db.call({ type: 'sources' }).then(
      (list) => live && setSources(list),
      () => live && setSources([]),
    );
    return () => {
      live = false;
    };
  }, [db]);

  const byPublisher = new Map<string, Source[]>();
  for (const src of sources ?? []) byPublisher.set(src.publisher, [...(byPublisher.get(src.publisher) ?? []), src]);

  return (
    <Card aria-labelledby="settings-sources">
      <h2 id="settings-sources" className="text-xl font-semibold">
        {t.sources}
      </h2>
      <p className="mt-1 text-muted">{t.sourcesIntro}</p>
      {sources === null ? (
        <MessageState title={s.loading} />
      ) : (
        <div className="mt-4 flex flex-col gap-4">
          {[...byPublisher].map(([publisher, list]) => (
            <section key={publisher}>
              <h3 className="font-semibold">{publisher}</h3>
              <ul className="mt-1 flex flex-col gap-1">
                {list.map((src) => (
                  <li key={src.id}>
                    <a href={src.url} target="_blank" rel="noopener noreferrer" className="text-muted underline-offset-4 hover:underline">
                      {src.title}
                      <ArrowUpRight aria-hidden="true" className="ml-1 inline size-4 align-[-0.15em]" />
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </Card>
  );
}
