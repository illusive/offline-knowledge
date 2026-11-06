// Tools, in headed sections (D-066): the timers for a power cut (the fridge and freezer clock and the
// boiling timer, D-058), and direction and daylight (the compass, D-045, and the sun, D-056).

import { Compass, Refrigerator, Sunrise, Timer, type LucideIcon } from 'lucide-react';
import { LinkRow, Page, RowList, Section, TabHeader } from '../components/ui';
import type { Strings } from '../i18n/strings';
import { usePageTitle } from '../lib/usePageTitle';
import { hrefs } from '../router';

interface Tool {
  href: string;
  Icon: LucideIcon;
  title: string;
  subtitle: string;
}

export function ToolsScreen({ s }: { s: Strings }) {
  usePageTitle(s.toolsTitle, s.appTitle);
  return (
    <Page>
      <TabHeader title={s.toolsTitle} settingsLabel={s.settingsOpen} />
      <div className="flex flex-col gap-6">
        {sections(s).map(({ id, title, tools }) => (
          <Section key={id} id={`tools-${id}`} title={title}>
            <RowList>
              {tools.map(({ href, Icon, title, subtitle }) => (
                <LinkRow
                  key={href}
                  href={href}
                  leading={<Icon aria-hidden="true" className="size-6 shrink-0" strokeWidth={1.5} />}
                  title={title}
                  subtitle={<span className="block text-sm text-muted">{subtitle}</span>}
                />
              ))}
            </RowList>
          </Section>
        ))}
      </div>
    </Page>
  );
}

function sections(s: Strings): { id: string; title: string; tools: Tool[] }[] {
  const t = s.toolSections;
  return [
    {
      id: 'timers',
      title: t.timers,
      tools: [
        { href: hrefs.powerClock, Icon: Refrigerator, title: s.power.title, subtitle: s.power.subtitle },
        { href: hrefs.boil, Icon: Timer, title: s.boil.title, subtitle: s.boil.subtitle },
      ],
    },
    {
      id: 'direction',
      title: t.direction,
      tools: [
        { href: hrefs.compass, Icon: Compass, title: s.compass.title, subtitle: s.compass.subtitle },
        { href: hrefs.sun, Icon: Sunrise, title: s.sun.title, subtitle: s.sun.subtitle },
      ],
    },
  ];
}
