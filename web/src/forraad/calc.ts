// Forråd (D-046) arithmetic, kept pure for tests: the water target, months to the next check and
// to expiry, and the unit shown.

import type { Category, Household, StoreItem } from './store';

// The stock lists' own grouping: water is its own list, shown only in the water card.
export type ListCategory = Category | 'water';

// One line of the stock lists in "Når det sker" (D-040), with the structured amount the content
// gives (pack schema 13).
export interface Amount {
  value: number;
  unit: 'g' | 'L';
  per: 'personDay' | 'person3Days';
}

export interface Recommendation {
  id: string;
  guideId: string;
  category: ListCategory;
  name: string;
  text: string;
  amount?: Amount;
  keywords: string[];
  products: string[]; // common goods that count as the line, offered while typing (D-052)
}

// The stock lists, one per category of the stores.
export const GUIDE_CATEGORY: Record<string, ListCategory> = {
  'vand-til-tre-doegn': 'water',
  'mad-til-tre-doegn': 'food',
  'medicin-og-hygiejne': 'medicine',
  'andet-hav-derhjemme': 'other',
};

// The water card covers these: they are not listed under "Overvej også".
export const WATER_PER_PERSON_ID = 'vand-3-liter';

// "Set a reminder every six months to check expiry dates" (uk-be-ready-checklist).
export const CHECK_EVERY_MONTHS = 6;

// The guide on dates (D-054): "bedst før" is often fine after the date; look, smell, taste. Linked
// from the things that expire soon.
export const DATES_GUIDE_ID = 'naar-datoen-er-overskredet';

// Things with a best-before month this many months ahead (or earlier) are shown at the top.
export const EXPIRING_WITHIN_MONTHS = 1;

// Litres for the household for the chosen number of days, or null without the stock list's figure.
export function waterNeeded(household: Household, litresPerPersonDay: number | null): number | null {
  if (litresPerPersonDay === null) return null;
  return (household.people * litresPerPersonDay + household.petLitresPerDay) * household.targetDays;
}

// Months from one yyyy-mm to another (negative when it is earlier).
export function monthsUntil(month: string, fromMonth: string): number {
  const [y1, m1] = month.split('-').map(Number);
  const [y0, m0] = fromMonth.split('-').map(Number);
  return (y1! - y0!) * 12 + (m1! - m0!);
}

export function addMonths(month: string, months: number): string {
  const [y, m] = month.split('-').map(Number);
  const index = y! * 12 + (m! - 1) + months;
  return `${Math.floor(index / 12)}-${String((index % 12) + 1).padStart(2, '0')}`;
}

// The month the water should be checked next, and whether that month has come.
export function nextCheck(lastChecked: string | null, currentMonth: string): { month: string; due: boolean } | null {
  if (!lastChecked) return null;
  const month = addMonths(lastChecked, CHECK_EVERY_MONTHS);
  return { month, due: monthsUntil(month, currentMonth) <= 0 };
}

// Expired (before this month) and soon-expiring things (this month or the next), soonest first.
export function expiring(items: StoreItem[], currentMonth: string, withinMonths = EXPIRING_WITHIN_MONTHS): { expired: StoreItem[]; soon: StoreItem[] } {
  const dated = items.filter((i): i is StoreItem & { expires: string } => i.expires !== undefined).sort((a, b) => a.expires.localeCompare(b.expires));
  return {
    expired: dated.filter((i) => monthsUntil(i.expires, currentMonth) < 0),
    soon: dated.filter((i) => {
      const m = monthsUntil(i.expires, currentMonth);
      return m >= 0 && m <= withinMonths;
    }),
  };
}
