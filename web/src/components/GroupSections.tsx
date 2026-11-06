// Headed sections for Opbevaring and Dyrkning (D-057): "Frugt" with its count, then its rows.
// Only groups with something in them are given.

import type { ReactNode } from 'react';
import type { FoodGroup } from '../food/groups';
import type { Strings } from '../i18n/strings';
import { Section } from './ui';

export function GroupSections<T>({ idPrefix, groups, s, render }: { idPrefix: string; groups: { group: FoodGroup; items: T[] }[]; s: Strings; render: (items: T[]) => ReactNode }) {
  return (
    <div className="flex flex-col gap-6">
      {groups.map(({ group, items }) => (
        <Section key={group} id={`${idPrefix}-${group}`} title={s.foodGroups[group]} aside={<span className="text-sm text-muted">{items.length}</span>}>
          {render(items)}
        </Section>
      ))}
    </div>
  );
}
