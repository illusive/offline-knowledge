// Ticks in the stock lists of "Når det sker" (D-040): which items the user has at home. Stored on
// the device only (localStorage), keyed by the item's stable id, so they survive pack updates; an
// id no longer in the pack is simply not shown.

import { useCallback, useSyncExternalStore } from 'react';

const KEY = 'stead.supplies.v1';
const CHANGED = 'stead-supplies-changed';

function read(): string[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

let cache: string[] | null = null;
const snapshot = () => (cache ??= read());

function subscribe(onChange: () => void) {
  const update = () => {
    cache = read();
    onChange();
  };
  window.addEventListener(CHANGED, onChange);
  window.addEventListener('storage', update);
  return () => {
    window.removeEventListener(CHANGED, onChange);
    window.removeEventListener('storage', update);
  };
}

export function useChecklist() {
  const ticked = useSyncExternalStore(subscribe, snapshot);
  const toggle = useCallback((id: string) => {
    const current = snapshot();
    const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      // private mode: kept until the app closes
    }
    cache = next;
    window.dispatchEvent(new Event(CHANGED));
  }, []);
  const has = useCallback((id: string) => ticked.includes(id), [ticked]);
  return { ticked, has, toggle };
}
