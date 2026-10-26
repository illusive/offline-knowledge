// Kort (D-036): the offline map, full screen under the floating tab bar, with the panel for
// choosing and managing downloaded areas.

import { Download } from 'lucide-react';
import type { Map as MapLibreMap, MapMouseEvent } from 'maplibre-gl';
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { MessageState, Page } from '../components/ui';
import type { Lang, Strings } from '../i18n/strings';
import { AreaPanel, formatBytes } from '../map/AreaPanel';
import { mapClient } from '../map/client';
import { showOverlay } from '../map/overlays';
import type { AreaInfo, Home } from '../map/protocol';

const MapView = lazy(() => import('../map/MapView'));

function useDarkMode(): boolean {
  const query = '(prefers-color-scheme: dark)';
  const [dark, setDark] = useState(() => matchMedia(query).matches);
  useEffect(() => {
    const list = matchMedia(query);
    const update = () => setDark(list.matches);
    list.addEventListener('change', update);
    return () => list.removeEventListener('change', update);
  }, []);
  return dark;
}

export function MapScreen({ lang, s }: { lang: Lang; s: Strings }) {
  const dark = useDarkMode();
  const [failed, setFailed] = useState(false);
  const [map, setMap] = useState<MapLibreMap | null>(null);
  const [areas, setAreas] = useState<AreaInfo[]>([]);
  const [home, setHome] = useState<Home | null>(null);
  const [panel, setPanel] = useState(false);
  const [picking, setPicking] = useState(false);
  const [radius, setRadius] = useState<number | null>(null);
  const lastRefresh = useRef(0);

  useEffect(() => {
    document.title = `${s.mapTitle} – ${s.appTitle}`;
  }, [s]);

  // Areas and home from the map worker; progress events keep the list current.
  useEffect(() => {
    const client = mapClient();
    let current = true;
    void client.ready.then(({ areas: a, home: h }) => {
      if (!current) return;
      setAreas(a);
      setHome(h);
    });
    const off = client.onAreas(setAreas);
    return () => {
      current = false;
      off();
    };
  }, []);

  // New detail tiles: redraw once when an area becomes ready or is deleted, and at most every
  // 5 s while one is downloading.
  const readyKey = areas
    .filter((a) => a.state === 'ready')
    .map((a) => a.id)
    .join(',');
  const lastReady = useRef(readyKey);
  useEffect(() => {
    if (!map) return;
    const now = Date.now();
    const downloading = areas.some((a) => a.state === 'downloading');
    if (readyKey !== lastReady.current || (downloading && now - lastRefresh.current > 5000)) {
      lastReady.current = readyKey;
      lastRefresh.current = now;
      map.refreshTiles('detail');
    }
  }, [areas, map, readyKey]);

  // Home point and radius preview on the map, also after a style change.
  useEffect(() => {
    if (!map) return;
    const draw = () => showOverlay(map, { home, radiusKm: radius });
    draw();
    map.on('style.load', draw);
    return () => {
      map.off('style.load', draw);
    };
  }, [map, home, radius]);

  // Show the radius being considered in the part of the map above the panel.
  useEffect(() => {
    if (!map || !home || !radius) return;
    const dLat = radius / 111.32;
    const dLon = radius / (111.32 * Math.cos((home.lat * Math.PI) / 180));
    map.fitBounds(
      [home.lon - dLon, home.lat - dLat, home.lon + dLon, home.lat + dLat],
      { padding: { top: 72, left: 24, right: 24, bottom: Math.round(window.innerHeight * 0.6) }, duration: 400 },
    );
  }, [map, home, radius]);

  const chooseHome = useCallback((h: Home) => {
    setHome(h);
    void mapClient().call({ type: 'setHome', home: h });
  }, []);

  // Picking home: the next tap on the map sets it, then the panel comes back.
  useEffect(() => {
    if (!map || !picking) return;
    const onClick = (e: MapMouseEvent) => {
      chooseHome({ lon: e.lngLat.lng, lat: e.lngLat.lat });
      setPicking(false);
      setPanel(true);
    };
    map.once('click', onClick);
    return () => {
      map.off('click', onClick);
    };
  }, [map, picking, chooseHome]);

  if (failed) {
    return (
      <Page>
        <h1 className="mt-2 px-1 text-3xl font-normal tracking-tight">{s.mapTitle}</h1>
        <MessageState title={s.mapErrorTitle} body={s.mapErrorBody} />
      </Page>
    );
  }

  const downloading = areas.find((a) => a.state === 'downloading');
  const percent = downloading && downloading.plannedBytes > 0 ? Math.floor((downloading.doneBytes / downloading.plannedBytes) * 100) : null;

  return (
    <main className="fixed inset-0 bg-background">
      <h1 className="sr-only">{s.mapTitle}</h1>
      <Suspense fallback={<MessageState title={s.mapLoading} />}>
        <MapView lang={lang} dark={dark} label={s.mapLabel} onError={() => setFailed(true)} onReady={setMap} />
      </Suspense>

      {picking ? (
        <p role="status" className="fixed inset-x-[12px] top-[calc(12px+env(safe-area-inset-top))] z-10 mx-auto max-w-[420px] rounded-full bg-ink px-[16px] py-3 text-center text-sm font-medium text-on-ink">
          {s.mapArea.pickHint}
        </p>
      ) : (
        <button
          type="button"
          onClick={() => setPanel((v) => !v)}
          aria-expanded={panel}
          className="fixed top-[calc(10px+env(safe-area-inset-top))] left-[12px] z-10 flex min-h-11 items-center gap-[8px] rounded-full bg-surface px-[14px] text-sm font-semibold shadow-lg"
        >
          <Download aria-hidden="true" className="size-5" />
          {downloading && percent !== null ? `${s.mapArea.states.downloading} ${percent} %` : s.mapArea.open}
        </button>
      )}

      {panel && !picking ? (
        <AreaPanel
          lang={lang}
          s={s}
          areas={areas}
          home={home}
          onClose={() => {
            setPanel(false);
            setRadius(null);
          }}
          onPickHome={() => {
            setPanel(false);
            setPicking(true);
          }}
          onHome={chooseHome}
          onPreviewRadius={setRadius}
          onShowArea={(area) => {
            setPanel(false);
            setRadius(null);
            map?.fitBounds(area.bounds, { padding: 40, maxZoom: 15 });
          }}
        />
      ) : null}
      {/* Size of all downloaded areas, for the screen reader summary of the button. */}
      <span className="sr-only">{areas.length > 0 ? formatBytes(areas.reduce((n, a) => n + a.plannedBytes, 0), lang) : ''}</span>
    </main>
  );
}
