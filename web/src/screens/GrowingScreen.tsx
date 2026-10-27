// "Dyrkning" category (D-038): growing guides for easy crops in the Danish climate.

import { useEffect } from 'react';
import { BackButton, MessageState, Page } from '../components/ui';
import type { GuideRow } from '../db/queries';
import type { Strings } from '../i18n/strings';
import { goBack, hrefs } from '../router';
import { GuideList } from './FirstAidScreen';

export function GrowingScreen({ guides, s }: { guides: GuideRow[] | null; s: Strings }) {
  useEffect(() => {
    document.title = `${s.growing} – ${s.appTitle}`;
  }, [s]);

  return (
    <Page>
      <BackButton label={s.back} onClick={() => goBack(hrefs.home)} />
      <header className="mt-4 mb-4 px-1">
        <h1 className="text-3xl font-normal tracking-tight">{s.growing}</h1>
        <p className="mt-1 text-muted">{s.growingIntro}</p>
      </header>
      {guides === null ? <MessageState title={s.loading} /> : <GuideList guides={guides} numbered={false} />}
    </Page>
  );
}
