// App side of the map worker (D-036): typed calls plus area progress events. One worker per app.

import type { AreaInfo, MapProgress, MapReply, MapRequest, MapResponses } from './protocol.ts';

// The published map, next to the app on the same host: https://illusive.github.io/stead-maps/dk/
// (locally the dev and preview servers answer /stead-maps/ themselves, see vite.config.ts).
export const MAP_URL = new URL('../stead-maps/dk/', new URL('./', document.baseURI)).href;

export interface MapClient {
  call<T extends MapRequest>(request: T): Promise<MapResponses[T['type']]>;
  onAreas(listener: (areas: AreaInfo[]) => void): () => void;
  ready: Promise<MapResponses['init']>;
}

let client: MapClient | null = null;

export function mapClient(): MapClient {
  if (client) return client;
  const worker = new Worker(new URL('./map.worker.ts', import.meta.url), { type: 'module' });
  const pending = new Map<number, { resolve: (value: never) => void; reject: (error: Error) => void }>();
  const listeners = new Set<(areas: AreaInfo[]) => void>();
  let nextId = 1;

  worker.onmessage = (event: MessageEvent<MapReply | MapProgress>) => {
    const data = event.data;
    if ('event' in data) {
      for (const listener of listeners) listener(data.areas);
      return;
    }
    const p = pending.get(data.id);
    if (!p) return;
    pending.delete(data.id);
    if (data.ok) p.resolve(data.result as never);
    else p.reject(new Error(data.error));
  };
  worker.onerror = (event) => {
    for (const p of pending.values()) p.reject(new Error(event.message || 'Map worker failed'));
    pending.clear();
  };

  const call = <T extends MapRequest>(request: T): Promise<MapResponses[T['type']]> => {
    const id = nextId++;
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve: resolve as (value: never) => void, reject });
      worker.postMessage({ id, request });
    });
  };
  client = {
    call,
    onAreas(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    ready: call({ type: 'init', mapUrl: MAP_URL }),
  };
  return client;
}
