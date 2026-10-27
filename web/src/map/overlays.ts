// Things drawn on top of the map (D-036): the home point, the radius being considered, and the
// user's position with its accuracy circle (only while "Vis min position" is on).
// Re-added after every style change (light/dark), since a new style drops sources and layers.

import type { Feature, FeatureCollection } from 'geojson';
import type { GeoJSONSource, Map as MapLibreMap } from 'maplibre-gl';
import type { Home } from './protocol.ts';

const SOURCE = 'stead-overlay';

export interface Overlay {
  home: Home | null;
  radiusKm: number | null;
  position?: Position | null;
}

export interface Position {
  lon: number;
  lat: number;
  accuracyM: number;
}

function circle(home: Pick<Home, 'lon' | 'lat'>, radiusKm: number): [number, number][] {
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
  const p = overlay.position;
  if (p) {
    features.push({ type: 'Feature', properties: { kind: 'accuracy' }, geometry: { type: 'Polygon', coordinates: [circle(p, p.accuracyM / 1000)] } });
    features.push({ type: 'Feature', properties: { kind: 'position' }, geometry: { type: 'Point', coordinates: [p.lon, p.lat] } });
  }
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
  map.addLayer({ id: 'stead-accuracy', type: 'fill', source: SOURCE, filter: ['==', ['get', 'kind'], 'accuracy'], paint: { 'fill-color': '#2f7de1', 'fill-opacity': 0.15, 'fill-outline-color': '#2f7de1' } });
  map.addLayer({
    id: 'stead-position',
    type: 'circle',
    source: SOURCE,
    filter: ['==', ['get', 'kind'], 'position'],
    paint: { 'circle-radius': 7, 'circle-color': '#2f7de1', 'circle-stroke-color': '#ffffff', 'circle-stroke-width': 3 },
  });
}
