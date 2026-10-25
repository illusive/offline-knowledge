// Registers the service worker and shows its state: "works offline now" once, and
// "new version ready" when an update has fully downloaded (it never takes over by itself).

import { useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import type { Strings } from '../i18n/strings';

export function UpdateBanner({ s }: { s: Strings }) {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  // "Works offline now" is informational: hide it after a few seconds. "Update" stays until acted on.
  useEffect(() => {
    if (!offlineReady || needRefresh) return;
    const timer = setTimeout(() => setOfflineReady(false), 6000);
    return () => clearTimeout(timer);
  }, [offlineReady, needRefresh, setOfflineReady]);

  if (!offlineReady && !needRefresh) return null;

  return (
    <>
      {/* Spacer so the end of the page can scroll clear of the fixed banner. */}
      <div aria-hidden="true" className="h-24" />
      <div className="fixed inset-x-0 bottom-[calc(4.75rem+max(0.75rem,env(safe-area-inset-bottom)))] z-10 px-4" role="status">
        <div className="mx-auto flex max-w-md items-center gap-3 rounded-card bg-surface p-3 shadow-lg">
          <p className="flex-1">{needRefresh ? s.updateReady : s.offlineReady}</p>
          {needRefresh ? (
            <button type="button" onClick={() => void updateServiceWorker(true)} className="min-h-11 rounded-full bg-accent px-4 font-semibold text-on-accent">
              {s.updateAction}
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => {
              setOfflineReady(false);
              setNeedRefresh(false);
            }}
            className="min-h-11 px-2 font-medium"
          >
            {s.dismiss}
          </button>
        </div>
      </div>
    </>
  );
}
