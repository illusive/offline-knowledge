import { describe, expect, it } from 'vitest';
import { strings } from './strings';

// The shape of a strings object: every key with the kind of value it holds, nested.
function shape(value: unknown, path = ''): string[] {
  if (typeof value === 'function') return [`${path}()`];
  if (Array.isArray(value)) return [`${path}[${typeof value[0]}]`];
  if (value && typeof value === 'object') return Object.entries(value).flatMap(([k, v]) => shape(v, path ? `${path}.${k}` : k));
  return [`${path}:${typeof value}`];
}

describe('interface strings', () => {
  // Place names on the map (places.kinds) are a lookup that falls back to the map's own name, so the
  // two languages may name different kinds.
  const comparable = (keys: string[]) => keys.filter((k) => !k.startsWith('places.kinds.')).sort();

  it('Danish and English have the same keys, of the same kind', () => {
    expect(comparable(shape(strings.en))).toEqual(comparable(shape(strings.da)));
  });

  it('no string is left empty', () => {
    for (const lang of ['da', 'en'] as const) {
      const empty = shape(strings[lang]).filter((k) => k.endsWith(':string')).map((k) => k.slice(0, -':string'.length)).filter((k) => {
        const v = k.split('.').reduce<unknown>((o, part) => (o as Record<string, unknown>)[part], strings[lang]);
        return v === '';
      });
      expect(empty, lang).toEqual([]);
    }
  });
});
