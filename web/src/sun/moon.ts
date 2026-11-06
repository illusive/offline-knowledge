// The moon for the sun tool (D-058): where it is, how much of it is lit, and when it rises and
// sets on a day. Meeus, "Astronomical Algorithms" (2nd ed.), chapters 47–48, with the largest
// periodic terms only: about 0.1° in position, which puts rise and set within a few minutes.
// Pure, so the tests need no browser.

const RAD = Math.PI / 180;
const sin = (deg: number) => Math.sin(deg * RAD);
const cos = (deg: number) => Math.cos(deg * RAD);
const norm = (deg: number) => ((deg % 360) + 360) % 360;
const DAY_MS = 86_400_000;

const julianDay = (ms: number) => ms / DAY_MS + 2440587.5;

// The moon's ecliptic position and distance, and its elongation from the sun, at a moment.
function lunar(ms: number) {
  const t = (julianDay(ms) - 2451545) / 36525;
  const lp = norm(218.3164477 + 481267.88123421 * t); // mean longitude
  const d = norm(297.8501921 + 445267.1114034 * t); // mean elongation
  const m = norm(357.5291092 + 35999.0502909 * t); // sun's mean anomaly
  const mp = norm(134.9633964 + 477198.8675055 * t); // moon's mean anomaly
  const f = norm(93.272095 + 483202.0175233 * t); // argument of latitude
  const lambda =
    lp +
    6.289 * sin(mp) + 1.274 * sin(2 * d - mp) + 0.658 * sin(2 * d) + 0.214 * sin(2 * mp) - 0.186 * sin(m) - 0.114 * sin(2 * f) +
    0.059 * sin(2 * d - 2 * mp) + 0.057 * sin(2 * d - m - mp) + 0.053 * sin(2 * d + mp) + 0.046 * sin(2 * d - m) -
    0.041 * sin(m - mp) - 0.035 * sin(d) - 0.03 * sin(m + mp);
  const beta =
    5.128 * sin(f) + 0.281 * sin(mp + f) + 0.278 * sin(mp - f) + 0.173 * sin(2 * d - f) + 0.055 * sin(2 * d - mp + f) +
    0.046 * sin(2 * d - mp - f) + 0.033 * sin(2 * d + f) + 0.017 * sin(2 * mp + f);
  const km = 385000.56 - 20905 * cos(mp) - 3699 * cos(2 * d - mp) - 2956 * cos(2 * d) - 570 * cos(2 * mp);
  const eps = 23.4392911 - 0.0130042 * t;
  const ra = Math.atan2(sin(lambda) * cos(eps) - (Math.tan(beta * RAD)) * sin(eps), cos(lambda)) / RAD;
  const dec = Math.asin(sin(beta) * cos(eps) + cos(beta) * sin(eps) * sin(lambda)) / RAD;
  // Phase angle (Meeus 48.4) from the elongation and anomalies.
  const phaseAngle = 180 - d - 6.289 * sin(mp) + 2.1 * sin(m) - 1.274 * sin(2 * d - mp) - 0.658 * sin(2 * d) - 0.214 * sin(2 * mp) - 0.11 * sin(d);
  return { ra, dec, km, elongation: d, phaseAngle };
}

// The moon's height above the horizon (degrees, geocentric) at a moment and place.
function altitude(ms: number, lat: number, lon: number): { alt: number; km: number } {
  const { ra, dec, km } = lunar(ms);
  const jd = julianDay(ms);
  const gmst = norm(280.46061837 + 360.98564736629 * (jd - 2451545));
  const hourAngle = gmst + lon - ra;
  return { alt: Math.asin(sin(lat) * sin(dec) + cos(lat) * cos(dec) * cos(hourAngle)) / RAD, km };
}

// Rising and setting use the moon's centre at h0 = 0.7275 × parallax − 0°34′ (Meeus 15.1).
const riseHeight = (km: number) => 0.7275 * (Math.asin(6378.14 / km) / RAD) - 34 / 60;

export interface MoonDay {
  rise: Date | null; // null: the moon does not rise on this day
  set: Date | null;
  illuminated: number; // 0–1, at the middle of the day
  waxing: boolean;
  phase: MoonPhase;
}

export type MoonPhase = 'new' | 'waxingCrescent' | 'firstQuarter' | 'waxingGibbous' | 'full' | 'waningGibbous' | 'lastQuarter' | 'waningCrescent';

// The phase from the moon's elongation (0° new, 90° first quarter, 180° full, 270° last quarter).
export function phaseOf(elongation: number): MoonPhase {
  const e = norm(elongation);
  const near = (target: number) => Math.abs(((e - target + 540) % 360) - 180) < 12;
  if (near(0)) return 'new';
  if (near(90)) return 'firstQuarter';
  if (near(180)) return 'full';
  if (near(270)) return 'lastQuarter';
  if (e < 90) return 'waxingCrescent';
  if (e < 180) return 'waxingGibbous';
  if (e < 270) return 'waningGibbous';
  return 'waningCrescent';
}

// How much of the moon is lit (0–1) at a moment, and whether it is growing.
export function moonLight(at: Date): { illuminated: number; waxing: boolean; phase: MoonPhase } {
  const { phaseAngle, elongation } = lunar(at.getTime());
  return { illuminated: (1 + cos(phaseAngle)) / 2, waxing: norm(elongation) < 180, phase: phaseOf(elongation) };
}

// The moon on a local day, from its midnight to the next (the caller gives both, so a day with a
// clock change is 23 or 25 hours). The height is followed in 10-minute steps and each crossing is
// narrowed down to a few seconds.
export function moonDay(dayStart: Date, dayEnd: Date, lat: number, lon: number): MoonDay {
  const start = dayStart.getTime();
  const end = dayEnd.getTime();
  const above = (ms: number) => {
    const { alt, km } = altitude(ms, lat, lon);
    return alt - riseHeight(km);
  };
  const step = 10 * 60_000;
  let rise: Date | null = null;
  let set: Date | null = null;
  let prev = above(start);
  for (let ms = start; ms < end; ms += step) {
    const next = Math.min(ms + step, end);
    const value = above(next);
    if ((prev < 0) !== (value < 0)) {
      let lo = ms;
      let hi = next;
      for (let i = 0; i < 12; i++) {
        const mid = (lo + hi) / 2;
        if ((above(mid) < 0) === (prev < 0)) lo = mid;
        else hi = mid;
      }
      const at = new Date((lo + hi) / 2);
      if (prev < 0 && !rise) rise = at;
      else if (prev >= 0 && !set) set = at;
    }
    prev = value;
  }
  return { rise, set, ...moonLight(new Date((start + end) / 2)) };
}
