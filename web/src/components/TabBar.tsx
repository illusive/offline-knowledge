// Floating bottom tab bar (design brief, D-025). Four tabs (Kort added, D-036), so the icon sits
// above the label. Like iOS's own tab bars it has a fixed size in
// pixels and a capped label size, so it stays usable at the largest text sizes (OPEN_QUESTIONS #25);
// VoiceOver reads the full labels.

import { House, LayoutGrid, Map as MapIcon, SlidersHorizontal, type LucideIcon } from 'lucide-react';
import type { Strings } from '../i18n/strings';
import { hrefs, type Tab } from '../router';

const TABS: { tab: Tab; href: string; Icon: LucideIcon }[] = [
  { tab: 'home', href: hrefs.home, Icon: House },
  { tab: 'map', href: hrefs.map, Icon: MapIcon },
  { tab: 'tools', href: hrefs.tools, Icon: LayoutGrid },
  { tab: 'settings', href: hrefs.settings, Icon: SlidersHorizontal },
];

export function TabBar({ active, s }: { active: Tab; s: Strings }) {
  return (
    <nav aria-label={s.navLabel} className="fixed inset-x-0 bottom-0 z-20 px-[16px] pb-[max(12px,env(safe-area-inset-bottom))]">
      <ul className="mx-auto flex max-w-[448px] gap-[4px] rounded-[30px] bg-ink p-[6px] shadow-lg">
        {TABS.map(({ tab, href, Icon }) => {
          const current = tab === active;
          return (
            <li key={tab} className="flex-1">
              <a
                href={href}
                aria-current={current ? 'page' : undefined}
                className={`flex h-[52px] flex-col items-center justify-center gap-[4px] rounded-[24px] px-[4px] text-[min(0.75rem,12px)] leading-none font-medium ${
                  current ? 'bg-accent text-on-accent' : 'text-on-ink'
                }`}
              >
                <Icon aria-hidden="true" className="size-[20px] shrink-0" />
                <span className="max-w-full truncate">{s.tabs[tab]}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
