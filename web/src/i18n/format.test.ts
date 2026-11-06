import { describe, expect, it } from 'vitest';
import { parseCounter } from './format';

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
