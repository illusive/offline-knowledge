import assert from 'node:assert/strict';
import { test } from 'node:test';
import { loadRegistry, readSnapshot } from '../lib/registry.ts';

test('the registry: unique ids, and every snapshot matches its recorded checksum', async () => {
  const sources = await loadRegistry();
  const ids = sources.map((s) => s.id);
  assert.equal(new Set(ids).size, ids.length, 'a source id is used twice');
  for (const source of sources) {
    assert.ok(source.title.trim() && source.publisher.trim() && source.url.startsWith('http'), `${source.id}: title, publisher and url are required`);
    if (source.snapshot) await readSnapshot(source); // throws on a checksum mismatch
  }
});
