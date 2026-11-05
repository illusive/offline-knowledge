// App side of the map worker (D-036): typed calls plus area progress events. One worker per app.

import { createRpcClient } from '../lib/rpc';
import type { AreaInfo, MapProgress, MapRequest, MapResponses } from './protocol.ts';

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
  const listeners = new Set<(areas: AreaInfo[]) => void>();
  const rpc = createRpcClient<MapRequest, MapResponses, MapProgress>(new Worker(new URL('./map.worker.ts', import.meta.url), { type: 'module' }), {
    name: 'Map',
    onEvent: (event) => {
      for (const listener of listeners) listener(event.areas);
    },
  });
  const call = rpc.call;
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
