// Forråd (D-046) arithmetic, kept pure for tests: water totals and targets, expiry, what the stock
// lists recommend that is not in the stores yet, and the unit shown.

import type { Category, Household, StoreItem } from './store';

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
  category: Category;
  name: string;
  text: string;
  amount?: Amount;
  keywords: string[];
}

// The stock lists, one per category of the stores.
export const GUIDE_CATEGORY: Record<string, Category> = {
  'vand-til-tre-doegn': 'water',
  'mad-til-tre-doegn': 'food',
  'medicin-og-hygiejne': 'medicine',
  'andet-hav-derhjemme': 'other',
};

// The water card covers these: they are not listed under "Overvej også".
export const WATER_PER_PERSON_ID = 'vand-3-liter';
const COVERED_BY_WATER_CARD = new Set([WATER_PER_PERSON_ID, 'vand-husdyr']);

// "Set a reminder every six months to check expiry dates" (uk-be-ready-checklist).
export const CHECK_EVERY_MONTHS = 6;

// Items expiring within this many days are shown at the top.
export const EXPIRING_WITHIN_DAYS = 30;

export const LITRES_PER_US_GALLON = 3.785411784;

export function waterTotal(items: StoreItem[]): number {
  return items.filter((i) => i.category === 'water').reduce((sum, i) => sum + i.count * (i.litresEach ?? 0), 0);
}

// Litres for the household for the chosen number of days, or null without the stock list's figure.
export function waterNeeded(household: Household, litresPerPersonDay: number | null): number | null {
  if (litresPerPersonDay === null) return null;
  return (household.people * litresPerPersonDay + household.petLitresPerDay) * household.targetDays;
}

// An amount for one person scaled to the household and the chosen number of days.
export function scaleAmount(amount: Amount, household: Household): number {
  const perDay = amount.per === 'personDay' ? amount.value : amount.value / 3;
  return perDay * household.people * household.targetDays;
}

function parseDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y!, m! - 1, d!);
}

export function daysUntil(iso: string, todayIso: string): number {
  return Math.round((parseDate(iso).getTime() - parseDate(todayIso).getTime()) / 86_400_000);
}

export function addMonths(iso: string, months: number): string {
  const date = parseDate(iso);
  const day = date.getDate();
  date.setDate(1);
  date.setMonth(date.getMonth() + months);
  const last = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  date.setDate(Math.min(day, last));
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// When the water should be checked next, and whether that day has passed.
export function nextCheck(lastChecked: string | null, todayIso: string): { date: string; due: boolean } | null {
  if (!lastChecked) return null;
  const date = addMonths(lastChecked, CHECK_EVERY_MONTHS);
  return { date, due: daysUntil(date, todayIso) <= 0 };
}

// Expired and soon-expiring items, soonest first.
export function expiring(items: StoreItem[], todayIso: string, withinDays = EXPIRING_WITHIN_DAYS): { expired: StoreItem[]; soon: StoreItem[] } {
  const dated = items.filter((i): i is StoreItem & { expires: string } => i.expires !== undefined).sort((a, b) => a.expires.localeCompare(b.expires));
  return {
    expired: dated.filter((i) => daysUntil(i.expires, todayIso) < 0),
    soon: dated.filter((i) => {
      const d = daysUntil(i.expires, todayIso);
      return d >= 0 && d <= withinDays;
    }),
  };
}

// Stock-list lines that no item in the stores covers yet (water is shown in the water card).
export function missing(recommendations: Recommendation[], items: StoreItem[]): Recommendation[] {
  const covered = new Set(items.map((i) => i.recommendationId).filter(Boolean));
  return recommendations.filter((r) => !COVERED_BY_WATER_CARD.has(r.id) && !covered.has(r.id));
}

export type WaterUnit = 'litres' | 'gallons';

export function toUnit(litres: number, unit: WaterUnit): number {
  return unit === 'gallons' ? litres / LITRES_PER_US_GALLON : litres;
}

export function fromUnit(value: number, unit: WaterUnit): number {
  return unit === 'gallons' ? value * LITRES_PER_US_GALLON : value;
}

export function formatVolume(litres: number, unit: WaterUnit, locale: string): string {
  const value = toUnit(litres, unit);
  const n = new Intl.NumberFormat(locale, { maximumFractionDigits: value < 10 && value % 1 !== 0 ? 1 : 0 }).format(value);
  return `${n} ${unit === 'gallons' ? 'gal' : 'L'}`;
}

export function formatGrams(grams: number, locale: string): string {
  if (grams >= 1000) return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(grams / 1000)} kg`;
  return `${Math.round(grams / 10) * 10} g`;
}
