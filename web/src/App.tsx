import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { MessageState } from './components/ui';
import { createDbClient, openPack } from './db/client';
import { useStrings } from './i18n/lang';
import { UpdateBanner } from './pwa/UpdateBanner';
import { useRoute } from './router';
import { FoodScreen } from './screens/FoodScreen';
import { SearchScreen } from './screens/SearchScreen';

const db = createDbClient();
const packReady = openPack(db);

export function App() {
  const { lang, s } = useStrings();
  const route = useRoute();
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [query, setQuery] = useState('');
  const searchScroll = useRef(0);

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

  // Keep the search list's scroll position when going to a food and back.
  const previous = useRef(route.name);
  useLayoutEffect(() => {
    if (previous.current === 'search' && route.name === 'food') window.scrollTo(0, 0);
    if (previous.current === 'food' && route.name === 'search') window.scrollTo(0, searchScroll.current);
    previous.current = route.name;
  }, [route]);
  useEffect(() => {
    if (route.name !== 'search') return;
    document.title = `${s.storageTitle} – ${s.appTitle}`;
    const save = () => (searchScroll.current = window.scrollY);
    window.addEventListener('scroll', save, { passive: true });
    return () => window.removeEventListener('scroll', save);
  }, [route.name, s]);

  let content;
  if (status === 'error') content = <MessageState title={s.packErrorTitle} body={s.packErrorBody} />;
  else if (status === 'loading') content = <MessageState title={s.loading} />;
  else if (route.name === 'food') content = <FoodScreen db={db} id={route.id} lang={lang} s={s} />;
  else content = <SearchScreen db={db} lang={lang} s={s} query={query} onQueryChange={setQuery} />;

  return (
    <>
      {content}
      <UpdateBanner s={s} />
    </>
  );
}
