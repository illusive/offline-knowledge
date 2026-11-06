// "Dyrkning" category (D-038): growing guides for easy crops in the Danish climate; the crops with
// their growing period, and how many there are, in headed groups (D-057), also while searching.

import { GroupSections } from '../components/GroupSections';
import { GuideList } from '../components/GuideList';
import { byGroup, groupOfCrop } from '../food/groups';
import type { DbClient } from '../db/client';
import type { GuideRow } from '../db/queries';
import { GuideCategoryScreen } from '../guides/GuideCategoryScreen';
import type { Strings } from '../i18n/strings';

export function GrowingScreen({ db, guides, s, query, onQueryChange }: { db: DbClient; guides: GuideRow[] | null; s: Strings; query: string; onQueryChange: (q: string) => void }) {
  const grouped = (list: GuideRow[]) => (
    <GroupSections idPrefix="growing" groups={byGroup(list, groupOfCrop)} s={s} render={(crops) => <GuideList guides={crops} numbered={false} />} />
  );
  return (
    <GuideCategoryScreen
      db={db}
      guides={guides}
      section="growing"
      title={s.growing}
      intro={s.growingIntro}
      search={{ placeholder: s.growingSearchPlaceholder, label: s.growingSearchLabel }}
      query={query}
      onQueryChange={onQueryChange}
      resultCount={s.growingCount}
      renderResults={grouped}
      s={s}
    >
      <div>
        <p className="px-1 pb-2 text-sm text-muted" aria-live="polite">
          {s.growingCount(guides?.length ?? 0)}
        </p>
        {grouped(guides ?? [])}
      </div>
    </GuideCategoryScreen>
  );
}
