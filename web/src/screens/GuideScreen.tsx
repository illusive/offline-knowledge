// One guide (D-037): the source's own words, laid out as steps, lists and warnings, with the
// handbook's photos next to the steps they show. Ends with the source (and pages) and the second
// authority it was compared with.

import { ChevronRight, TriangleAlert } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { EmergencyCard } from '../components/EmergencyCard';
import { BackButton, Card, MessageState, Page } from '../components/ui';
import type { DbClient } from '../db/client';
import type { GuideBlock, GuideDetail, GuideImage } from '../db/queries';
import type { Strings } from '../i18n/strings';
import { goBack, hrefs } from '../router';
import { GuideList } from './FirstAidScreen';
import { SaveButton } from '../bookmarks/BookmarkButton';

export function GuideScreen({ db, id, s }: { db: DbClient; id: string; s: Strings }) {
  const [detail, setDetail] = useState<{ id: string; value: GuideDetail | null } | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    let current = true;
    void db.call({ type: 'guide', id }).then((value) => {
      if (current) setDetail({ id, value });
    });
    return () => {
      current = false;
    };
  }, [db, id]);

  const loaded = detail?.id === id ? detail.value : undefined;
  const title = loaded ? (loaded.guide.name ?? loaded.guide.title) : null;
  const imageUrls = useImageUrls(loaded?.images);

  useEffect(() => {
    if (title) {
      document.title = `${title} – ${s.appTitle}`;
      heading.current?.focus();
    }
  }, [title, s.appTitle]);

  const parent = loaded?.guide.category === 'growing' ? hrefs.growing : hrefs.firstAid;
  const back = <BackButton label={s.back} onClick={() => goBack(parent)} />;
  if (loaded === undefined) return <Page>{back}<MessageState title={s.loading} /></Page>;
  if (loaded === null) return <Page>{back}<MessageState title={s.guideNotFound} /></Page>;

  const { guide, blocks, source, checks, related, blockSources } = loaded;
  const firstAid = guide.category === 'first-aid';
  return (
    <Page>
      <div className="flex items-center justify-between gap-[12px]">
        {back}
        <SaveButton kind="guide" id={guide.id} section={guide.category === 'growing' ? 'growing' : 'first-aid'} s={s} />
      </div>
      <article className="mt-4 flex flex-col gap-3" lang="da">
        <header className="mb-1 px-1">
          <h1 ref={heading} tabIndex={-1} className="text-3xl font-normal tracking-tight outline-none">
            {guide.name ?? guide.title}
          </h1>
          {guide.season ? <p className="mt-1 font-medium">{guide.season}</p> : null}
          {guide.summary ? <p className="mt-1 text-muted">{guide.summary}</p> : null}
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
        <Card className="flex flex-col gap-4">
          {blocks.map((block, i) => (
            <Block key={i} block={block} imageUrls={imageUrls} s={s} />
          ))}
        </Card>
      </article>

      {firstAid ? (
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

function Block({ block, imageUrls, s }: { block: GuideBlock; imageUrls: Map<string, string>; s: Strings }) {
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
