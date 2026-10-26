// Food guide sections (D-033): sourced statements in Danish, with the original wording one tap away.

import type { ReactNode } from 'react';
import type { Ethylene, GuideBlockRow, ItemDetail, RelatedItem } from '../db/queries';
import type { Lang, Strings } from '../i18n/strings';
import { hrefs } from '../router';
import { Card } from './ui';

type SourceList = ItemDetail['sources'];

function sourceNames(blocks: GuideBlockRow[], sources: SourceList): string {
  const ids = [...new Set(blocks.map((b) => b.source_id))];
  return [...new Set(ids.map((id) => sources.find((s) => s.id === id)?.short_name ?? id))].join(', ');
}

export function GuideCard(props: {
  id: string;
  title: string;
  verdict?: string | null;
  blocks: GuideBlockRow[];
  showOriginal: boolean;
  sources: SourceList;
  s: Strings;
  children?: ReactNode;
}) {
  const { id, title, verdict, blocks, showOriginal, sources, s, children } = props;
  if (!verdict && blocks.length === 0 && !children) return null;
  return (
    <Card className="flex flex-col gap-3" aria-labelledby={id}>
      <h2 id={id} className="text-lg font-semibold">
        {title}
      </h2>
      {verdict ? <p className="font-semibold">{verdict}</p> : null}
      {blocks.map((b, i) => {
        const lang = sources.find((src) => src.id === b.source_id)?.lang ?? 'en';
        return showOriginal ? (
          <p key={i} lang={lang} className="text-muted">
            {b.quote}
          </p>
        ) : (
          <p key={i} lang="da">
            {b.text}
          </p>
        );
      })}
      {children}
      {blocks.length > 0 ? <p className="text-sm text-muted">{s.basedOn(sourceNames(blocks, sources))}</p> : null}
    </Card>
  );
}

function RelatedList({ items, lang }: { items: RelatedItem[]; lang: Lang }) {
  return (
    <ul className="flex flex-wrap gap-[8px]">
      {items.map((item) => {
        const name = lang === 'da' ? item.name_da : item.name_en;
        const subtitle = lang === 'da' ? item.subtitle_da : item.subtitle_en;
        return (
          <li key={item.id}>
            <a href={hrefs.food(item.id)} className="inline-flex min-h-9 items-center rounded-full bg-background px-[12px] text-sm">
              {subtitle ? `${name} (${subtitle})` : name}
            </a>
          </li>
        );
      })}
    </ul>
  );
}

// The computed part of "With other produce": from USDA Handbook 66, Table 1.
export function EthyleneLists({ ethylene, lang, s }: { ethylene: Ethylene; lang: Lang; s: Strings }) {
  const apartLabel = ethylene.sensitive ? s.apartFromProducers : ethylene.producer ? s.apartFromSensitive : null;
  return (
    <div className="flex flex-col gap-3">
      {apartLabel && ethylene.apart.length > 0 ? (
        <div className="flex flex-col gap-2">
          <p className="font-medium">{apartLabel}</p>
          <RelatedList items={ethylene.apart} lang={lang} />
        </div>
      ) : (
        <p className="font-medium">{s.ethyleneNeutral}</p>
      )}
      {ethylene.with.length > 0 ? (
        <div className="flex flex-col gap-2">
          <p className="font-medium">{s.storeWith}</p>
          <RelatedList items={ethylene.with} lang={lang} />
        </div>
      ) : null}
    </div>
  );
}
