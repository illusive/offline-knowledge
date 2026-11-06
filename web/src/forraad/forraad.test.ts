import { describe, expect, it } from 'vitest';
import { formatMonth, formatVolume } from '../i18n/format';
import { addMonths, expiring, monthsUntil, nextCheck, waterNeeded, type Recommendation } from './calc';
import { applyBackup, makeBackup, readBackup } from './backupFile';
import { acceptCode, cropFor, parseProduct, SAME_CODE_PAUSE_MS, SCAN_FRAME } from './barcode';
import { matchRecommendation, suggest } from './recommendations';
import { EMPTY, findByBarcode, parse, stockMore, withCount, type StoreItem } from './store';

const item = (over: Partial<StoreItem>): StoreItem => ({ id: 'x', name: 'Pasta', category: 'food', count: 1, added: '2026-11-01', ...over });
const rec = (id: string, category: Recommendation['category'], name: string, keywords: string[], products: string[] = []): Recommendation => ({ id, guideId: 'g', category, name, text: name, keywords, products });

describe('Forråd water', () => {
  it('scales the target by people, animals and days', () => {
    expect(waterNeeded({ people: 3, petLitresPerDay: 0, targetDays: 3 }, 3)).toBe(27);
    expect(waterNeeded({ people: 2, petLitresPerDay: 1, targetDays: 7 }, 3)).toBe(49);
    expect(waterNeeded({ people: 2, petLitresPerDay: 0, targetDays: 3 }, null)).toBeNull();
  });

  it('checks again six months after the month of the last check', () => {
    expect(addMonths('2026-08', 6)).toBe('2027-02');
    expect(addMonths('2026-12', 1)).toBe('2027-01');
    expect(nextCheck('2026-05', '2026-10')).toEqual({ month: '2026-11', due: false });
    expect(nextCheck('2026-05', '2026-11')).toEqual({ month: '2026-11', due: true });
    expect(nextCheck(null, '2026-11')).toBeNull();
  });

  it('shows litres or US gallons', () => {
    expect(formatVolume(27, 'litres', 'da')).toBe('27 L');
    expect(formatVolume(1.5, 'litres', 'da')).toBe('1,5 L');
    expect(formatVolume(27, 'gallons', 'en')).toBe('7.1 gal');
  });
});

describe('Forråd months', () => {
  it('counts months across the turn of the year', () => {
    expect(monthsUntil('2027-01', '2026-12')).toBe(1);
    expect(monthsUntil('2026-10', '2026-12')).toBe(-2);
  });

  it('lists expired (before this month) and soon (this or next month), soonest first', () => {
    const items = [item({ id: 'a', expires: '2027-03' }), item({ id: 'b', expires: '2026-11' }), item({ id: 'c', expires: '2027-01' }), item({ id: 'd', expires: '2026-12' }), item({ id: 'e' })];
    const { expired, soon } = expiring(items, '2026-12');
    expect(expired.map((i) => i.id)).toEqual(['b']);
    expect(soon.map((i) => i.id)).toEqual(['d', 'c']);
  });

  it('names a month', () => {
    expect(formatMonth('2027-05', 'da')).toBe('maj 2027');
    expect(formatMonth('2027-05', 'en')).toBe('May 2027');
  });
});

