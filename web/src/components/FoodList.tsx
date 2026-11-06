// List of foods with where each keeps longest (owner 2026-10-27, replacing the other-language name);
// each row opens the food's storage details. In Opbevaring the list is divided into headed groups
// (D-057), also while searching.

import type { ItemRow } from '../db/queries';
import type { Lang, Strings } from '../i18n/strings';
import { hrefs } from '../router';
import { formatDuration } from '../food/format';
import { displayName } from '../food/useFoodSearch';
import { byGroup, groupOfItem } from '../food/groups';
import { GroupSections } from './GroupSections';
import { LinkRow, MessageState, RowList } from './ui';

export function FoodList({ items, query, lang, s, grouped = false }: { items: ItemRow[] | null; query: string; lang: Lang; s: Strings; grouped?: boolean }) {
  const trimmed = query.trim();
  const rows = (list: ItemRow[]) => (
    <RowList>
      {list.map((item) => (
        <FoodRow key={item.id} item={item} lang={lang} s={s} />
      ))}
    </RowList>
  );
  return (
    <div>
      <p className="px-1 pb-2 text-sm text-muted" aria-live="polite">
        {items ? s.itemCount(items.length) : ' '}
      </p>
      {items && items.length === 0 && trimmed !== '' ? <MessageState title={s.noResults(trimmed)} /> : null}
      {items && items.length > 0 ? (
        grouped ? <GroupSections idPrefix="storage" groups={byGroup(items, groupOfItem)} s={s} render={rows} /> : rows(items)
      ) : null}
    </div>
  );
}

function FoodRow({ item, lang, s }: { item: ItemRow; lang: Lang; s: Strings }) {
  const subtitle = lang === 'da' ? item.subtitle_da : item.subtitle_en;
  return (
    <LinkRow
      href={hrefs.food(item.id)}
      title={displayName(item, lang)}
      subtitle={
        <>
          {subtitle ? <span className="block text-sm text-muted">{subtitle}</span> : null}
          {item.longest ? (
            <span className="block text-sm text-muted">
              {s.locations[item.longest.location]} · {formatDuration(item.longest, s)}
            </span>
          ) : null}
        </>
      }
    />
  );
}
