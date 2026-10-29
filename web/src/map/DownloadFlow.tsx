// Getting the map for offline use (D-036), one decision per step:
// why → what (home / region / country) → which (radius or region) → confirm → progress → done.
// Opened before the map the first time there is no downloaded area, and from the map's button.

import { ArrowLeft, Download, House, Map as MapIcon, MapPinned, Pause, Play, Trash2, X, type LucideIcon } from 'lucide-react';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Lang, Strings } from '../i18n/strings';
import { mapClient } from './client.ts';
import type { AreaInfo, AreaShape, Home, MapSummary } from './protocol.ts';

const RADII = [10, 25, 50] as const;
type Kind = 'home' | 'region' | 'country';
// 'start': the list of areas if there are any, otherwise the explanation.
export type FlowStep = 'start' | 'intro' | 'areas' | 'kind' | 'home' | 'region' | 'confirm' | 'progress';

// Map version (the Protomaps build date, e.g. '20261024') as a date people read.
export function formatMapDate(version: string, lang: Lang): string {
  const m = /^(\d{4})(\d{2})(\d{2})/.exec(version);
  if (!m) return version;
  return new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]))).toLocaleDateString(lang === 'da' ? 'da-DK' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}

export function formatBytes(bytes: number, lang: Lang): string {
  const nf = (v: number, digits: number) => new Intl.NumberFormat(lang, { maximumFractionDigits: digits }).format(v);
  return bytes >= 1e9 ? `${nf(bytes / 1e9, 1)} GB` : `${nf(Math.max(1, bytes / 1e6), 0)} MB`;
}

interface Choice {
  key: string;
  label: string;
  shape: AreaShape;
}

const percentOf = (a: AreaInfo) => (a.plannedBytes > 0 ? Math.floor((a.doneBytes / a.plannedBytes) * 100) : 100);

