// Formats storage periods for display. Pure; no React Native imports.

import type { Strings } from '../i18n/strings';

export type Location = 'pantry' | 'fridge' | 'freezer';
export type Basis = 'fromPurchase' | 'afterOpening' | 'afterThawing' | 'unspecified';
export type Unit = 'hours' | 'days' | 'weeks' | 'months' | 'years';
export type Kind = 'range' | 'notRecommended' | 'indefinitely' | 'untilRipe' | 'packageUseByDate';

export interface PeriodRow {
  location: Location;
  basis: Basis;
  kind: Kind;
  min_value: number | null;
  max_value: number | null;
  unit: Unit | null;
}

export function formatDuration(p: PeriodRow, s: Strings): string {
  if (p.kind !== 'range') return s.durations[p.kind];
  if (p.min_value === null || p.max_value === null || p.unit === null) throw new Error('Range period without values');
  const [singular, plural] = s.units[p.unit];
  if (p.min_value === p.max_value) return `${p.min_value} ${p.min_value === 1 ? singular : plural}`;
  return `${p.min_value}–${p.max_value} ${plural}`;
}

// 'unspecified' has no label: the source does not say what the time is counted from,
// and it must not be shown as "from purchase" (OPEN_QUESTIONS #14).
export function formatBasis(p: PeriodRow, s: Strings): string | null {
  return s.basis[p.basis];
}

export const LOCATION_ORDER: Location[] = ['pantry', 'fridge', 'freezer'];

const DAYS: Record<Unit, number> = { hours: 1 / 24, days: 1, weeks: 7, months: 30, years: 365 };

// Where a food keeps longest, for the line under its name: the range period (from purchase or
// unspecified, not after opening or thawing) with the longest maximum. Null if no range is given.
export function longestKeeping(periods: PeriodRow[]): PeriodRow | null {
  let best: PeriodRow | null = null;
  for (const p of periods) {
    if (p.kind !== 'range' || p.max_value === null || p.unit === null) continue;
    if (p.basis === 'afterOpening' || p.basis === 'afterThawing') continue;
    if (!best || p.max_value * DAYS[p.unit] > (best.max_value ?? 0) * DAYS[best.unit ?? 'days']) best = p;
  }
  return best;
}
