import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { TabBar } from './components/TabBar';
import { Spinner } from './components/OfflineStatus';
import { MessageState, Page } from './components/ui';
import type { PackInfo } from './db/protocol';
import type { Strings } from './i18n/strings';
import { createDbClient, openPack } from './db/client';
import { useStrings } from './i18n/lang';
import { UpdateBanner } from './pwa/UpdateBanner';
import { UpdatesProvider } from './pwa/updates';
import { ScrollToTop } from './components/ScrollToTop';
import { useOfflineReady } from './pwa/useOfflineReady';
import { useApplyTheme } from './settings/preferences';
import { usePrecacheProgress } from './pwa/usePrecacheProgress';
import { tabOf, useRoute, type Tab } from './router';
import { ForraadScreen } from './forraad/ForraadScreen';
import { ItemEditor } from './forraad/ItemEditor';
import { ScanScreen } from './forraad/ScanScreen';
import { useStockLists } from './forraad/recommendations';
import { FirstAidScreen } from './screens/FirstAidScreen';
import { useGuides } from './guides/useGuides';
import { FoodScreen } from './screens/FoodScreen';
import { GrowingScreen } from './screens/GrowingScreen';
import { GuideScreen } from './screens/GuideScreen';
import { SavedScreen } from './screens/SavedScreen';
import { PrepareScreen } from './screens/PrepareScreen';
import { HomeScreen } from './screens/HomeScreen';
import { ErrorBoundary } from './components/ErrorBoundary';
import { MapScreen } from './screens/MapScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { CompassScreen } from './screens/CompassScreen';
import { SunScreen } from './screens/SunScreen';
import { PowerClockScreen } from './screens/PowerClockScreen';
import { BoilTimerScreen } from './screens/BoilTimerScreen';
import { CprMetronomeScreen } from './screens/CprMetronomeScreen';
import { ConvertScreen } from './screens/ConvertScreen';
import { ToolsScreen } from './screens/ToolsScreen';
import { StorageScreen } from './screens/StorageScreen';
import { SourcesScreen } from './screens/SourcesScreen';
import { useAllFoods } from './food/useFoodSearch';

type SearchPage = 'home' | 'storage' | 'firstAid' | 'growing' | 'prepare' | 'forraad';

// Every route has a page: the compiler stops a new route that is not handled here.
function unreachable(route: never): never {
  throw new Error(`No page for route ${JSON.stringify(route)}`);
}

const db = createDbClient();
const packReady = openPack(db);

export function App() {
  const { lang, s } = useStrings();
  const route = useRoute();
  useApplyTheme();
  const [pack, setPack] = useState<PackInfo | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  // What was typed in each page's search, kept while moving around the app.
  const [queries, setQueries] = useState<Record<SearchPage, string>>({ home: '', storage: '', firstAid: '', growing: '', prepare: '', forraad: '' });
  const search = (page: SearchPage) => ({ query: queries[page], onQueryChange: (q: string) => setQueries((all) => ({ ...all, [page]: q })) });
  const offlineReady = useOfflineReady(status === 'ready');
  // Settings is not a tab (D-046): the tab bar keeps the tab it was opened from.
  const lastTab = useRef<Tab>('home');
  const activeTab = tabOf(route) ?? lastTab.current;
  lastTab.current = activeTab;
  const precache = usePrecacheProgress();

  useEffect(() => {
    packReady.then(
      (opened) => {
        setPack(opened.pack);
        setStatus('ready');
      },
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
  const crops = useGuides(status === 'ready' ? db : null, 'growing');
  const prepare = useGuides(status === 'ready' ? db : null, 'preparedness');
  // Loads the stock lists once; also turns ticks kept before D-048 into Forråd entries.
  useStockLists(status === 'ready' ? db : null);

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

  let content: ReactNode;
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
  else {
    switch (route.name) {
      case 'home':
        content = <HomeScreen db={db} foods={foods} lang={lang} s={s} offlineReady={offlineReady} precache={precache} guides={guides} crops={crops} prepare={prepare} {...search('home')} />;
        break;
      case 'firstAid':
        content = <FirstAidScreen db={db} guides={guides} s={s} {...search('firstAid')} />;
        break;
      case 'prepare':
        content = <PrepareScreen db={db} guides={prepare} s={s} {...search('prepare')} />;
        break;
      case 'storage':
        content = <StorageScreen db={db} foods={foods} lang={lang} s={s} {...search('storage')} />;
        break;
      case 'growing':
        content = <GrowingScreen db={db} guides={crops} s={s} {...search('growing')} />;
        break;
      case 'guide':
        content = <GuideScreen db={db} id={route.id} s={s} />;
        break;
      case 'food':
        content = <FoodScreen db={db} id={route.id} tab={route.tab} lang={lang} s={s} />;
        break;
      case 'saved':
        content = <SavedScreen section={route.section} guides={guides} crops={crops} prepare={prepare} foods={foods} lang={lang} s={s} />;
        break;
      case 'forraad':
      case 'forraadNew':
        // Adding by typing is a sheet over the Forråd page (D-054); its address keeps the back button
        // and the category's + working.
        content = <ForraadScreen db={db} adding={route.name === 'forraadNew' ? route : null} lang={lang} s={s} {...search('forraad')} />;
        break;
      case 'forraadScan':
        content = <ScanScreen db={db} lang={lang} s={s} />;
        break;
      case 'forraadEdit':
        content = <ItemEditor key={route.id} db={db} route={route} lang={lang} s={s} />;
        break;
      case 'tools':
        content = <ToolsScreen s={s} />;
        break;
      case 'compass':
        content = <CompassScreen lang={lang} s={s} />;
        break;
      case 'sun':
        content = <SunScreen lang={lang} s={s} />;
        break;
      case 'powerClock':
        content = <PowerClockScreen lang={lang} s={s} />;
        break;
      case 'boil':
        content = <BoilTimerScreen s={s} />;
        break;
      case 'cpr':
        content = <CprMetronomeScreen s={s} />;
        break;
      case 'convert':
        content = <ConvertScreen lang={lang} s={s} />;
        break;
      case 'settings':
        content = <SettingsScreen pack={pack} lang={lang} s={s} offlineReady={offlineReady} />;
        break;
      case 'settingsSources':
        content = <SourcesScreen db={db} s={s} />;
        break;
      default:
        content = unreachable(route);
    }
  }

  return (
    <UpdatesProvider>
      {content}
      {/* Long pages (D-069): guides and foods. Keyed by address, so it starts hidden on each page. */}
      {route.name === 'guide' || route.name === 'food' ? <ScrollToTop key={location.hash} label={s.scrollToTop} /> : null}
      <UpdateBanner s={s} ready={offlineReady} />
      <TabBar active={activeTab} s={s} />
    </UpdatesProvider>
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