export function DownloadFlow(props: {
  lang: Lang;
  s: Strings;
  firstTime: boolean; // opened by itself before the map: offer to skip
  areas: AreaInfo[];
  home: Home | null;
  onClose: () => void;
  onPickHome: () => void; // hide the flow; the next tap on the map sets home
  onHome: (home: Home) => void;
  onPreviewRadius: (km: number | null) => void;
  onShowArea: (area: AreaInfo) => void;
  step: FlowStep;
  onStep: (step: FlowStep) => void;
  hidden: boolean; // while home is picked on the map; kept mounted so the steps are not lost
}) {
  const { lang, s, firstTime, areas, home, onClose, onPickHome, onHome, onPreviewRadius, onShowArea, onStep, hidden } = props;
  const step: FlowStep = props.step === 'start' ? (areas.length > 0 ? 'areas' : 'intro') : props.step;
  const t = s.mapArea;
  const client = mapClient();
  const [summary, setSummary] = useState<MapSummary | null>(null);
  const [offline, setOffline] = useState(false);
  const [choice, setChoice] = useState<Choice | null>(null);
  const [sizes, setSizes] = useState<Record<string, number>>({});
  const [free, setFree] = useState<number | null>(null);
  const [positionError, setPositionError] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [startedId, setStartedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState<FlowStep[]>([]);

  useEffect(() => {
    client
      .call({ type: 'summary' })
      .then((m) => {
        setSummary(m);
        setOffline(false);
      })
      .catch(() => setOffline(true));
    void navigator.storage?.estimate?.().then((e) => setFree(e.quota !== undefined && e.usage !== undefined ? e.quota - e.usage : null));
  }, [client]);

  const go = (next: FlowStep) => {
    setHistory((h) => [...h, step]);
    onStep(next);
  };
  const back = () => {
    const previous = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    if (previous) onStep(previous);
    else onClose();
  };

  const homeKey = home ? `${home.lon.toFixed(4)},${home.lat.toFixed(4)}` : '';
  const options: Choice[] = useMemo(() => {
    if (step === 'home' && home) return RADII.map((km) => ({ key: `r${km}:${homeKey}`, label: t.aroundHome(km), shape: { kind: 'circle', lon: home.lon, lat: home.lat, radiusKm: km } }));
    if (step === 'region') return (summary?.regions ?? []).map((r) => ({ key: r.id, label: r.name, shape: { kind: 'region', id: r.id } }));
    if (step === 'confirm' && choice) return [choice];
    return [];
  }, [step, home, homeKey, summary, choice, t]);

  // Exact sizes from the archive's directories, one option at a time.
  useEffect(() => {
    let current = true;
    void (async () => {
      for (const o of options) {
        if (sizes[o.key] !== undefined) continue;
        const { bytes } = await client.call({ type: 'estimate', shape: o.shape });
        if (!current) return;
        setSizes((prev) => ({ ...prev, [o.key]: bytes }));
      }
    })().catch(() => setOffline(true));
    return () => {
      current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options, client]);

  useEffect(() => {
    onPreviewRadius(step === 'home' && choice?.shape.kind === 'circle' ? choice.shape.radiusKm : null);
  }, [step, choice, onPreviewRadius]);

  const useMyPosition = () => {
    setPositionError(false);
    navigator.geolocation.getCurrentPosition(
      (p) => onHome({ lon: p.coords.longitude, lat: p.coords.latitude }),
      () => setPositionError(true),
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 600000 },
    );
  };

  const download = async () => {
    if (!choice) return;
    setBusy(true);
    setError(null);
    try {
      await navigator.storage?.persist?.(); // keep downloaded maps when storage runs low
      const area = await client.call({ type: 'download', label: choice.label, shape: choice.shape });
      setStartedId(area.id);
      go('progress');
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const started = areas.find((a) => a.id === startedId) ?? null;
  const choiceSize = choice ? sizes[choice.key] : undefined;
  const tooBig = choiceSize !== undefined && free !== null && choiceSize > free;
  const kinds: Kind[] = summary && summary.regions.length > 0 ? ['home', 'region', 'country'] : ['home', 'country'];
  const kindIcon: Record<Kind, LucideIcon> = { home: House, region: MapPinned, country: MapIcon };

  let title = '';
  let body: ReactNode = null;
  let actions: ReactNode = null;

  if (step === 'intro') {
    title = t.introTitle;
    body = (
      <>
        <p>{t.introBody}</p>
        <p className="font-medium">{t.introWarning}</p>
        <p className="text-sm text-muted">{t.introSizes}</p>
        {offline ? <p className="text-muted">{t.offlineNow}</p> : null}
      </>
    );
    actions = (
      <>
        <PrimaryButton disabled={offline || !summary} onClick={() => go('kind')}>
          {t.chooseArea}
        </PrimaryButton>
        <SecondaryButton onClick={onClose}>{firstTime ? t.skipForNow : t.close}</SecondaryButton>
      </>
    );
  } else if (step === 'areas') {
    title = t.yourAreas;
    body = (
      <ul className="flex flex-col gap-2">
        {areas.map((a) => (
          <li key={a.id} className="flex flex-col gap-2 rounded-2xl bg-surface px-[14px] py-3">
            <div className="flex items-start justify-between gap-[8px]">
              <button type="button" onClick={() => onShowArea(a)} className="text-left">
                <span className="block font-medium">{a.label}</span>
                <span className="block text-sm text-muted">
                  {t.states[a.state]}
                  {a.state !== 'ready' ? ` · ${t.progress(percentOf(a))}` : ''} · {formatBytes(a.plannedBytes, lang)}
                </span>
                <span className="block text-sm text-muted">{a.replaces ? t.updating : t.mapDate(formatMapDate(a.version, lang))}</span>
                {a.error ? <span className="block text-sm text-muted">{a.error}</span> : null}
              </button>
              <div className="flex shrink-0 gap-[6px]">
                {a.state === 'downloading' ? (
                  <IconButton label={`${t.pause}: ${a.label}`} Icon={Pause} onClick={() => void client.call({ type: 'pause', id: a.id })} />
                ) : null}
                {a.state === 'paused' && !offline ? (
                  <IconButton label={`${t.resume}: ${a.label}`} Icon={Play} onClick={() => void client.call({ type: 'resume', id: a.id })} />
                ) : null}
                <button
                  type="button"
                  onClick={() => {
                    if (confirmDelete !== a.id) return setConfirmDelete(a.id);
                    setConfirmDelete(null);
                    void client.call({ type: 'delete', id: a.id });
                  }}
                  className={`flex h-11 min-w-11 items-center justify-center gap-[6px] rounded-full px-[10px] ${confirmDelete === a.id ? 'bg-accent text-on-accent' : 'bg-background'}`}
                  aria-label={confirmDelete === a.id ? t.confirmRemove : `${t.remove}: ${a.label}`}
                >
                  <Trash2 aria-hidden="true" className="size-5" />
                  {confirmDelete === a.id ? <span className="text-sm">{t.confirmRemove}</span> : null}
                </button>
              </div>
            </div>
            {a.state !== 'ready' ? <Progress percent={percentOf(a)} label={a.label} /> : null}
            {/* A newer map is published: download it next to this one; this one is kept until the new one is complete. */}
            {summary && a.state === 'ready' && summary.version > a.version && !areas.some((b) => b.replaces === a.id) ? (
              <div className="flex flex-col gap-2 rounded-xl bg-background px-[12px] py-2">
                <p className="text-sm">{t.newerMap}</p>
                <button
                  type="button"
                  disabled={offline}
                  onClick={() => void client.call({ type: 'download', label: a.label, shape: a.shape, replaces: a.id })}
                  className="min-h-11 self-start rounded-full bg-accent px-[16px] text-sm font-semibold text-on-accent disabled:opacity-50"
                >
                  {t.update}
                </button>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    );
    actions = (
      <>
        {offline ? <p className="text-sm text-muted">{t.needsNetwork}</p> : null}
        <PrimaryButton disabled={offline || !summary} onClick={() => go('kind')}>
          {t.addArea}
        </PrimaryButton>
      </>
    );
  } else if (step === 'kind') {
    title = t.kindTitle;
    body = (
      <ul className="flex flex-col gap-2">
        {kinds.map((k) => {
          const Icon = kindIcon[k];
          return (
            <li key={k}>
              <button
                type="button"
                onClick={() => {
                  setChoice(null);
                  if (k === 'country' && summary) {
                    setChoice({ key: 'country', label: summary.name[lang], shape: { kind: 'country' } });
                    go('confirm');
                  } else go(k as 'home' | 'region');
                }}
                className="flex w-full items-start gap-[14px] rounded-2xl bg-surface px-[16px] py-4 text-left"
              >
                <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-full bg-accent text-on-accent">
                  <Icon className="size-5" />
                </span>
                <span>
                  <span className="block font-semibold">{t.choices[k]}</span>
                  <span className="block text-sm text-muted">{t.kindHelp[k]}</span>
                  <span className="mt-1 block text-sm font-medium">{t.kindSize[k]}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    );
  } else if (step === 'home') {
    title = home ? t.radiusTitle : t.choices.home;
    body = (
      <>
        <p className="text-muted">{home ? t.homeSet : t.noHome}</p>
        {positionError ? <p className="text-sm text-muted">{t.positionDenied}</p> : null}
        <div className="flex flex-wrap gap-[8px]">
          <SecondaryButton onClick={onPickHome}>{home ? `${t.changeHome}: ${t.pickOnMap.toLowerCase()}` : t.pickOnMap}</SecondaryButton>
          {'geolocation' in navigator ? <SecondaryButton onClick={useMyPosition}>{t.useMyPosition}</SecondaryButton> : null}
        </div>
        <Options options={options} sizes={sizes} selected={choice?.key ?? null} onSelect={setChoice} lang={lang} t={t} />
      </>
    );
    actions = (
      <PrimaryButton disabled={!choice} onClick={() => go('confirm')}>
        {t.chooseArea}
      </PrimaryButton>
    );
  } else if (step === 'region') {
    title = t.regionTitle;
    body = <Options options={options} sizes={sizes} selected={choice?.key ?? null} onSelect={setChoice} lang={lang} t={t} />;
    actions = (
      <PrimaryButton disabled={!choice} onClick={() => go('confirm')}>
        {t.chooseArea}
      </PrimaryButton>
    );
  } else if (step === 'confirm' && choice) {
    title = t.confirmTitle;
    body = (
      <>
        <p className="text-xl font-semibold">{choice.label}</p>
        <p>{choiceSize === undefined ? t.calculating : t.confirmSize(formatBytes(choiceSize, lang))}</p>
        {free !== null ? <p className="text-sm text-muted">{t.freeSpace(formatBytes(free, lang))}</p> : null}
        {tooBig ? <p className="font-medium">{t.notEnoughSpace}</p> : null}
        <p className="text-sm text-muted">{t.confirmKeepOpen}</p>
        {error ? (
          <p role="alert" className="font-medium">
            {t.downloadFailed} {error}
          </p>
        ) : null}
      </>
    );
    actions = (
      <PrimaryButton disabled={choiceSize === undefined || tooBig || busy} onClick={() => void download()}>
        <Download aria-hidden="true" className="size-5" />
        {choiceSize === undefined ? t.startDownload : `${t.startDownload} (${formatBytes(choiceSize, lang)})`}
      </PrimaryButton>
    );
  } else if (step === 'progress' && started) {
    const done = started.state === 'ready';
    title = done ? t.doneTitle : t.progressTitle(started.label);
    body = done ? (
      <p>{t.doneBody(started.label)}</p>
    ) : (
      <>
        <Progress percent={percentOf(started)} label={started.label} />
        <p className="text-sm text-muted">
          {t.states[started.state]} · {t.progress(percentOf(started))} · {formatBytes(started.plannedBytes, lang)}
        </p>
        {started.error ? <p className="font-medium">{started.error}</p> : null}
        <p className="text-sm text-muted">{t.keepUsing}</p>
      </>
    );
    actions = done ? (
      <>
        <PrimaryButton onClick={() => onShowArea(started)}>{t.showOnMap}</PrimaryButton>
        <SecondaryButton onClick={onClose}>{t.close}</SecondaryButton>
      </>
    ) : (
      <>
        {started.state === 'paused' ? <PrimaryButton onClick={() => void client.call({ type: 'resume', id: started.id })}>{t.tryAgain}</PrimaryButton> : null}
        <SecondaryButton onClick={onClose}>{t.close}</SecondaryButton>
      </>
    );
  }

  return (
    <section
      hidden={hidden}
      aria-labelledby="map-flow-title"
      className="fixed inset-0 z-10 overflow-y-auto bg-background px-[16px] pt-[calc(12px+env(safe-area-inset-top))] pb-[calc(96px+env(safe-area-inset-bottom))]"
    >
      <div className="mx-auto flex max-w-[448px] flex-col gap-5">
        <div className="flex items-center justify-between">
          {history.length > 0 && step !== 'progress' ? (
            <IconButton label={t.back} Icon={ArrowLeft} onClick={back} />
          ) : (
            <span className="size-11" aria-hidden="true" />
          )}
          <IconButton label={t.close} Icon={X} onClick={onClose} />
        </div>
        <h2 id="map-flow-title" className="px-1 text-3xl font-normal tracking-tight">
          {title}
        </h2>
        <div className="flex flex-col gap-3 px-1">{body}</div>
        {actions ? <div className="flex flex-col gap-2">{actions}</div> : null}
      </div>
    </section>
  );
}

function Options(props: { options: Choice[]; sizes: Record<string, number>; selected: string | null; onSelect: (c: Choice) => void; lang: Lang; t: Strings['mapArea'] }) {
  const { options, sizes, selected, onSelect, lang, t } = props;
  if (options.length === 0) return null;
  return (
    <ul className="flex flex-col gap-2" role="radiogroup">
      {options.map((o) => {
        const on = selected === o.key;
        const size = sizes[o.key];
        return (
          <li key={o.key}>
            <button
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onSelect(o)}
              className={`flex min-h-12 w-full items-center justify-between gap-[12px] rounded-2xl px-[16px] py-2 text-left ${on ? 'bg-accent text-on-accent' : 'bg-surface'}`}
            >
              <span className="font-medium">{o.label}</span>
              <span className={`text-sm ${on ? 'text-on-accent' : 'text-muted'}`}>{size === undefined ? t.calculating : formatBytes(size, lang)}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function Progress({ percent, label }: { percent: number; label: string }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-surface" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <div className="h-full bg-accent" style={{ width: `${percent}%` }} />
    </div>
  );
}

function PrimaryButton({ children, onClick, disabled }: { children: ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button type="button" disabled={disabled} onClick={onClick} className="flex min-h-12 items-center justify-center gap-[8px] rounded-full bg-accent px-[20px] font-semibold text-on-accent disabled:opacity-40">
      {children}
    </button>
  );
}

function SecondaryButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex min-h-11 items-center justify-center rounded-full bg-surface px-[18px] text-sm font-medium">
      {children}
    </button>
  );
}

function IconButton({ label, Icon, onClick }: { label: string; Icon: LucideIcon; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} className="grid size-11 place-items-center rounded-full bg-surface">
      <Icon aria-hidden="true" className="size-5" />
    </button>
  );
}
