import assert from 'node:assert/strict';
import { test } from 'node:test';
import { validateGuides, verbatimText } from '../lib/guides.ts';
import type { RegistrySource } from '../lib/registry.ts';
import type { Guide } from '../schema/guide.ts';

test('verbatimText joins words broken across lines and drops page markers, page numbers and soft hyphens', () => {
  const raw = '--- p1\nFØRSTEHJÆLPENS ABC\nUnder hele forløbet ydes der første-\nhjælp til den tilska­dekomne.\n1\n--- p2\n Ring 1-1-2\n2';
  assert.equal(verbatimText(raw), 'FØRSTEHJÆLPENS ABC Under hele forløbet ydes der førstehjælp til den tilskadekomne. Ring 1-1-2');
});

test('verbatimText keeps a hyphen before a capital letter (a list dash, not a broken word)', () => {
  assert.equal(verbatimText('-\nTænde AED’en'), '- Tænde AED’en');
});

const source = (id: string): RegistrySource => ({
  id, status: 'request-needed', title: id, publisher: 'P', url: 'https://example.org', lang: 'da', license: 'unknown', attribution: '', retrievedAt: '2026-10-27', snapshot: `snapshots/${id}.pdf`, snapshotSha256: 'x',
});
const sources = [source('main'), source('second')];
const texts = new Map([
  ['main', verbatimText('SKAB SIKKERHED\nDu må aldrig gå på kompromis med din egen sik-\nkerhed. Hvis du kommer til skade, har du forværret situtionanen.\nSituationen kan virke kaotisk.')],
  ['second', verbatimText('Sikr dig, at der ikke er fare for dig selv.')],
]);
const guide = (patch: Partial<Guide> = {}): Guide => ({
  id: 'g', category: 'first-aid', order: 1, title: 'Skab sikkerhed', sourceId: 'main', risk: 'high',
  blocks: [{ kind: 'text', text: 'Du må aldrig gå på kompromis med din egen sikkerhed.', page: 1 }],
  checks: [{ sourceId: 'second', locator: 's. 1', quote: 'Sikr dig, at der ikke er fare for dig selv.', note: 'Agrees.' }],
  ownerChecked: false,
  ...patch,
});

test('validateGuides accepts verbatim text, a title in another case and a recorded correction', () => {
  const g = guide({
    corrections: [{ from: 'situtionanen', to: 'situationen' }],
    blocks: [
      { kind: 'heading', text: 'Skab sikkerhed', page: 1 },
      { kind: 'text', text: 'Hvis du kommer til skade, har du forværret situationen.', page: 1 },
      { kind: 'text', text: 'Situationen kan virke kaotisk.', page: 1 }, // spelled right in the source too
    ],
  });
  assert.deepEqual(validateGuides([g], sources, texts, new Set()), []);
});

test('validateGuides refuses reworded text, a missing second authority and images that do not exist', () => {
  const problems = validateGuides(
    [
      guide({
        blocks: [
          { kind: 'text', text: 'Gå aldrig på kompromis med din sikkerhed.', page: 1 },
          { kind: 'steps', items: ['Du må aldrig gå på kompromis med din egen sikkerhed.'], images: [{ after: 2, file: 'missing.jpg', alt: '', page: 1 }], page: 1 },
        ],
        checks: [],
      }),
    ],
    sources,
    texts,
    new Set(),
  );
  assert.ok(problems.some((p) => p.includes('not verbatim')));
  assert.ok(problems.some((p) => p.includes('no second-authority check')));
  assert.ok(problems.some((p) => p.includes("image 'missing.jpg' not found")));
  assert.ok(problems.some((p) => p.includes('needs alt text')));
  assert.ok(problems.some((p) => p.includes('after step 2, which does not exist')));
});

test('validateGuides refuses a second-authority quote that is not in that source', () => {
  const problems = validateGuides([guide({ checks: [{ sourceId: 'second', locator: 's. 1', quote: 'Sikr dig altid.', note: 'x' }] })], sources, texts, new Set());
  assert.ok(problems.some((p) => p.includes('quote not found in second')));
});

test('growing guides: low risk needs no second authority; a block may quote another source, checked there', () => {
  const g = guide({
    id: 'radiser', category: 'growing', risk: 'low', checks: [], name: 'Radiser',
    blocks: [
      { kind: 'section', key: 'sowing', page: 1 },
      { kind: 'text', text: 'Sikr dig, at der ikke er fare for dig selv.', page: 1, sourceId: 'second' },
    ],
  });
  assert.deepEqual(validateGuides([g], sources, texts, new Set()), []);
  const wrong = guide({ id: 'x', category: 'growing', risk: 'low', checks: [], name: 'X', blocks: [{ kind: 'text', text: 'Sikr dig, at der ikke er fare for dig selv.', page: 1 }] });
  assert.ok(validateGuides([wrong], sources, texts, new Set()).some((p) => p.includes('not verbatim in main')));
  const firstAidMix = guide({ blocks: [{ kind: 'text', text: 'Sikr dig, at der ikke er fare for dig selv.', page: 1, sourceId: 'second' }] });
  assert.ok(validateGuides([firstAidMix], sources, texts, new Set()).some((p) => p.includes('from one source')));
});

test('preparedness: a group is required, checklist lines are checked verbatim, checklist ids are unique across guides', () => {
  const list = (id: string, itemId: string, text: string) =>
    guide({ id, category: 'preparedness', risk: 'low', checks: [], group: 'supplies', blocks: [{ kind: 'checklist', items: [{ id: itemId, text }], page: 1 }] });
  assert.deepEqual(validateGuides([list('a', 'knaekbroed', 'Du må aldrig gå på kompromis med din egen sikkerhed.')], sources, texts, new Set()), []);
  const problems = validateGuides(
    [list('b', 'same-id', 'Ikke i kilden.'), list('c', 'same-id', 'Du må aldrig gå på kompromis med din egen sikkerhed.'), guide({ id: 'd', category: 'preparedness', risk: 'low', checks: [] })],
    sources, texts, new Set(),
  );
  assert.ok(problems.some((p) => p.includes('not verbatim')));
  assert.ok(problems.some((p) => p.includes("'same-id' is used twice")));
  assert.ok(problems.some((p) => p.includes('need a group')));
});

test('a high-risk preparedness guide still needs a second authority', () => {
  const g = guide({ id: 'e', category: 'preparedness', risk: 'high', group: 'situation', checks: [] });
  assert.ok(validateGuides([g], sources, texts, new Set()).some((p) => p.includes('no second-authority check')));
});
