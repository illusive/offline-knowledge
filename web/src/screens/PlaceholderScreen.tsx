// Tools and Settings until their own build steps (ROADMAP M1).

import { useEffect } from 'react';
import { MessageState, Page } from '../components/ui';
import type { Strings } from '../i18n/strings';

export function PlaceholderScreen({ title, s }: { title: string; s: Strings }) {
  useEffect(() => {
    document.title = `${title} – ${s.appTitle}`;
  }, [title, s]);
  return (
    <Page>
      <h1 className="mt-2 px-1 text-3xl font-normal tracking-tight">{title}</h1>
      <MessageState title={s.comingLater} />
    </Page>
  );
}
