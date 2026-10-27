// Bookmarks (D-026): the first user data the app keeps. Stored on the device only (localStorage,
// separate from the knowledge pack), keyed by stable content ids so they survive pack updates.
// A bookmark whose item is gone from a newer pack is shown as unavailable, not dropped.

import { useCallback, useSyncExternalStore } from 'react';
import type { SavedSection } from '../router';

export type BookmarkKind = 'guide' | 'food';

export interface Bookmark {
  kind: BookmarkKind;
  id: string;
  section: SavedSection; // the group it is listed under, kept even if the item leaves the pack
  savedAt: string; // ISO date
}

const KEY = 'stead.bookmarks.v1';
const CHANGED = 'stead-bookmarks-changed';

function read(): Bookmark[] {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((b): b is Bookmark => typeof b?.id === 'string' && (b.kind === 'guide' || b.kind === 'food') && typeof b.section === 'string') : [];
  } catch {
    return [];
  }
}

function write(list: Bookmark[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // Storage blocked (private mode): the change lasts until the app closes.
  }
  cache = list;
  window.dispatchEvent(new Event(CHANGED));
}

let cache: Bookmark[] | null = null;
const snapshot = () => (cache ??= read());

function subscribe(onChange: () => void) {
  const update = () => {
    cache = read();
    onChange();
  };
  window.addEventListener(CHANGED, onChange);
  window.addEventListener('storage', update); // another tab or window
  return () => {
    window.removeEventListener(CHANGED, onChange);
    window.removeEventListener('storage', update);
  };
}

export function useBookmarks() {
  const list = useSyncExternalStore(subscribe, snapshot);
  const has = useCallback((kind: BookmarkKind, id: string) => list.some((b) => b.kind === kind && b.id === id), [list]);
  const toggle = useCallback((kind: BookmarkKind, id: string, section: SavedSection) => {
    const current = snapshot();
    const exists = current.some((b) => b.kind === kind && b.id === id);
    write(exists ? current.filter((b) => !(b.kind === kind && b.id === id)) : [...current, { kind, id, section, savedAt: new Date().toISOString() }]);
  }, []);
  return { list, has, toggle };
}
