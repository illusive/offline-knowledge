// Places on the map (points of interest from OpenStreetMap, in the Protomaps 'pois' layer) in groups
// the user switches on or off (D-036, owner 2026-10-27). Groups that help in an emergency are on by
// default; everything else in the data stays available under the other groups, including "Alt andet".
// Drawn by our own layers (a coloured dot per group, the name from zoom 15), not the basemap's.

import { useState } from 'react';
import type { ExpressionSpecification, FilterSpecification, LayerSpecification } from 'maplibre-gl';

export const POI_GROUPS = [
  { key: 'emergency', on: true, color: '#d6332a', kinds: ['hospital', 'clinic', 'doctors', 'pharmacy', 'dentist', 'police', 'fire_station', 'ambulance_station', 'emergency_access_point', 'defibrillator', 'veterinary'] },
  { key: 'water', on: true, color: '#2f7de1', kinds: ['drinking_water', 'water_point', 'waterpoint', 'watering_place', 'shelter', 'toilets', 'shower', 'camp_site', 'caravan_site', 'firepit', 'bbq', 'spring'] },
  { key: 'supplies', on: true, color: '#1f7a3d', kinds: ['supermarket', 'convenience', 'kiosk', 'greengrocer', 'bakery', 'butcher', 'grocery', 'fuel', 'charging_station', 'atm', 'bank', 'hardware', 'doityourself', 'outdoor', 'chemist', 'marketplace', 'department_store', 'mall', 'farm'] },
  { key: 'transport', on: true, color: '#6b4fbb', kinds: ['station', 'halt', 'bus_station', 'bus_stop', 'ferry_terminal', 'aerodrome', 'subway_entrance', 'taxi', 'bicycle_rental', 'car_rental', 'parking', 'marina', 'slipway'] },
  { key: 'public', on: false, color: '#5b6470', kinds: ['townhall', 'post_office', 'library', 'school', 'kindergarten', 'university', 'college', 'community_centre', 'place_of_worship', 'social_facility', 'courthouse', 'nursing_home', 'childcare'] },
  { key: 'nature', on: false, color: '#5a8f29', kinds: ['park', 'forest', 'garden', 'beach', 'peak', 'viewpoint', 'picnic_site', 'picnic_table', 'bathing_place', 'swimming_area', 'nature_reserve', 'playground', 'dog_park', 'allotments', 'hill', 'cave_entrance'] },
  { key: 'food', on: false, color: '#c2541b', kinds: ['restaurant', 'cafe', 'fast_food', 'bar', 'pub', 'ice_cream', 'biergarten', 'food_court'] },
  { key: 'culture', on: false, color: '#a8327d', kinds: ['museum', 'attraction', 'theatre', 'cinema', 'artwork', 'zoo', 'aquarium', 'memorial', 'monument', 'archaeological_site', 'castle', 'ruins', 'gallery', 'arts_centre', 'stadium', 'sports_centre', 'swimming_pool'] },
  { key: 'other', on: false, color: '#8a8a8a', kinds: [] as string[] }, // every kind not listed above
] as const;

export type PoiGroup = (typeof POI_GROUPS)[number]['key'];
const LISTED = POI_GROUPS.flatMap((g) => [...g.kinds]);
const KEY = 'stead.map.poiGroups';
const kind: ExpressionSpecification = ['get', 'kind'];

export function defaultGroups(): PoiGroup[] {
  return POI_GROUPS.filter((g) => g.on).map((g) => g.key);
}

export function usePoiGroups() {
  const [groups, setGroupsState] = useState<PoiGroup[]>(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return (JSON.parse(raw) as string[]).filter((k): k is PoiGroup => POI_GROUPS.some((g) => g.key === k));
    } catch {
      // fall through to the defaults
    }
    return defaultGroups();
  });
  const setGroups = (next: PoiGroup[]) => {
    setGroupsState(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      // private mode: not remembered
    }
  };
  return { groups, setGroups };
}

// Which places to draw: the selected groups' kinds (for "other", every kind not in a group), each
// only from the zoom the data gives it.
export function poiFilter(groups: readonly PoiGroup[]): FilterSpecification {
  const parts: ExpressionSpecification[] = groups.map((key) => {
    if (key === 'other') return ['!', ['in', kind, ['literal', LISTED]]];
    const g = POI_GROUPS.find((x) => x.key === key)!;
    return ['in', kind, ['literal', [...g.kinds]]];
  });
  return ['all', ['>=', ['zoom'], ['coalesce', ['get', 'min_zoom'], 0]], parts.length > 0 ? ['any', ...parts] : ['boolean', false]];
}

const color: ExpressionSpecification = ['match', kind, ...POI_GROUPS.filter((g) => g.kinds.length > 0).flatMap((g) => [[...g.kinds], g.color]), POI_GROUPS.at(-1)!.color] as unknown as ExpressionSpecification;

export const POI_LAYER_IDS = ['stead-pois-dot', 'stead-pois-label'] as const;

export function poiLayers(groups: readonly PoiGroup[], dark: boolean): LayerSpecification[] {
  const filter = poiFilter(groups);
  return [
    {
      id: 'stead-pois-dot',
      type: 'circle',
      source: 'detail',
      'source-layer': 'pois',
      filter,
      paint: { 'circle-radius': ['interpolate', ['linear'], ['zoom'], 12, 3.5, 16, 6.5], 'circle-color': color, 'circle-stroke-color': dark ? '#1b1b1a' : '#ffffff', 'circle-stroke-width': 1.5 },
    },
    {
      id: 'stead-pois-label',
      type: 'symbol',
      source: 'detail',
      'source-layer': 'pois',
      minzoom: 15,
      filter,
      layout: { 'text-field': ['get', 'name'], 'text-font': ['Noto Sans Regular'], 'text-size': 12, 'text-offset': [0, 0.9], 'text-anchor': 'top', 'text-max-width': 9, 'text-optional': true },
      paint: { 'text-color': color, 'text-halo-color': dark ? '#1b1b1a' : '#ffffff', 'text-halo-width': 1.5 },
    },
  ];
}

// Group of a kind, for the details shown when a place is tapped.
export function groupOf(k: string): PoiGroup {
  return POI_GROUPS.find((g) => (g.kinds as readonly string[]).includes(k))?.key ?? 'other';
}
