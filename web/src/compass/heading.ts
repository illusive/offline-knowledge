// Pure compass maths (D-045), kept apart so tests need no browser or sensor.

import type { Lang } from '../i18n/strings';

// Degrees in [0, 360).
export function normalize(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

// The shortest turn from one direction to another, in (-180, 180]: positive is clockwise (right).
export function signedDelta(from: number, to: number): number {
  const d = normalize(to - from);
  return d > 180 ? d - 360 : d;
}

const POINTS: Record<Lang, string[]> = {
  da: ['N', 'NØ', 'Ø', 'SØ', 'S', 'SV', 'V', 'NV'],
  en: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'],
};

// The nearest of the eight compass points.
export function cardinal(deg: number, lang: Lang): string {
  return POINTS[lang][Math.round(normalize(deg) / 45) % 8]!;
}

// Smooths a jittery reading without swinging the long way round through north.
export function smooth(previous: number | null, next: number, factor = 0.25): number {
  if (previous === null) return normalize(next);
  return normalize(previous + signedDelta(previous, next) * factor);
}

export interface Reading {
  heading: number; // degrees from magnetic north, clockwise, for the top of the screen
  accuracy: number | null; // ± degrees; -1 when iOS says it is not calibrated; null when the device does not say
}

// The parts of an orientation event we use. iOS adds webkitCompassHeading (already a compass
// heading) and webkitCompassAccuracy; other browsers give an absolute alpha (counter-clockwise).
export interface OrientationLike {
  absolute?: boolean;
  alpha?: number | null;
  webkitCompassHeading?: number;
  webkitCompassAccuracy?: number;
}

// screenAngle: how far the screen is turned (0 in portrait, 90 or 270 in landscape).
export function readingFrom(event: OrientationLike, screenAngle: number, absoluteEvent: boolean): Reading | null {
  if (typeof event.webkitCompassHeading === 'number' && !Number.isNaN(event.webkitCompassHeading)) {
    const accuracy = typeof event.webkitCompassAccuracy === 'number' ? (event.webkitCompassAccuracy < 0 ? -1 : event.webkitCompassAccuracy) : null;
    return { heading: normalize(event.webkitCompassHeading + screenAngle), accuracy };
  }
  if ((absoluteEvent || event.absolute) && typeof event.alpha === 'number') {
    return { heading: normalize(360 - event.alpha + screenAngle), accuracy: null };
  }
  return null;
}

// Worse than this, or not calibrated, the compass is shown as uncertain. Unknown accuracy is not.
export const UNCERTAIN_ABOVE = 20;

export function isUncertain(accuracy: number | null): boolean {
  return accuracy !== null && (accuracy < 0 || accuracy > UNCERTAIN_ABOVE);
}

// Within this many degrees of the course, you are on course.
export const ON_COURSE_WITHIN = 5;
