import { expect, test } from 'vitest';
import { strings } from '../i18n/strings';
import { formatBasis, formatDuration, type PeriodRow } from './format';
import { fold, ftsPhrase, prefixFilter, rankResults } from './search';

const range = (min: number, max: number, unit: PeriodRow['unit']): PeriodRow => ({
  location: 'fridge', basis: 'fromPurchase', kind: 'range', min_value: min, max_value: max, unit,
});

test('formatDuration uses singular, plural and en dash ranges in both languages', () => {
  expect(formatDuration(range(1, 2, 'weeks'), strings.da)).toBe('1–2 uger');
  expect(formatDuration(range(1, 1, 'weeks'), strings.da)).toBe('1 uge');
  expect(formatDuration(range(3, 3, 'months'), strings.en)).toBe('3 months');
  expect(formatDuration(range(1, 1, 'years'), strings.en)).toBe('1 year');
  expect(formatDuration({ ...range(0, 0, null), kind: 'notRecommended', min_value: null, max_value: null }, strings.da)).toBe('Anbefales ikke');
});

test('formatBasis never labels an unspecified basis', () => {
  expect(formatBasis(range(1, 2, 'days'), strings.da)).toBe('fra købsdato');
  expect(formatBasis({ ...range(1, 2, 'days'), basis: 'unspecified' }, strings.en)).toBe(null);
});

test('fold matches the index: case and å folded, æ and ø kept', () => {
  expect(fold('Kål')).toBe('kal');
  expect(fold('ÆBLER')).toBe('æbler');
  expect(fold('Rødbeder')).toBe('rødbeder');
});

test('ftsPhrase quotes user input so FTS operators are not interpreted', () => {
  expect(ftsPhrase(' kål ')).toBe('"kål"');
  expect(ftsPhrase('a" OR "b')).toBe('"a"" OR ""b"');
});

test('rankResults puts exact and prefix matches before compound-word matches', () => {
  const rows = [
    { id: '423', name_da: 'Grønkål', name_en: 'Kale' },
    { id: '278', name_da: 'Kål', name_en: 'Cabbage' },
    { id: '494', name_da: 'Kålrabi', name_en: 'Kohlrabi' },
    { id: '277', name_da: 'Rosenkål', name_en: 'Brussels sprouts' },
  ];
  expect(rankResults(rows, 'kål', 'da').map((r) => r.name_da)).toEqual(['Kål', 'Kålrabi', 'Grønkål', 'Rosenkål']);
  expect(rankResults(rows, 'kale', 'en').map((r) => r.name_en)[0]).toEqual('Kale');
});

test('prefixFilter handles short queries by word prefix', () => {
  const rows = [
    { id: '1', name_da: 'Søde kartofler / yams', name_en: 'Yams/sweet potatoes' },
    { id: '2', name_da: 'Kartofler', name_en: 'Potatoes' },
    { id: '3', name_da: 'Æbler', name_en: 'Apples' },
  ];
  expect(prefixFilter(rows, 'ka').map((r) => r.id)).toEqual(['1', '2']);
  expect(prefixFilter(rows, 'æ').map((r) => r.id)).toEqual(['3']);
  expect(prefixFilter(rows, '').length).toBe(3);
});
