// Forråd (D-046): the household's own stores, kept on the device only (localStorage), in one
// versioned object. parse() accepts anything and returns valid data, so damaged or older data never
// breaks the screen; unknown fields are dropped. Version 2 (owner, 2026-11-05): water is one figure
// with the month it was last checked; things have an optional size and a month/year date.

import { thisMonth, today } from '../i18n/format';
import { createLocalStore } from '../lib/localStore';

export const CATEGORIES = ['food', 'medicine', 'other'] as const;
export type Category = (typeof CATEGORIES)[number];
export const TARGET_DAYS = [3, 7, 14] as const;
export type TargetDays = (typeof TARGET_DAYS)[number];

export interface StoreItem {
  id: string;
  name: string;
  category: Category;
  count: number;
  size?: string; // free text, e.g. "400 g"
  expires?: string; // best before, month precision: yyyy-mm
  recommendationId?: string; // the stock-list item it covers (D-040 checklist id)
  viaChecklist?: true; // added by ticking the stock list (D-048); unticking removes only these
  barcode?: string;
  added: string; // yyyy-mm-dd
}

export interface Household {
  people: number;
  petLitresPerDay: number; // the user's own figure: the sources give no amount for animals
  targetDays: TargetDays;
}

export interface Product {
  name: string;
  brand?: string;
  quantity?: string;
}

export interface Water {
  litres: number;
  lastChecked: string | null; // yyyy-mm
}

export interface ForraadData {
  version: 2;
  household: Household;
  water: Water;
  items: StoreItem[];
  products: Record<string, Product>; // barcode → product, remembered after a lookup or typed once
}

export const KEY = 'stead.forraad.v1';

export const EMPTY: ForraadData = {
  version: 2,
  household: { people: 1, petLitresPerDay: 0, targetDays: 3 },
  water: { litres: 0, lastChecked: null },
  items: [],
  products: {},
};

const isDay = (x: unknown): x is string => typeof x === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(x);
// A month (yyyy-mm); version 1 stored full dates, which are cut to their month.
const toMonth = (x: unknown): string | undefined => (typeof x === 'string' && /^\d{4}-(0[1-9]|1[0-2])(-\d{2})?$/.test(x) ? x.slice(0, 7) : undefined);
const isObject = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null && !Array.isArray(x);
const str = (x: unknown, max = 200): string | undefined => (typeof x === 'string' && x.trim() ? x.trim().slice(0, max) : undefined);
const num = (x: unknown, min: number, max: number): number | undefined =>
  typeof x === 'number' && Number.isFinite(x) ? Math.min(max, Math.max(min, x)) : undefined;

function parseItem(x: unknown): StoreItem | null {
  if (!isObject(x)) return null;
  const id = str(x.id, 64);
  const name = str(x.name);
  const category = CATEGORIES.find((c) => c === x.category);
  if (!id || !name || !category) return null;
  const item: StoreItem = { id, name, category, count: Math.round(num(x.count, 1, 9999) ?? 1), added: isDay(x.added) ? x.added : today() };
  const size = str(x.size, 40);
  if (size) item.size = size;
  const expires = toMonth(x.expires);
  if (expires) item.expires = expires;
  const rec = str(x.recommendationId, 64);
  if (rec) item.recommendationId = rec;
  const barcode = str(x.barcode, 32);
  if (barcode) item.barcode = barcode;
  if (x.viaChecklist === true && item.recommendationId) item.viaChecklist = true;
  return item;
}

export function parse(raw: unknown): ForraadData {
  if (!isObject(raw) || (raw.version !== 1 && raw.version !== 2)) return structuredClone(EMPTY);
  const h = isObject(raw.household) ? raw.household : {};
  const household: Household = {
    people: Math.round(num(h.people, 0, 50) ?? EMPTY.household.people),
    petLitresPerDay: num(h.petLitresPerDay, 0, 100) ?? 0,
    targetDays: TARGET_DAYS.find((d) => d === h.targetDays) ?? EMPTY.household.targetDays,
  };
  const w = isObject(raw.water) ? raw.water : {};
  const rawItems = Array.isArray(raw.items) ? raw.items : [];
  // Version 1 kept water as containers among the things; they become the one water figure.
  const v1Water = raw.version === 1 ? rawItems.filter((i) => isObject(i) && i.category === 'water') : [];
  const v1Litres = v1Water.reduce<number>((sum, i) => sum + (num((i as Record<string, unknown>).count, 1, 9999) ?? 1) * (num((i as Record<string, unknown>).litresEach, 0, 1000) ?? 0), 0);
  const water: Water = {
    litres: Math.round((raw.version === 1 ? v1Litres : (num(w.litres, 0, 100_000) ?? 0)) * 100) / 100,
    lastChecked: toMonth(w.lastChecked) ?? null,
  };
  const items = rawItems.map(parseItem).filter((i): i is StoreItem => i !== null);
  const products: Record<string, Product> = {};
  if (isObject(raw.products)) {
    for (const [code, p] of Object.entries(raw.products)) {
      if (!/^\d{6,14}$/.test(code) || !isObject(p)) continue;
      const name = str(p.name);
      if (!name) continue;
      products[code] = { name, ...(str(p.brand) ? { brand: str(p.brand) } : {}), ...(str(p.quantity, 40) ? { quantity: str(p.quantity, 40) } : {}) };
    }
  }
  return { version: 2, household, water, items, products };
}

const store = createLocalStore<ForraadData>({ key: KEY, parse });

export const useForraad = store.use;

const update = store.update;

export const forraad = {
  get: store.get,
  setHousehold: (household: Household) => update((d) => ({ ...d, household })),
  setWater: (water: Water) => update((d) => ({ ...d, water })),
  checkWater: (month = thisMonth()) => update((d) => ({ ...d, water: { ...d.water, lastChecked: month } })),
  saveItem: (item: Omit<StoreItem, 'id' | 'added'> & { id?: string; added?: string }) =>
    update((d) => {
      const saved: StoreItem = { ...item, id: item.id ?? crypto.randomUUID(), added: item.added ?? today() };
      const exists = d.items.some((i) => i.id === saved.id);
      return { ...d, items: exists ? d.items.map((i) => (i.id === saved.id ? saved : i)) : [...d.items, saved] };
    }),
  removeItem: (id: string) => update((d) => ({ ...d, items: d.items.filter((i) => i.id !== id) })),
  rememberProduct: (barcode: string, product: Product) => update((d) => ({ ...d, products: { ...d.products, [barcode]: product } })),
};
