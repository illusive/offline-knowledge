// "Når det sker" (D-040, D-043): one card per kind of weather (before, during and after), situations
// (what to do when power, water or heat disappears) and stock lists (what to keep at home, kept in
// Forråd, D-048), each group under its own heading.

import { GuideList } from '../components/GuideList';
import { Section } from '../components/ui';
import type { DbClient } from '../db/client';
import type { GuideRow } from '../db/queries';
import { GuideCategoryScreen } from '../guides/GuideCategoryScreen';
import type { Strings } from '../i18n/strings';

const PREPARE_GROUPS = ['weather', 'situation', 'supplies'] as const;
type PrepareGroup = (typeof PREPARE_GROUPS)[number];

export function PrepareScreen({ db, guides, s, query, onQueryChange }: { db: DbClient; guides: GuideRow[] | null; s: Strings; query: string; onQueryChange: (q: string) => void }) {
  const group = (grp: PrepareGroup) => (guides ?? []).filter((g) => g.grp === grp);
  const heading: Record<PrepareGroup, string> = { weather: s.prepareWeather, situation: s.prepareSituations, supplies: s.prepareSupplies };
  return (
    <GuideCategoryScreen
      db={db}
      guides={guides}
      section="prepare"
      title={s.prepare}
      intro={s.prepareIntro}
      search={{ placeholder: s.prepareSearchPlaceholder, label: s.prepareSearchLabel }}
      query={query}
      onQueryChange={onQueryChange}
      s={s}
    >
      <div className="flex flex-col gap-6">
        {PREPARE_GROUPS.filter((grp) => group(grp).length > 0).map((grp) => (
          <Section key={grp} id={`prepare-${grp}`} title={heading[grp]}>
            <GuideList guides={group(grp)} numbered={false} />
          </Section>
        ))}
      </div>
    </GuideCategoryScreen>
  );
}
