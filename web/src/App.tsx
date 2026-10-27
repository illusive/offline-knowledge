import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { TabBar } from './components/TabBar';
import { Spinner } from './components/OfflineStatus';
import { MessageState, Page } from './components/ui';
import type { Strings } from './i18n/strings';
import { createDbClient, openPack } from './db/client';
import { useStrings } from './i18n/lang';
import { UpdateBanner } from './pwa/UpdateBanner';
import { useOfflineReady } from './pwa/useOfflineReady';
import { usePrecacheProgress } from './pwa/usePrecacheProgress';
import { tabOf, useRoute } from './router';
import { FirstAidScreen, useGuides } from './screens/FirstAidScreen';
import { FoodScreen } from './screens/FoodScreen';
import { GuideScreen } from './screens/GuideScreen';
import { HomeScreen } from './screens/HomeScreen';
import { ErrorBoundary } from './components/ErrorBoundary';
import { MapScreen } from './screens/MapScreen';
import { PlaceholderScreen } from './screens/PlaceholderScreen';
import { StorageScreen } from './screens/StorageScreen';
import { useAllFoods } from './storage/useFoodSearch';

const db = createDbClient();
const packReady = openPack(db);

export function App() {
  const { lang, s } = useStrings();
  const route = useRoute();
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [homeQuery, setHomeQuery] = useState('');
  const [storageQuery, setStorageQuery] = useState('');
  const [firstAidQuery, setFirstAidQuery] = useState('');
  const offlineReady = useOfflineReady(status === 'ready');
  const precache = usePrecacheProgress();

  useEffect(() => {
    packReady.then(
      () => setStatus('ready'),
      (error: unknown) => {
        console.error('Could not open the knowledge pack', error);
        setStatus('error');
      },
    );
    // Ask the browser to protect our storage from automatic deletion (granted for Home Screen apps on iOS).
    void navigator.storage?.persist?.();
  }, []);

  const foods = useAllFoods(status === 'ready' ? db : null);
  const guides = useGuides(status === 'ready' ? db : null);

  // Remember each page's scroll position: going back restores it, new pages start at the top.
  const scrollPositions = useRef(new Map<string, number>());
  const currentHash = useRef(location.hash);
  useEffect(() => {
    const save = () => scrollPositions.current.set(currentHash.current, window.scrollY);
    window.addEventListener('scroll', save, { passive: true });
    return () => window.removeEventListener('scroll', save);
  }, []);
  useLayoutEffect(() => {
    currentHash.current = location.hash;
    window.scrollTo(0, scrollPositions.current.get(location.hash) ?? 0);
  }, [route]);

  useEffect(() => {
    if (route.name === 'home') document.title = s.appTitle;
  }, [route.name, s]);

  let content;
  // The map does not use the knowledge pack (D-036): it opens even while the pack loads or fails.
  if (route.name === 'map')
    content = (
      <ErrorBoundary
        fallback={
          <Page>
            <MessageState title={s.mapErrorTitle} body={s.mapCrashBody} />
          </Page>
        }
      >
        <MapScreen lang={lang} s={s} />
      </ErrorBoundary>
    );
  else if (status === 'error') content = <Page><MessageState title={s.packErrorTitle} body={s.packErrorBody} /></Page>;
  else if (status === 'loading') content = <Page><LoadingState s={s} /></Page>;
  else if (route.name === 'food') content = <FoodScreen db={db} id={route.id} tab={route.tab} lang={lang} s={s} />;
  else if (route.name === 'firstAid') content = <FirstAidScreen db={db} guides={guides} s={s} query={firstAidQuery} onQueryChange={setFirstAidQuery} />;
  else if (route.name === 'guide') content = <GuideScreen db={db} id={route.id} s={s} />;
  else if (route.name === 'storage') content = <StorageScreen db={db} foods={foods} lang={lang} s={s} query={storageQuery} onQueryChange={setStorageQuery} />;
  else if (route.name === 'tools') content = <PlaceholderScreen title={s.toolsTitle} s={s} />;
  else if (route.name === 'settings') content = <PlaceholderScreen title={s.settingsTitle} s={s} />;
  else content = <HomeScreen db={db} foods={foods} lang={lang} s={s} offlineReady={offlineReady} precache={precache} guides={guides} query={homeQuery} onQueryChange={setHomeQuery} />;

  return (
    <>
      {content}
      <UpdateBanner s={s} />
      <TabBar active={tabOf(route)} s={s} />
    </>
  );
}

// First launch: the pack is being fetched and imported; later launches open it in a moment.
function LoadingState({ s }: { s: Strings }) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-16 text-center" role="status">
      <span className="scale-150">
        <Spinner />
      </span>
      <p className="font-semibold">{s.openingPack}</p>
      <p className="text-sm text-muted">{s.firstLaunchNote}</p>
    </div>
  );
}
