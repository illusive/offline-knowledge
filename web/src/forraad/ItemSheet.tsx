// What can be done with one thing in Forråd (D-049), in a sheet from the bottom: take some out
// (and say when the next one expires), stock more (the earlier month is kept), edit the details
// on the editor page, or delete it. Taking out the last one asks first, like deleting.

import { Minus, Pencil, Plus, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button, ButtonLink, IconButton, Stepper } from '../components/ui';
import { formatMonth, thisMonth } from '../i18n/format';
import type { Lang, Strings } from '../i18n/strings';
import { hrefs } from '../router';
import { monthsUntil } from './calc';
import { MonthYear } from './MonthYear';
import { formatSize } from './size';
import { forraad, type StoreItem } from './store';

export const SHEET_TITLE_ID = 'forraad-sheet-title';

// One line about a thing: how many, its size and its month. The row and the sheet share it.
export function itemSummary(item: StoreItem, lang: Lang, t: Strings['forraad']): string {
  return [
    t.countLabel(item.count),
    item.amount && item.unit ? formatSize({ amount: item.amount, unit: item.unit }, lang, (u) => t.units[u]) : (item.size ?? null),
    item.expires ? (monthsUntil(item.expires, thisMonth()) < 0 ? t.expired : t.expires)(formatMonth(item.expires, lang)) : null,
  ]
    .filter(Boolean)
    .join(' · ');
}

type View = 'main' | 'take' | 'stock';

export function ItemSheet({ item, lang, s, onClose, onDone }: { item: StoreItem; lang: Lang; s: Strings; onClose: () => void; onDone: (message: string) => void }) {
  const t = s.forraad;
  const [view, setView] = useState<View>('main');
  const [n, setN] = useState(1);
  const [month, setMonth] = useState('');
  const all = n >= item.count;
  // The tapped button goes away when the view changes, so focus moves to the new view (VoiceOver
  // reads it, and focus stays inside the sheet).
  const viewRef = useRef<HTMLDivElement>(null);
  const moveFocus = useRef(false);
  useEffect(() => {
    if (!moveFocus.current) return;
    moveFocus.current = false;
    viewRef.current?.focus();
  }, [view]);
  const show = (next: View) => {
    moveFocus.current = true;
    setView(next);
  };

  const open = (next: View) => {
    setN(1);
    setMonth(next === 'take' ? (item.expires ?? '') : '');
    show(next);
  };

  const take = () => {
    if (all) {
      if (!window.confirm(t.takeLastConfirm(item.name))) return;
      forraad.removeItem(item.id);
      onDone(t.tookAll(item.name));
      return;
    }
    // Only a changed month is saved; "Ingen dato" clears it.
    forraad.take(item.id, n, month === (item.expires ?? '') ? undefined : month || null);
    onDone(t.tookOut(item.name, n, item.count - n));
  };

  const stock = () => {
    forraad.stock(item.id, n, month || undefined);
    onDone(t.stocked(item.name, n, Math.min(9999, item.count + n)));
  };

  const removeAll = () => {
    if (!window.confirm(t.removeConfirm(item.name))) return;
    forraad.removeItem(item.id);
    onDone(t.deleted(item.name));
  };

  return (
    <>
      <div className="flex items-start justify-between gap-[12px] px-1">
        <div className="pt-1">
          <h2 id={SHEET_TITLE_ID} className="text-xl font-semibold">
            {item.name}
          </h2>
          <p className="text-sm text-muted">{itemSummary(item, lang, t)}</p>
        </div>
        <IconButton label={t.close} Icon={X} onClick={onClose} className="-mr-1 bg-surface" />
      </div>

      <div ref={viewRef} tabIndex={-1} className="outline-none">
        {view === 'main' ? (
          <div className="mt-4 flex flex-col gap-[8px]">
            <Button variant="primary" onClick={() => open('take')}>
              <Minus aria-hidden="true" className="size-5" />
              {t.takeOut}
            </Button>
            <Button variant="ink" onClick={() => open('stock')}>
              <Plus aria-hidden="true" className="size-5" />
              {t.stockMore}
            </Button>
            <ButtonLink variant="onPage" href={hrefs.forraadItem(item.id)}>
              <Pencil aria-hidden="true" className="size-4" />
              {t.editDetails}
            </ButtonLink>
            <button type="button" onClick={removeAll} className="mt-1 min-h-11 self-center px-[8px] font-medium underline underline-offset-4">
              {t.removeAll}
            </button>
          </div>
        ) : (
          <form
            className="mt-4 flex flex-col gap-5 rounded-card bg-surface px-[20px] py-5"
            aria-label={view === 'take' ? t.takeOut : t.stockMore}
            onSubmit={(e) => {
              e.preventDefault();
              if (view === 'take') take();
              else stock();
            }}
          >
            {view === 'stock' || item.count > 1 ? <Stepper label={t.count} value={n} min={1} max={view === 'take' ? item.count : 999} onChange={setN} /> : null}
            {view === 'take' && !all ? (
              <MonthYear id="forraad-take-month" label={t.bestBeforeNow} help={t.bestBeforeNowHelp} value={month} onChange={setMonth} lang={lang} noDate={t.noDate} clearLabel={t.clearDate} monthLabel={t.month} yearLabel={t.year} />
            ) : null}
            {view === 'take' && all ? <p className="text-sm text-muted">{t.takeLastNote}</p> : null}
            {view === 'stock' ? (
              <MonthYear id="forraad-stock-month" label={t.bestBeforeNew} help={t.bestBeforeNewHelp} value={month} onChange={setMonth} lang={lang} noDate={t.noDate} clearLabel={t.clearDate} monthLabel={t.month} yearLabel={t.year} />
            ) : null}
            <div className="flex flex-wrap gap-[8px]">
              <Button type="submit" variant="primary" className="flex-1">
                {view === 'stock' ? t.addN(n) : all ? (item.count === 1 ? t.takeOut : t.takeAll) : t.takeN(n)}
              </Button>
              <Button onClick={() => show('main')} variant="secondary">
                {s.back}
              </Button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}
