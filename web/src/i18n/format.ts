// Every date, number and unit the app shows, in the user's language, in one place. Pure, so the
// tests need no browser.

import type { Lang } from './strings';

export const localeOf = (lang: Lang) => (lang === 'da' ? 'da-DK' : 'en-GB');

const pad = (n: number) => String(n).padStart(2, '0');

// Today on the device, as yyyy-mm-dd (local time, not UTC).
export function today(now = new Date()): string {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

// This month on the device, as yyyy-mm.
export function thisMonth(now = new Date()): string {
  return today(now).slice(0, 7);
}

// "24. oktober 2026" / "24 October 2026".
export function formatDate(date: Date, lang: Lang): string {
  return date.toLocaleDateString(localeOf(lang), { day: 'numeric', month: 'long', year: 'numeric' });
}

// A month as yyyy-mm → "maj 2027" / "May 2027".
export function formatMonth(month: string, lang: Lang): string {
  const [y, m] = month.split('-').map(Number);
  return new Intl.DateTimeFormat(localeOf(lang), { month: 'long', year: 'numeric' }).format(new Date(y!, m! - 1, 1));
}

// The name of a month, 0 = January.
export function monthName(index: number, lang: Lang): string {
  return new Intl.DateTimeFormat(localeOf(lang), { month: 'long' }).format(new Date(2000, index, 1));
}

// Map version (the Protomaps build date, e.g. '20261024') as a date people read.
export function formatMapDate(version: string, lang: Lang): string {
  const m = /^(\d{4})(\d{2})(\d{2})/.exec(version);
  if (!m) return version;
  return new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]))).toLocaleDateString(localeOf(lang), { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}

export function formatBytes(bytes: number, lang: Lang): string {
  const nf = (v: number, digits: number) => new Intl.NumberFormat(localeOf(lang), { maximumFractionDigits: digits }).format(v);
  // Non-breaking space: the number and its unit stay on one line.
  return bytes >= 1e9 ? `${nf(bytes / 1e9, 1)} GB` : `${nf(Math.max(1, bytes / 1e6), 0)} MB`;
}

// Water (D-046): stored in litres, shown in litres or US gallons.
export type WaterUnit = 'litres' | 'gallons';
export const LITRES_PER_US_GALLON = 3.785411784;
export const unitLabel = (unit: WaterUnit) => (unit === 'gallons' ? 'gal' : 'L');
export const toUnit = (litres: number, unit: WaterUnit) => (unit === 'gallons' ? litres / LITRES_PER_US_GALLON : litres);
export const fromUnit = (value: number, unit: WaterUnit) => (unit === 'gallons' ? value * LITRES_PER_US_GALLON : value);

export function formatVolume(litres: number, unit: WaterUnit, lang: Lang): string {
  const value = toUnit(litres, unit);
  const n = new Intl.NumberFormat(localeOf(lang), { maximumFractionDigits: value < 10 && value % 1 !== 0 ? 1 : 0 }).format(value);
  return `${n} ${unitLabel(unit)}`;
}

// A number for a text field the user edits ("1,5" in Danish), and the number typed back.
export function decimalForInput(value: number, lang: Lang, digits = 1): string {
  const f = 10 ** digits;
  return String(Math.round(value * f) / f).replace('.', lang === 'da' ? ',' : '.');
}

export function parseDecimal(text: string): number | null {
  const value = Number(text.trim().replace(',', '.'));
  return text.trim() !== '' && Number.isFinite(value) ? value : null;
}

// A number typed into a counter (Stepper, D-054): a whole number, or with `decimal` a comma or point
// number, within min..max; null while it is not one yet (empty, "1,", too big).
export function parseCounter(text: string, min: number, max: number, decimal = false): number | null {
  const t = text.trim();
  if (!(decimal ? /^\d+([.,]\d*)?$/ : /^\d+$/).test(t)) return null;
  const value = decimal ? parseDecimal(t) : Number(t);
  return value !== null && value >= min && value <= max ? value : null;
}

// A time of day on the phone's clock, rounded to the nearest minute: "08.37" / "08:37" (D-056).
export function formatClock(date: Date, lang: Lang): string {
  const rounded = new Date(Math.round(date.getTime() / 60_000) * 60_000);
  return new Intl.DateTimeFormat(localeOf(lang), { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(rounded);
}

// A length of time in whole minutes: "7 t 1 min" / "7 h 1 min"; under an hour "45 min".
export function formatDuration(minutes: number, lang: Lang): string {
  const total = Math.round(minutes);
  const h = Math.floor(total / 60);
  const m = total % 60;
  const hours = `${h} ${lang === 'da' ? 't' : 'h'}`;
  return h === 0 ? `${m} min` : m === 0 ? hours : `${hours} ${m} min`;
}
