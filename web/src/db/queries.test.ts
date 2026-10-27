// Runs the app's queries against the real pack (public/pack, from `npm run sync:pack`)
// using the same SQLite WebAssembly build as the app, loaded in memory.

import sqlite3InitModule from '@sqlite.org/sqlite-wasm';
import { readFileSync } from 'node:fs';
import { beforeAll, expect, test } from 'vitest';
import { getGuide, getItemDetail, listGuides, listItems, searchGuides, searchItems, verifyPack, type SqlDb } from './queries';

let db: SqlDb;

beforeAll(async () => {
  const sqlite3 = await sqlite3InitModule();
  const bytes = new Uint8Array(readFileSync(new URL('../../public/pack/core.sqlite', import.meta.url)));
  const memory = new sqlite3.oo1.DB();
  const pointer = sqlite3.wasm.allocFromTypedArray(bytes);
  const rc = sqlite3.capi.sqlite3_deserialize(memory.pointer!, 'main', pointer, bytes.byteLength, bytes.byteLength, sqlite3.capi.SQLITE_DESERIALIZE_FREEONCLOSE);
  memory.checkRc(rc);
  db = memory as unknown as SqlDb;
});

test('the pack passes the launch check', () => {
  expect(() => verifyPack(db)).not.toThrow();
});

test('lists all storage items with Danish and English names', () => {
  const items = listItems(db);
  expect(items).toHaveLength(101);
  expect(items.every((i) => i.name_da && i.name_en)).toBe(true);
});

test('trigram search finds Danish compound words and English names', () => {
  expect(searchItems(db, 'kal').map((r) => r.name_da).sort()).toEqual(['Blomkål', 'Grønkål', 'Kål', 'Kålrabi', 'Kålroer', 'Rosenkål']);
  expect(searchItems(db, 'potato').map((r) => r.name_da).sort()).toEqual(['Kartofler', 'Søde kartofler / yams']);
  expect(searchItems(db, 'a" OR "b')).toEqual([]);
  expect(() => searchItems(db, 'ka')).toThrow(/too short/);
});

test('detail returns periods, notes and source in source order', () => {
  const detail = getItemDetail(db, 'foodkeeper-297'); // Potatoes
  expect(detail?.item.name_da).toBe('Kartofler');
  expect(detail?.periods.map((p) => [p.location, p.basis, p.min_value, p.max_value, p.unit])).toEqual([
    ['pantry', 'fromPurchase', 1, 2, 'months'],
    ['fridge', 'fromPurchase', 1, 2, 'weeks'],
    ['freezer', 'unspecified', 10, 12, 'months'],
  ]);
  expect(detail?.notes.map((n) => n.location)).toEqual(['pantry', 'fridge', 'freezer']);
  expect(detail?.notes[2]).toMatchObject({
    lang: 'en',
    text: 'Freezer timeline applies to cooked and mashed potatoes.',
    text_da: 'Tiden i fryseren gælder kogte kartofler og kartoffelmos.',
  });
  expect(detail?.source.license).toBe('CC0-1.0');
  expect(getItemDetail(db, 'does-not-exist')).toBeNull();
});

test('first aid guides are listed in emergency order; a guide brings its photos, source and checks', () => {
  const guides = listGuides(db, 'first-aid');
  expect(guides[0]?.id).toBe('tre-hovedpunkter');
  expect(guides.map((g) => g.id)).toContain('stabilt-sideleje');

  const guide = getGuide(db, 'stabilt-sideleje');
  const steps = guide?.blocks.find((b) => b.kind === 'steps');
  expect(steps?.kind === 'steps' && steps.items).toHaveLength(6);
  expect(steps?.kind === 'steps' && steps.images.map((i) => i.after)).toEqual([2, 3, 4, 5, 6]);
  expect(guide?.images).toHaveLength(5);
  expect(guide?.images.every((i) => i.mime === 'image/jpeg' && i.data.byteLength > 1000)).toBe(true);
  expect(guide?.source.publisher).toBe('Forsvarets Sanitetskommando, Center for Sundheds- & Sanitetsuddannelse');
  expect(guide?.checks[0]?.source.short_name).toBe('Dansk Råd for Genoplivning');
  expect(guide?.related.map((r) => r.id)).toEqual(['vejrtraekning', 'frie-luftveje', 'hlr-voksne']);
  expect(getGuide(db, 'does-not-exist')).toBeNull();
});

test('guide search finds text inside guides, title matches first; abbreviations come explained', () => {
  const ids = searchGuides(db, 'blødning').map((g) => g.id);
  expect(ids[0]).toBe('massive-bloedninger');
  expect(ids).toContain('mabc'); // matched in the text, not the title
  expect(searchGuides(db, 'opkast').map((g) => g.id)).toContain('frie-luftveje');
  expect(searchGuides(db, 'hjertelungeredning').map((g) => g.id)).toContain('hlr-boern'); // via its abbreviation
  expect(listGuides(db, 'first-aid').find((g) => g.id === 'hlr-boern')?.abbreviations).toEqual([{ short: 'HLR', long: 'hjertelungeredning' }]);
  expect(listGuides(db, 'first-aid').some((g) => g.title.includes('<M>'))).toBe(false);
});

test('growing guides: fixed sections, a link to the food page, and the seed page as a second source', () => {
  expect(listGuides(db, 'growing').map((g) => g.id)).toEqual(['radiser', 'aerter', 'kartofler']);
  const g = getGuide(db, 'aerter');
  expect(g?.guide.food_id).toBe('foodkeeper-273');
  expect(g?.blocks.filter((b) => b.kind === 'section').map((b) => b.kind === 'section' && b.key)).toEqual(['sowing', 'conditions', 'care', 'harvest', 'seeds', 'neighbours']);
  expect(g?.blockSources.map((s) => s.id)).toEqual(['dk-bolius-froe']);
  expect(searchGuides(db, 'jordtemperatur').map((r) => r.id)).toEqual(expect.arrayContaining(['aerter', 'kartofler']));
});

test('lists show where a food keeps longest (not after opening or thawing)', () => {
  const potatoes = listItems(db).find((i) => i.id === 'foodkeeper-297');
  expect(potatoes?.longest).toMatchObject({ location: 'freezer', min_value: 10, max_value: 12, unit: 'months' });
  expect(searchItems(db, 'kartof').find((i) => i.id === 'foodkeeper-297')?.longest?.location).toBe('freezer');
});
