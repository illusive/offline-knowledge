// The stock lists' ticks (D-040), driven by Forråd (D-048): Forråd is the one record of what the
// household has. A line is ticked when something in Forråd counts as it. Ticking a line adds a
// plain entry for it to Forråd (marked as added from the list); unticking removes only such entries,
// so things the user entered themselves are never deleted from here. The water lines follow the
// water in Forråd and are changed there. The line on water for animals is a reminder only: the app
// keeps no figure for animals (D-063).

import { useCallback } from 'react';
import type { ChecklistItem } from '../db/queries';
import { GUIDE_CATEGORY, waterNeeded, WATER_PER_PERSON_ID, type Recommendation } from '../forraad/calc';
import { forraad, useForraad, type Category, type ForraadData, type StoreItem } from '../forraad/store';

export const PET_WATER_ID = 'vand-husdyr';
const WATER_LINES = new Set([WATER_PER_PERSON_ID, PET_WATER_ID]);

export type LineState =
  | { kind: 'water'; on: boolean } // shown from the water figure; changed in Forråd
  | { kind: 'item'; on: boolean; own: StoreItem[] } // own: things the user entered that count as it
  | { kind: 'note'; on: false }; // a reminder with no box (D-063)

export function lineState(item: ChecklistItem, data: ForraadData): LineState {
  if (WATER_LINES.has(item.id)) {
    if (item.id === PET_WATER_ID) return { kind: 'note', on: false };
    const need = item.amount?.unit === 'L' && item.amount.per === 'personDay' ? waterNeeded(data.household, item.amount.value) : null;
    return { kind: 'water', on: need !== null && need > 0 && data.water.litres >= need };
  }
  const covering = data.items.filter((i) => i.recommendationId === item.id);
  return { kind: 'item', on: covering.length > 0, own: covering.filter((i) => !i.viaChecklist) };
}

// The category a stock list's things go under in Forråd, or null for the water list.
export function categoryOfList(guideId: string): Category | null {
  const c = GUIDE_CATEGORY[guideId];
  return c && c !== 'water' ? c : null;
}

export function useChecklist(guideId: string) {
  const data = useForraad();
  const category = categoryOfList(guideId);
  const state = useCallback((item: ChecklistItem) => lineState(item, data), [data]);
  const toggle = useCallback(
    (item: ChecklistItem) => {
      if (!category || WATER_LINES.has(item.id)) return;
      const added = data.items.filter((i) => i.recommendationId === item.id && i.viaChecklist);
      if (added.length > 0) for (const i of added) forraad.removeItem(i.id);
      else if (!data.items.some((i) => i.recommendationId === item.id)) {
        forraad.saveItem({ name: item.name ?? item.text, category, count: 1, recommendationId: item.id, viaChecklist: true });
      }
    },
    [data, category],
  );
  return { state, toggle };
}

// Ticks kept before D-048 (a list of line ids) become Forråd entries once, then the old key goes.
const LEGACY_KEY = 'stead.supplies.v1';

export function migrateLegacyTicks(recommendations: Recommendation[]) {
  let ids: unknown;
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    if (raw === null) return;
    ids = JSON.parse(raw);
  } catch {
    return;
  }
  const covered = new Set(forraad.get().items.map((i) => i.recommendationId));
  for (const id of Array.isArray(ids) ? ids : []) {
    const rec = recommendations.find((r) => r.id === id);
    if (!rec || rec.category === 'water' || covered.has(rec.id)) continue;
    forraad.saveItem({ name: rec.name, category: rec.category, count: 1, recommendationId: rec.id, viaChecklist: true });
    covered.add(rec.id);
  }
  try {
    localStorage.removeItem(LEGACY_KEY);
  } catch {
    // Storage blocked: tried again next time; already-covered lines are skipped.
  }
}
