// Saved (D-026): bookmarks grouped by category. Opened from a category, the list starts at that
// category's group (scrolled to and focused); from Home it starts at the top.

import { ChevronRight } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useBookmarks } from '../bookmarks/bookmarks';
import { BackButton, Card, MessageState, Page } from '../components/ui';
import type { GuideRow, ItemRow } from '../db/queries';
import type { Lang, Strings } from '../i18n/strings';
import { goBack, hrefs, SAVED_SECTIONS, type SavedSection } from '../router';
import { displayName } from '../storage/useFoodSearch';

interface Row {
  key: string;
  href: string | null; // null: no longer in the pack
  title: string;
  subtitle: string | null;
  remove: () => void;
}

export function SavedScreen(props: { section: SavedSection | null; guides: GuideRow[] | null; crops: GuideRow[] | null; prepare: GuideRow[] | null; foods: ItemRow[] | null; lang: Lang; s: Strings }) {
  const { section, guides, crops, prepare, foods, lang, s } = props;
  const { list, toggle } = useBookmarks();
  const headings = useRef(new Map<SavedSection, HTMLHeadingElement>());
  const loaded = guides !== null && crops !== null && prepare !== null && foods !== null;

  useEffect(() => {
    document.title = `${s.savedTitle} – ${s.appTitle}`;
  }, [s]);

  // Start at the category the list was opened from.
  useEffect(() => {
    if (!loaded || !section) return;
    const heading = headings.current.get(section);
    heading?.scrollIntoView({ block: 'start' });
    heading?.focus({ preventScroll: true });
  }, [loaded, section]);

  const all = [...(guides ?? []), ...(crops ?? []), ...(prepare ?? [])];
  const rows = (section: SavedSection): Row[] =>
    list
      .filter((b) => b.section === section)
      .map((b) => {
        const remove = () => toggle(b.kind, b.id, b.section);
        if (b.kind === 'food') {
          const f = (foods ?? []).find((x) => x.id === b.id);
          return { key: b.id, href: f ? hrefs.food(f.id) : null, title: f ? displayName(f, lang) : b.id, subtitle: f ? (lang === 'da' ? f.subtitle_da : f.subtitle_en) : null, remove };
        }
        const g = all.find((x) => x.id === b.id);
        return { key: b.id, href: g ? hrefs.guide(g.id) : null, title: g ? (g.name ?? g.title) : b.id, subtitle: g ? (g.season ?? g.summary) : null, remove };
      });
  const sections: Record<SavedSection, { title: string; rows: Row[] }> = {
    prepare: { title: s.prepare, rows: rows('prepare') },
    'first-aid': { title: s.firstAid, rows: rows('first-aid') },
    growing: { title: s.growing, rows: rows('growing') },
    storage: { title: s.storingFood, rows: rows('storage') },
  };

  return (
    <Page>
      <BackButton label={s.back} onClick={() => goBack(hrefs.home)} />
      <header className="mt-4 mb-4 px-1">
        <h1 className="text-3xl font-normal tracking-tight">{s.savedTitle}</h1>
        <p className="mt-1 text-muted">{s.savedIntro}</p>
      </header>
      {!loaded ? (
        <MessageState title={s.loading} />
      ) : list.length === 0 ? (
        <Card>
          <p className="font-semibold">{s.savedEmptyTitle}</p>
          <p className="mt-1 text-muted">{s.savedEmptyBody}</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-6">
          {SAVED_SECTIONS.map((key) => {
            const { title, rows: items } = sections[key];
            return (
              <section key={key} aria-labelledby={`saved-${key}`} className="flex scroll-mt-4 flex-col gap-2">
                <h2
                  id={`saved-${key}`}
                  tabIndex={-1}
                  ref={(el) => {
                    if (el) headings.current.set(key, el);
                  }}
                  className="flex items-baseline justify-between px-1 text-xl font-semibold outline-none"
                >
                  {title}
                  <span className="text-sm font-normal text-muted">{s.savedCount(items.length)}</span>
                </h2>
                {items.length === 0 ? (
                  <p className="px-1 text-sm text-muted">{s.savedNoneHere}</p>
                ) : (
                  <ul className="divide-y divide-border overflow-hidden rounded-card bg-surface">
                    {items.map((r) => (
                      <li key={r.key}>
                        {r.href ? (
                          <a href={r.href} className="flex min-h-14 items-center gap-[12px] px-[20px] py-3">
                            <span className="flex-1">
                              <span className="block font-medium">{r.title}</span>
                              {r.subtitle ? <span className="line-clamp-2 block text-sm text-muted">{r.subtitle}</span> : null}
                            </span>
                            <ChevronRight aria-hidden="true" className="size-5 shrink-0 text-muted" />
                          </a>
                        ) : (
                          <div className="flex min-h-14 items-center gap-[12px] px-[20px] py-3">
                            <span className="flex-1">
                              <span className="block font-medium text-muted">{r.title}</span>
                              <span className="block text-sm text-muted">{s.savedUnavailable}</span>
                            </span>
                            <button type="button" onClick={r.remove} className="min-h-11 rounded-full bg-background px-[14px] text-sm font-semibold">
                              {s.remove}
                            </button>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      )}
    </Page>
  );
}
