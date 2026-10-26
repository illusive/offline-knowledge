// Things drawn on top of the map (D-036): the home point and the radius being considered.
// Re-added after every style change (light/dark), since a new style drops sources and layers.

import type { Feature, FeatureCollection } from 'geojson';
import type { GeoJSONSource, Map as MapLibreMap } from 'maplibre-gl';
import type { Home } from './protocol.ts';

const SOURCE = 'stead-overlay';

export interface Overlay {
  home: Home | null;
  radiusKm: number | null;
}

function circle(home: Home, radiusKm: number): [number, number][] {
  const points: [number, number][] = [];
  const kx = 111.32 * Math.cos((home.lat * Math.PI) / 180);
  for (let i = 0; i <= 64; i++) {
    const a = (i / 64) * 2 * Math.PI;
    points.push([home.lon + (radiusKm * Math.cos(a)) / kx, home.lat + (radiusKm * Math.sin(a)) / 111.32]);
  }
  return points;
}

function data(overlay: Overlay): FeatureCollection {
  const features: Feature[] = [];
  if (overlay.home && overlay.radiusKm) {
    features.push({ type: 'Feature', properties: { kind: 'radius' }, geometry: { type: 'Polygon', coordinates: [circle(overlay.home, overlay.radiusKm)] } });
  }
  if (overlay.home) features.push({ type: 'Feature', properties: { kind: 'home' }, geometry: { type: 'Point', coordinates: [overlay.home.lon, overlay.home.lat] } });
  return { type: 'FeatureCollection', features };
}

export function showOverlay(map: MapLibreMap, overlay: Overlay) {
  const source = map.getSource(SOURCE) as GeoJSONSource | undefined;
  if (source) {
    source.setData(data(overlay));
    return;
  }
  if (!map.isStyleLoaded()) return; // added on 'style.load'
  map.addSource(SOURCE, { type: 'geojson', data: data(overlay) });
  map.addLayer({ id: 'stead-radius-fill', type: 'fill', source: SOURCE, filter: ['==', ['get', 'kind'], 'radius'], paint: { 'fill-color': '#c8e64a', 'fill-opacity': 0.18 } });
  map.addLayer({ id: 'stead-radius-line', type: 'line', source: SOURCE, filter: ['==', ['get', 'kind'], 'radius'], paint: { 'line-color': '#5a6b00', 'line-width': 2 } });
  map.addLayer({
    id: 'stead-home',
    type: 'circle',
    source: SOURCE,
    filter: ['==', ['get', 'kind'], 'home'],
    paint: { 'circle-radius': 8, 'circle-color': '#c8e64a', 'circle-stroke-color': '#1b1b1a', 'circle-stroke-width': 3 },
  });
}
