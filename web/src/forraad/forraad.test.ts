import { describe, expect, it } from 'vitest';
import { addMonths, expiring, formatVolume, missing, nextCheck, scaleAmount, waterNeeded, waterTotal, type Recommendation } from './calc';
import { makeBackup, readBackup } from './backupFile';
import { litresIn, parseProduct } from './barcode';
import { matchRecommendation, suggest } from './recommendations';
import { EMPTY, parse, type StoreItem } from './store';

const item = (over: Partial<StoreItem>): StoreItem => ({ id: 'x', name: 'Vand', category: 'water', count: 1, added: '2026-11-01', ...over });

describe('Forråd water', () => {
  it('adds up water containers', () => {
    expect(waterTotal([item({ count: 6, litresEach: 1.5 }), item({ count: 2, litresEach: 5 }), item({ category: 'food', count: 9 })])).toBe(19);
  });

  it('scales the target by people, animals and days', () => {
    expect(waterNeeded({ people: 3, petLitresPerDay: 0, targetDays: 3 }, 3)).toBe(27);
    expect(waterNeeded({ people: 2, petLitresPerDay: 1, targetDays: 7 }, 3)).toBe(49);
    expect(waterNeeded({ people: 2, petLitresPerDay: 0, targetDays: 3 }, null)).toBeNull();
  });

  it('checks again six months after the last check', () => {
    expect(addMonths('2026-08-31', 6)).toBe('2027-02-28');
    expect(nextCheck('2026-05-03', '2026-11-02')).toEqual({ date: '2026-11-03', due: false });
    expect(nextCheck('2026-05-03', '2026-11-03')).toEqual({ date: '2026-11-03', due: true });
    expect(nextCheck(null, '2026-11-03')).toBeNull();
  });

  it('shows litres or US gallons', () => {
    expect(formatVolume(27, 'litres', 'da-DK')).toBe('27 L');
    expect(formatVolume(1.5, 'litres', 'da-DK')).toBe('1,5 L');
    expect(formatVolume(27, 'gallons', 'en-US')).toBe('7.1 gal');
  });
});

describe('Forråd items', () => {
  it('lists expired and soon-expiring items, soonest first', () => {
    const items = [item({ id: 'a', expires: '2026-12-20' }), item({ id: 'b', expires: '2026-10-01' }), item({ id: 'c', expires: '2026-11-10' }), item({ id: 'd' })];
    const { expired, soon } = expiring(items, '2026-11-05');
    expect(expired.map((i) => i.id)).toEqual(['b']);
    expect(soon.map((i) => i.id)).toEqual(['c']);
  });

  it('scales a stock-list amount for one person for three days', () => {
    expect(scaleAmount({ value: 500, unit: 'g', per: 'person3Days' }, { people: 2, petLitresPerDay: 0, targetDays: 7 })).toBeCloseTo(2333.33, 1);
    expect(scaleAmount({ value: 3, unit: 'L', per: 'personDay' }, { people: 2, petLitresPerDay: 0, targetDays: 3 })).toBe(18);
  });

  it('recommends what no item covers, leaving water to the water card', () => {
    const rec = (id: string): Recommendation => ({ id, guideId: 'g', category: 'food', name: id, text: id, keywords: [] });
    const left = missing([rec('vand-3-liter'), rec('knaekbroed'), rec('noedder')], [item({ category: 'food', recommendationId: 'knaekbroed' })]);
    expect(left.map((r) => r.id)).toEqual(['noedder']);
  });
});

describe('Forråd data on the device', () => {
  it('starts empty for missing, damaged or unknown data', () => {
    expect(parse(null)).toEqual(EMPTY);
    expect(parse({ version: 2 })).toEqual(EMPTY);
    expect(parse('nonsense')).toEqual(EMPTY);
  });

  it('keeps valid items and drops broken ones', () => {
    const data = parse({
      version: 1,
      household: { people: 3, petLitresPerDay: -4, targetDays: 5 },
      water: { lastChecked: 'yesterday' },
      items: [
        { id: '1', name: ' Knækbrød ', category: 'food', count: 2.4, expires: '2027-01-01', litresEach: 3 },
        { id: '2', name: '', category: 'food' },
        { id: '3', name: 'Ting', category: 'tools' },
        'bad',
      ],
      products: { '5701234567890': { name: 'Vand' }, abc: { name: 'x' } },
    });
    expect(data.household).toEqual({ people: 3, petLitresPerDay: 0, targetDays: 3 });
    expect(data.water.lastChecked).toBeNull();
    expect(data.items).toHaveLength(1);
    expect(data.items[0]).toMatchObject({ name: 'Knækbrød', count: 2, expires: '2027-01-01' });
    expect(data.items[0]).not.toHaveProperty('litresEach');
    expect(Object.keys(data.products)).toEqual(['5701234567890']);
  });
});

