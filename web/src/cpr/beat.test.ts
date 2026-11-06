import { describe, expect, it } from 'vitest';
import { beatMs, COMPRESSIONS, CPR_RATE, roundState } from './beat';

describe('HLR-metronom (D-067)', () => {
  it('beats 110 times a minute, inside the 100–120 of the handbook and ERC 2025', () => {
    expect(CPR_RATE).toBeGreaterThanOrEqual(100);
    expect(CPR_RATE).toBeLessThanOrEqual(120);
    expect(beatMs()).toBeCloseTo(545.45, 1);
  });

  it('counts 1 to 30, then asks for the 2 breaths', () => {
    expect(roundState(0)).toEqual({ count: 1, phase: 0, breaths: false });
    expect(roundState(beatMs() * 1.5)).toMatchObject({ count: 2, breaths: false });
    expect(roundState(beatMs() * 1.5).phase).toBeCloseTo(0.5);
    expect(roundState(beatMs() * (COMPRESSIONS - 0.5)).count).toBe(30);
    expect(roundState(beatMs() * COMPRESSIONS)).toEqual({ count: 30, phase: 1, breaths: true });
    expect(roundState(-5).count).toBe(1);
  });
});
