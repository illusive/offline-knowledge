// "Offline ready" status in the Home header, and the download card shown until the app is ready.

import { useEffect, useState } from 'react';
import type { Strings } from '../i18n/strings';
import type { PrecacheProgress } from '../pwa/usePrecacheProgress';

// The development server (npm run dev) runs without a service worker, so offline is not available there.
export const OFFLINE_DISABLED = import.meta.env.DEV;

export function OfflineStatus({ ready, s }: { ready: boolean; s: Strings }) {
  if (OFFLINE_DISABLED) return <p className="text-sm text-muted">Dev · offline off</p>;
  return (
    <p className="flex items-center gap-2 text-sm text-muted">
      {ready ? <span aria-hidden="true" className="size-2.5 rounded-full bg-ok" /> : <Spinner />}
      {ready ? s.offlineReadyStatus : s.preparingOffline}
    </p>
  );
}

export function DownloadCard({ progress, s }: { progress: PrecacheProgress | null; s: Strings }) {
  // Only shown if downloading takes noticeable time, so fast connections see no flash.
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 600);
    return () => clearTimeout(timer);
  }, []);
  if (!visible) return null;

  const fraction = progress && progress.total > 0 ? progress.done / progress.total : null;
  return (
    <section role="status" aria-live="polite" className="mt-4 rounded-card bg-surface px-[20px] py-4">
      <p className="flex items-center gap-[10px] font-semibold">
        <Spinner />
        {s.downloadingTitle}
      </p>
      <p className="mt-1 text-sm text-muted">{s.downloadingBody}</p>
      <div
        className="mt-3 h-2 overflow-hidden rounded-full bg-background"
        role="progressbar"
        aria-label={s.downloadingTitle}
        aria-valuemin={0}
        aria-valuemax={progress?.total ?? 0}
        aria-valuenow={progress?.done ?? 0}
        aria-valuetext={progress ? s.downloadProgress(progress.done, progress.total) : undefined}
      >
        <div className={`h-full rounded-full bg-text ${fraction === null ? 'w-1/4 animate-pulse' : ''}`} style={fraction === null ? undefined : { width: `${Math.round(fraction * 100)}%` }} />
      </div>
      {progress ? <p className="mt-2 text-sm text-muted">{s.downloadProgress(progress.done, progress.total)}</p> : null}
    </section>
  );
}

export function Spinner() {
  return <span aria-hidden="true" className="inline-block size-3.5 shrink-0 animate-spin rounded-full border-2 border-muted border-t-transparent motion-reduce:animate-none" />;
}
