// Hash-based routes (D-023): work offline and on any static host without server rewrites.
import { useEffect, useState } from 'react';

export type Route =
  | { name: 'home' }
  | { name: 'storage' }
  | { name: 'food'; id: string }
  | { name: 'tools' }
  | { name: 'settings' };

export type Tab = 'home' | 'tools' | 'settings';

export function parseRoute(hash: string): Route {
  const food = /^#\/food\/([^/]+)$/.exec(hash);
  if (food?.[1]) return { name: 'food', id: decodeURIComponent(food[1]) };
  if (hash === '#/storage') return { name: 'storage' };
  if (hash === '#/tools') return { name: 'tools' };
  if (hash === '#/settings') return { name: 'settings' };
  return { name: 'home' };
}

export const hrefs = {
  home: '#/',
  storage: '#/storage',
  tools: '#/tools',
  settings: '#/settings',
  food: (id: string) => `#/food/${encodeURIComponent(id)}`,
};

// Which tab a route belongs to (content pages sit under Home).
export function tabOf(route: Route): Tab {
  return route.name === 'tools' || route.name === 'settings' ? route.name : 'home';
}

// The pages visited in this session, so "back" can tell whether there is an in-app page to
// return to. If the app was opened directly on a deep link, "back" goes to the parent page
// (replacing the history entry) instead of leaving the app or looping.
const visited: string[] = [location.hash || hrefs.home];

function track(hash: string) {
  if (visited.length > 1 && visited[visited.length - 2] === hash) visited.pop();
  else if (visited[visited.length - 1] !== hash) visited.push(hash);
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
