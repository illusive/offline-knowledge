// App side of the database worker: typed request/response calls.

import type { PackInfo, Reply, Request, Responses } from './protocol';

export interface DbClient {
  call<T extends Request>(request: T): Promise<Responses[T['type']]>;
}

export function createDbClient(): DbClient {
  const worker = new Worker(new URL('./db.worker.ts', import.meta.url), { type: 'module' });
  const pending = new Map<number, { resolve: (value: never) => void; reject: (error: Error) => void }>();
  let nextId = 1;

  worker.onmessage = (event: MessageEvent<Reply>) => {
    const reply = event.data;
    const p = pending.get(reply.id);
    if (!p) return;
    pending.delete(reply.id);
    if (reply.ok) p.resolve(reply.result as never);
    else p.reject(new Error(reply.error));
  };
  worker.onerror = (event) => {
    for (const p of pending.values()) p.reject(new Error(event.message || 'Database worker failed'));
    pending.clear();
  };

  return {
    call(request) {
      const id = nextId++;
      return new Promise((resolve, reject) => {
        pending.set(id, { resolve: resolve as (value: never) => void, reject });
        worker.postMessage({ id, request });
      });
    },
  };
}

// Opens the bundled pack: reads its manifest (cached by the service worker) and lets the worker
// import it into OPFS if this version is not there yet.
export async function openPack(client: DbClient) {
  const base = new URL('pack/', document.baseURI);
  const pack = (await (await fetch(new URL('manifest.json', base))).json()) as PackInfo;
  return client.call({ type: 'init', packUrl: new URL('core.sqlite', base).href, pack });
}
