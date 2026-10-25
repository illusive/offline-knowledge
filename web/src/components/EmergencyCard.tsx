// Emergency call card (D-025): a tel: link works without mobile data. Denmark: 112.

import { Phone } from 'lucide-react';
import type { Strings } from '../i18n/strings';

export function EmergencyCard({ s }: { s: Strings }) {
  return (
    <a href="tel:112" aria-label={s.emergencyCallLabel} className="flex flex-wrap items-center gap-x-[16px] gap-y-2 rounded-card bg-ink px-[20px] py-5 text-on-ink">
      <Phone aria-hidden="true" className="size-6 shrink-0 text-accent" />
      <span className="min-w-[10rem] flex-1">
        <span className="block font-semibold">{s.emergencyTitle}</span>
        <span className="block text-sm text-ink-muted">{s.emergencySubtitle}</span>
      </span>
      <span aria-hidden="true" className="text-4xl font-semibold tracking-tight text-accent">
        112
      </span>
    </a>
  );
}