describe('Forråd recommendations', () => {
  const recs = [
    rec('vand-3-liter', 'water', 'Drikkevand', ['vand', 'flaskevand']),
    rec('konserves-koed-fisk', 'food', 'Dåser med fisk eller kød', ['makrel', 'tun', 'corned beef']),
    rec('ris', 'food', 'Ris', ['ris', 'jasminris']),
    rec('foerstehjaelpskasse', 'medicine', 'Førstehjælpskasse', ['plaster', 'forbinding']),
    rec('batterier', 'other', 'Batterier', ['aa', 'batterier']),
  ];

  it('suggests stock-list lines by keyword and names used before, never water', () => {
    const own = [item({ id: 'o', name: 'Makrel i tomat' })];
    expect(suggest('makr', recs, own).map((x) => `${x.kind}:${x.name}`)).toEqual(['own:Makrel i tomat', 'recommendation:Dåser med fisk eller kød']);
    expect(suggest('flaske', recs, own)).toEqual([]);
    expect(suggest('m', recs, own)).toEqual([]);
  });

  it('offers the most specific names first: used before, scanned, listed products, then lines (D-052)', () => {
    const lines = [
      rec('konserves-koed-fisk', 'food', 'Dåser med fisk eller kød', ['makrel', 'tun'], ['Makrel i tomat', 'Makrel i olie', 'Tun i vand']),
      rec('konserves-baelgfrugter', 'food', 'Dåser med bønner eller kikærter', ['kikærter'], ['Kikærter på dåse']),
      rec('vand-3-liter', 'water', 'Drikkevand', ['vand'], ['Vand på flaske']),
    ];
    const own = [item({ id: 'o', name: 'Makrel i olie', recommendationId: 'konserves-koed-fisk' })];
    const scanned = { '5701234567890': { name: 'Makrel, Amanda', quantity: '125 g' } };
    expect(suggest('makr', lines, own, scanned).map((x) => `${x.kind}:${x.name}`)).toEqual([
      'own:Makrel i olie',
      'scanned:Makrel, Amanda',
      'product:Makrel i tomat',
      'recommendation:Dåser med fisk eller kød',
    ]);
    expect(suggest('kik', lines, []).map((x) => x.name)).toEqual(['Kikærter på dåse', 'Dåser med bønner eller kikærter']);
    expect(suggest('vand', lines, []).map((x) => x.name)).toEqual(['Tun i vand']); // not 'Vand på flaske': water is the water card's
    expect(suggest('tun', lines, [], {}, 1).map((x) => x.name)).toEqual(['Tun i vand']);
  });

  it('links a listed product to its own line first', () => {
    const lines = [
      rec('konserves-groentsager', 'food', 'Dåser med tomater eller grøntsager', ['tomater'], ['Tomatsuppe på dåse']),
      rec('konserves-koed-fisk', 'food', 'Dåser med fisk eller kød', ['makrel'], ['Makrel i tomat']),
    ];
    expect(matchRecommendation('Makrel i tomat', null, lines)?.id).toBe('konserves-koed-fisk'); // not the tomato line
    expect(matchRecommendation('makrel i TOMAT', 'food', lines)?.id).toBe('konserves-koed-fisk');
    expect(matchRecommendation('Makrel i tomat', 'other', lines)).toBeUndefined();
  });

  it('guesses the line, and so the category, from a typed name', () => {
    expect(matchRecommendation('Makrel i tomat', null, recs)?.id).toBe('konserves-koed-fisk');
    expect(matchRecommendation('Plaster, store', null, recs)?.category).toBe('medicine');
    expect(matchRecommendation('Corned beef, 340 g', 'food', recs)?.id).toBe('konserves-koed-fisk');
    expect(matchRecommendation('Makrel i tomat', 'other', recs)).toBeUndefined();
    expect(matchRecommendation('Flaskevand', null, recs)).toBeUndefined();
    expect(matchRecommendation('Paraply', null, recs)).toBeUndefined();
  });
});

describe('Forråd data on the device', () => {
  it('starts empty for missing, damaged or unknown data', () => {
    expect(parse(null)).toEqual(EMPTY);
    expect(parse({ version: 3 })).toEqual(EMPTY);
    expect(parse('nonsense')).toEqual(EMPTY);
  });

  it('keeps valid things and drops broken ones', () => {
    const data = parse({
      version: 2,
      household: { people: 3, petLitresPerDay: -4, targetDays: 5 },
      water: { litres: 12.5, lastChecked: 'yesterday' },
      items: [{ id: '1', name: ' Knækbrød ', category: 'food', count: 2.4, expires: '2027-01', size: ' 250 g ' }, { id: '2', name: '', category: 'food' }, { id: '3', name: 'Ting', category: 'tools' }, 'bad'],
      products: { '5701234567890': { name: 'Vand' }, abc: { name: 'x' } },
    });
    expect(data.household).toEqual({ people: 3, petLitresPerDay: 0, targetDays: 3 });
    expect(data.water).toEqual({ litres: 12.5, lastChecked: null });
    expect(data.items).toHaveLength(1);
    expect(data.items[0]).toMatchObject({ name: 'Knækbrød', count: 2, expires: '2027-01', amount: 250, unit: 'g' });
    expect(data.items[0]).not.toHaveProperty('size');
    expect(Object.keys(data.products)).toEqual(['5701234567890']);
  });

  it('turns version 1 water containers into one figure and dates into months', () => {
    const data = parse({
      version: 1,
      household: { people: 2, petLitresPerDay: 0, targetDays: 3 },
      water: { lastChecked: '2026-05-03' },
      items: [
        { id: 'w1', name: 'Kildevand', category: 'water', count: 6, litresEach: 1.5 },
        { id: 'w2', name: 'Dunk', category: 'water', count: 2, litresEach: 5 },
        { id: 'f', name: 'Pasta', category: 'food', count: 1, expires: '2027-02-14' },
      ],
    });
    expect(data.version).toBe(2);
    expect(data.water).toEqual({ litres: 19, lastChecked: '2026-05' });
    expect(data.items.map((i) => i.id)).toEqual(['f']);
    expect(data.items[0]!.expires).toBe('2027-02');
  });
});

