// Food guide sections (D-033): sourced statements in Danish, with the original wording one tap away.

import { ChevronRight } from 'lucide-react';
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
        const text = showOriginal ? (
          <p lang={lang} className="text-muted">
            {b.quote}
          </p>
        ) : (
          <p lang="da">{b.text}</p>
        );
        // Recipes from recipe sites and food brands are labelled as untested (D-034).
        return b.note === 'untested' ? (
          <div key={i} className="flex flex-col gap-1">
            <p className="text-xs font-semibold tracking-wide text-muted uppercase">{s.untestedRecipe}</p>
            {text}
          </div>
        ) : (
          <div key={i}>{text}</div>
        );
      })}
      {children}
      {blocks.length > 0 ? <p className="text-sm text-muted">{s.basedOn(sourceNames(blocks, sources))}</p> : null}
    </Card>
  );
}

// One food per row, sorted alphabetically in the interface language (æ, ø, å last in Danish).
function RelatedList({ items, lang }: { items: RelatedItem[]; lang: Lang }) {
  const collator = new Intl.Collator(lang);
  const rows = items
    .map((item) => ({
      id: item.id,
      name: lang === 'da' ? item.name_da : item.name_en,
      subtitle: lang === 'da' ? item.subtitle_da : item.subtitle_en,
    }))
    .sort((a, b) => collator.compare(a.name, b.name) || collator.compare(a.subtitle ?? '', b.subtitle ?? ''));
  return (
    <ul className="flex flex-col divide-y divide-border rounded-2xl bg-background">
      {rows.map((row) => (
        <li key={row.id}>
          <a href={hrefs.food(row.id)} className="flex min-h-11 items-center justify-between gap-[12px] px-[16px] py-2">
            <span>
              {row.name}
              {row.subtitle ? <span className="text-muted"> ({row.subtitle})</span> : null}
            </span>
            <ChevronRight aria-hidden="true" className="size-4 shrink-0 text-muted" />
          </a>
        </li>
      ))}
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
