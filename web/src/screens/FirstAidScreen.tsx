// "Førstehjælp" category (D-037): the guides in the order of an emergency, with the 112 card first.

import { ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { EmergencyCard } from '../components/EmergencyCard';
import { BackButton, MessageState, Page } from '../components/ui';
import type { DbClient } from '../db/client';
import type { GuideRow } from '../db/queries';
import type { Strings } from '../i18n/strings';
import { goBack, hrefs } from '../router';

export function useGuides(db: DbClient | null) {
  const [guides, setGuides] = useState<GuideRow[] | null>(null);
  useEffect(() => {
    if (!db) return;
    let current = true;
    void db.call({ type: 'guides', category: 'first-aid' }).then((rows) => {
      if (current) setGuides(rows);
    });
    return () => {
      current = false;
    };
  }, [db]);
  return guides;
}

export function FirstAidScreen({ guides, s }: { guides: GuideRow[] | null; s: Strings }) {
  useEffect(() => {
    document.title = `${s.firstAid} – ${s.appTitle}`;
  }, [s]);

  return (
    <Page>
      <BackButton label={s.back} onClick={() => goBack(hrefs.home)} />
      <header className="mt-4 mb-4 px-1">
        <h1 className="text-3xl font-normal tracking-tight">{s.firstAid}</h1>
        <p className="mt-1 text-muted">{s.firstAidIntro}</p>
      </header>
      <div className="mb-3">
        <EmergencyCard s={s} />
      </div>
      {guides === null ? (
        <MessageState title={s.loading} />
      ) : (
        <GuideList guides={guides} />
      )}
    </Page>
  );
}

export function GuideList({ guides, numbered = true }: { guides: GuideRow[]; numbered?: boolean }) {
  return (
    <ol className="flex flex-col divide-y divide-border rounded-card bg-surface" lang="da">
      {guides.map((g, i) => (
        <li key={g.id}>
          <a href={hrefs.guide(g.id)} className="flex min-h-14 items-center gap-[12px] px-[20px] py-3">
            {numbered ? (
              <span aria-hidden="true" className="grid size-7 shrink-0 place-items-center rounded-full bg-background text-sm font-semibold text-muted">
                {i + 1}
              </span>
            ) : null}
            <span className="flex-1">
              <span className="block font-medium">{g.title}</span>
              {g.summary ? <span className="line-clamp-2 block text-sm text-muted">{g.summary}</span> : null}
            </span>
            <ChevronRight aria-hidden="true" className="size-5 shrink-0 text-muted" />
          </a>
        </li>
      ))}
    </ol>
  );
}