describe('Forråd sizes on the device', () => {
  it('keeps a number and a unit, turns readable text into one and leaves the rest as text', () => {
    const items = parse({
      version: 2,
      items: [
        { id: '1', name: 'Mel', category: 'food', amount: 2, unit: 'kg' },
        { id: '2', name: 'Vand', category: 'food', size: '1,5 l' },
        { id: '3', name: 'Sodavand', category: 'food', size: '6 x 1,5 l' },
        { id: '4', name: 'Kiks', category: 'food', size: 'Familiepakke' },
        { id: '5', name: 'Ris', category: 'food', amount: 1, unit: 'sacks' },
      ],
    }).items;
    expect(items[0]).toMatchObject({ amount: 2, unit: 'kg' });
    expect(items[1]).toMatchObject({ amount: 1.5, unit: 'l' });
    expect(items[2]).toMatchObject({ size: '6 x 1,5 l' });
    expect(items[2]).not.toHaveProperty('unit');
    expect(items[3]).toMatchObject({ size: 'Familiepakke' });
    expect(items[4]).not.toHaveProperty('amount');
  });
});

describe('Forråd counts and stocking more', () => {
  it('sets a count from the sheet\'s counter, whole and within 1..9999 (D-054)', () => {
    const tins = item({ count: 3, expires: '2027-05' });
    expect(withCount(tins, 5)).toMatchObject({ count: 5, expires: '2027-05' });
    expect(withCount(tins, 0).count).toBe(1);
    expect(withCount(tins, 2.6).count).toBe(3);
    expect(withCount(tins, 20_000).count).toBe(9999);
  });

  it('stocks more, keeping the earlier month, up to the limit', () => {
    const tins = item({ count: 2, expires: '2027-05' });
    expect(stockMore(tins, 2)).toMatchObject({ count: 4, expires: '2027-05' });
    expect(stockMore(tins, 1, '2027-09').expires).toBe('2027-05');
    expect(stockMore(tins, 1, '2027-02').expires).toBe('2027-02');
    expect(stockMore(item({ count: 1 }), 1, '2028-01').expires).toBe('2028-01');
    expect(stockMore(item({ count: 9998 }), 5).count).toBe(9999);
  });

  it('finds the thing a scanned barcode belongs to (D-053)', () => {
    const items = [item({ id: 'a', name: 'Kiks' }), item({ id: 'b', name: 'Makrel', barcode: '5701234567899' })];
    expect(findByBarcode(items, '5701234567899')?.id).toBe('b');
    expect(findByBarcode(items, '4000000000000')).toBeUndefined();
  });
});

