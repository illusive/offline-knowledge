// Reusable notice pill: a circle with an icon, then a title and short text (D-032).
// Used at the end of food pages ("Use your senses"); intended for guide pages too.

import { Eye, type LucideIcon } from 'lucide-react';
import type { Strings } from '../i18n/strings';

export function NoticePill({ Icon, title, body }: { Icon: LucideIcon; title: string; body: string }) {
  return (
    <aside className="flex items-center gap-[16px] rounded-[32px] bg-ink py-4 pr-[24px] pl-[12px] text-on-ink">
      <span aria-hidden="true" className="grid size-14 shrink-0 place-items-center rounded-full bg-accent text-on-accent">
        <Icon className="size-7" />
      </span>
      <span>
        <span className="block font-semibold">{title}</span>
        <span className="block text-sm text-ink-muted">{body}</span>
      </span>
    </aside>
  );
}

export function SensesPill({ s }: { s: Strings }) {
  return <NoticePill Icon={Eye} title={s.sensesTitle} body={s.sensesBody} />;
}
