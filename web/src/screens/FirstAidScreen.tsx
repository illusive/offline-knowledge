// "Førstehjælp" category (D-037): search, the 112 card, the three main points as their own
// section, then the other guides in the order of an emergency.

import { ChevronRight } from 'lucide-react';
import { EmergencyCard } from '../components/EmergencyCard';
import { Section } from '../components/ui';
import type { DbClient } from '../db/client';
import type { GuideDetail, GuideRow } from '../db/queries';
import { useDbQuery } from '../db/useDbQuery';
import { GuideList } from '../components/GuideList';
import { GuideCategoryScreen } from '../guides/GuideCategoryScreen';
import type { Strings } from '../i18n/strings';
import { hrefs } from '../router';

// The guide shown as the section at the top of Førstehjælp.
const MAIN_POINTS_ID = 'tre-hovedpunkter';

export function FirstAidScreen({ db, guides, s, query, onQueryChange }: { db: DbClient; guides: GuideRow[] | null; s: Strings; query: string; onQueryChange: (q: string) => void }) {
  const mainPoints = useMainPoints(db);
  return (
    <GuideCategoryScreen
      db={db}
      guides={guides}
      section="first-aid"
      title={s.firstAid}
      intro={s.firstAidIntro}
      search={{ placeholder: s.firstAidSearchPlaceholder, label: s.firstAidSearchLabel }}
      query={query}
      onQueryChange={onQueryChange}
      searchFooter={<EmergencyCard s={s} />}
      s={s}
    >
      <div className="flex flex-col gap-3">
        <EmergencyCard s={s} />
        {mainPoints ? <MainPoints guide={mainPoints} s={s} /> : null}
        <Section id="first-aid-all" title={s.allGuides} className="mt-3">
          <GuideList guides={(guides ?? []).filter((g) => g.id !== MAIN_POINTS_ID)} />
        </Section>
      </div>
    </GuideCategoryScreen>
  );
}

function useMainPoints(db: DbClient) {
  return useDbQuery(db, { type: 'guide', id: MAIN_POINTS_ID }).data ?? null;
}

// The three main points, shown in full: the first thing to remember in any emergency.
function MainPoints({ guide, s }: { guide: GuideDetail; s: Strings }) {
  const steps = guide.blocks.find((b) => b.kind === 'steps');
  return (
    <section aria-labelledby="main-points" className="flex flex-col gap-3 rounded-card bg-accent px-[20px] py-5 text-on-accent" lang="da">
      <h2 id="main-points" className="text-xl font-semibold">
        {guide.guide.name ?? guide.guide.title}
      </h2>
      {steps?.kind === 'steps' ? (
        <ol className="flex flex-col gap-2">
          {steps.items.map((item, i) => (
            <li key={i} className="flex items-center gap-[12px] text-lg">
              <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-full bg-ink font-semibold text-on-ink">
                {i + 1}
              </span>
              {item}
            </li>
          ))}
        </ol>
      ) : null}
      {guide.guide.summary ? <p>{guide.guide.summary}</p> : null}
      <a href={hrefs.guide(guide.guide.id)} className="flex min-h-11 items-center gap-1 self-start font-semibold underline underline-offset-4">
        {s.readMore}
        <ChevronRight aria-hidden="true" className="size-5" />
      </a>
    </section>
  );
}
