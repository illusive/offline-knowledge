// When the sun rises and sets (D-056), worked out on the phone from a place and a date: NOAA's
// solar position equations (after Jean Meeus, "Astronomical Algorithms"; NOAA Global Monitoring
// Laboratory, public domain). Pure, so the tests need no browser. Accurate to about a minute for
// places away from the poles; hills, buildings and the weather are not counted.

const RAD = Math.PI / 180;
const sin = (deg: number) => Math.sin(deg * RAD);
const cos = (deg: number) => Math.cos(deg * RAD);
const tan = (deg: number) => Math.tan(deg * RAD);
const DAY_MS = 86_400_000;

// The sun's centre below the horizon at each event, in degrees from straight up.
export const ZENITH = {
  sun: 90.833, // sunrise and sunset: the upper edge on the horizon, with the bending of light in the air
  civil: 96, // civil twilight: 6° below the horizon
} as const;

// Rising and setting on the day, with the directions; or the sun stays above ('up') or below
// ('down') that height the whole day.
export type Pass = { kind: 'riseSet'; rise: Date; set: Date; riseAzimuth: number; setAzimuth: number } | { kind: 'up' } | { kind: 'down' };

export interface SunDay {
  noon: Date; // the sun at its highest
  sun: Pass; // sunrise and sunset
  light: Pass; // civil twilight: light enough outside
  dayLengthMin: number; // minutes from sunrise to sunset (0 or 1440 when it never sets or rises)
}

// The sun's declination and the equation of time (minutes) at a moment, as Julian centuries
// since J2000.0.
function position(t: number) {
  const l0 = (280.46646 + t * (36000.76983 + t * 0.0003032)) % 360;
  const m = 357.52911 + t * (35999.05029 - 0.0001537 * t);
  const e = 0.016708634 - t * (0.000042037 + 0.0000001267 * t);
  const c = sin(m) * (1.914602 - t * (0.004817 + 0.000014 * t)) + sin(2 * m) * (0.019993 - 0.000101 * t) + sin(3 * m) * 0.000289;
  const omega = 125.04 - 1934.136 * t;
  const lambda = l0 + c - 0.00569 - 0.00478 * sin(omega);
  const eps0 = 23 + (26 + (21.448 - t * (46.815 + t * (0.00059 - t * 0.001813))) / 60) / 60;
  const eps = eps0 + 0.00256 * cos(omega);
  const decl = Math.asin(sin(eps) * sin(lambda)) / RAD;
  const y = tan(eps / 2) ** 2;
  const eqTime =
    (4 / RAD) *
    (y * sin(2 * l0) - 2 * e * sin(m) + 4 * e * y * sin(m) * cos(2 * l0) - 0.5 * y * y * sin(4 * l0) - 1.25 * e * e * sin(2 * m));
  return { decl, eqTime };
}

// Julian centuries since J2000.0 at a moment given as ms since 1970.
const centuries = (ms: number) => (ms / DAY_MS + 2440587.5 - 2451545) / 36525;

// The hour angle (degrees) at which the sun's centre reaches `zenith`, or 'up'/'down' when it never does.
function hourAngle(lat: number, decl: number, zenith: number): number | 'up' | 'down' {
  const x = cos(zenith) / (cos(lat) * cos(decl)) - tan(lat) * tan(decl);
  if (x > 1) return 'down';
  if (x < -1) return 'up';
  return Math.acos(x) / RAD;
}

// The direction (true degrees from north, clockwise) of the sun at `zenith` in the morning.
function morningAzimuth(lat: number, decl: number, zenith: number): number {
  const x = (sin(decl) - sin(lat) * cos(zenith)) / (cos(lat) * sin(zenith));
  return Math.acos(Math.max(-1, Math.min(1, x))) / RAD;
}

// One event, refined twice: the sun's position is taken again at the time first found.
function event(dayStart: number, lat: number, lon: number, zenith: number, morning: boolean) {
  let ms = dayStart + DAY_MS / 2;
  let azimuth = 0;
  for (let i = 0; i < 3; i++) {
    const { decl, eqTime } = position(centuries(ms));
    const ha = hourAngle(lat, decl, zenith);
    if (typeof ha !== 'number') return ha;
    const minutes = 720 - 4 * lon - eqTime + (morning ? -4 : 4) * ha;
    ms = dayStart + minutes * 60_000;
    const az = morningAzimuth(lat, decl, zenith);
    azimuth = morning ? az : 360 - az;
  }
  return { at: new Date(ms), azimuth };
}

function pass(dayStart: number, lat: number, lon: number, zenith: number): Pass {
  const rise = event(dayStart, lat, lon, zenith, true);
  const set = event(dayStart, lat, lon, zenith, false);
  if (typeof rise === 'string') return { kind: rise };
  if (typeof set === 'string') return { kind: set };
  return { kind: 'riseSet', rise: rise.at, set: set.at, riseAzimuth: rise.azimuth, setAzimuth: set.azimuth };
}

// The sun on a calendar day (`month` 1–12) at a place (degrees; east and north positive). The day
// is taken as the UTC day of that date, which is the local day for places near Europe's time zones.
export function sunDay(year: number, month: number, day: number, lat: number, lon: number): SunDay {
  const dayStart = Date.UTC(year, month - 1, day);
  let noonMs = dayStart + (720 - 4 * lon) * 60_000;
  for (let i = 0; i < 2; i++) noonMs = dayStart + (720 - 4 * lon - position(centuries(noonMs)).eqTime) * 60_000;
  const sun = pass(dayStart, lat, lon, ZENITH.sun);
  const dayLengthMin = sun.kind === 'riseSet' ? (sun.set.getTime() - sun.rise.getTime()) / 60_000 : sun.kind === 'up' ? 1440 : 0;
  return { noon: new Date(noonMs), sun, light: pass(dayStart, lat, lon, ZENITH.civil), dayLengthMin };
}

// The calendar day before a yyyy-mm-dd date, as [year, month, day].
export function dayBefore(year: number, month: number, day: number): [number, number, number] {
  const d = new Date(Date.UTC(year, month - 1, day) - DAY_MS);
  return [d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate()];
}
