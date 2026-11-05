// Tools (D-045): a list of the tools; the compass is the first.

import { ChevronRight, Compass } from 'lucide-react';
import { useEffect } from 'react';
import { Page, TabHeader } from '../components/ui';
import type { Strings } from '../i18n/strings';
import { hrefs } from '../router';

export function ToolsScreen({ s }: { s: Strings }) {
  useEffect(() => {
    document.title = `${s.toolsTitle} – ${s.appTitle}`;
  }, [s]);
  return (
    <Page>
      <TabHeader title={s.toolsTitle} settingsLabel={s.settingsOpen} />
      <ul className="flex flex-col divide-y divide-border rounded-card bg-surface">
        <li>
          <a href={hrefs.compass} className="flex min-h-14 items-center gap-[12px] px-[20px] py-3">
            <Compass aria-hidden="true" className="size-6 shrink-0" strokeWidth={1.5} />
            <span className="flex-1">
              <span className="block font-medium">{s.compass.title}</span>
              <span className="block text-sm text-muted">{s.compass.subtitle}</span>
            </span>
            <ChevronRight aria-hidden="true" className="size-5 shrink-0 text-muted" />
          </a>
        </li>
      </ul>
    </Page>
  );
}
