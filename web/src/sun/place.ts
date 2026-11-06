// The place the sun tool works out the times for (D-056), kept on the device until changed: the
// phone's position (asked for only when the user taps, once, never watched), the map's home point,
// or a town from the list. A position is rounded to 0.01° (about 1 km), which is plenty for the
// time to the minute.

import { createLocalStore } from '../lib/localStore';
import { townById } from './towns';

export type Place = { kind: 'gps'; lat: number; lon: number } | { kind: 'home'; lat: number; lon: number } | { kind: 'town'; id: string };

export const roundCoord = (deg: number) => Math.round(deg * 100) / 100;

const isLat = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && v >= -90 && v <= 90;
const isLon = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && v >= -180 && v <= 180;

export function parsePlace(stored: unknown): Place | null {
  if (!stored || typeof stored !== 'object') return null;
  const p = stored as Record<string, unknown>;
  if ((p.kind === 'gps' || p.kind === 'home') && isLat(p.lat) && isLon(p.lon)) return { kind: p.kind, lat: p.lat, lon: p.lon };
  if (p.kind === 'town' && typeof p.id === 'string' && townById(p.id)) return { kind: 'town', id: p.id };
  return null;
}

export const placeStore = createLocalStore<Place | null>({ key: 'stead.sun.place.v1', parse: parsePlace });

export function coordsOf(place: Place): { lat: number; lon: number } {
  if (place.kind !== 'town') return { lat: place.lat, lon: place.lon };
  const town = townById(place.id)!;
  return { lat: town.lat, lon: town.lon };
}
