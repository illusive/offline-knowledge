import { useEffect, useState } from 'react';
import { strings, type Lang, type Strings } from './strings';

// Follows the browser/device language: Danish if the first preferred language is Danish,
// otherwise English (OPEN_QUESTIONS #8: a manual override is still open).
function detectLang(): Lang {
  const first = navigator.languages?.[0] ?? navigator.language ?? 'en';
  return first.toLowerCase().startsWith('da') ? 'da' : 'en';
}

export function useStrings(): { lang: Lang; s: Strings } {
  const [lang, setLang] = useState<Lang>(detectLang);
  useEffect(() => {
    const update = () => setLang(detectLang());
    window.addEventListener('languagechange', update);
    return () => window.removeEventListener('languagechange', update);
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  return { lang, s: strings[lang] };
}
