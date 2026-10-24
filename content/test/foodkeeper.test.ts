import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mapNotes, mapPeriods, mapProduce, parseDuration, type FoodKeeperExport } from '../lib/foodkeeper.ts';

test('parseDuration maps numeric ranges and normalises units', () => {
  assert.deepEqual(parseDuration(3, 5, 'Days', 'x'), { kind: 'range', min: 3, max: 5, unit: 'days' });
  assert.deepEqual(parseDuration(1, 1, 'Year', 'x'), { kind: 'range', min: 1, max: 1, unit: 'years' });
  assert.deepEqual(parseDuration(6, null, 'Months', 'x'), { kind: 'range', min: 6, max: 6, unit: 'months' });
});

test('parseDuration maps the non-numeric metrics', () => {
  assert.deepEqual(parseDuration(null, null, 'Not Recommended', 'x'), { kind: 'notRecommended' });
  assert.deepEqual(parseDuration(null, null, 'When Ripe', 'x'), { kind: 'untilRipe' });
  assert.deepEqual(parseDuration(null, null, 'Indefinitely', 'x'), { kind: 'indefinitely' });
  assert.deepEqual(parseDuration(null, null, 'Package use-by date', 'x'), { kind: 'packageUseByDate' });
});

test('parseDuration returns undefined for empty fields and rejects inconsistent data', () => {
  assert.equal(parseDuration(null, null, null, 'x'), undefined);
  assert.throws(() => parseDuration(2, 3, null, 'x'), /number without metric/);
  assert.throws(() => parseDuration(1, 2, 'Fortnights', 'x'), /unknown metric/);
  assert.throws(() => parseDuration(null, null, 'Weeks', 'x'), /without numbers/);
  assert.throws(() => parseDuration(5, 2, 'Days', 'x'), /min 5 > max 2/);
});

test('mapPeriods keeps purchase-based and unqualified times apart', () => {
  const periods = mapPeriods(
    {
      DOP_Refrigerate_Min: 4, DOP_Refrigerate_Max: 6, DOP_Refrigerate_Metric: 'Weeks',
      Freeze_Min: 8, Freeze_Max: 8, Freeze_Metric: 'Months',
    },
    'test',
  );
  assert.deepEqual(periods, [
    { location: 'fridge', basis: 'fromPurchase', duration: { kind: 'range', min: 4, max: 6, unit: 'weeks' }, sourceField: 'DOP_Refrigerate' },
    { location: 'freezer', basis: 'unspecified', duration: { kind: 'range', min: 8, max: 8, unit: 'months' }, sourceField: 'Freeze' },
  ]);
});

test('mapNotes keeps location notes even when the location has no storage time', () => {
  // Shape taken from FoodKeeper 506 (Cilantro): freezer note, no freezer time.
  const product = { Pantry_Min: 1, Pantry_Max: 2, Pantry_Metric: 'Weeks', Freeze_Tips: 'Freeze damage will appear.' };
  assert.deepEqual(mapPeriods(product, 'test').map((p) => p.location), ['pantry']);
  assert.deepEqual(mapNotes(product), [{ location: 'freezer', lang: 'en', text: 'Freeze damage will appear.', sourceField: 'Freeze_Tips' }]);
});

test('mapProduce selects only fresh produce and attaches Danish names', () => {
  const data: FoodKeeperExport = {
    sheets: [
      {
        name: 'Category',
        data: [
          [{ ID: 18 }, { Category_Name: 'Produce' }, { Subcategory_Name: 'Fresh Fruits' }],
          [{ ID: 5 }, { Category_Name: 'Dairy Products & Eggs' }, { Subcategory_Name: null }],
        ],
      },
      {
        name: 'Product',
        data: [
          [{ ID: 248 }, { Category_ID: 18 }, { Name: 'Apples' }, { Name_subtitle: null }, { Keywords: 'Apples,apple' },
            { DOP_Pantry_Min: 3 }, { DOP_Pantry_Max: 3 }, { DOP_Pantry_Metric: 'Weeks' }],
          [{ ID: 1 }, { Category_ID: 5 }, { Name: 'Butter' }, { Keywords: 'Butter' }],
        ],
      },
    ],
  };
  const items = mapProduce(data, { '248': { en: 'Apples', name: 'Æbler', checked: false } });
  assert.equal(items.length, 1);
  assert.deepEqual(items[0], {
    id: 'foodkeeper-248',
    category: 'fresh-fruits',
    names: { en: { name: 'Apples' }, da: { name: 'Æbler', checked: false } },
    keywords: ['Apples', 'apple'],
    periods: [{ location: 'pantry', basis: 'fromPurchase', duration: { kind: 'range', min: 3, max: 3, unit: 'weeks' }, sourceField: 'DOP_Pantry' }],
    notes: [],
    sourceRef: { sourceId: 'us-fsis-foodkeeper', recordId: '248' },
  });
  assert.throws(() => mapProduce(data, { '248': { en: 'Apricots', name: 'Abrikoser', checked: false } }), /source says "Apples"/);
});
