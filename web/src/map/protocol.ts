// Messages between the app and the map worker (D-036).

import type { Shape } from './area.ts';

// What the user chose: a circle (radius around home), a region of the country, or the whole country.
export type AreaShape = Extract<Shape, { kind: 'circle' }> | { kind: 'region'; id: string } | { kind: 'country' };

export type AreaState = 'downloading' | 'paused' | 'ready';

export interface AreaInfo {
  id: string;
  label: string;
  shape: AreaShape;
  bounds: [number, number, number, number]; // west, south, east, north
  version: string; // map version (Protomaps build date) the tiles come from
  plannedTiles: number;
  plannedBytes: number;
  doneBytes: number;
  state: AreaState;
  error: string | null; // why a download paused, if it did not pause on request
  createdAt: string;
  replaces: string | null; // an update: the older area it replaces once this one is ready
}

export interface Home {
  lon: number;
  lat: number;
}

export interface MapSummary {
  version: string;
  name: { da: string; en: string };
  maxZoom: number;
  regions: { id: string; name: string }[];
}

export type MapRequest =
  | { type: 'init'; mapUrl: string }
  | { type: 'summary' }
  | { type: 'estimate'; shape: AreaShape }
  | { type: 'download'; label: string; shape: AreaShape; replaces?: string }
  | { type: 'resume'; id: string }
  | { type: 'pause'; id: string }
  | { type: 'delete'; id: string }
  | { type: 'tile'; z: number; x: number; y: number }
  | { type: 'covered'; lon: number; lat: number }
  | { type: 'setHome'; home: Home | null };

export interface MapResponses {
  init: { areas: AreaInfo[]; home: Home | null };
  summary: MapSummary;
  estimate: { tiles: number; bytes: number };
  download: AreaInfo;
  resume: AreaInfo;
  pause: null;
  delete: null;
  tile: { data: Uint8Array | null; stored: boolean }; // stored: from a downloaded area
  covered: boolean;
  setHome: null;
}

export type MapReply = { id: number; ok: true; result: unknown } | { id: number; ok: false; error: string };
// Sent after every change to any area (progress, state, delete): the full list.
export interface MapProgress {
  event: 'areas';
  areas: AreaInfo[];
}
