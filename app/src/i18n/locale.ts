import { useLocales } from 'expo-localization';
import { strings, type Lang, type Strings } from './strings';

// Follows the device language: Danish if the first preferred language is Danish, otherwise English.
// A manual override is an open product question (docs/OPEN_QUESTIONS.md #8).
export function useStrings(): { lang: Lang; s: Strings } {
  const [first] = useLocales();
  const lang: Lang = first.languageCode === 'da' ? 'da' : 'en';
  return { lang, s: strings[lang] };
}
