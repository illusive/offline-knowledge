// One guide (D-037): the source's own words, laid out as steps, lists and warnings, with the
// handbook's photos next to the steps they show. Ends with the source (and pages) and the second
// authority it was compared with.

import { Check, ChevronRight, TriangleAlert } from 'lucide-react';
import { useChecklist } from '../supplies/checklist';
import { useEffect, useMemo, useRef, useState } from 'react';
import { EmergencyCard } from '../components/EmergencyCard';
import { BackButton, Card, MessageState, OriginalToggle, Page } from '../components/ui';
import type { DbClient } from '../db/client';
import type { ChecklistItem, GuideBlock, GuideImage } from '../db/queries';
import { useDbQuery } from '../db/useDbQuery';
import type { Strings } from '../i18n/strings';
import { goBack, hrefs } from '../router';
import { GuideList } from '../components/GuideList';
import { SaveButton } from '../bookmarks/BookmarkButton';
import { usePageTitle } from '../lib/usePageTitle';

export function GuideScreen({ db, id, s }: { db: DbClient; id: string; s: Strings }) {
  const { data: loaded, error } = useDbQuery(db, { type: 'guide', id });
  const heading = useRef<HTMLHeadingElement>(null);
  const [showOriginal, setShowOriginal] = useState(false);

  const title = loaded ? (loaded.guide.name ?? loaded.guide.title) : null;
  const imageUrls = useImageUrls(loaded?.images);

  // Move focus to the new page's heading so screen readers announce it (not on sub-page switches).
  usePageTitle(title, s.appTitle, heading);

  const category = loaded?.guide.category;
  const parent = category === 'growing' ? hrefs.growing : category === 'preparedness' ? hrefs.prepare : hrefs.firstAid;
  const back = <BackButton label={s.back} onClick={() => goBack(parent)} />;
  if (error) return <Page>{back}<MessageState title={s.packErrorTitle} body={s.packErrorBody} /></Page>;
  if (loaded === undefined) return <Page>{back}<MessageState title={s.loading} /></Page>;
  if (loaded === null) return <Page>{back}<MessageState title={s.guideNotFound} /></Page>;

  const { guide, blocks, source, checks, related, blockSources } = loaded;
  const firstAid = guide.category === 'first-aid';
  // The 112 card on first aid and on situations (not on stock lists or crops).
  const showEmergency = firstAid || guide.grp === 'situation' || guide.grp === 'weather';
  const checklistItems = blocks.flatMap((b) => (b.kind === 'checklist' ? b.items : []));
  const translated = blocks.some((b) => b.original?.lang === 'en');
  const rewritten = !!guide.summary_original || blocks.some((b) => b.original?.lang === 'da');
  return (
    <Page>
      <div className="flex items-center justify-between gap-[12px]">
        {back}
        <SaveButton kind="guide" id={guide.id} section={guide.category === 'growing' ? 'growing' : guide.category === 'preparedness' ? 'prepare' : 'first-aid'} s={s} />
      </div>
      <article className="mt-4 flex flex-col gap-3" lang="da">
        <header className="mb-1 px-1">
          <h1 ref={heading} tabIndex={-1} className="text-3xl font-normal tracking-tight outline-none">
            {guide.name ?? guide.title}
          </h1>
          {guide.season ? <p className="mt-1 font-medium">{guide.season}</p> : null}
          {guide.summary ? <p className="mt-1 text-muted">{showOriginal && guide.summary_original ? guide.summary_original : guide.summary}</p> : null}
          {checklistItems.length > 0 ? <ChecklistProgress guideId={guide.id} items={checklistItems} s={s} /> : null}
        </header>
        {guide.abbreviations.length > 0 ? (
          <dl aria-label={s.abbreviationsLabel} className="flex flex-col gap-1 rounded-2xl bg-surface px-[16px] py-3 text-sm">
            {guide.abbreviations.map((a) => (
              <div key={a.short} className="flex gap-[8px]">
                <dt className="font-semibold">{a.short}</dt>
                <dd>{a.long}</dd>
              </div>
            ))}
          </dl>
        ) : null}
        {translated || rewritten ? (
          <OriginalToggle
            showOriginal={showOriginal}
            onToggle={() => setShowOriginal((v) => !v)}
            status={showOriginal ? s.sourceWordsShown : rewritten ? s.plainLanguage : s.partlyTranslated}
            showLabel={s.showOriginal}
            hideLabel={s.showTranslation}
          />
        ) : null}
        <Card className="flex flex-col gap-4">
          {blocks.map((block, i) => (
            // A run of translated blocks (D-041) starts with a label; "Vis original" shows the source's words.
            <div key={i} className="contents" lang={block.original?.lang === 'en' && showOriginal ? 'en' : undefined}>
              {block.original?.lang === 'en' && blocks[i - 1]?.original?.lang !== 'en' ? <p className="-mb-2 text-xs font-semibold uppercase tracking-wide text-muted">{showOriginal ? s.originalEnglish : s.translatedFromEnglish}</p> : null}
              <Block block={showOriginal ? withOriginal(block) : block} guideId={guide.id} imageUrls={imageUrls} s={s} />
            </div>
          ))}
        </Card>
      </article>

      {showEmergency ? (
        <div className="mt-3">
          <EmergencyCard s={s} />
        </div>
      ) : null}
      {guide.food_id ? (
        <a href={hrefs.food(guide.food_id)} className="mt-3 flex min-h-14 items-center justify-between gap-[12px] rounded-card bg-surface px-[20px] py-4 font-medium">
          {s.storeThisCrop}
          <ChevronRight aria-hidden="true" className="size-5 shrink-0 text-muted" />
        </a>
      ) : null}

      {related.length > 0 ? (
        <section className="mt-6 flex flex-col gap-2" aria-labelledby="related-heading">
          <h2 id="related-heading" className="px-1 text-lg font-semibold">
            {s.relatedGuides}
          </h2>
          <GuideList guides={related} numbered={false} />
        </section>
      ) : null}

      <footer className="mt-6 flex flex-col gap-1 px-1 text-sm text-muted">
        <p>{firstAid ? s.guideSource(`${source.title} (${source.publisher})`, ...pageRange(blocks)) : s.basedOn(`${source.publisher}: ${source.title}`)}</p>
        {blockSources.map((b) => (
          <p key={b.id}>{s.basedOn(`${b.publisher}: ${b.title}`)}</p>
        ))}
        {checks.length > 0 ? (
          <p>
            {s.checkedAgainst}: {[...new Set(checks.map((c) => `${c.source.short_name}, ${c.source.title}`))].join('; ')}
          </p>
        ) : null}
        {guide.owner_checked ? null : <p>{s.ownerNotChecked}</p>}
      </footer>
    </Page>
  );
}

