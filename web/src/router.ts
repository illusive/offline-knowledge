// Hash-based routes (D-023): work offline and on any static host without server rewrites.
import { useEffect, useState } from 'react';

export type Route = { name: 'search' } | { name: 'food'; id: string };

export function parseRoute(hash: string): Route {
  const match = /^#\/food\/([^/]+)$/.exec(hash);
  return match?.[1] ? { name: 'food', id: decodeURIComponent(match[1]) } : { name: 'search' };
}

export const foodHref = (id: string) => `#/food/${encodeURIComponent(id)}`;

export function useRoute(): Route {
  const [route, setRoute] = useState(() => parseRoute(location.hash));
  useEffect(() => {
    const update = () => setRoute(parseRoute(location.hash));
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, []);
  return route;
}
