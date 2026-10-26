// Food guide sections (D-033): sourced statements in Danish, with the original wording one tap away;
// drying, pickling and canning methods as recipes with numbered steps (D-035).

import { ChevronDown, ChevronRight } from 'lucide-react';
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
  const langOf = (b: GuideBlockRow) => sources.find((src) => src.id === b.source_id)?.lang ?? 'en';
  const paragraphs = blocks.filter((b) => !b.recipe);
  const recipes = blocks.filter((b) => b.recipe);
  return (
    <Card className="flex flex-col gap-3" aria-labelledby={id}>
      <h2 id={id} className="text-lg font-semibold">
        {title}
      </h2>
      {verdict ? <p className="font-semibold">{verdict}</p> : null}
      {paragraphs.map((b, i) =>
        showOriginal ? (
          <p key={i} lang={langOf(b)} className="text-muted">
            {b.quote}
          </p>
        ) : (
          <p key={i} lang="da">
            {b.text}
          </p>
        ),
      )}
      {children}
      {paragraphs.length > 0 ? <p className="text-sm text-muted">{s.basedOn(sourceNames(paragraphs, sources))}</p> : null}
      {recipes.length > 0 ? (
        <ul className="flex flex-col gap-[8px]">
          {recipes.map((b, i) => (
            <li key={i}>
              <RecipeCard block={b} lang={langOf(b)} showOriginal={showOriginal} sources={sources} s={s} />
            </li>
          ))}
        </ul>
      ) : null}
    </Card>
  );
}

// A step-by-step method (D-035): a row that opens to show what you need and numbered steps.
function RecipeCard({ block, lang, showOriginal, sources, s }: { block: GuideBlockRow; lang: string; showOriginal: boolean; sources: SourceList; s: Strings }) {
  const recipe = block.recipe;
  if (!recipe) return null;
  const facts = (['time', 'keeps', 'yield'] as const).filter((k) => recipe.facts?.[k]);
  return (
    <details className="group rounded-2xl bg-background">
      <summary className="flex min-h-11 cursor-pointer list-none items-start justify-between gap-[12px] px-[16px] py-3 [&::-webkit-details-marker]:hidden">
        <span className="flex flex-col gap-2">
          <span className="font-semibold" lang="da">
            {recipe.title}
          </span>
          {facts.length > 0 ? (
            <span className="flex flex-wrap gap-[6px]">
              {facts.map((k) => (
                <span key={k} className="rounded-full bg-surface px-[10px] py-0.5 text-sm">
                  <span className="text-muted">{s.recipeFacts[k]}: </span>
                  <span lang="da">{recipe.facts?.[k]}</span>
                </span>
              ))}
            </span>
          ) : null}
        </span>
        <ChevronDown aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-muted transition-transform group-open:rotate-180" />
      </summary>
      <div className="flex flex-col gap-4 px-[16px] pt-1 pb-4">
        {showOriginal ? (
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-semibold text-muted">{s.originalWording}</h3>
            <p lang={lang} className="text-muted">
              {block.quote}
            </p>
          </div>
        ) : (
          <>
            {recipe.intro ? <p lang="da">{recipe.intro}</p> : null}
            {recipe.ingredients?.length ? (
              <div className="flex flex-col gap-2">
                <h3 className="font-semibold">{s.ingredientsHeading}</h3>
                <ul className="flex list-disc flex-col gap-1 pl-[20px]" lang="da">
                  {recipe.ingredients.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            <div className="flex flex-col gap-2">
              <h3 className="font-semibold">{s.stepsHeading}</h3>
              <ol className="flex flex-col gap-3" lang="da">
                {recipe.steps.map((step, i) => (
                  <li key={i} className="flex gap-[12px]">
                    <span aria-hidden="true" className="grid size-7 shrink-0 place-items-center rounded-full bg-ink text-sm font-semibold text-on-ink">
                      {i + 1}
                    </span>
                    <span className="pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </>
        )}
        <p className="text-sm text-muted">{s.basedOn(sourceNames([block], sources))}</p>
      </div>
    </details>
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
