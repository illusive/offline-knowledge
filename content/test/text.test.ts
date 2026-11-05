import assert from 'node:assert/strict';
import { test } from 'node:test';
import { missingQuoteParts, normalize, snapshotBody } from '../lib/text.ts';

test('normalize drops zero-width characters and folds white space', () => {
  assert.equal(normalize(' Hold​  vandet\n koldt '), 'Hold vandet koldt');
});

test('snapshotBody refuses text extracted from another snapshot', () => {
  assert.equal(snapshotBody('# doc sha256 abc\nTekst', 'doc', 'abc'), 'Tekst');
  assert.throws(() => snapshotBody('# doc sha256 abc\nTekst', 'doc', 'other'), /another snapshot/);
});

test('a quote may skip words with " … " and carry [editorial] words', () => {
  const text = 'Store in a cool dry place. Keep away from light. Use within 3 months.';
  assert.deepEqual(missingQuoteParts(text, 'Store in a cool dry place. … Use within 3 months.'), []);
  assert.deepEqual(missingQuoteParts(text, '[Pantry] Store in a cool'), []);
  assert.deepEqual(missingQuoteParts(text, 'Store in a cool dry place. … Use within 6 months.'), ['Use within 6 months.']);
});
