// The stock lists once had tick boxes (D-040), later driven by Forråd (D-048). Since D-070 the
// guides are for reading and Forråd alone keeps track of what the household has. What remains here
// is the one-time move of ticks kept before D-048 (a list of line ids) into Forråd entries, for a
// phone that still has them; the old key goes afterwards.

import type { Recommendation } from '../forraad/calc';
import { forraad } from '../forraad/store';

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
