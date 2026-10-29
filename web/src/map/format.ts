// Pure formatting for the map screens (kept apart so tests need no browser).

import type { Lang } from '../i18n/strings';

// Map version (the Protomaps build date, e.g. '20261024') as a date people read.
export function formatMapDate(version: string, lang: Lang): string {
  const m = /^(\d{4})(\d{2})(\d{2})/.exec(version);
  if (!m) return version;
  return new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]))).toLocaleDateString(lang === 'da' ? 'da-DK' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}
