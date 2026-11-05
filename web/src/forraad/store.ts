// Forråd (D-046): the household's own stores, kept on the device only (localStorage), in one
// versioned object. parse() accepts anything and returns valid data, so damaged or older data never
// breaks the screen; unknown fields are dropped.

import { useSyncExternalStore } from 'react';

export const CATEGORIES = ['water', 'food', 'medicine', 'other'] as const;
export type Category = (typeof CATEGORIES)[number];
export const TARGET_DAYS = [3, 7, 14] as const;
export type TargetDays = (typeof TARGET_DAYS)[number];

export interface StoreItem {
  id: string;
  name: string;
  category: Category;
  count: number;
  litresEach?: number; // water only: litres in one unit
  expires?: string; // ISO date (yyyy-mm-dd)
  recommendationId?: string; // the stock-list item it covers (D-040 checklist id)
  barcode?: string;
  added: string; // ISO date
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

export interface ForraadData {
  version: 1;
  household: Household;
  water: { lastChecked: string | null };
  items: StoreItem[];
  products: Record<string, Product>; // barcode → product, remembered after a lookup or typed once
}

export const KEY = 'stead.forraad.v1';
const CHANGED = 'stead-forraad-changed';

export const EMPTY: ForraadData = {
  version: 1,
  household: { people: 1, petLitresPerDay: 0, targetDays: 3 },
  water: { lastChecked: null },
  items: [],
  products: {},
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const isDate = (x: unknown): x is string => typeof x === 'string' && ISO_DATE.test(x);
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
  const item: StoreItem = { id, name, category, count: Math.round(num(x.count, 1, 9999) ?? 1), added: isDate(x.added) ? x.added : today() };
  const litres = num(x.litresEach, 0, 1000);
  if (category === 'water' && litres) item.litresEach = litres;
  if (isDate(x.expires)) item.expires = x.expires;
  const rec = str(x.recommendationId, 64);
  if (rec) item.recommendationId = rec;
  const barcode = str(x.barcode, 32);
  if (barcode) item.barcode = barcode;
  return item;
}

export function parse(raw: unknown): ForraadData {
  if (!isObject(raw) || raw.version !== 1) return structuredClone(EMPTY);
  const h = isObject(raw.household) ? raw.household : {};
  const household: Household = {
    people: Math.round(num(h.people, 0, 50) ?? EMPTY.household.people),
    petLitresPerDay: num(h.petLitresPerDay, 0, 100) ?? 0,
    targetDays: TARGET_DAYS.find((d) => d === h.targetDays) ?? EMPTY.household.targetDays,
  };
  const w = isObject(raw.water) ? raw.water : {};
  const items = Array.isArray(raw.items) ? raw.items.map(parseItem).filter((i): i is StoreItem => i !== null) : [];
  const products: Record<string, Product> = {};
  if (isObject(raw.products)) {
    for (const [code, p] of Object.entries(raw.products)) {
      if (!/^\d{6,14}$/.test(code) || !isObject(p)) continue;
      const name = str(p.name);
      if (!name) continue;
      products[code] = { name, ...(str(p.brand) ? { brand: str(p.brand) } : {}), ...(str(p.quantity, 40) ? { quantity: str(p.quantity, 40) } : {}) };
    }
  }
  return { version: 1, household, water: { lastChecked: isDate(w.lastChecked) ? w.lastChecked : null }, items, products };
}

// Today's date on the device, as yyyy-mm-dd (local time, not UTC).
export function today(now = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function read(): ForraadData {
  try {
    const raw = localStorage.getItem(KEY);
    return raw === null ? structuredClone(EMPTY) : parse(JSON.parse(raw));
  } catch {
    return structuredClone(EMPTY);
  }
}

let cache: ForraadData | null = null;
const snapshot = () => (cache ??= read());

function subscribe(onChange: () => void) {
  const update = () => {
    cache = read();
    onChange();
  };
  window.addEventListener(CHANGED, onChange);
  window.addEventListener('storage', update);
  return () => {
    window.removeEventListener(CHANGED, onChange);
    window.removeEventListener('storage', update);
  };
}

function write(next: ForraadData) {
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Private mode or full storage: kept until the app closes.
  }
  cache = next;
  window.dispatchEvent(new Event(CHANGED));
}

function update(change: (data: ForraadData) => ForraadData) {
  write(change(snapshot()));
}

export function useForraad(): ForraadData {
  return useSyncExternalStore(subscribe, snapshot);
}

export const forraad = {
  setHousehold: (household: Household) => update((d) => ({ ...d, household })),
  checkWater: (date = today()) => update((d) => ({ ...d, water: { lastChecked: date } })),
  saveItem: (item: Omit<StoreItem, 'id' | 'added'> & { id?: string; added?: string }) =>
    update((d) => {
      const saved: StoreItem = { ...item, id: item.id ?? crypto.randomUUID(), added: item.added ?? today() };
      const exists = d.items.some((i) => i.id === saved.id);
      return { ...d, items: exists ? d.items.map((i) => (i.id === saved.id ? saved : i)) : [...d.items, saved] };
    }),
  removeItem: (id: string) => update((d) => ({ ...d, items: d.items.filter((i) => i.id !== id) })),
  rememberProduct: (barcode: string, product: Product) => update((d) => ({ ...d, products: { ...d.products, [barcode]: product } })),
  replaceAll: (data: ForraadData) => write(parse(data)),
};
