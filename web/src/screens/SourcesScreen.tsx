// Kilder (D-064): every source in the pack, grouped by publisher, on its own page under Settings.
// Works offline: the list comes from the pack; the links open the source online.

import { ArrowUpRight } from 'lucide-react';
import { Card, MessageState, Page, SubPageHeader } from '../components/ui';
import type { DbClient } from '../db/client';
import type { Responses } from '../db/protocol';
import { useDbQuery } from '../db/useDbQuery';
import type { Strings } from '../i18n/strings';
import { usePageTitle } from '../lib/usePageTitle';
import { hrefs } from '../router';

type Source = Responses['sources'][number];

export function SourcesScreen({ db, s }: { db: DbClient; s: Strings }) {
  const t = s.settings;
  usePageTitle(t.sources, s.appTitle);
  const { data, error } = useDbQuery(db, { type: 'sources' });
  const sources = error ? [] : (data ?? null);

  const byPublisher = new Map<string, Source[]>();
  for (const src of sources ?? []) byPublisher.set(src.publisher, [...(byPublisher.get(src.publisher) ?? []), src]);

  return (
    <Page>
      <SubPageHeader backLabel={s.back} backTo={hrefs.settings} title={t.sources} subtitle={t.sourcesIntro} />
      {sources === null ? (
        <MessageState title={s.loading} />
      ) : (
        <Card>
          <div className="flex flex-col gap-4">
            {[...byPublisher].map(([publisher, list]) => (
              <section key={publisher}>
                <h2 className="font-semibold">{publisher}</h2>
                <ul className="mt-1 flex flex-col gap-1">
                  {list.map((src) => (
                    <li key={src.id}>
                      <a href={src.url} target="_blank" rel="noopener noreferrer" className="text-muted underline-offset-4 hover:underline">
                        {src.title}
                        <ArrowUpRight aria-hidden="true" className="ml-1 inline size-4 align-[-0.15em]" />
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </Card>
      )}
    </Page>
  );
}
