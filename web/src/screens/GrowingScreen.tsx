// "Dyrkning" category (D-038): growing guides for easy crops in the Danish climate; the crops with
// their growing period, and how many there are.

import { GuideList } from '../components/GuideList';
import type { DbClient } from '../db/client';
import type { GuideRow } from '../db/queries';
import { GuideCategoryScreen } from '../guides/GuideCategoryScreen';
import type { Strings } from '../i18n/strings';

export function GrowingScreen({ db, guides, s, query, onQueryChange }: { db: DbClient; guides: GuideRow[] | null; s: Strings; query: string; onQueryChange: (q: string) => void }) {
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
      s={s}
    >
      <div>
        <p className="px-1 pb-2 text-sm text-muted" aria-live="polite">
          {s.growingCount(guides?.length ?? 0)}
        </p>
        <GuideList guides={guides ?? []} numbered={false} />
      </div>
    </GuideCategoryScreen>
  );
}
