// List of foods with Danish and English names; each row opens the food's storage details.

import { ChevronRight } from 'lucide-react';
import type { ItemRow } from '../db/queries';
import type { Lang, Strings } from '../i18n/strings';
import { hrefs } from '../router';
import { displayName } from '../storage/useFoodSearch';
import { MessageState } from './ui';

export function FoodList({ items, query, lang, s }: { items: ItemRow[] | null; query: string; lang: Lang; s: Strings }) {
  const trimmed = query.trim();
  return (
    <div>
      <p className="px-1 pb-2 text-sm text-muted" aria-live="polite">
        {items ? s.itemCount(items.length) : ' '}
      </p>
      {items && items.length === 0 && trimmed !== '' ? <MessageState title={s.noResults(trimmed)} /> : null}
      {items && items.length > 0 ? (
        <ul className="divide-y divide-border overflow-hidden rounded-card bg-surface">
          {items.map((item) => {
            const subtitle = lang === 'da' ? item.subtitle_da : item.subtitle_en;
            const otherName = lang === 'da' ? item.name_en : item.name_da;
            return (
              <li key={item.id}>
                <a href={hrefs.food(item.id)} className="flex items-center gap-[12px] px-[20px] py-3.5 active:bg-background">
                  <span className="flex-1">
                    <span className="block font-medium">{displayName(item, lang)}</span>
                    {subtitle ? <span className="block text-sm text-muted">{subtitle}</span> : null}
                    <span className="block text-sm text-muted" lang={lang === 'da' ? 'en' : 'da'}>
                      {otherName}
                    </span>
                  </span>
                  <ChevronRight aria-hidden="true" className="size-5 shrink-0 text-muted" />
                </a>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
