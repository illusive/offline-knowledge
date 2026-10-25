// Download progress of the service worker's install (sw.ts posts PRECACHE_PROGRESS messages).

import { useEffect, useState } from 'react';

export interface PrecacheProgress {
  done: number;
  total: number;
}

export function usePrecacheProgress(): PrecacheProgress | null {
  const [progress, setProgress] = useState<PrecacheProgress | null>(null);
  useEffect(() => {
    const sw = navigator.serviceWorker;
    if (!sw) return;
    const onMessage = (event: MessageEvent<{ type?: string; done?: number; total?: number }>) => {
      const { type, done, total } = event.data ?? {};
      if (type === 'PRECACHE_PROGRESS' && typeof done === 'number' && typeof total === 'number') setProgress({ done, total });
    };
    sw.addEventListener('message', onMessage);
    return () => sw.removeEventListener('message', onMessage);
  }, []);
  return progress;
}
