// Floating bottom tab bar (design brief, D-025). Like iOS's own tab bars it has a fixed size in
// pixels and a capped label size, so it stays usable at the largest text sizes (OPEN_QUESTIONS #25);
// VoiceOver reads the full labels.

import { House, LayoutGrid, SlidersHorizontal, type LucideIcon } from 'lucide-react';
import type { Strings } from '../i18n/strings';
import { hrefs, type Tab } from '../router';

const TABS: { tab: Tab; href: string; Icon: LucideIcon }[] = [
  { tab: 'home', href: hrefs.home, Icon: House },
  { tab: 'tools', href: hrefs.tools, Icon: LayoutGrid },
  { tab: 'settings', href: hrefs.settings, Icon: SlidersHorizontal },
];

export function TabBar({ active, s }: { active: Tab; s: Strings }) {
  return (
    <nav aria-label={s.navLabel} className="fixed inset-x-0 bottom-0 z-20 px-[16px] pb-[max(12px,env(safe-area-inset-bottom))]">
      <ul className="mx-auto flex max-w-[448px] gap-[4px] rounded-full bg-ink p-[6px] shadow-lg">
        {TABS.map(({ tab, href, Icon }) => {
          const current = tab === active;
          return (
            <li key={tab} className="flex-1">
              <a
                href={href}
                aria-current={current ? 'page' : undefined}
                className={`flex h-[48px] items-center justify-center gap-[6px] rounded-full px-[8px] text-[min(0.875rem,15px)] leading-none font-medium ${
                  current ? 'bg-accent text-on-accent' : 'text-on-ink'
                }`}
              >
                <Icon aria-hidden="true" className="size-[20px] shrink-0" />
                <span className="truncate">{s.tabs[tab]}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
