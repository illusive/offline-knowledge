// Kort (D-036): the offline map, full screen under the floating tab bar.

import { lazy, Suspense, useEffect, useState } from 'react';
import { MessageState, Page } from '../components/ui';
import type { Lang, Strings } from '../i18n/strings';

const MapView = lazy(() => import('../map/MapView'));

function useDarkMode(): boolean {
  const query = '(prefers-color-scheme: dark)';
  const [dark, setDark] = useState(() => matchMedia(query).matches);
  useEffect(() => {
    const list = matchMedia(query);
    const update = () => setDark(list.matches);
    list.addEventListener('change', update);
    return () => list.removeEventListener('change', update);
  }, []);
  return dark;
}

export function MapScreen({ lang, s }: { lang: Lang; s: Strings }) {
  const dark = useDarkMode();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    document.title = `${s.mapTitle} – ${s.appTitle}`;
  }, [s]);

  if (failed) {
    return (
      <Page>
        <h1 className="mt-2 px-1 text-3xl font-normal tracking-tight">{s.mapTitle}</h1>
        <MessageState title={s.mapErrorTitle} body={s.mapErrorBody} />
      </Page>
    );
  }

  return (
    <main className="fixed inset-0 bg-background">
      <h1 className="sr-only">{s.mapTitle}</h1>
      <Suspense fallback={<MessageState title={s.mapLoading} />}>
        <MapView lang={lang} dark={dark} label={s.mapLabel} onError={() => setFailed(true)} />
      </Suspense>
    </main>
  );
}
