// "Offline ready" means: the knowledge pack is open and a service worker controls the page,
// so the app and its files will load without a network.

import { useEffect, useState } from 'react';

export function useOfflineReady(packReady: boolean): boolean {
  const [controlled, setControlled] = useState(() => Boolean(navigator.serviceWorker?.controller));
  useEffect(() => {
    const sw = navigator.serviceWorker;
    if (!sw) return;
    const update = () => setControlled(Boolean(sw.controller));
    sw.addEventListener('controllerchange', update);
    void sw.ready.then(update);
    return () => sw.removeEventListener('controllerchange', update);
  }, []);
  return packReady && controlled;
}
