// The groups that divide Opbevaring and Dyrkning into headed sections (D-057): one order for the
// whole app. Meat and fish are defined for foods to come; a group with nothing in it is not shown.

import type { GuideRow, ItemRow } from '../db/queries';

export const FOOD_GROUPS = ['fruit', 'vegetables', 'herbs', 'meat', 'fish'] as const;
export type FoodGroup = (typeof FOOD_GROUPS)[number];

const OF_CATEGORY: Record<ItemRow['category'], FoodGroup> = {
  'fresh-fruits': 'fruit',
  'fresh-vegetables': 'vegetables',
  meat: 'meat',
  fish: 'fish',
};

export const groupOfItem = (item: Pick<ItemRow, 'category'>): FoodGroup => OF_CATEGORY[item.category];

// A crop's group from its guide; one without a known group counts as a vegetable.
export const groupOfCrop = (guide: Pick<GuideRow, 'grp'>): FoodGroup =>
  guide.grp === 'fruit' || guide.grp === 'herbs' || guide.grp === 'vegetables' ? guide.grp : 'vegetables';

// The non-empty groups in the app's order, each with its things in the order given.
export function byGroup<T>(list: T[], groupOf: (x: T) => FoodGroup): { group: FoodGroup; items: T[] }[] {
  return FOOD_GROUPS.map((group) => ({ group, items: list.filter((x) => groupOf(x) === group) })).filter((g) => g.items.length > 0);
}
