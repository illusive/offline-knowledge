// Tools: a list of the tools: the compass (D-045) and the sun (D-056).

import { Compass, Sunrise } from 'lucide-react';
import { LinkRow, Page, RowList, TabHeader } from '../components/ui';
import type { Strings } from '../i18n/strings';
import { usePageTitle } from '../lib/usePageTitle';
import { hrefs } from '../router';

export function ToolsScreen({ s }: { s: Strings }) {
  usePageTitle(s.toolsTitle, s.appTitle);
  return (
    <Page>
      <TabHeader title={s.toolsTitle} settingsLabel={s.settingsOpen} />
      <RowList>
        <LinkRow
          href={hrefs.compass}
          leading={<Compass aria-hidden="true" className="size-6 shrink-0" strokeWidth={1.5} />}
          title={s.compass.title}
          subtitle={<span className="block text-sm text-muted">{s.compass.subtitle}</span>}
        />
        <LinkRow
          href={hrefs.sun}
          leading={<Sunrise aria-hidden="true" className="size-6 shrink-0" strokeWidth={1.5} />}
          title={s.sun.title}
          subtitle={<span className="block text-sm text-muted">{s.sun.subtitle}</span>}
        />
      </RowList>
    </Page>
  );
}
