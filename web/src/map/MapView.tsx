// The map itself (D-036). Loaded on demand from the Kort tab, but precached like the rest of the
// app, so it opens offline. Everything it needs comes from the app: style, fonts, icons, tiles.

import * as maplibregl from 'maplibre-gl';
import type { Map as MapLibreMap, RequestParameters } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url';
import { useEffect, useRef } from 'react';
import { mapStyle } from './style';
import { getTile, type TileSource } from './tiles';

const ATTRIBUTION = '© OpenStreetMap contributors';
const DENMARK: [number, number, number, number] = [8.0, 54.5, 15.2, 57.8];

// The app's base URL (works on GitHub Pages' sub-path and locally).
const BASE = new URL('./', document.baseURI).href;

let protocolAdded = false;
function addProtocol() {
  if (protocolAdded) return;
  protocolAdded = true;
  maplibregl.setWorkerUrl(new URL(workerUrl, document.baseURI).href);
  maplibregl.addProtocol('stead', async (params: RequestParameters) => {
    const match = /^stead:\/\/(overview|detail)\/(\d+)\/(\d+)\/(\d+)$/.exec(params.url);
    if (!match) throw new Error(`Unknown map address ${params.url}`);
    const [, source, z, x, y] = match;
    const tile = await getTile(BASE, source as TileSource, Number(z), Number(x), Number(y));
    // No tile: an empty vector tile, so the layers underneath show through.
    return { data: tile ? (tile.buffer.slice(tile.byteOffset, tile.byteOffset + tile.byteLength) as ArrayBuffer) : new ArrayBuffer(0) };
  });
}

export default function MapView({ lang, dark, label, onError }: { lang: 'da' | 'en'; dark: boolean; label: string; onError: () => void }) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<MapLibreMap | null>(null);

  useEffect(() => {
    const element = container.current;
    if (!element) return;
    addProtocol();
    let instance: MapLibreMap;
    try {
      instance = new maplibregl.Map({
        container: element,
        style: mapStyle(BASE, dark, lang, ATTRIBUTION),
        bounds: DENMARK,
        maxZoom: 18,
        attributionControl: false,
        dragRotate: false,
        pitchWithRotate: false,
      });
    } catch {
      onError(); // e.g. WebGL not available
      return;
    }
    instance.touchZoomRotate.disableRotation();
    instance.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    instance.addControl(new maplibregl.AttributionControl({ compact: false }), 'bottom-left');
    instance.getCanvas().setAttribute('aria-label', label);
    // When everything in view is drawn, record it on the element (offline tests read this).
    instance.on('idle', () => {
      element.dataset.ready = 'true';
      element.dataset.features = String(instance.queryRenderedFeatures().length);
    });
    map.current = instance;
    // Development only: lets the browser console and tests inspect the map.
    if (import.meta.env.DEV) (window as unknown as { steadMap?: MapLibreMap }).steadMap = instance;
    return () => {
      instance.remove();
      map.current = null;
    };
    // The map is created once; theme and language changes swap the style below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Theme or language changed after the map was created: swap the style.
  const styled = useRef({ dark, lang });
  useEffect(() => {
    if (styled.current.dark === dark && styled.current.lang === lang) return;
    styled.current = { dark, lang };
    map.current?.setStyle(mapStyle(BASE, dark, lang, ATTRIBUTION));
  }, [dark, lang]);

  // MapLibre makes its container position: relative, so the full-screen sizing sits on a wrapper.
  return (
    <div className="stead-map absolute inset-0">
      <div ref={container} className="h-full w-full" data-testid="map" />
    </div>
  );
}
