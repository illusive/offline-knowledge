/// <reference types="node" />
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { strings } from '../i18n/strings.ts';
import { formatBasis, formatDuration, type PeriodRow } from './format.ts';
import { fold, ftsPhrase, prefixFilter, rankResults } from './search.ts';

const range = (min: number, max: number, unit: PeriodRow['unit']): PeriodRow => ({
  location: 'fridge', basis: 'fromPurchase', kind: 'range', min_value: min, max_value: max, unit,
});

test('formatDuration uses singular, plural and en dash ranges in both languages', () => {
  assert.equal(formatDuration(range(1, 2, 'weeks'), strings.da), '1–2 uger');
  assert.equal(formatDuration(range(1, 1, 'weeks'), strings.da), '1 uge');
  assert.equal(formatDuration(range(3, 3, 'months'), strings.en), '3 months');
  assert.equal(formatDuration(range(1, 1, 'years'), strings.en), '1 year');
  assert.equal(formatDuration({ ...range(0, 0, null), kind: 'notRecommended', min_value: null, max_value: null }, strings.da), 'Anbefales ikke');
});

test('formatBasis never labels an unspecified basis', () => {
  assert.equal(formatBasis(range(1, 2, 'days'), strings.da), 'fra købsdato');
  assert.equal(formatBasis({ ...range(1, 2, 'days'), basis: 'unspecified' }, strings.en), null);
});

test('fold matches the index: case and å folded, æ and ø kept', () => {
  assert.equal(fold('Kål'), 'kal');
  assert.equal(fold('ÆBLER'), 'æbler');
  assert.equal(fold('Rødbeder'), 'rødbeder');
});

test('ftsPhrase quotes user input so FTS operators are not interpreted', () => {
  assert.equal(ftsPhrase(' kål '), '"kål"');
  assert.equal(ftsPhrase('a" OR "b'), '"a"" OR ""b"');
});

test('rankResults puts exact and prefix matches before compound-word matches', () => {
  const rows = [
    { id: '423', name_da: 'Grønkål', name_en: 'Kale' },
    { id: '278', name_da: 'Kål', name_en: 'Cabbage' },
    { id: '494', name_da: 'Kålrabi', name_en: 'Kohlrabi' },
    { id: '277', name_da: 'Rosenkål', name_en: 'Brussels sprouts' },
  ];
  assert.deepEqual(rankResults(rows, 'kål', 'da').map((r) => r.name_da), ['Kål', 'Kålrabi', 'Grønkål', 'Rosenkål']);
  assert.deepEqual(rankResults(rows, 'kale', 'en').map((r) => r.name_en)[0], 'Kale');
});

test('prefixFilter handles short queries by word prefix', () => {
  const rows = [
    { id: '1', name_da: 'Søde kartofler / yams', name_en: 'Yams/sweet potatoes' },
    { id: '2', name_da: 'Kartofler', name_en: 'Potatoes' },
    { id: '3', name_da: 'Æbler', name_en: 'Apples' },
  ];
  assert.deepEqual(prefixFilter(rows, 'ka').map((r) => r.id), ['1', '2']);
  assert.deepEqual(prefixFilter(rows, 'æ').map((r) => r.id), ['3']);
  assert.equal(prefixFilter(rows, '').length, 3);
});
