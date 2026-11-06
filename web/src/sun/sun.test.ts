// Reference values fetched 2026-11-06 (D-056), not typed from memory:
// - sunrise, sunset and their directions: NOAA Solar Calculator (gml.noaa.gov/grad/solcalc), its
//   own calcSunriseSet, local time in minutes (08:37.17 = 8 h 37.17 min);
// - civil twilight: U.S. Naval Observatory, "Complete Sun and Moon Data for One Day"
//   (aa.usno.navy.mil/api/rstt/oneday), to the minute.

import { describe, expect, it } from 'vitest';
import { dayBefore, sunDay, type Pass } from './sun';
import { coordsOf, parsePlace } from './place';
import { TOWNS } from './towns';

// A local time (hours, decimal minutes) at a UTC offset, as ms since 1970.
const at = (y: number, m: number, d: number, tz: number, h: number, min: number) => Date.UTC(y, m - 1, d, h - tz, 0) + min * 60_000;
const riseSet = (p: Pass) => {
  if (p.kind !== 'riseSet') throw new Error(`expected a rise and a set, got ${p.kind}`);
  return p;
};
const minutesOff = (a: Date, b: number) => Math.abs(a.getTime() - b) / 60_000;

describe('sunDay against NOAA', () => {
  const cases = [
    { name: 'København, winter solstice', date: [2026, 12, 21], lat: 55.68, lon: 12.57, tz: 1, rise: [8, 37.17], riseAz: 133.17, set: [15, 38.38], setAz: 226.82 },
    { name: 'København, summer solstice', date: [2026, 6, 21], lat: 55.68, lon: 12.57, tz: 2, rise: [4, 25.29], riseAz: 43.38, set: [21, 57.77], setAz: 316.62 },
    { name: 'København, equinox', date: [2026, 3, 20], lat: 55.68, lon: 12.57, tz: 1, rise: [6, 12.24], riseAz: 89.05, set: [18, 23.26], setAz: 271.3 },
    { name: 'Skagen, summer solstice', date: [2026, 6, 21], lat: 57.72, lon: 10.59, tz: 2, rise: [4, 16.49], riseAz: 39.84, set: [22, 22.42], setAz: 320.16 },
    { name: 'Rønne, winter solstice', date: [2026, 12, 21], lat: 55.1, lon: 14.7, tz: 1, rise: [8, 24.87], riseAz: 132.41, set: [15, 33.64], setAz: 227.59 },
  ] as const;
  for (const c of cases) {
    it(c.name, () => {
      const [y, m, d] = c.date;
      const sun = riseSet(sunDay(y, m, d, c.lat, c.lon).sun);
      expect(minutesOff(sun.rise, at(y, m, d, c.tz, c.rise[0], c.rise[1]))).toBeLessThan(1);
      expect(minutesOff(sun.set, at(y, m, d, c.tz, c.set[0], c.set[1]))).toBeLessThan(1);
      expect(Math.abs(sun.riseAzimuth - c.riseAz)).toBeLessThan(0.5);
      expect(Math.abs(sun.setAzimuth - c.setAz)).toBeLessThan(0.5);
    });
  }
});

describe('civil twilight against USNO', () => {
  const cases = [
    { name: 'København, winter solstice', date: [2026, 12, 21], lat: 55.68, lon: 12.57, tz: 1, dawn: [7, 50], dusk: [16, 25] },
    { name: 'København, summer solstice', date: [2026, 6, 21], lat: 55.68, lon: 12.57, tz: 2, dawn: [3, 24], dusk: [22, 59] },
    { name: 'Skagen, summer solstice', date: [2026, 6, 21], lat: 57.72, lon: 10.59, tz: 2, dawn: [3, 3], dusk: [23, 36] },
  ] as const;
  for (const c of cases) {
    it(c.name, () => {
      const [y, m, d] = c.date;
      const light = riseSet(sunDay(y, m, d, c.lat, c.lon).light);
      // USNO gives whole minutes, so allow the rounding.
      expect(minutesOff(light.rise, at(y, m, d, c.tz, c.dawn[0], c.dawn[1]))).toBeLessThan(1.5);
      expect(minutesOff(light.set, at(y, m, d, c.tz, c.dusk[0], c.dusk[1]))).toBeLessThan(1.5);
    });
  }
});

describe('days without a sunrise or a sunset', () => {
  it('far north the sun stays down in midwinter and up in midsummer', () => {
    const winter = sunDay(2026, 1, 1, 78.22, 15.65);
    expect(winter.sun.kind).toBe('down');
    expect(winter.light.kind).toBe('down');
    expect(winter.dayLengthMin).toBe(0);
    const summer = sunDay(2026, 6, 21, 78.22, 15.65);
    expect(summer.sun.kind).toBe('up');
    expect(summer.dayLengthMin).toBe(1440);
  });
});

describe('day length', () => {
  it('is the time from sunrise to sunset, and grows after the winter solstice', () => {
    const day = sunDay(2026, 12, 21, 55.68, 12.57);
    const sun = riseSet(day.sun);
    expect(day.dayLengthMin).toBeCloseTo((sun.set.getTime() - sun.rise.getTime()) / 60_000, 6);
    expect(Math.round(day.dayLengthMin)).toBe(421); // NOAA: 15:38.38 − 08:37.17
    expect(sunDay(2027, 1, 21, 55.68, 12.57).dayLengthMin - sunDay(2027, 1, 20, 55.68, 12.57).dayLengthMin).toBeGreaterThan(3);
  });
  it('dayBefore crosses months and years', () => {
    expect(dayBefore(2026, 3, 1)).toEqual([2026, 2, 28]);
    expect(dayBefore(2028, 3, 1)).toEqual([2028, 2, 29]);
    expect(dayBefore(2027, 1, 1)).toEqual([2026, 12, 31]);
  });
});

