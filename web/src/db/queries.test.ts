// Runs the app's queries against the real pack (public/pack, from `npm run sync:pack`)
// using the same SQLite WebAssembly build as the app, loaded in memory.

import sqlite3InitModule from '@sqlite.org/sqlite-wasm';
import { readFileSync } from 'node:fs';
import { beforeAll, expect, test } from 'vitest';
import { getItemDetail, listItems, searchItems, verifyPack, type SqlDb } from './queries';

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
  expect(detail?.source.license).toBe('CC0-1.0');
  expect(getItemDetail(db, 'does-not-exist')).toBeNull();
});
