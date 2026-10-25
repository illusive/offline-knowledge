import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { TabBar } from './components/TabBar';
import { MessageState, Page } from './components/ui';
import { createDbClient, openPack } from './db/client';
import { useStrings } from './i18n/lang';
import { UpdateBanner } from './pwa/UpdateBanner';
import { useOfflineReady } from './pwa/useOfflineReady';
import { tabOf, useRoute } from './router';
import { FoodScreen } from './screens/FoodScreen';
import { HomeScreen } from './screens/HomeScreen';
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
  const offlineReady = useOfflineReady(status === 'ready');

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
  if (status === 'error') content = <Page><MessageState title={s.packErrorTitle} body={s.packErrorBody} /></Page>;
  else if (status === 'loading') content = <Page><MessageState title={s.loading} /></Page>;
  else if (route.name === 'food') content = <FoodScreen db={db} id={route.id} lang={lang} s={s} />;
  else if (route.name === 'storage') content = <StorageScreen db={db} foods={foods} lang={lang} s={s} query={storageQuery} onQueryChange={setStorageQuery} />;
  else if (route.name === 'tools') content = <PlaceholderScreen title={s.toolsTitle} s={s} />;
  else if (route.name === 'settings') content = <PlaceholderScreen title={s.settingsTitle} s={s} />;
  else content = <HomeScreen db={db} foods={foods} lang={lang} s={s} offlineReady={offlineReady} query={homeQuery} onQueryChange={setHomeQuery} />;

  return (
    <>
      {content}
      <UpdateBanner s={s} />
      <TabBar active={tabOf(route)} s={s} />
    </>
  );
}
