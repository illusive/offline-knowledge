// Tools: a list of the tools: the compass (D-045), the sun (D-056), and for a power cut the fridge
// and freezer clock and the boiling timer (D-058). The sirens guide lives in "Når det sker" (D-061).

import { Compass, Refrigerator, Sunrise, Timer, type LucideIcon } from 'lucide-react';
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
        {tools(s).map(({ href, Icon, title, subtitle }) => (
          <LinkRow
            key={href}
            href={href}
            leading={<Icon aria-hidden="true" className="size-6 shrink-0" strokeWidth={1.5} />}
            title={title}
            subtitle={<span className="block text-sm text-muted">{subtitle}</span>}
          />
        ))}
      </RowList>
    </Page>
  );
}

function tools(s: Strings): { href: string; Icon: LucideIcon; title: string; subtitle: string }[] {
  return [
    { href: hrefs.compass, Icon: Compass, title: s.compass.title, subtitle: s.compass.subtitle },
    { href: hrefs.sun, Icon: Sunrise, title: s.sun.title, subtitle: s.sun.subtitle },
    { href: hrefs.powerClock, Icon: Refrigerator, title: s.power.title, subtitle: s.power.subtitle },
    { href: hrefs.boil, Icon: Timer, title: s.boil.title, subtitle: s.boil.subtitle },
  ];
}