describe('Forråd backup file', () => {
  const storage = (entries: Record<string, string>) => ({
    length: Object.keys(entries).length,
    key: (i: number) => Object.keys(entries)[i] ?? null,
    getItem: (k: string) => entries[k] ?? null,
  });

  it("keeps only the app's own keys and reads them back", () => {
    const forraadData = JSON.stringify({ ...EMPTY, items: [item({ id: 'a' }), item({ id: 'b' })] });
    const file = makeBackup(storage({ 'stead.forraad.v1': forraadData, 'stead.bookmarks.v1': '["x"]', other: 'secret' }));
    expect(Object.keys(file.data).sort()).toEqual(['stead.bookmarks.v1', 'stead.forraad.v1']);
    const read = readBackup(JSON.stringify(file));
    expect(read?.itemCount).toBe(2);
    expect(read?.data['stead.bookmarks.v1']).toBe('["x"]');
  });

  // A storage that holds strings and can be told to fail on a key, like a full localStorage.
  const memory = (entries: Record<string, string>, failOn?: string) => {
    const map = new Map(Object.entries(entries));
    return {
      map,
      get length() {
        return map.size;
      },
      key: (i: number) => [...map.keys()][i] ?? null,
      getItem: (k: string) => map.get(k) ?? null,
      setItem: (k: string, v: string) => {
        if (k === failOn) throw new Error('QuotaExceededError');
        map.set(k, v);
      },
      removeItem: (k: string) => void map.delete(k),
    };
  };

  it('restores all or nothing: a failed write puts the earlier data back', () => {
    const ok = memory({ 'stead.a': 'old', 'stead.gone': 'x', other: 'kept' });
    expect(applyBackup(ok, { 'stead.a': 'new', 'stead.b': 'b' })).toBe(true);
    expect(Object.fromEntries(ok.map)).toEqual({ 'stead.a': 'new', 'stead.b': 'b', other: 'kept' });

    const full = memory({ 'stead.a': 'old', 'stead.gone': 'x' }, 'stead.c');
    expect(applyBackup(full, { 'stead.a': 'new', 'stead.b': 'b', 'stead.c': 'c' })).toBe(false);
    expect(Object.fromEntries(full.map)).toEqual({ 'stead.a': 'old', 'stead.gone': 'x' });
  });

  it('refuses files that are not a stead backup', () => {
    expect(readBackup('not json')).toBeNull();
    expect(readBackup('{"app":"other","kind":"backup","version":1,"data":{}}')).toBeNull();
    expect(readBackup('{"app":"stead","kind":"backup","version":1,"data":{"evil":"x","stead.a":5}}')).toEqual({ data: {}, itemCount: 0 });
  });
});

describe('Forråd scan frame (D-055)', () => {
  it('maps a box in the view to video pixels, with the video covering the view', () => {
    // A portrait view on a taller video: the sides are cut off.
    expect(cropFor(800, 1200, 400, 800, { x: 0.25, y: 0.25, w: 0.5, h: 0.5 }, 0)).toEqual({ x: 250, y: 300, w: 300, h: 600 });
    // A landscape view on a 16:9 video: the top and bottom are cut off.
    expect(cropFor(1920, 1080, 800, 400, { x: 0, y: 0, w: 1, h: 1 }, 0)).toEqual({ x: 0, y: 60, w: 1920, h: 960 });
  });

  it('adds a margin around the frame, but stays inside the video', () => {
    expect(cropFor(1920, 1080, 800, 400, { x: 0, y: 0, w: 1, h: 1 }, 0.1)).toEqual({ x: 0, y: 0, w: 1920, h: 1080 }); // clamped to the video
    const r = cropFor(1080, 1920, 390, 600);
    expect(r.x).toBeGreaterThanOrEqual(0);
    expect(r.x + r.w).toBeLessThanOrEqual(1080);
    expect(r.h).toBeLessThan(1920 * SCAN_FRAME.h * 2);
  });
});

describe('Forråd barcode lookup', () => {
  it('reads name, brand and size from Open Food Facts', () => {
    expect(parseProduct({ status: 1, product: { product_name: 'Mackerel', product_name_da: 'Makrel i tomat', brands: 'Amanda, Other', quantity: '125 g' } })).toEqual({
      name: 'Makrel i tomat',
      brand: 'Amanda',
      quantity: '125 g',
    });
    expect(parseProduct({ status: 1, product: { product_name: 'Ris', quantity: '1 pose', product_quantity: '500', product_quantity_unit: 'g' } })?.quantity).toBe('500 g');
    expect(parseProduct({ status: 1, product: { product_name: 'Vand', quantity: '6 x 1,5 l', product_quantity: 9000, product_quantity_unit: 'ml' } })?.quantity).toBe('6 x 1,5 l');
    expect(parseProduct({ status: 1, product: { product_name: 'Ting', quantity: 'stor' } })?.quantity).toBe('stor');
    expect(parseProduct({ status: 0 })).toBeNull();
    expect(parseProduct({ status: 1, product: { product_name: ' ' } })).toBeNull();
  });

  it('ignores the code just scanned for a moment, but not another code (D-053)', () => {
    const last = { code: '5701234567899', at: 10_000 };
    expect(acceptCode('5701234567899', null, 10_000)).toBe(true);
    expect(acceptCode('5701234567899', last, 10_000 + SAME_CODE_PAUSE_MS - 1)).toBe(false);
    expect(acceptCode('5701234567899', last, 10_000 + SAME_CODE_PAUSE_MS)).toBe(true);
    expect(acceptCode('4000000000000', last, 10_001)).toBe(true);
  });
});
