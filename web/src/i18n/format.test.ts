import { describe, expect, it } from 'vitest';
import { formatClock, formatDuration, parseCounter } from './format';

describe('parseCounter (the typed number in a Stepper, D-054)', () => {
  it('takes whole numbers within the range', () => {
    expect(parseCounter('3', 0, 9999)).toBe(3);
    expect(parseCounter(' 12 ', 0, 9999)).toBe(12);
    expect(parseCounter('0', 0, 9999)).toBe(0);
    expect(parseCounter('0', 1, 9999)).toBeNull();
    expect(parseCounter('10000', 0, 9999)).toBeNull();
  });

  it('is null while the text is not a number yet', () => {
    expect(parseCounter('', 0, 10)).toBeNull();
    expect(parseCounter('-1', 0, 10)).toBeNull();
    expect(parseCounter('2,5', 0, 10)).toBeNull(); // not whole
    expect(parseCounter('abc', 0, 10)).toBeNull();
  });

  it('takes a comma or a point when decimal', () => {
    expect(parseCounter('2,5', 0, 100, true)).toBe(2.5);
    expect(parseCounter('2.5', 0, 100, true)).toBe(2.5);
    expect(parseCounter('12', 0, 100, true)).toBe(12);
    expect(parseCounter('2,', 0, 100, true)).toBe(2);
    expect(parseCounter(',5', 0, 100, true)).toBeNull();
  });
});

describe('formatClock and formatDuration (the sun tool, D-056)', () => {
  it('rounds a time to the nearest minute on the phone\'s clock', () => {
    expect(formatClock(new Date(2026, 11, 21, 8, 37, 20), 'da')).toBe('08.37');
    expect(formatClock(new Date(2026, 11, 21, 8, 37, 40), 'da')).toBe('08.38');
    expect(formatClock(new Date(2026, 11, 21, 23, 59, 50), 'en')).toBe('00:00');
    expect(formatClock(new Date(2026, 11, 21, 15, 38, 0), 'en')).toBe('15:38');
  });
  it('gives hours and minutes', () => {
    expect(formatDuration(421.2, 'da')).toBe('7 t 1 min');
    expect(formatDuration(1052.5, 'en')).toBe('17 h 33 min');
    expect(formatDuration(45, 'da')).toBe('45 min');
    expect(formatDuration(1440, 'da')).toBe('24 t');
    expect(formatDuration(59.7, 'da')).toBe('1 t');
  });
});
