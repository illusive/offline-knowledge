// Settings (D-044): language and appearance either follow the phone or are fixed by the user.
// Stored on the device only (localStorage), like bookmarks. Text size always follows the phone.

import { useEffect, useState } from 'react';
import { createLocalStore } from '../lib/localStore';

export type LangPref = 'system' | 'da' | 'en';
export type ThemePref = 'system' | 'light' | 'dark';
export type WaterUnitPref = 'litres' | 'gallons'; // Forråd (D-046)

export interface Preferences {
  lang: LangPref;
  theme: ThemePref;
  waterUnit: WaterUnitPref;
}

const DEFAULTS: Preferences = { lang: 'system', theme: 'system', waterUnit: 'litres' };

const store = createLocalStore<Preferences>({
  key: 'stead.preferences.v1',
  parse: (stored) => {
    const p = (stored ?? {}) as Partial<Record<keyof Preferences, unknown>>;
    return {
      lang: p.lang === 'da' || p.lang === 'en' ? p.lang : DEFAULTS.lang,
      theme: p.theme === 'light' || p.theme === 'dark' ? p.theme : DEFAULTS.theme,
      waterUnit: p.waterUnit === 'gallons' ? 'gallons' : DEFAULTS.waterUnit,
    };
  },
});

export const usePreferences = store.use;

export function setPreference<K extends keyof Preferences>(key: K, value: Preferences[K]) {
  store.update((current) => ({ ...current, [key]: value }));
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