function Block({ block, guideId, imageUrls, s }: { block: GuideBlock; guideId: string; imageUrls: Map<string, string>; s: Strings }) {
  switch (block.kind) {
    case 'heading':
      return <h2 className="text-lg font-semibold">{block.text}</h2>;
    case 'section':
      return (
        <h2 className="mt-2 border-t border-border pt-4 text-xl font-semibold first:mt-0 first:border-t-0 first:pt-0">
          {s.growingSections[block.key]}
        </h2>
      );
    case 'text':
      return <p>{block.text}</p>;
    case 'list':
      return (
        <div className="flex flex-col gap-2">
          {block.title ? <h2 className="font-semibold">{block.title}</h2> : null}
          <ul className="flex list-disc flex-col gap-1 pl-[20px]">
            {block.items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      );
    case 'steps':
      return (
        <div className="flex flex-col gap-2">
          {block.title ? <h2 className="font-semibold">{block.title}</h2> : null}
          <ol className="flex flex-col gap-3">
            {block.items.map((step, i) => (
              <li key={i} className="flex flex-col gap-3">
                <span className="flex gap-[12px]">
                  <span aria-hidden="true" className="grid size-7 shrink-0 place-items-center rounded-full bg-ink text-sm font-semibold text-on-ink">
                    {i + 1}
                  </span>
                  <span className="pt-0.5">{step}</span>
                </span>
                {block.images
                  .filter((image) => image.after === i + 1)
                  .map((image) => (
                    // Indented under the step's text and kept small, so the steps stay easy to scan.
                    <div key={image.imageId} className="max-w-[340px] pl-[40px]">
                      <Photo src={imageUrls.get(image.imageId)} alt={image.alt} />
                    </div>
                  ))}
              </li>
            ))}
          </ol>
        </div>
      );
    case 'checklist':
      return <Checklist guideId={guideId} title={block.title} items={block.items} s={s} />;
    case 'warning':
      return (
        <div role="note" className="flex gap-[12px] rounded-2xl bg-note-bg px-[16px] py-3 text-note-text">
          <TriangleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
          <div className="flex flex-col gap-1">
            {block.title ? <p className="font-semibold">{block.title}</p> : null}
            {block.text ? <p className="font-medium">{block.text}</p> : null}
            {block.items.length > 0 ? (
              <ul className="flex list-disc flex-col gap-1 pl-[20px] font-medium">
                {block.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      );
    case 'image':
      return (
        <figure className="flex flex-col gap-2">
          <Photo src={imageUrls.get(block.imageId)} alt={block.alt} />
          {block.caption ? <figcaption className="text-sm text-muted">{block.caption}</figcaption> : null}
        </figure>
      );
  }
}

// The block with the source's own words in place of the translation.
function withOriginal(block: GuideBlock): GuideBlock {
  const o = block.original;
  if (!o) return block;
  switch (block.kind) {
    case 'heading':
    case 'text':
      return { ...block, text: o.text ?? block.text };
    case 'steps':
    case 'list':
      return { ...block, title: o.title ?? block.title, items: o.items ?? block.items };
    case 'warning':
      return { ...block, title: o.title ?? block.title, text: o.text ?? block.text, items: o.items ?? block.items };
    default:
      return block;
  }
}

function Photo({ src, alt }: { src: string | undefined; alt: string }) {
  return src ? <img src={src} alt={alt} className="w-full rounded-2xl bg-background" /> : null;
}

// Images come from the pack as bytes; object URLs are released when the guide closes.
function useImageUrls(images: GuideImage[] | undefined) {
  const urls = useMemo(
    () => new Map((images ?? []).map((image) => [image.id, URL.createObjectURL(new Blob([image.data as Uint8Array<ArrayBuffer>], { type: image.mime }))])),
    [images],
  );
  useEffect(() => () => urls.forEach((url) => URL.revokeObjectURL(url)), [urls]);
  return urls;
}

// The handbook pages the guide is taken from.
function pageRange(blocks: GuideBlock[]): [number, number] {
  const pages = blocks.flatMap((b) => [b.page, ...(b.kind === 'steps' ? b.images.map((i) => i.page) : [])]);
  return [Math.min(...pages), Math.max(...pages)];
}

// A stock list (D-040). Ticks are what Forråd holds (D-048): ticking adds the line to Forråd, and
// things entered in Forråd tick their line. The water lines follow the water figure in Forråd.
function Checklist({ guideId, title, items, s }: { guideId: string; title: string | null; items: ChecklistItem[]; s: Strings }) {
  const { state, toggle } = useChecklist(guideId);
  return (
    <div className="flex flex-col gap-2">
      {title ? <h2 className="font-semibold">{title}</h2> : null}
      <ul className="flex flex-col gap-2">
        {items.map((item) => {
          const line = state(item);
          const box = (
            <span aria-hidden="true" className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-md border-2 peer-focus-visible:outline-2 peer-focus-visible:outline-text ${line.on ? 'border-transparent bg-accent text-on-accent' : 'border-muted'}`}>
              {line.on ? <Check className="size-4" strokeWidth={3} /> : null}
            </span>
          );
          const text = <span className={line.on ? 'text-muted line-through decoration-1' : ''}>{item.text}</span>;
          // Water for animals (D-063): a reminder, with nothing to tick.
          if (line.kind === 'note') {
            return (
              <li key={item.id} className="flex min-h-12 items-start rounded-2xl bg-background px-[12px] py-3">
                {item.text}
              </li>
            );
          }
          if (line.kind === 'water') {
            return (
              <li key={item.id}>
                <a href={hrefs.forraad} className="flex min-h-12 items-start gap-[12px] rounded-2xl bg-background px-[12px] py-3" aria-label={`${item.text}. ${line.on ? s.checklistHave : s.checklistMissing}. ${s.checklistWaterInForraad}`}>
                  {box}
                  <span className="flex-1">
                    {text}
                    <span className="block text-sm font-medium underline underline-offset-4">{s.checklistWaterInForraad}</span>
                  </span>
                </a>
              </li>
            );
          }
          // Things the user entered themselves keep the line ticked; the box cannot take them away.
          const locked = line.own.length > 0;
          return (
            <li key={item.id}>
              <label className={`flex min-h-12 items-start gap-[12px] rounded-2xl bg-background px-[12px] py-3 ${locked ? '' : 'cursor-pointer'}`}>
                <input type="checkbox" checked={line.on} disabled={locked} onChange={() => toggle(item)} className="peer sr-only" />
                {box}
                <span className="flex-1">
                  {text}
                  {locked ? <span className="block text-sm text-muted">{s.checklistInForraad(line.own.map((i) => i.name).join(', '))}</span> : null}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ChecklistProgress({ guideId, items, s }: { guideId: string; items: ChecklistItem[]; s: Strings }) {
  const { state } = useChecklist(guideId);
  const done = items.filter((item) => state(item).on).length;
  return (
    <p className="mt-2 text-sm font-semibold" aria-live="polite">
      {s.checklistProgress(done, items.length)}
    </p>
  );
}
