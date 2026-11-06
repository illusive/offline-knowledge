import { describe, expect, it } from 'vitest';
import { LIMITS, minutesLeft, minutesSince } from './limits';
import { BOIL_SECONDS, secondsLeft } from '../screens/BoilTimerScreen';

describe('fridge and freezer clock (D-058)', () => {
  it('uses the sourced hours: fridge 4, full freezer 48, half-full freezer 24', () => {
    expect(LIMITS.map((l) => [l.id, l.hours])).toEqual([['fridge', 4], ['freezerFull', 48], ['freezerHalf', 24]]);
  });
  it('counts from the stored start, so a restart keeps the time', () => {
    const start = Date.UTC(2026, 10, 6, 12, 0);
    expect(minutesSince(start, start + 200 * 60_000)).toBe(200);
    expect(minutesSince(start, start - 5_000)).toBe(0);
    expect(minutesLeft(4, 200)).toBe(40);
    expect(minutesLeft(4, 240)).toBe(0);
    expect(minutesLeft(48, 300)).toBe(2580);
  });
});

describe('boiling timer (D-058)', () => {
  it('runs one minute from the stored start and then stays done', () => {
    const start = 1_000_000;
    expect(BOIL_SECONDS).toBe(60);
    expect(secondsLeft(start, start)).toBe(60);
    expect(secondsLeft(start, start + 59_500)).toBe(1);
    expect(secondsLeft(start, start + 60_000)).toBe(0);
    expect(secondsLeft(start, start + 3_600_000)).toBe(0);
  });
});
