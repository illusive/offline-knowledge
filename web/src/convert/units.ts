// Omregn mål (D-068): US units to metric, pure for tests. Every factor is from NIST Handbook 44
// (2026), Appendix C, "General Tables of Units of Measurement" (source us-nist-hb44-appendix-c-2026):
// - 1 fluid ounce = 29.573 53 mL; 1 cup = 8 fluid ounces (exactly); 1 tablespoon = ½ fluid ounce
//   (exactly); 1 teaspoon = ⅓ tablespoon (exactly)
// - 1 liquid pint = 473.176 5 mL; 1 liquid quart = 946.352 9 mL; 1 gallon = 3 785.411 784 mL
// - 1 ounce (avoirdupois) = 28.349 523 125 g; 1 pound (avoirdupois) = 453.592 37 g
// - 1 inch = 2.54 cm (exactly)
// - Temperature (exact): °C = (°F − 32) / 1.8

export const FLUID_OUNCE_ML = 29.57353;

export const UNITS = ['cup', 'tbsp', 'tsp', 'floz', 'pint', 'quart', 'gallon', 'oz', 'lb', 'inch', 'fahrenheit'] as const;
export type Unit = (typeof UNITS)[number];

export type Converted = { kind: 'volume'; ml: number } | { kind: 'mass'; g: number } | { kind: 'length'; cm: number } | { kind: 'temperature'; celsius: number };

const ML: Partial<Record<Unit, number>> = {
  cup: 8 * FLUID_OUNCE_ML,
  tbsp: FLUID_OUNCE_ML / 2,
  tsp: FLUID_OUNCE_ML / 6,
  floz: FLUID_OUNCE_ML,
  pint: 473.1765,
  quart: 946.3529,
  gallon: 3785.411784,
};
const G: Partial<Record<Unit, number>> = { oz: 28.349523125, lb: 453.59237 };

export function convert(value: number, unit: Unit): Converted {
  if (unit === 'fahrenheit') return { kind: 'temperature', celsius: (value - 32) / 1.8 };
  if (unit === 'inch') return { kind: 'length', cm: value * 2.54 };
  const g = G[unit];
  if (g !== undefined) return { kind: 'mass', g: value * g };
  return { kind: 'volume', ml: value * ML[unit]! };
}
