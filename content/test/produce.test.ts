import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ethyleneProfiles, htmlToText, pdfText, relations, validateGuides } from '../lib/produce.ts';
import type { RegistrySource } from '../lib/registry.ts';
import type { ProduceGuide } from '../schema/produce.ts';

const entries = [
  { name: 'Apple', group: '1B', ethyleneSensitive: false, ethyleneProducer: true },
  { name: 'Carrot', group: '1A', ethyleneSensitive: true, ethyleneProducer: false },
  { name: 'Potato', group: '3', ethyleneSensitive: false, ethyleneProducer: false },
  { name: 'Pumpkin', group: '3', ethyleneSensitive: false, ethyleneProducer: false },
  { name: 'Banana', group: '3', ethyleneSensitive: false, ethyleneProducer: true },
];
const map = { '1': ['Apple'], '2': ['Carrot'], '3': ['Potato'], '4': ['Pumpkin'], '5': ['Banana'], '6': [] };

test('relations: producers apart from sensitive produce; "with" only without a producer mix', () => {
  const rel = relations(ethyleneProfiles(entries, map));
  const find = (a: string, b: string) => rel.find((r) => r.itemId === `foodkeeper-${a}` && r.otherId === `foodkeeper-${b}`)?.relation;
  assert.equal(find('1', '2'), 'apart');      // apple next to carrots
  assert.equal(find('2', '1'), 'apart');
  assert.equal(find('3', '4'), 'with');       // potato with pumpkin (same group, no producers)
  assert.equal(find('3', '5'), undefined);    // potato not "with" banana (producer mix)
  assert.equal(find('3', '1'), undefined);    // different group, no conflict
  assert.equal(rel.some((r) => r.itemId === 'foodkeeper-6'), false); // unmapped food has no relations
});

test('htmlToText decodes named entities and strips scripts', () => {
  assert.equal(htmlToText('<p>Guler&oslash;dder &amp; k&aring;l</p><script>x()</script> <b>5&nbsp;°C</b>'), 'Gulerødder & kål 5 °C');
});

test('htmlToText joins inline elements without a space and separates blocks', () => {
  assert.equal(htmlToText('<p>See <a href="#t1">Table 1</a>. 85&ordm;F</p><td>Hot</td><td>20 min</td>'), 'See Table 1. 85ºF Hot 20 min');
});

test('pdfText drops page markers and printed page numbers, and refuses text from another snapshot', () => {
  const raw = '# doc sha256 abc\n--- p1\n1\nCuring\n--- p2\n2\nstimulates\uFFFDhealing\n';
  assert.equal(pdfText(raw, 'doc', 'abc'), 'Curing stimulates healing');
  assert.throws(() => pdfText(raw, 'doc', 'other'), /another snapshot/);
});

test('validateGuides checks sources, verdicts and HTML quotes', () => {
  const sources = [{ id: 'web', status: 'request-needed', title: 't', publisher: 'p', url: 'u', lang: 'da', license: 'unknown', attribution: '', retrievedAt: '2026-10-25', snapshot: 's.html', snapshotSha256: 'x' }] as RegistrySource[];
  const guide: ProduceGuide = {
    id: 'foodkeeper-1', translationChecked: false,
    sections: [
      { key: 'prefers', blocks: [{ text: 'Mørkt og køligt.', sourceRef: { sourceId: 'web', locator: 'x', quote: 'Opbevar mørkt … og køligt' } }] },
      { key: 'drying', verdict: 'good', blocks: [] },
    ],
  };
  const text = new Map([['web', 'Opbevar mørkt og tørt og køligt Hot Pints 20 min']]);
  assert.deepEqual(validateGuides([guide], new Set(['foodkeeper-1']), sources, text), []);
  // [Bracketed] words are editorial and not matched; visualOnly quotes are not checked at all.
  const table: ProduceGuide = { ...guide, sections: [{ key: 'about', blocks: [{ text: 'x', sourceRef: { sourceId: 'web', locator: 'x', quote: 'Hot [Jar] Pints 20 min' } }, { text: 'y', sourceRef: { sourceId: 'web', locator: 'x', quote: 'In an image', visualOnly: true } }] }] };
  assert.deepEqual(validateGuides([table], new Set(['foodkeeper-1']), sources, text), []);
  const bad: ProduceGuide = { ...guide, sections: [{ key: 'drying', verdict: 'maybe', blocks: [{ text: 'x', sourceRef: { sourceId: 'nope', locator: 'x', quote: 'Not there' } }] }] };
  const problems = validateGuides([bad], new Set(), sources, text).join('\n');
  assert.match(problems, /no storage item/);
  assert.match(problems, /verdict must be one of/);
  assert.match(problems, /not in registry/);
});
