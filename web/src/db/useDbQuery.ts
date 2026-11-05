// One request to the knowledge pack, for a component (D-022). The answer belongs to the request it
// was asked for, so a slow answer to an earlier request is never shown; a failed request gives an
// error instead of loading forever. `db` or `request` null: nothing is asked yet.

import { useEffect, useState } from 'react';
import type { DbClient } from './client';
import type { Request, Responses } from './protocol';

export interface Query<T> {
  data: T | undefined; // undefined while loading (or when nothing is asked)
  error: Error | null;
}

export function useDbQuery<R extends Request>(db: DbClient | null, request: R | null): Query<Responses[R['type']]> {
  const key = db && request ? JSON.stringify(request) : null;
  const [result, setResult] = useState<{ key: string; data?: Responses[R['type']]; error?: Error } | null>(null);

  useEffect(() => {
    if (!db || !request || key === null) return;
    let live = true;
    db.call(request).then(
      (data) => live && setResult({ key, data }),
      (error: unknown) => {
        console.error('Knowledge pack request failed', request.type, error);
        if (live) setResult({ key, error: error instanceof Error ? error : new Error(String(error)) });
      },
    );
    return () => {
      live = false;
    };
    // The request is compared by its key, so a new object with the same content asks nothing new.
  }, [db, key]);

  const current = result && result.key === key ? result : null;
  return { data: current?.data, error: current?.error ?? null };
}
