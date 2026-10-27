// Hash-based routes (D-023): work offline and on any static host without server rewrites.
import { useEffect, useState } from 'react';

export type Route =
  | { name: 'home' }
  | { name: 'storage' }
  | { name: 'food'; id: string; tab: FoodTab }
  | { name: 'firstAid' }
  | { name: 'growing' }
  | { name: 'guide'; id: string }
  | { name: 'saved'; section: SavedSection | null }
  | { name: 'map' }
  | { name: 'tools' }
  | { name: 'settings' };

export type Tab = 'home' | 'map' | 'tools' | 'settings';

// Sections of the saved list (D-026), one per category with something to save.
export const SAVED_SECTIONS = ['first-aid', 'growing', 'storage'] as const;
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
  if (hash === '#/storage') return { name: 'storage' };
  if (hash === '#/map') return { name: 'map' };
  if (hash === '#/tools') return { name: 'tools' };
  if (hash === '#/settings') return { name: 'settings' };
  return { name: 'home' };
}

export const hrefs = {
  home: '#/',
  storage: '#/storage',
  firstAid: '#/first-aid',
  growing: '#/growing',
  guide: (id: string) => `#/guide/${encodeURIComponent(id)}`,
  saved: (section?: SavedSection) => (section ? `#/saved/${section}` : '#/saved'),
  map:'#/map',
  tools: '#/tools',
  settings: '#/settings',
  food: (id: string, tab: FoodTab = DEFAULT_FOOD_TAB) =>
    `#/food/${encodeURIComponent(id)}${tab === DEFAULT_FOOD_TAB ? '' : `/${tab}`}`,
};

// Which tab a route belongs to (content pages sit under Home).
export function tabOf(route: Route): Tab {
  return route.name === 'map' || route.name === 'tools' || route.name === 'settings' ? route.name : 'home';
}

// The pages visited in this session, so "back" can tell whether there is an in-app page to
// return to. If the app was opened directly on a deep link, "back" goes to the parent page
// (replacing the history entry) instead of leaving the app or looping.
const visited: string[] = [location.hash || hrefs.home];

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
  const [route, setRoute] = useState(() => parseRoute(location.hash));
  useEffect(() => {
    const update = () => {
      track(location.hash || hrefs.home);
      setRoute(parseRoute(location.hash));
    };
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, []);
  return route;
}
