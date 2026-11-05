// Barcode lookup (D-047): the one optional online request the app makes on its own. Only the
// barcode is sent, to Open Food Facts (open data, ODbL), and only after the user scans; without a
// connection, or if the product is unknown, the user types the name and the barcode is remembered
// on the device with it. Parsing is pure, for tests.

import { parseSize, SIZE_UNITS, sizeText } from './size';
import type { Product } from './store';

export const OFF_ATTRIBUTION = 'Open Food Facts';
export const OFF_URL = 'https://world.openfoodfacts.org';
const TIMEOUT_MS = 6000;

export type FoundProduct = Product;

export const isBarcode = (code: string) => /^\d{8,14}$/.test(code);

// Scanning goes on until the user is done (D-053), so the pack just added is usually still in
// front of the camera: its code is ignored for a moment after the camera resumes.
export const SAME_CODE_PAUSE_MS = 3000;
export function acceptCode(code: string, last: { code: string; at: number } | null, now: number): boolean {
  return !last || code !== last.code || now - last.at >= SAME_CODE_PAUSE_MS;
}

// Name, brand and size of a product in an Open Food Facts answer; the category is guessed from the
// name in the form, like a typed name.
export function parseProduct(json: unknown): FoundProduct | null {
  if (typeof json !== 'object' || json === null) return null;
  const { status, product } = json as { status?: unknown; product?: Record<string, unknown> };
  if (status !== 1 || typeof product !== 'object' || product === null) return null;
  const text = (x: unknown, max = 200) => (typeof x === 'string' && x.trim() ? x.trim().slice(0, max) : undefined);
  const name = text(product.product_name_da) ?? text(product.product_name);
  if (!name) return null;
  const brand = text(product.brands)?.split(',')[0]?.trim();
  // The size text ("6 x 1,5 l") keeps a multipack; Open Food Facts' own number and unit are the
  // fallback when the text cannot be read (D-050).
  const given = text(product.quantity, 40);
  const n = typeof product.product_quantity === 'string' ? Number(product.product_quantity) : product.product_quantity;
  const unit = SIZE_UNITS.find((u) => u === text(product.product_quantity_unit)?.toLowerCase());
  const quantity = given && parseSize(given) ? given : typeof n === 'number' && n > 0 && unit ? sizeText({ amount: n, unit }) : given;
  return { name, ...(brand ? { brand } : {}), ...(quantity ? { quantity } : {}) };
}

export type Lookup = { kind: 'found'; product: FoundProduct } | { kind: 'notFound' } | { kind: 'offline' };

export async function lookUp(code: string): Promise<Lookup> {
  if (!isBarcode(code)) return { kind: 'notFound' };
  if (!navigator.onLine) return { kind: 'offline' };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const url = `${OFF_URL}/api/v2/product/${code}.json?fields=product_name,product_name_da,brands,quantity,product_quantity,product_quantity_unit`;
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
