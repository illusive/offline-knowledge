import { describe, expect, it } from 'vitest';
import { cardinal, cardinalLetters, isUncertain, normalize, readingFrom, signedDelta, smooth } from './heading';

describe('compass maths', () => {
  it('normalizes to [0, 360)', () => {
    expect(normalize(-10)).toBe(350);
    expect(normalize(360)).toBe(0);
    expect(normalize(725)).toBe(5);
  });

  it('turns the short way round', () => {
    expect(signedDelta(350, 10)).toBe(20); // right, across north
    expect(signedDelta(10, 350)).toBe(-20); // left, across north
    expect(signedDelta(42, 72)).toBe(30);
    expect(signedDelta(0, 180)).toBe(180);
  });

  it('names the nearest compass point', () => {
    expect(cardinal(42, 'da')).toBe('NØ');
    expect(cardinal(42, 'en')).toBe('NE');
    expect(cardinal(359, 'da')).toBe('N');
    expect(cardinal(200, 'da')).toBe('S');
    expect(cardinal(250, 'da')).toBe('V');
    expect(cardinalLetters('da')).toEqual(['N', 'Ø', 'S', 'V']);
    expect(cardinalLetters('en')).toEqual(['N', 'E', 'S', 'W']);
  });

  it('smooths across north without swinging round', () => {
    expect(smooth(null, 370)).toBe(10);
    expect(smooth(350, 10, 0.5)).toBe(0);
  });

  it('reads iOS and absolute events, corrected for a turned screen', () => {
    expect(readingFrom({ webkitCompassHeading: 42, webkitCompassAccuracy: 10 }, 0, false)).toEqual({ heading: 42, accuracy: 10 });
    expect(readingFrom({ webkitCompassHeading: 42, webkitCompassAccuracy: -1 }, 90, false)).toEqual({ heading: 132, accuracy: -1 });
    expect(readingFrom({ alpha: 90, absolute: true }, 0, false)).toEqual({ heading: 270, accuracy: null });
    expect(readingFrom({ alpha: 90 }, 0, true)).toEqual({ heading: 270, accuracy: null });
    expect(readingFrom({ alpha: 90 }, 0, false)).toBeNull(); // relative only: no compass
  });

  it('is uncertain when not calibrated or worse than ±20°, not when unknown', () => {
    expect(isUncertain(-1)).toBe(true);
    expect(isUncertain(35)).toBe(true);
    expect(isUncertain(10)).toBe(false);
    expect(isUncertain(null)).toBe(false);
  });
});
