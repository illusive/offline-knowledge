// Hash-based routes (D-023): work offline and on any static host without server rewrites.
import { useEffect, useState } from 'react';

export type Route =
  | { name: 'home' }
  | { name: 'storage' }
  | { name: 'food'; id: string; tab: FoodTab }
  | { name: 'firstAid' }
  | { name: 'growing' }
  | { name: 'prepare' }
  | { name: 'guide'; id: string }
  | { name: 'saved'; section: SavedSection | null }
  | { name: 'map' }
  | { name: 'tools' }
  | { name: 'compass' }
  | { name: 'sun' }
  | { name: 'powerClock' }
  | { name: 'boil' }
  | { name: 'cpr' }
  | { name: 'convert' }
  | { name: 'forraad' }
  | { name: 'forraadScan' }
  | { name: 'forraadNew'; category: string | null; recommendationId: string | null }
  | { name: 'forraadEdit'; id: string }
  | { name: 'settings' }
  | { name: 'settingsSources' };

// Settings is not a tab (D-046): it opens from the gear at the top right.
export type Tab = 'home' | 'map' | 'forraad' | 'tools';

// Sections of the saved list (D-026), one per category with something to save, in the app's
// category order (D-048): first aid, Når det sker, food, growing last.
export const SAVED_SECTIONS = ['first-aid', 'prepare', 'storage', 'growing'] as const;
export type SavedSection = (typeof SAVED_SECTIONS)[number];

// Sub-pages of a food (D-034). The default (no suffix) is 'storage'.
export const FOOD_TABS = ['about', 'storage', 'preserving', 'sources'] as const;
export type FoodTab = (typeof FOOD_TABS)[number];
const DEFAULT_FOOD_TAB: FoodTab = 'storage';

export function parseRoute(hash: string): Route {
  const food = /^#\/food\/([^/]+)(?:\/([a-z]+))?$/.exec(hash);
  if (food?.[1]) {
    const tab = FOOD_TABS.find((t) => t === food[2]) ?? DEFAULT_FOOD_TAB;
    return { name: 'food', id: decodeURIComponent(food[1]), tab };
  }
  const guide = /^#\/guide\/([^/]+)$/.exec(hash);
  if (guide?.[1]) return { name: 'guide', id: decodeURIComponent(guide[1]) };
  const saved = /^#\/saved(?:\/([a-z-]+))?$/.exec(hash);
  if (saved) return { name: 'saved', section: SAVED_SECTIONS.find((x) => x === saved[1]) ?? null };
  if (hash === '#/first-aid') return { name: 'firstAid' };
  if (hash === '#/growing') return { name: 'growing' };
  if (hash === '#/prepare') return { name: 'prepare' };
  if (hash === '#/storage') return { name: 'storage' };
  if (hash === '#/map') return { name: 'map' };
  if (hash === '#/tools') return { name: 'tools' };
  if (hash === '#/tools/compass') return { name: 'compass' };
  if (hash === '#/tools/sun') return { name: 'sun' };
  if (hash === '#/tools/power') return { name: 'powerClock' };
  if (hash === '#/tools/boil') return { name: 'boil' };
  if (hash === '#/tools/cpr') return { name: 'cpr' };
  if (hash === '#/tools/convert') return { name: 'convert' };
  if (hash === '#/forraad') return { name: 'forraad' };
  // Adding to Forråd (D-053): scanning, or typing (optionally in a category or for a stock-list
  // line); and editing an existing item (D-046).
  if (hash === '#/forraad/scan') return { name: 'forraadScan' };
  const forraadNew = /^#\/forraad\/new(?:\/([a-z]+)(?:\/([a-z0-9-]+))?)?$/.exec(hash);
  if (forraadNew) return { name: 'forraadNew', category: forraadNew[1] ?? null, recommendationId: forraadNew[2] ?? null };
  const forraadItem = /^#\/forraad\/item\/([^/]+)$/.exec(hash);
  if (forraadItem?.[1]) return { name: 'forraadEdit', id: decodeURIComponent(forraadItem[1]) };
  if (hash === '#/settings') return { name: 'settings' };
  if (hash === '#/settings/sources') return { name: 'settingsSources' };
  return { name: 'home' };
}

