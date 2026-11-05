import { useEffect, useState } from 'react';
import { usePreferences } from '../settings/preferences';
import { strings, type Lang, type Strings } from './strings';

// The phone's language: Danish if the first preferred language is Danish, otherwise English.
// Settings can fix the language instead (D-044).
function detectLang(): Lang {
  const first = navigator.languages?.[0] ?? navigator.language ?? 'en';
  return first.toLowerCase().startsWith('da') ? 'da' : 'en';
}

export function useStrings(): { lang: Lang; s: Strings } {
  const [systemLang, setSystemLang] = useState<Lang>(detectLang);
  const { lang: chosen } = usePreferences();
  const lang = chosen === 'system' ? systemLang : chosen;
  useEffect(() => {
    const update = () => setSystemLang(detectLang());
    window.addEventListener('languagechange', update);
    return () => window.removeEventListener('languagechange', update);
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  return { lang, s: strings[lang] };
}
