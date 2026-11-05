// Barcode lookup (D-047): the one optional online request the app makes on its own. Only the
// barcode is sent, to Open Food Facts (open data, ODbL), and only after the user scans; without a
// connection, or if the product is unknown, the user types the name and the barcode is remembered
// on the device with it. Parsing is pure, for tests.

import type { Category, Product } from './store';

export const OFF_ATTRIBUTION = 'Open Food Facts';
export const OFF_URL = 'https://world.openfoodfacts.org';
const TIMEOUT_MS = 6000;

export interface FoundProduct extends Product {
  category: Category;
  litresEach?: number;
}

export const isBarcode = (code: string) => /^\d{8,14}$/.test(code);

// Litres in a quantity such as "1,5 l", "50 cl", "500 ml" or "6 x 1.5 L" (one bottle's worth).
export function litresIn(quantity: string | undefined): number | undefined {
  const m = quantity ? /(\d+(?:[.,]\d+)?)\s*(l|cl|ml)\b/i.exec(quantity) : null;
  if (!m) return undefined;
  const value = Number(m[1]!.replace(',', '.'));
  const unit = m[2]!.toLowerCase();
  const litres = unit === 'l' ? value : unit === 'cl' ? value / 100 : value / 1000;
  return litres > 0 && litres <= 1000 ? Math.round(litres * 1000) / 1000 : undefined;
}

export function parseProduct(json: unknown): FoundProduct | null {
  if (typeof json !== 'object' || json === null) return null;
  const { status, product } = json as { status?: unknown; product?: Record<string, unknown> };
  if (status !== 1 || typeof product !== 'object' || product === null) return null;
  const text = (x: unknown) => (typeof x === 'string' && x.trim() ? x.trim().slice(0, 200) : undefined);
  const name = text(product.product_name_da) ?? text(product.product_name);
  if (!name) return null;
  const tags = Array.isArray(product.categories_tags) ? product.categories_tags.filter((t): t is string => typeof t === 'string') : [];
  const water = tags.some((t) => t === 'en:waters' || t === 'en:spring-waters' || t === 'en:mineral-waters' || t === 'en:drinking-water');
  const brand = text(product.brands)?.split(',')[0]?.trim();
  const quantity = text(product.quantity);
  return {
    name,
    ...(brand ? { brand } : {}),
    ...(quantity ? { quantity } : {}),
    category: water ? 'water' : 'food',
    ...(water && litresIn(quantity) ? { litresEach: litresIn(quantity) } : {}),
  };
}

export type Lookup = { kind: 'found'; product: FoundProduct } | { kind: 'notFound' } | { kind: 'offline' };

export async function lookUp(code: string): Promise<Lookup> {
  if (!isBarcode(code)) return { kind: 'notFound' };
  if (!navigator.onLine) return { kind: 'offline' };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const url = `${OFF_URL}/api/v2/product/${code}.json?fields=product_name,product_name_da,brands,quantity,categories_tags`;
    const response = await fetch(url, { signal: controller.signal, credentials: 'omit', referrerPolicy: 'no-referrer', cache: 'no-store' });
    if (response.status === 404) return { kind: 'notFound' };
    if (!response.ok) return { kind: 'offline' };
    const product = parseProduct(await response.json());
    return product ? { kind: 'found', product } : { kind: 'notFound' };
  } catch {
    return { kind: 'offline' }; // no connection, timeout or a blocked request
  } finally {
    clearTimeout(timer);
  }
}