describe('place', () => {
  it('keeps valid places and drops damaged ones', () => {
    expect(parsePlace({ kind: 'gps', lat: 55.68, lon: 12.57 })).toEqual({ kind: 'gps', lat: 55.68, lon: 12.57 });
    expect(parsePlace({ kind: 'town', id: 'skagen' })).toEqual({ kind: 'town', id: 'skagen' });
    expect(parsePlace({ kind: 'town', id: 'atlantis' })).toBeNull();
    expect(parsePlace({ kind: 'home', lat: 120, lon: 0 })).toBeNull();
    expect(parsePlace('x')).toBeNull();
    expect(parsePlace(undefined)).toBeNull();
  });
  it('every town lies in Denmark and has its coordinates', () => {
    for (const town of TOWNS) {
      const { lat, lon } = coordsOf({ kind: 'town', id: town.id });
      expect(lat).toBeGreaterThan(54.5);
      expect(lat).toBeLessThan(57.8);
      expect(lon).toBeGreaterThan(8);
      expect(lon).toBeLessThan(15.2);
    }
  });
});

describe('yearOfDayLengths', () => {
  it('has every day of the year, shortest near the winter and longest near the summer solstice', async () => {
    const { yearOfDayLengths } = await import('./sun');
    const days = yearOfDayLengths(2026, 55.68, 12.57);
    expect(days).toHaveLength(365);
    expect(yearOfDayLengths(2028, 55.68, 12.57)).toHaveLength(366);
    const byLength = [...days].sort((a, b) => a.minutes - b.minutes);
    const shortest = byLength[0]!;
    const longest = byLength[byLength.length - 1]!;
    expect(shortest.month).toBe(12);
    expect(shortest.day).toBeGreaterThanOrEqual(20);
    expect(shortest.day).toBeLessThanOrEqual(22);
    expect(longest.month).toBe(6);
    expect(longest.day).toBeGreaterThanOrEqual(20);
    expect(longest.day).toBeLessThanOrEqual(22);
    expect(days[354]).toEqual({ month: 12, day: 21, minutes: sunDay(2026, 12, 21, 55.68, 12.57).dayLengthMin });
  });
});

// Reference values fetched 2026-11-06 (D-058): the sun's position from NOAA's Solar Calculator
// (its own calcAzEl, with refraction); the moon from USNO's "Complete Sun and Moon Data for One
// Day" (aa.usno.navy.mil/api/rstt/oneday), to the minute, with its illuminated fraction for the day.
describe('sunPosition against NOAA', () => {
  const cases = [
    { at: Date.UTC(2026, 10, 6, 9, 0), lat: 55.68, lon: 12.57, az: 151.91, el: 14.48 },
    { at: Date.UTC(2026, 5, 21, 13, 30), lat: 55.68, lon: 12.57, az: 232.53, el: 48.97 },
    { at: Date.UTC(2026, 2, 20, 6, 0), lat: 57.72, lon: 10.59, az: 97.46, el: 4.69 },
  ];
  for (const c of cases) {
    it(new Date(c.at).toISOString(), async () => {
      const { sunPosition } = await import('./sun');
      const p = sunPosition(new Date(c.at), c.lat, c.lon);
      expect(Math.abs(p.azimuth - c.az)).toBeLessThan(0.3);
      expect(Math.abs(p.elevation - c.el)).toBeLessThan(0.3);
    });
  }
});

describe('moonDay against USNO', () => {
  // [local date, lat, lon, UTC offset, rise, set (local h, min), illuminated %]
  const cases = [
    { date: [2026, 12, 21], lat: 55.68, lon: 12.57, tz: 1, rise: [12, 51], set: [5, 38], pct: 90 },
    { date: [2026, 6, 21], lat: 55.68, lon: 12.57, tz: 2, rise: [12, 47], set: [0, 46], pct: 45 },
    { date: [2026, 11, 6], lat: 55.68, lon: 12.57, tz: 1, rise: [4, 2], set: [14, 57], pct: 8 },
    { date: [2026, 3, 3], lat: 57.72, lon: 10.59, tz: 1, rise: [18, 8], set: [7, 8], pct: 100 },
  ] as const;
  for (const c of cases) {
    it(`${c.date.join('-')} at ${c.lat}`, async () => {
      const { moonDay } = await import('./moon');
      const [y, m, d] = c.date;
      // The test machine may be in any time zone: the day is given as the place's local midnight.
      const midnight = new Date(Date.UTC(y, m - 1, d) - c.tz * 3_600_000);
      const local = (dt: Date | null) => (dt ? (dt.getTime() - midnight.getTime()) / 60_000 : NaN);
      const day = moonDay(midnight, new Date(midnight.getTime() + 86_400_000), c.lat, c.lon);
      expect(Math.abs(local(day.rise) - (c.rise[0] * 60 + c.rise[1]))).toBeLessThan(2);
      expect(Math.abs(local(day.set) - (c.set[0] * 60 + c.set[1]))).toBeLessThan(2);
      expect(Math.abs(day.illuminated * 100 - c.pct)).toBeLessThan(1.5);
    });
  }
});
