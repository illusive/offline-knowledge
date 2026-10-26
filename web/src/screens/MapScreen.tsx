// Kort (D-036): the offline map, full screen under the floating tab bar. With no downloaded area,
// the download flow comes first (once per app session) so it is clear the map needs downloading
// to work without a connection; the "Hent kort" button opens the same flow.

import { Download } from 'lucide-react';
import type { Map as MapLibreMap, MapMouseEvent } from 'maplibre-gl';
import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { MessageState, Page } from '../components/ui';
import type { Lang, Strings } from '../i18n/strings';
import { mapClient } from '../map/client';
import { DownloadFlow, type FlowStep } from '../map/DownloadFlow';
import { showOverlay } from '../map/overlays';
import type { AreaInfo, Home } from '../map/protocol';

const MapView = lazy(() => import('../map/MapView'));

// The first-time step is shown once per app session (again after a restart, until an area exists).
let introShownThisSession = false;

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

function useOnline(): boolean {
  const [online, setOnline] = useState(() => navigator.onLine);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);
  return online;
}

export function MapScreen({ lang, s }: { lang: Lang; s: Strings }) {
  const dark = useDarkMode();
  const online = useOnline();
  const [failed, setFailed] = useState(false);
  const [map, setMap] = useState<MapLibreMap | null>(null);
  const [areas, setAreas] = useState<AreaInfo[] | null>(null);
  const [home, setHome] = useState<Home | null>(null);
  const [flow, setFlow] = useState<FlowStep | null>(null);
  const [firstTime, setFirstTime] = useState(false);
  const [picking, setPicking] = useState(false);
  const [radius, setRadius] = useState<number | null>(null);
  const [notCovered, setNotCovered] = useState(false);
  const t = s.mapArea;

  useEffect(() => {
    document.title = `${s.mapTitle} – ${s.appTitle}`;
  }, [s]);

  // Areas and home from the map worker; every change sends the full list.
  useEffect(() => {
    const client = mapClient();
    let current = true;
    void client.ready.then(({ areas: a, home: h }) => {
      if (!current) return;
      setAreas(a);
      setHome(h);
      if (a.length === 0 && !introShownThisSession) {
        introShownThisSession = true;
        setFirstTime(true);
        setFlow('intro');
      }
    });
    const off = client.onAreas(setAreas);
    return () => {
      current = false;
      off();
    };
  }, []);

  // New detail tiles: redraw when an area becomes ready or is deleted, and every 5 s while one downloads.
  const readyKey = (areas ?? [])
    .filter((a) => a.state === 'ready')
    .map((a) => a.id)
    .join(',');
  const downloading = (areas ?? []).find((a) => a.state === 'downloading');
  useEffect(() => {
    map?.refreshTiles('detail');
  }, [map, readyKey]);
  useEffect(() => {
    if (!map || !downloading) return;
    const timer = setInterval(() => map.refreshTiles('detail'), 5000);
    return () => clearInterval(timer);
  }, [map, downloading]);

  // "Not downloaded here": checked for the middle of the view once zoomed in past the overview.
  useEffect(() => {
    if (!map) return;
    const check = () => {
      if (map.getZoom() < 9) return setNotCovered(false);
      const c = map.getCenter();
      void mapClient()
        .call({ type: 'covered', lon: c.lng, lat: c.lat })
        .then((covered) => setNotCovered(!covered))
        .catch(() => setNotCovered(false));
    };
    check();
    map.on('moveend', check);
    return () => {
      map.off('moveend', check);
    };
  }, [map, readyKey]);

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

  const chooseHome = useCallback((h: Home) => {
    setHome(h);
    void mapClient().call({ type: 'setHome', home: h });
  }, []);

  // Picking home: the next tap on the map sets it, then the flow comes back.
  useEffect(() => {
    if (!map || !picking) return;
    const onClick = (e: MapMouseEvent) => {
      chooseHome({ lon: e.lngLat.lng, lat: e.lngLat.lat });
      setPicking(false);
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

  const percent = downloading && downloading.plannedBytes > 0 ? Math.floor((downloading.doneBytes / downloading.plannedBytes) * 100) : null;
  const openFlow = () => {
    setFirstTime(false);
    setFlow('start');
  };

  return (
    <main className="fixed inset-0 bg-background">
      <h1 className="sr-only">{s.mapTitle}</h1>
      <Suspense fallback={<MessageState title={s.mapLoading} />}>
        <MapView lang={lang} dark={dark} label={s.mapLabel} onError={() => setFailed(true)} onReady={setMap} />
      </Suspense>

      {picking ? (
        <p role="status" className="fixed inset-x-[12px] top-[calc(12px+env(safe-area-inset-top))] z-10 mx-auto max-w-[420px] rounded-full bg-ink px-[16px] py-3 text-center text-sm font-medium text-on-ink">
          {t.pickHint}
        </p>
      ) : (
        <div className="fixed top-[calc(10px+env(safe-area-inset-top))] left-[12px] z-[5] flex max-w-[calc(100%-80px)] flex-col items-start gap-[8px]">
          <button type="button" onClick={openFlow} className="flex min-h-11 items-center gap-[8px] rounded-full bg-surface px-[14px] text-sm font-semibold shadow-lg">
            <Download aria-hidden="true" className="size-5" />
            {downloading && percent !== null ? `${t.states.downloading} ${percent} %` : t.open}
          </button>
          {notCovered ? (
            <div role="status" className="flex items-center gap-[10px] rounded-2xl bg-ink py-2 pr-[6px] pl-[14px] text-sm text-on-ink shadow-lg">
              <span>{online ? t.notCovered : t.notCoveredOffline}</span>
              {online ? (
                <button type="button" onClick={openFlow} className="min-h-9 rounded-full bg-accent px-[12px] font-semibold text-on-accent">
                  {t.getThisArea}
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      )}

      {flow ? (
        <DownloadFlow
          lang={lang}
          s={s}
          firstTime={firstTime}
          areas={areas ?? []}
          home={home}
          step={flow}
          onStep={setFlow}
          hidden={picking}
          onClose={() => {
            setFlow(null);
            setRadius(null);
          }}
          onPickHome={() => setPicking(true)}
          onHome={chooseHome}
          onPreviewRadius={setRadius}
          onShowArea={(area: AreaInfo) => {
            setFlow(null);
            setRadius(null);
            map?.fitBounds(area.bounds, { padding: 40, maxZoom: 15 });
          }}
        />
      ) : null}
    </main>
  );
}
