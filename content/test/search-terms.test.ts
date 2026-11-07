import assert from 'node:assert/strict';
import { test } from 'node:test';
import { loadSearchTerms, phrasesByGuide, validateSearchTerms } from '../lib/search-terms.ts';
import { loadGuides } from '../lib/guides.ts';

test('search terms (D-071): every guide exists and each phrase is lower case, trimmed, in one entry only', () => {
  const ids = new Set(['a', 'b']);
  assert.deepEqual(validateSearchTerms([{ phrases: ['kan ikke få luft'], guides: ['a', 'b'] }], ids), []);
  const problems = validateSearchTerms(
    [
      { phrases: ['Bløder', ' røg', 'ab'], guides: ['a', 'x'] },
      { phrases: ['kvælning'], guides: ['a', 'a'] },
      { phrases: ['kvælning'], guides: [] },
    ],
    ids,
  );
  assert.ok(problems.some((p) => p.includes("'Bløder'")));
  assert.ok(problems.some((p) => p.includes("' røg'")));
  assert.ok(problems.some((p) => p.includes("'ab'")));
  assert.ok(problems.some((p) => p.includes("no guide 'x'")));
  assert.ok(problems.some((p) => p.includes('listed twice')));
  assert.ok(problems.some((p) => p.includes("'kvælning' is also in entry 2")));
  assert.ok(problems.some((p) => p.includes('no guides')));
});

test('search terms: the kept list is valid against the guides, and a phrase can lead to several guides', async () => {
  const entries = await loadSearchTerms();
  const guides = await loadGuides();
  assert.deepEqual(validateSearchTerms(entries, new Set(guides.map((g) => g.id))), []);
  const byGuide = phrasesByGuide(entries);
  assert.ok(byGuide.get('frie-luftveje')?.includes('kan ikke få luft'));
  assert.ok(byGuide.get('fremmedlegeme-i-luftvejene')?.includes('kan ikke få luft'));
});
