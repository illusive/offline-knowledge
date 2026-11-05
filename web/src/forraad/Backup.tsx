// A copy of what the user has saved in the app (D-046), as a file they keep themselves: Forråd,
// bookmarks, ticks and choices (every localStorage key starting with "stead."). On iPhone the share
// sheet offers "Gem i Filer"; elsewhere the file is downloaded. Restoring checks the file, says what
// it holds and asks before replacing anything. Nothing leaves the device unless the user sends it.

import { useRef, useState } from 'react';
import { Card } from '../components/ui';
import type { Lang, Strings } from '../i18n/strings';
import { today } from './store';
import { readBackup, makeBackup } from './backupFile';

export function Backup({ s }: { lang: Lang; s: Strings }) {
  const t = s.forraad;
  const input = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);

  const save = async () => {
    setMessage(null);
    const file = new File([JSON.stringify(makeBackup(localStorage), null, 1)], `stead-kopi-${today()}.json`, { type: 'application/json' });
    try {
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file] });
        return;
      }
    } catch (error) {
      if ((error as Error).name === 'AbortError') return; // the user closed the share sheet
    }
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  };

  const restore = async (file: File | undefined) => {
    if (!file) return;
    setMessage(null);
    const backup = readBackup(await file.text());
    if (!backup) {
      setMessage(t.restoreFailed);
      return;
    }
    if (!window.confirm(t.restoreConfirm(backup.itemCount))) return;
    try {
      for (const key of Object.keys(localStorage).filter((k) => k.startsWith('stead.'))) localStorage.removeItem(key);
      for (const [key, value] of Object.entries(backup.data)) localStorage.setItem(key, value);
    } catch {
      setMessage(t.restoreFailed);
      return;
    }
    // Every store reads its key again on a fresh start.
    sessionStorage.setItem('stead.restored', '1');
    location.reload();
  };

  const [restored] = useState(() => {
    try {
      const done = sessionStorage.getItem('stead.restored') === '1';
      sessionStorage.removeItem('stead.restored');
      return done;
    } catch {
      return false;
    }
  });

  return (
    <Card aria-labelledby="forraad-backup">
      <h2 id="forraad-backup" className="text-xl font-semibold">
        {t.backup}
      </h2>
      <p className="mt-1 text-muted">{t.backupBody}</p>
      <div className="mt-4 flex flex-wrap gap-[8px]">
        <button type="button" onClick={() => void save()} className="min-h-11 rounded-full bg-ink px-[18px] font-medium text-on-ink">
          {t.saveCopy}
        </button>
        <button type="button" onClick={() => input.current?.click()} className="min-h-11 rounded-full bg-background px-[18px] font-medium">
          {t.restoreCopy}
        </button>
        <input
          ref={input}
          type="file"
          accept="application/json,.json"
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(e) => {
            void restore(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
      </div>
      {message ?? (restored ? t.restoreDone : null) ? (
        <p className="mt-3 font-medium" role="status">
          {message ?? t.restoreDone}
        </p>
      ) : null}
    </Card>
  );
}
