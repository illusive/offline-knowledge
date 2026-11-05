// Bookmarks (D-026): the first user data the app keeps. Stored on the device only (localStorage,
// separate from the knowledge pack), keyed by stable content ids so they survive pack updates.
// A bookmark whose item is gone from a newer pack is shown as unavailable, not dropped.

import { useCallback } from 'react';
import { createLocalStore } from '../lib/localStore';
import type { SavedSection } from '../router';

export type BookmarkKind = 'guide' | 'food';

export interface Bookmark {
  kind: BookmarkKind;
  id: string;
  section: SavedSection; // the group it is listed under, kept even if the item leaves the pack
  savedAt: string; // ISO date
}

const store = createLocalStore<Bookmark[]>({
  key: 'stead.bookmarks.v1',
  parse: (stored) =>
    Array.isArray(stored) ? stored.filter((b): b is Bookmark => typeof b?.id === 'string' && (b.kind === 'guide' || b.kind === 'food') && typeof b.section === 'string') : [],
});

export function useBookmarks() {
  const list = store.use();
  const has = useCallback((kind: BookmarkKind, id: string) => list.some((b) => b.kind === kind && b.id === id), [list]);
  const toggle = useCallback((kind: BookmarkKind, id: string, section: SavedSection) => {
    store.update((current) =>
      current.some((b) => b.kind === kind && b.id === id) ? current.filter((b) => !(b.kind === kind && b.id === id)) : [...current, { kind, id, section, savedAt: new Date().toISOString() }],
    );
  }, []);
  return { list, has, toggle };
}