export const hrefs = {
  home: '#/',
  storage: '#/storage',
  firstAid: '#/first-aid',
  growing: '#/growing',
  prepare: '#/prepare',
  guide: (id: string) => `#/guide/${encodeURIComponent(id)}`,
  saved: (section?: SavedSection) => (section ? `#/saved/${section}` : '#/saved'),
  map: '#/map',
  forraad: '#/forraad',
  forraadScan: '#/forraad/scan',
  forraadNew: (category?: string, recommendationId?: string) =>
    `#/forraad/new${category ? `/${category}${recommendationId ? `/${recommendationId}` : ''}` : ''}`,
  forraadItem: (id: string) => `#/forraad/item/${encodeURIComponent(id)}`,
  tools: '#/tools',
  compass: '#/tools/compass',
  sun: '#/tools/sun',
  powerClock: '#/tools/power',
  boil: '#/tools/boil',
  cpr: '#/tools/cpr',
  convert: '#/tools/convert',
  settings: '#/settings',
  settingsSources: '#/settings/sources',
  food: (id: string, tab: FoodTab = DEFAULT_FOOD_TAB) =>
    `#/food/${encodeURIComponent(id)}${tab === DEFAULT_FOOD_TAB ? '' : `/${tab}`}`,
};

// Which tab a route belongs to (content pages sit under Home). Settings belongs to none: the tab
// bar keeps showing the tab it was opened from.
export function tabOf(route: Route): Tab | null {
  if (route.name === 'settings' || route.name === 'settingsSources') return null;
  if (route.name === 'compass' || route.name === 'sun' || route.name === 'powerClock' || route.name === 'boil' || route.name === 'cpr' || route.name === 'convert') return 'tools';
  if (route.name === 'forraadScan' || route.name === 'forraadNew' || route.name === 'forraadEdit') return 'forraad';
  return route.name === 'map' || route.name === 'tools' || route.name === 'forraad' ? route.name : 'home';
}

// The pages visited in this session, so "back" can tell whether there is an in-app page to
// return to. If the app was opened directly on a deep link, "back" goes to the parent page
// (replacing the history entry) instead of leaving the app or looping.
const visited: string[] = [(typeof location === 'undefined' ? '' : location.hash) || hrefs.home];

// Food sub-pages replace each other in history, so "back" leaves the food, not the last tab.
const foodOf = (hash: string) => /^#\/food\/[^/]+/.exec(hash)?.[0] ?? null;

function track(hash: string) {
  const last = visited[visited.length - 1] ?? '';
  if (visited.length > 1 && visited[visited.length - 2] === hash) visited.pop();
  else if (foodOf(hash) !== null && foodOf(hash) === foodOf(last)) visited[visited.length - 1] = hash;
  else if (last !== hash) visited.push(hash);
}

// Switch between sub-pages of the same page without adding a history entry.
export function replaceRoute(href: string) {
  location.replace(href);
}

export function goBack(fallback: string) {
  if (visited.length > 1) history.back();
  else {
    visited[0] = fallback;
    location.replace(fallback);
  }
}

export function useRoute(): Route {
  const [start] = useState(() => location.hash);
  const [route, setRoute] = useState(() => parseRoute(start));
  useEffect(() => {
    const update = () => {
      track(location.hash || hrefs.home);
      setRoute(parseRoute(location.hash));
    };
    window.addEventListener('hashchange', update);
    // The address may have changed while the app was starting, before this listener existed.
    if (location.hash !== start) update();
    return () => window.removeEventListener('hashchange', update);
  }, [start]);
  return route;
}
