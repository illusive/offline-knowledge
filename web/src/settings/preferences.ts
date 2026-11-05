// Settings (D-044): language and appearance either follow the phone or are fixed by the user.
// Stored on the device only (localStorage), like bookmarks. Text size always follows the phone.

import { useEffect, useState, useSyncExternalStore } from 'react';

export type LangPref = 'system' | 'da' | 'en';
export type ThemePref = 'system' | 'light' | 'dark';

export interface Preferences {
  lang: LangPref;
  theme: ThemePref;
}

const KEY = 'stead.preferences.v1';
const CHANGED = 'stead-preferences-changed';
const DEFAULTS: Preferences = { lang: 'system', theme: 'system' };

function read(): Preferences {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(KEY) ?? '{}');
    const p = (parsed ?? {}) as Partial<Record<keyof Preferences, unknown>>;
    return {
      lang: p.lang === 'da' || p.lang === 'en' ? p.lang : DEFAULTS.lang,
      theme: p.theme === 'light' || p.theme === 'dark' ? p.theme : DEFAULTS.theme,
    };
  } catch {
    return DEFAULTS;
  }
}

let cache: Preferences | null = null;
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

export function usePreferences(): Preferences {
  return useSyncExternalStore(subscribe, snapshot);
}

export function setPreference<K extends keyof Preferences>(key: K, value: Preferences[K]) {
  const next = { ...snapshot(), [key]: value };
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Storage blocked (private mode): the choice lasts until the app closes.
  }
  cache = next;
  window.dispatchEvent(new Event(CHANGED));
}

const DARK_QUERY = '(prefers-color-scheme: dark)';

function useSystemDark(): boolean {
  const [dark, setDark] = useState(() => matchMedia(DARK_QUERY).matches);
  useEffect(() => {
    const list = matchMedia(DARK_QUERY);
    const update = () => setDark(list.matches);
    list.addEventListener('change', update);
    return () => list.removeEventListener('change', update);
  }, []);
  return dark;
}

// The appearance in use: the user's choice, or the phone's when it follows the phone.
export function useDarkMode(): boolean {
  const { theme } = usePreferences();
  const systemDark = useSystemDark();
  return theme === 'system' ? systemDark : theme === 'dark';
}

// Applies the appearance to the page: the tokens in index.css switch on data-theme, and the
// status bar colour follows. index.html sets the same before the first paint, so there is no flash.
export function useApplyTheme() {
  const dark = useDarkMode();
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    for (const meta of document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')) {
      meta.content = dark ? '#0f0f0e' : '#f3f3ef';
    }
  }, [dark]);
}
