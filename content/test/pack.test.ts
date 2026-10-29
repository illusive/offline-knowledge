import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { after, test } from 'node:test';
import { buildPack, validatePackInput, type PackInput } from '../lib/pack.ts';
import type { RegistrySource } from '../lib/registry.ts';
import type { StorageItem } from '../schema/storage.ts';

const source: RegistrySource = {
  id: 'test-source', status: 'cleared', title: 'Test data', publisher: 'Test', url: 'https://example.org/data.json',
  lang: 'en', license: 'CC0-1.0', attribution: 'Source: test (CC0).', retrievedAt: '2026-10-24',
  snapshot: 'snapshots/test.json', snapshotSha256: 'abc',
};

function item(id: string, en: string, da: string, checked = true): StorageItem {
  return {
    id, category: 'fresh-vegetables',
    names: { en: { name: en }, da: { name: da, checked } },
    keywords: [en.toLowerCase()],
    periods: [{ location: 'fridge', basis: 'fromPurchase', duration: { kind: 'range', min: 1, max: 2, unit: 'weeks' }, sourceField: 'DOP_Refrigerate' }],
    notes: [{ location: 'freezer', lang: 'en', text: 'Blanch before freezing.', sourceField: 'Freeze_Tips', translation: { lang: 'da', text: 'Blancher før indfrysning.', checked: false } }],
    sourceRef: { sourceId: 'test-source', recordId: id },
  };
}

function input(items: StorageItem[], sources: RegistrySource[] = [source]): PackInput {
  return {
    packId: 'core', version: '0.0.1', sources,
    storage: [{ sourceId: 'test-source', sourceDataVersion: '1', generatedFrom: { snapshot: 'snapshots/test.json', sha256: 'abc' }, items }],
  };
}

const dirs: string[] = [];
after(async () => { for (const d of dirs) await rm(d, { recursive: true, force: true }); });

test('validation accepts cleared sources with checked Danish names', () => {
  assert.deepEqual(validatePackInput(input([item('a', 'Cabbage', 'Kål')])), []);
});

test('validation refuses unchecked Danish names, duplicate ids and mismatched snapshots', () => {
  assert.match(validatePackInput(input([item('a', 'Cabbage', 'Kål', false)])).join(), /Danish name not checked/);
  assert.match(validatePackInput(input([item('a', 'Cabbage', 'Kål')], [{ ...source, snapshotSha256: 'other' }])).join(), /different snapshot/);
  assert.match(validatePackInput(input([item('a', 'Cabbage', 'Kål'), item('a', 'Kale', 'Grønkål')])).join(), /duplicate id/);
});

test('validation accepts sources whose licence is not cleared yet (D-028)', () => {
  assert.deepEqual(validatePackInput(input([item('a', 'Cabbage', 'Kål')], [{ ...source, status: 'request-needed', license: 'unknown', attribution: '' }])), []);
});

test('validation refuses notes without a Danish translation', () => {
  const untranslated = item('a', 'Cabbage', 'Kål');
  untranslated.notes = [{ location: 'freezer', lang: 'en', text: 'Blanch before freezing.', sourceField: 'Freeze_Tips' }];
  assert.match(validatePackInput(input([untranslated])).join(), /note without Danish translation/);
});

test('buildPack refuses invalid input and writes nothing', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'pack-'));
  dirs.push(dir);
  await assert.rejects(buildPack(input([item('a', 'Cabbage', 'Kål', false)]), dir), /Pack validation failed/);
  await assert.rejects(readFile(join(dir, 'manifest.json')));
});

test('buildPack writes a pack whose manifest matches the file and whose search handles Danish compounds', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'pack-'));
  dirs.push(dir);
  const manifest = await buildPack(input([item('a', 'Cabbage', 'Kål'), item('b', 'Kale', 'Grønkål'), item('c', 'Blueberries', 'Blåbær')]), dir);

  const bytes = await readFile(join(dir, manifest.file));
  assert.equal(manifest.sizeBytes, bytes.byteLength);
  assert.equal(manifest.sha256, createHash('sha256').update(bytes).digest('hex'));
  assert.deepEqual(manifest.counts, { guides: 0, produceGuides: 0, storageItems: 3, sources: 1 });
  assert.deepEqual(JSON.parse(await readFile(join(dir, 'manifest.json'), 'utf8')), manifest);

  const db = new DatabaseSync(join(dir, manifest.file), { readOnly: true });
  try {
    const search = (q: string) =>
      (db.prepare("SELECT DISTINCT item_id FROM storage_search WHERE storage_search MATCH ? ORDER BY item_id").all(`"${q}"`) as { item_id: string }[]).map((r) => r.item_id);
    assert.deepEqual(search('kål'), ['a', 'b']);       // compound word: Grønkål
    assert.deepEqual(search('kal'), ['a', 'b']);       // å folded to a
    assert.deepEqual(search('blåb'), ['c']);
    assert.deepEqual(search('blueb'), ['c']);          // English name
    // node:sqlite rows have a null prototype; copy them into plain objects to compare.
    assert.deepEqual(db.prepare('SELECT location, kind, min_value, max_value, unit FROM storage_periods WHERE item_id = ?').all('a').map((r) => ({ ...r })),
      [{ location: 'fridge', kind: 'range', min_value: 1, max_value: 2, unit: 'weeks' }]);
    assert.equal((db.prepare('SELECT attribution FROM sources WHERE id = ?').get('test-source') as { attribution: string }).attribution, 'Source: test (CC0).');
    assert.equal((db.prepare("SELECT value FROM meta WHERE key = 'schemaVersion'").get() as { value: string }).value, '12');
    assert.deepEqual({ ...(db.prepare('SELECT text, text_da, text_da_checked FROM storage_notes WHERE item_id = ?').get('a') as object) }, {
      text: 'Blanch before freezing.',
      text_da: 'Blancher før indfrysning.',
      text_da_checked: 0,
    });
  } finally {
    db.close();
  }
});
