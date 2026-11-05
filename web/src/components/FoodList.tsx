// List of foods with where each keeps longest (owner 2026-10-27, replacing the other-language name);
// each row opens the food's storage details.

import type { ItemRow } from '../db/queries';
import type { Lang, Strings } from '../i18n/strings';
import { hrefs } from '../router';
import { formatDuration } from '../food/format';
import { displayName } from '../food/useFoodSearch';
import { LinkRow, MessageState, RowList } from './ui';

export function FoodList({ items, query, lang, s }: { items: ItemRow[] | null; query: string; lang: Lang; s: Strings }) {
  const trimmed = query.trim();
  return (
    <div>
      <p className="px-1 pb-2 text-sm text-muted" aria-live="polite">
        {items ? s.itemCount(items.length) : ' '}
      </p>
      {items && items.length === 0 && trimmed !== '' ? <MessageState title={s.noResults(trimmed)} /> : null}
      {items && items.length > 0 ? (
        <RowList>
          {items.map((item) => {
            const subtitle = lang === 'da' ? item.subtitle_da : item.subtitle_en;
            return (
              <LinkRow
                key={item.id}
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
          })}
        </RowList>
      ) : null}
    </div>
  );
}
