// Map style (D-036): Protomaps basemap layers, with fonts and icons from the app itself.
// Two sources: 'overview' (bundled, z0–8, scaled up beyond) draws land and water underneath, so
// the map is never blank outside a downloaded area; 'detail' draws the full map where tiles exist.

import { layers, namedFlavor } from '@protomaps/basemaps';
import type { LayerSpecification, StyleSpecification } from 'maplibre-gl';
import { poiLayers, type PoiGroup } from './pois';

const UNDERLAY = new Set(['earth', 'landcover', 'water']);

export const OVERVIEW_MAX_ZOOM = 8;
export const DETAIL_MAX_ZOOM = 15;

// `base` is the app's base URL (ends with '/'); templates must keep their {braces} unencoded.
// The basemap's own place layer is replaced by ours (pois.ts), so the user chooses what is shown.
export function mapStyle(base: string, dark: boolean, lang: 'da' | 'en', attribution: string, groups: readonly PoiGroup[]): StyleSpecification {
  const flavor = namedFlavor(dark ? 'dark' : 'light');
  const detail = (layers('detail', flavor, { lang }) as LayerSpecification[]).filter((l) => l.id !== 'pois');
  const underlay = (layers('overview', flavor, { lang }) as LayerSpecification[])
    .filter((l) => UNDERLAY.has(l.id))
    .map((l) => ({ ...l, id: `overview_${l.id}` }) as LayerSpecification);
  const [background, ...rest] = detail;
  return {
    version: 8,
    glyphs: `${base}map/assets/fonts/{fontstack}/{range}.pbf`,
    sprite: `${base}map/assets/sprites/${dark ? 'dark' : 'light'}`,
    sources: {
      overview: { type: 'vector', tiles: ['stead://overview/{z}/{x}/{y}'], maxzoom: OVERVIEW_MAX_ZOOM, attribution },
      detail: { type: 'vector', tiles: ['stead://detail/{z}/{x}/{y}'], maxzoom: DETAIL_MAX_ZOOM, attribution },
    },
    layers: [...(background ? [background] : []), ...underlay, ...rest, ...poiLayers(groups, dark)],
  };
}
