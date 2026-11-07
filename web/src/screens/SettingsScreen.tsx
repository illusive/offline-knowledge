// Settings (D-044): what is on the phone, language, appearance, text size, a link to the sources
// (their own page, D-064) and About.
// Everything here works offline: the counts come from the pack's manifest, the sources from the pack.

import { BookOpen, Check, RefreshCw } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { Button, Card, Choice, LinkRow, Page, RowList, SubPageHeader } from '../components/ui';
import type { PackInfo } from '../db/protocol';
import type { Lang, Strings } from '../i18n/strings';
import { mapClient } from '../map/client';
import { formatBytes, formatDate } from '../i18n/format';
import type { AreaInfo } from '../map/protocol';
import { hrefs } from '../router';
import { setPreference, usePreferences, type LangPref, type ThemePref } from '../settings/preferences';
import { HouseholdSettings } from '../forraad/HouseholdSettings';
import { usePageTitle } from '../lib/usePageTitle';
import { useUpdates, type CheckResult } from '../pwa/updates';
import { usePrecacheProgress } from '../pwa/usePrecacheProgress';

export function SettingsScreen({ pack, lang, s, offlineReady }: { pack: PackInfo | null; lang: Lang; s: Strings; offlineReady: boolean }) {
  const prefs = usePreferences();
  const t = s.settings;

  usePageTitle(s.settingsTitle, s.appTitle);

  return (
    <Page>
      <SubPageHeader backLabel={s.back} backTo={hrefs.home} title={s.settingsTitle} />
      <div className="flex flex-col gap-4">
        <Library pack={pack} lang={lang} s={s} offlineReady={offlineReady} />

        <AppVersion lang={lang} s={s} />

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

        <HouseholdSettings s={s} />

        {/* The sources have their own page (D-064). */}
        <RowList>
          <LinkRow
            href={hrefs.settingsSources}
            leading={<BookOpen aria-hidden="true" className="size-6 shrink-0" strokeWidth={1.5} />}
            title={t.sources}
            subtitle={pack?.counts ? <span className="block text-sm text-muted">{t.sourcesCount(pack.counts.sources)}</span> : undefined}
          />
        </RowList>

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
  // Whether the phone has agreed not to clear the app's data when space runs low (D-071). Shown
  // only when it has not; nothing here promises that data is kept for ever.
  const [persisted, setPersisted] = useState<boolean | null>(null);

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
    navigator.storage?.persisted?.().then(
      (p) => live && setPersisted(p),
      () => undefined,
    );
    return () => {
      live = false;
    };
  }, []);

  const date = pack?.createdAt ? formatDate(new Date(pack.createdAt), lang) : null;
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
      {/* What "klar" covers: maps are fetched apart and do not hold the rest back (D-071). */}
      {offlineReady ? <p className="mt-1 text-sm text-muted">{t.readyScope}</p> : null}
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
      {persisted === false ? <p className="mt-3 text-sm">{t.notPersisted}</p> : null}
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

// The app's build and "Søg efter ny version" (D-065). A found version downloads in full first; then
// "Opdater" switches to it, as the banner does.
function AppVersion({ lang, s }: { lang: Lang; s: Strings }) {
  const t = s.settings;
  const { needRefresh, applyUpdate, check } = useUpdates();
  const progress = usePrecacheProgress();
  const [state, setState] = useState<'idle' | 'checking' | CheckResult>('idle');
  const build = __APP_BUILD__;

  let status: string | null = null;
  if (needRefresh) status = s.updateReady;
  else if (state === 'checking') status = t.checking;
  else if (state === 'found') status = progress && progress.done < progress.total ? t.updateProgress(progress.done, progress.total) : t.updateFound;
  else if (state === 'latest') status = t.upToDate;
  else if (state === 'offline') status = t.updateOffline;
  else if (state === 'failed') status = t.updateFailed;

  return (
    <Card aria-labelledby="settings-app" className="flex flex-col gap-3">
      <h2 id="settings-app" className="text-xl font-semibold">
        {t.appVersion}
      </h2>
      <p className="text-muted">{t.appBuild(formatDate(new Date(build.date), lang), build.commit)}</p>
      <p role="status" className={status ? 'font-medium' : 'sr-only'}>
        {status}
      </p>
      {needRefresh ? (
        <Button variant="primary" onClick={applyUpdate}>
          {s.updateAction}
        </Button>
      ) : (
        <Button
          variant="onPage"
          disabled={state === 'checking'}
          onClick={async () => {
            setState('checking');
            setState(await check());
          }}
        >
          <RefreshCw aria-hidden="true" className="size-5" />
          {t.checkUpdate}
        </Button>
      )}
    </Card>
  );
}
