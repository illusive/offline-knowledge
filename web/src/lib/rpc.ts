// Typed requests to a web worker and their answers (D-022, D-036): the app asks with
// `client.call({ type, ... })` and gets the answer typed for that request; the worker answers with
// one handler per request type, so a handler that returns the wrong thing does not compile.
// Messages with an `event` field are the worker's own news (e.g. map download progress).

export type RpcReply = { id: number; ok: true; result: unknown } | { id: number; ok: false; error: string };

type Message = { type: string };
export type Handlers<Req extends Message, Res extends Record<Req['type'], unknown>> = {
  [K in Req['type']]: (request: Extract<Req, { type: K }>) => Res[K] | Promise<Res[K]>;
};

export interface RpcClient<Req extends Message, Res extends Record<Req['type'], unknown>> {
  call<T extends Req>(request: T): Promise<Res[T['type']]>;
}

export function createRpcClient<Req extends Message, Res extends Record<Req['type'], unknown>, Event = never>(
  worker: Worker,
  { name, onEvent }: { name: string; onEvent?: (event: Event) => void },
): RpcClient<Req, Res> {
  const pending = new Map<number, { resolve: (value: never) => void; reject: (error: Error) => void }>();
  let nextId = 1;

  worker.onmessage = (message: MessageEvent<RpcReply | (Event & { event: string })>) => {
    const data = message.data;
    if ('event' in data) {
      onEvent?.(data);
      return;
    }
    const p = pending.get(data.id);
    if (!p) return;
    pending.delete(data.id);
    if (data.ok) p.resolve(data.result as never);
    else p.reject(new Error(data.error));
  };
  worker.onerror = (event) => {
    for (const p of pending.values()) p.reject(new Error(event.message || `${name} worker failed`));
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

// Inside the worker: answers each request with its handler. `before` runs first for every request
// (e.g. waiting until the worker is set up). Requests are handled concurrently.
export function serveRpc<Req extends Message, Res extends Record<Req['type'], unknown>>(handlers: Handlers<Req, Res>, before?: (request: Req) => Promise<void>) {
  self.onmessage = async (event: MessageEvent<{ id: number; request: Req }>) => {
    const { id, request } = event.data;
    let reply: RpcReply;
    try {
      await before?.(request);
      const handler = handlers[request.type as Req['type']] as (r: Req) => unknown;
      reply = { id, ok: true, result: await handler(request) };
    } catch (error) {
      reply = { id, ok: false, error: error instanceof Error ? error.message : String(error) };
    }
    self.postMessage(reply);
  };
}
