import { describe, expect, it } from 'vitest';
import { convert } from './units';

describe('Omregn mål (D-068), NIST Handbook 44 Appendix C', () => {
  it('converts US kitchen measures to millilitres', () => {
    expect(convert(1, 'cup')).toEqual({ kind: 'volume', ml: expect.closeTo(236.59, 2) });
    expect(convert(1, 'tbsp')).toEqual({ kind: 'volume', ml: expect.closeTo(14.79, 2) });
    expect(convert(1, 'tsp')).toEqual({ kind: 'volume', ml: expect.closeTo(4.93, 2) });
    expect(convert(1, 'floz')).toEqual({ kind: 'volume', ml: 29.57353 });
    expect(convert(2, 'pint')).toEqual({ kind: 'volume', ml: expect.closeTo(946.35, 2) });
    expect(convert(1, 'gallon')).toEqual({ kind: 'volume', ml: 3785.411784 });
  });

  it('converts weight, length and temperature', () => {
    expect(convert(1, 'lb')).toEqual({ kind: 'mass', g: 453.59237 });
    expect(convert(16, 'oz')).toEqual({ kind: 'mass', g: expect.closeTo(453.59, 2) });
    expect(convert(1, 'inch')).toEqual({ kind: 'length', cm: 2.54 });
    expect(convert(350, 'fahrenheit')).toEqual({ kind: 'temperature', celsius: expect.closeTo(176.67, 2) });
    expect(convert(32, 'fahrenheit')).toEqual({ kind: 'temperature', celsius: 0 });
    expect(convert(-40, 'fahrenheit')).toEqual({ kind: 'temperature', celsius: -40 });
  });
});
