// What the stock lists recommend (D-046): read from the four stock-list guides in the pack, so the
// tracker's suggestions and amounts are the sourced ones. Also the name suggestions while typing.

import { useEffect, useState } from 'react';
import type { DbClient } from '../db/client';
import { fold } from '../food/search';
import { GUIDE_CATEGORY, WATER_PER_PERSON_ID, type Recommendation } from './calc';
import type { Category, Product, StoreItem } from './store';
import { migrateLegacyTicks } from '../supplies/checklist';

export interface StockLists {
  recommendations: Recommendation[];
  guideTitles: Record<string, string>;
  litresPerPersonDay: number | null;
}

let loading: Promise<StockLists> | null = null;

async function load(db: DbClient): Promise<StockLists> {
  const recommendations: Recommendation[] = [];
  const guideTitles: Record<string, string> = {};
  for (const [guideId, category] of Object.entries(GUIDE_CATEGORY)) {
    const detail = await db.call({ type: 'guide', id: guideId });
    if (!detail) continue;
    guideTitles[guideId] = detail.guide.name ?? detail.guide.title;
    for (const block of detail.blocks) {
      if (block.kind !== 'checklist') continue;
      for (const item of block.items) {
        recommendations.push({ id: item.id, guideId, category, name: item.name ?? item.text, text: item.text, amount: item.amount, keywords: item.keywords ?? [], products: item.products ?? [] });
      }
    }
  }
  const water = recommendations.find((r) => r.id === WATER_PER_PERSON_ID)?.amount;
  return { recommendations, guideTitles, litresPerPersonDay: water?.unit === 'L' && water.per === 'personDay' ? water.value : null };
}

export function useStockLists(db: DbClient | null): StockLists | null {
  const [lists, setLists] = useState<StockLists | null>(null);
  useEffect(() => {
    if (!db) return;
    let live = true;
    loading ??= load(db).then((lists) => {
      migrateLegacyTicks(lists.recommendations);
      return lists;
    });
    loading.then(
      (l) => live && setLists(l),
      () => {
        loading = null; // try again next time
      },
    );
    return () => {
      live = false;
    };
  }, [db]);
  return lists;
}

type Line = Recommendation & { category: Category };

export type Suggestion =
  | { kind: 'own'; name: string; category: Category; item: StoreItem }
  | { kind: 'scanned'; name: string; barcode: string; product: Product }
  | { kind: 'product'; name: string; category: Category; recommendation: Line }
  | { kind: 'recommendation'; name: string; category: Category; recommendation: Line };

// Suggestions for the name field (D-052), most specific first: names the user has used before,
// products they have scanned, common goods from the stock lists ("Makrel i tomat"), and last the
// stock-list lines themselves ("Dåser med fisk eller kød"). A suggestion matches when a word of it
// starts with the query; each name is offered once. Free text is always allowed; this only helps.
export function suggest(query: string, recommendations: Recommendation[], items: StoreItem[], products: Record<string, Product> = {}, limit = 6): Suggestion[] {
  const q = fold(query.trim());
  if (q.length < 2) return [];
  const startsWord = (text: string) => fold(text).split(/[\s,()–-]+/).some((w) => w.startsWith(q)) || fold(text).startsWith(q);
  const lines = recommendations.filter((r): r is Line => r.category !== 'water');
  const found: Suggestion[] = [];
  const seen = new Set<string>();
  const add = (s: Suggestion) => {
    const key = fold(s.name);
    if (seen.has(key)) return;
    seen.add(key);
    found.push(s);
  };
  for (const item of [...items].reverse()) if (startsWord(item.name)) add({ kind: 'own', name: item.name, category: item.category, item });
  for (const [barcode, product] of Object.entries(products)) if (startsWord(product.name)) add({ kind: 'scanned', name: product.name, barcode, product });
  for (const r of lines) for (const p of r.products) if (startsWord(p)) add({ kind: 'product', name: p, category: r.category, recommendation: r });
  for (const r of lines) if (startsWord(r.name) || r.keywords.some(startsWord)) add({ kind: 'recommendation', name: r.name, category: r.category, recommendation: r });
  return found.slice(0, limit);
}

// The stock-list line a typed name belongs to: a listed product of the line, or else a keyword or
// the line's name that starts one of its words ("Makrel i tomat" → canned fish or meat). Within a category when one is given, else in any
// (which also guesses the category of a new thing). Water lines are left to the water card.
export function matchRecommendation(name: string, category: Category | null, recommendations: Recommendation[]): (Recommendation & { category: Category }) | undefined {
  const folded = fold(name.trim());
  if (folded.length < 3) return undefined;
  // A listed product names its line exactly (D-052): "Kikærter på dåse" is the bean line.
  const fits = (r: Recommendation): r is Line => r.category !== 'water' && (category === null || r.category === category);
  const listed = recommendations.find((r) => fits(r) && r.products.some((p) => fold(p) === folded));
  if (listed && fits(listed)) return listed;
  const words = folded.split(/[\s,()–-]+/).filter(Boolean);
  const hits = (term: string) => {
    const k = fold(term);
    return k.includes(' ') ? folded.includes(k) : words.some((w) => w.startsWith(k));
  };
  return recommendations.find(
    (r): r is Recommendation & { category: Category } =>
      r.category !== 'water' && (category === null || r.category === category) && (hits(r.name) || r.keywords.some((k) => k.length >= 3 && hits(k))),
  );
}
