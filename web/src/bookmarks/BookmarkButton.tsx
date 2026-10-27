// Save / unsave the page the user is on (a guide, crop or food), and the round button in page
// headers that opens the saved list (at the current category when there is one).

import { Bookmark, BookmarkCheck } from 'lucide-react';
import type { Strings } from '../i18n/strings';
import { hrefs, type SavedSection } from '../router';
import { useBookmarks, type BookmarkKind } from './bookmarks';

export function SaveButton({ kind, id, section, s }: { kind: BookmarkKind; id: string; section: SavedSection; s: Strings }) {
  const { has, toggle } = useBookmarks();
  const saved = has(kind, id);
  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={s.saveLabel}
      onClick={() => toggle(kind, id, section)}
      className={`flex min-h-11 items-center gap-[8px] rounded-full px-[14px] text-sm font-semibold ${saved ? 'bg-accent text-on-accent' : 'bg-surface'}`}
    >
      {saved ? <BookmarkCheck aria-hidden="true" className="size-5" /> : <Bookmark aria-hidden="true" className="size-5" />}
      {saved ? s.saved : s.save}
    </button>
  );
}

export function SavedLink({ section, s }: { section?: SavedSection; s: Strings }) {
  const { list } = useBookmarks();
  return (
    <a href={hrefs.saved(section)} aria-label={s.savedOpenLabel(list.length)} className="relative grid size-11 shrink-0 place-items-center rounded-full bg-surface">
      <Bookmark aria-hidden="true" className="size-5" />
      {list.length > 0 ? (
        <span aria-hidden="true" className="absolute -top-1 -right-1 grid min-w-5 place-items-center rounded-full bg-ink px-1 text-xs font-semibold text-on-ink">
          {list.length}
        </span>
      ) : null}
    </a>
  );
}