describe('Forråd backup file', () => {
  const storage = (entries: Record<string, string>) => ({
    length: Object.keys(entries).length,
    key: (i: number) => Object.keys(entries)[i] ?? null,
    getItem: (k: string) => entries[k] ?? null,
  });

  it('keeps only the app\'s own keys and reads them back', () => {
    const forraadData = JSON.stringify({ ...EMPTY, items: [item({ id: 'a' }), item({ id: 'b' })] });
    const file = makeBackup(storage({ 'stead.forraad.v1': forraadData, 'stead.bookmarks.v1': '["x"]', other: 'secret' }));
    expect(Object.keys(file.data).sort()).toEqual(['stead.bookmarks.v1', 'stead.forraad.v1']);
    const read = readBackup(JSON.stringify(file));
    expect(read?.itemCount).toBe(2);
    expect(read?.data['stead.bookmarks.v1']).toBe('["x"]');
  });

  it('refuses files that are not a stead backup', () => {
    expect(readBackup('not json')).toBeNull();
    expect(readBackup('{"app":"other","kind":"backup","version":1,"data":{}}')).toBeNull();
    expect(readBackup('{"app":"stead","kind":"backup","version":1,"data":{"evil":"x","stead.a":5}}')).toEqual({ data: {}, itemCount: 0 });
  });
});

describe('Forråd suggestions', () => {
  const rec = (id: string, category: Recommendation['category'], name: string, keywords: string[]): Recommendation => ({ id, guideId: 'g', category, name, text: name, keywords });
  const recs = [rec('konserves-koed-fisk', 'food', 'Dåser med fisk eller kød', ['makrel', 'tun', 'corned beef']), rec('ris', 'food', 'Ris', ['ris', 'jasminris']), rec('batterier', 'other', 'Batterier', ['aa', 'batterier'])];

  it('suggests stock-list lines by keyword and names used before', () => {
    const own = [item({ id: 'o', name: 'Makrel i tomat', category: 'food' })];
    expect(suggest('makr', recs, own).map((x) => `${x.kind}:${x.name}`)).toEqual(['own:Makrel i tomat', 'recommendation:Dåser med fisk eller kød']);
    expect(suggest('m', recs, own)).toEqual([]);
  });

  it('links a typed name to its line within the category', () => {
    expect(matchRecommendation('Makrel i tomat', 'food', recs)?.id).toBe('konserves-koed-fisk');
    expect(matchRecommendation('Corned beef, 340 g', 'food', recs)?.id).toBe('konserves-koed-fisk');
    expect(matchRecommendation('Jasminris', 'food', recs)?.id).toBe('ris');
    expect(matchRecommendation('Makrel i tomat', 'other', recs)).toBeUndefined();
    expect(matchRecommendation('Paraply', 'food', recs)).toBeUndefined();
  });
});

describe('Forråd barcode lookup', () => {
  it('reads a product from Open Food Facts, water with the litres of one bottle', () => {
    expect(parseProduct({ status: 1, product: { product_name: 'Mackerel', product_name_da: 'Makrel i tomat', brands: 'Amanda, Other', quantity: '125 g', categories_tags: ['en:canned-fishes'] } })).toEqual({
      name: 'Makrel i tomat',
      brand: 'Amanda',
      quantity: '125 g',
      category: 'food',
    });
    expect(parseProduct({ status: 1, product: { product_name: 'Kildevand', quantity: '6 x 1,5 l', categories_tags: ['en:beverages', 'en:waters'] } })).toMatchObject({ category: 'water', litresEach: 1.5 });
    expect(parseProduct({ status: 0 })).toBeNull();
    expect(parseProduct({ status: 1, product: { product_name: ' ' } })).toBeNull();
  });

  it('finds litres in a quantity', () => {
    expect(litresIn('50 cl')).toBe(0.5);
    expect(litresIn('500 ml')).toBe(0.5);
    expect(litresIn('5L')).toBe(5);
    expect(litresIn('400 g')).toBeUndefined();
  });
});
