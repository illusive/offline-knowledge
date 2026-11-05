// App side of the database worker: typed request/response calls.

import { createRpcClient, type RpcClient } from '../lib/rpc';
import type { PackInfo, Request, Responses } from './protocol';

export type DbClient = RpcClient<Request, Responses>;

export function createDbClient(): DbClient {
  return createRpcClient<Request, Responses>(new Worker(new URL('./db.worker.ts', import.meta.url), { type: 'module' }), { name: 'Database' });
}

// Opens the bundled pack: reads its manifest (cached by the service worker) and lets the worker
// import it into OPFS if this version is not there yet.
export async function openPack(client: DbClient) {
  const base = new URL('pack/', document.baseURI);
  const pack = (await (await fetch(new URL('manifest.json', base))).json()) as PackInfo;
  const init = await client.call({ type: 'init', packUrl: new URL('core.sqlite', base).href, pack });
  return { pack, init };
}
