// Choosing and managing offline map areas (D-036): a radius around home, a region (only when the
// country has known regions) or the whole country. The size is shown before anything is downloaded.

import { Download, Pause, Play, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { SubNav } from '../components/ui';
import type { Lang, Strings } from '../i18n/strings';
import { mapClient } from './client.ts';
import type { AreaInfo, AreaShape, Home, MapSummary } from './protocol.ts';

const RADII = [10, 25, 50] as const;
type Choice = 'home' | 'region' | 'country';

export function formatBytes(bytes: number, lang: Lang): string {
  const nf = (v: number, digits: number) => new Intl.NumberFormat(lang, { maximumFractionDigits: digits }).format(v);
  return bytes >= 1e9 ? `${nf(bytes / 1e9, 1)} GB` : `${nf(Math.max(1, bytes / 1e6), 0)} MB`;
}

interface Option {
  key: string;
  label: string;
  shape: AreaShape;
}

export function AreaPanel(props: {
  lang: Lang;
  s: Strings;
  areas: AreaInfo[];
  home: Home | null;
  onClose: () => void;
  onPickHome: () => void;
  onHome: (home: Home) => void;
  onPreviewRadius: (km: number | null) => void;
  onShowArea: (area: AreaInfo) => void;
}) {
  const { lang, s, areas, home, onClose, onPickHome, onHome, onPreviewRadius, onShowArea } = props;
  const t = s.mapArea;
  const client = mapClient();
  const [summary, setSummary] = useState<MapSummary | null>(null);
  const [offline, setOffline] = useState(false);
  const [choice, setChoice] = useState<Choice>('home');
  const [selected, setSelected] = useState<string | null>(null);
  const [sizes, setSizes] = useState<Record<string, number>>({});
  const [free, setFree] = useState<number | null>(null);
  const [positionError, setPositionError] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    client
      .call({ type: 'summary' })
      .then(setSummary)
      .catch(() => setOffline(true));
    void navigator.storage?.estimate?.().then((e) => setFree(e.quota !== undefined && e.usage !== undefined ? e.quota - e.usage : null));
  }, [client]);

  const options: Option[] = useMemo(() => {
    if (choice === 'home') return home ? RADII.map((km) => ({ key: `r${km}`, label: t.radius(km), shape: { kind: 'circle', lon: home.lon, lat: home.lat, radiusKm: km } })) : [];
    if (choice === 'region') return (summary?.regions ?? []).map((r) => ({ key: r.id, label: r.name, shape: { kind: 'region', id: r.id } }));
    return summary ? [{ key: 'country', label: summary.name[lang], shape: { kind: 'country' } }] : [];
  }, [choice, home, summary, lang, t]);

  // Sizes come from the archive's directories (exact), one option at a time.
  useEffect(() => {
    let current = true;
    void (async () => {
      for (const o of options) {
        const key = `${o.key}:${home?.lon ?? ''},${home?.lat ?? ''}`;
        if (sizes[key] !== undefined) continue;
        const { bytes } = await client.call({ type: 'estimate', shape: o.shape });
        if (!current) return;
        setSizes((prev) => ({ ...prev, [key]: bytes }));
      }
    })().catch(() => setOffline(true));
    return () => {
      current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options, client]);

  const sizeOf = (o: Option) => sizes[`${o.key}:${home?.lon ?? ''},${home?.lat ?? ''}`];
  const chosen = options.find((o) => o.key === selected);
  const chosenSize = chosen ? sizeOf(chosen) : undefined;
  const tooBig = chosenSize !== undefined && free !== null && chosenSize > free;

  useEffect(() => {
    onPreviewRadius(chosen?.shape.kind === 'circle' ? chosen.shape.radiusKm : null);
  }, [chosen, onPreviewRadius]);

  const useMyPosition = () => {
    setPositionError(false);
    navigator.geolocation.getCurrentPosition(
      (p) => onHome({ lon: p.coords.longitude, lat: p.coords.latitude }),
      () => setPositionError(true),
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 600000 },
    );
  };

  const download = async () => {
    if (!chosen) return;
    setBusy(true);
    setError(null);
    try {
      await navigator.storage?.persist?.(); // keep downloaded maps when storage runs low
      const label = chosen.shape.kind === 'circle' ? t.aroundHome(chosen.shape.radiusKm) : chosen.label;
      await client.call({ type: 'download', label, shape: chosen.shape });
      setSelected(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const choices: Choice[] = summary && summary.regions.length > 0 ? ['home', 'region', 'country'] : ['home', 'country'];

  return (
    <section aria-labelledby="map-area-title" className="fixed inset-x-0 bottom-[calc(76px+max(12px,env(safe-area-inset-bottom)))] z-10 mx-auto max-h-[56dvh] max-w-[448px] overflow-y-auto px-[12px]">
      <div className="flex flex-col gap-4 rounded-card bg-surface px-[16px] py-4 shadow-lg">
        <div className="flex items-center justify-between gap-[12px]">
          <h2 id="map-area-title" className="text-lg font-semibold">
            {t.title}
          </h2>
          <button type="button" onClick={onClose} className="grid size-11 place-items-center rounded-full bg-background" aria-label={t.close}>
            <X aria-hidden="true" className="size-5" />
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="font-semibold">{t.yourAreas}</h3>
          {areas.length === 0 ? <p className="text-sm text-muted">{t.noAreasYet}</p> : null}
          <ul className="flex flex-col gap-2">
            {areas.map((a) => {
              const percent = a.plannedBytes > 0 ? Math.floor((a.doneBytes / a.plannedBytes) * 100) : 100;
              return (
                <li key={a.id} className="flex flex-col gap-2 rounded-2xl bg-background px-[12px] py-3">
                  <div className="flex items-start justify-between gap-[8px]">
                    <div>
                      <button type="button" onClick={() => onShowArea(a)} className="text-left font-medium underline-offset-2 hover:underline">
                        {a.label}
                      </button>
                      <p className="text-sm text-muted">
                        {t.states[a.state]}
                        {a.state !== 'ready' ? ` · ${t.progress(percent)}` : ''} · {formatBytes(a.plannedBytes, lang)}
                      </p>
                      {a.error ? <p className="text-sm text-muted">{a.error}</p> : null}
                    </div>
                    <div className="flex shrink-0 gap-[6px]">
                      {a.state === 'downloading' ? (
                        <button type="button" onClick={() => void client.call({ type: 'pause', id: a.id })} className="grid size-11 place-items-center rounded-full bg-surface" aria-label={`${t.pause}: ${a.label}`}>
                          <Pause aria-hidden="true" className="size-5" />
                        </button>
                      ) : null}
                      {a.state === 'paused' && !offline ? (
                        <button type="button" onClick={() => void client.call({ type: 'resume', id: a.id })} className="grid size-11 place-items-center rounded-full bg-surface" aria-label={`${t.resume}: ${a.label}`}>
                          <Play aria-hidden="true" className="size-5" />
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => {
                          if (confirmDelete !== a.id) return setConfirmDelete(a.id);
                          setConfirmDelete(null);
                          void client.call({ type: 'delete', id: a.id });
                        }}
                        className={`flex h-11 min-w-11 items-center justify-center gap-[6px] rounded-full px-[10px] ${confirmDelete === a.id ? 'bg-accent text-on-accent' : 'bg-surface'}`}
                        aria-label={confirmDelete === a.id ? t.confirmRemove : `${t.remove}: ${a.label}`}
                      >
                        <Trash2 aria-hidden="true" className="size-5" />
                        {confirmDelete === a.id ? <span className="text-sm">{t.confirmRemove}</span> : null}
                      </button>
                    </div>
                  </div>
                  {a.state !== 'ready' ? (
                    <div className="h-2 overflow-hidden rounded-full bg-surface" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label={a.label}>
                      <div className="h-full bg-accent" style={{ width: `${percent}%` }} />
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="font-semibold">{t.getArea}</h3>
          {offline ? (
            <p className="text-sm text-muted">{t.needsNetwork}</p>
          ) : (
            <>
              <SubNav
                label={t.getArea}
                current={choice}
                onSelect={(href) => {
                  setChoice(href.slice(1) as Choice);
                  setSelected(null);
                }}
                items={choices.map((c) => ({ key: c, label: t.choices[c], href: `#${c}` }))}
              />
              {choice === 'home' ? (
                <div className="flex flex-col gap-2">
                  <p className="text-sm text-muted">{home ? t.homeSet : t.noHome}</p>
                  {positionError ? <p className="text-sm text-muted">{t.positionDenied}</p> : null}
                  <div className="flex flex-wrap gap-[8px]">
                    <button type="button" onClick={onPickHome} className="min-h-11 rounded-full bg-background px-[16px] text-sm font-medium">
                      {home ? `${t.changeHome}: ${t.pickOnMap.toLowerCase()}` : t.pickOnMap}
                    </button>
                    {'geolocation' in navigator ? (
                      <button type="button" onClick={useMyPosition} className="min-h-11 rounded-full bg-background px-[16px] text-sm font-medium">
                        {t.useMyPosition}
                      </button>
                    ) : null}
                  </div>
                </div>
              ) : null}
              {options.length > 0 ? (
                <ul className="flex flex-col gap-2" role="radiogroup" aria-label={t.getArea}>
                  {options.map((o) => {
                    const size = sizeOf(o);
                    const on = selected === o.key;
                    return (
                      <li key={o.key}>
                        <button
                          type="button"
                          role="radio"
                          aria-checked={on}
                          onClick={() => setSelected(on ? null : o.key)}
                          className={`flex min-h-11 w-full items-center justify-between gap-[12px] rounded-2xl px-[14px] py-2 text-left ${on ? 'bg-accent text-on-accent' : 'bg-background'}`}
                        >
                          <span className="font-medium">{o.label}</span>
                          <span className={`text-sm ${on ? 'text-on-accent' : 'text-muted'}`}>{size === undefined ? t.calculating : formatBytes(size, lang)}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : null}
              {free !== null ? <p className="text-sm text-muted">{t.freeSpace(formatBytes(free, lang))}</p> : null}
              {tooBig ? <p className="text-sm font-medium">{t.notEnoughSpace}</p> : null}
              {error ? (
                <p role="alert" className="text-sm font-medium">
                  {t.downloadFailed} {error}
                </p>
              ) : null}
              <button
                type="button"
                disabled={!chosen || chosenSize === undefined || tooBig || busy}
                onClick={() => void download()}
                className="flex min-h-12 items-center justify-center gap-[8px] rounded-full bg-accent px-[20px] font-semibold text-on-accent disabled:opacity-40"
              >
                <Download aria-hidden="true" className="size-5" />
                {chosen && chosenSize !== undefined ? t.download(formatBytes(chosenSize, lang)) : t.open}
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
