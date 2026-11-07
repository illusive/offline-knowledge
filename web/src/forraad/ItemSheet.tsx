// What can be done with one thing in Forråd, in a sheet from the bottom (D-049, D-054): a counter
// with the number of them, saved at once; editing the details on the edit page; deleting it.
// Counting down to 0 removes the thing when the sheet closes (ForraadScreen), so a slip of the
// finger can still be undone by counting up again.

import { Pencil, Trash2, X } from 'lucide-react';
import { Button, ButtonLink, IconButton, Stepper, useConfirm } from '../components/ui';
import { formatMonth, thisMonth } from '../i18n/format';
import type { Lang, Strings } from '../i18n/strings';
import { hrefs } from '../router';
import { monthsUntil } from './calc';
import { formatSize } from './size';
import { forraad, MAX_COUNT, type StoreItem } from './store';

export const SHEET_TITLE_ID = 'forraad-sheet-title';

// One line about a thing: how many, its size and its month. The rows and the sheet share it. The
// month is a part of its own, so a row can mark it (red when the thing has expired or soon will).
export function itemSummary(item: StoreItem, lang: Lang, t: Strings['forraad']): { rest: string; date: string | null } {
  const rest = [t.countLabel(item.count), item.amount && item.unit ? formatSize({ amount: item.amount, unit: item.unit }, lang, (u) => t.units[u]) : (item.size ?? null)].filter(Boolean).join(' · ');
  const date = item.expires ? (monthsUntil(item.expires, thisMonth()) < 0 ? t.expired : t.expires)(formatMonth(item.expires, lang)) : null;
  return { rest, date };
}

export function summaryText(item: StoreItem, lang: Lang, t: Strings['forraad']): string {
  const { rest, date } = itemSummary(item, lang, t);
  return date ? `${rest} · ${date}` : rest;
}

// `count` is what the counter shows: the saved count, or 0 while the thing is to be removed.
export function ItemSheet(props: { item: StoreItem; count: number; onCount: (n: number) => void; lang: Lang; s: Strings; onClose: () => void; onDeleted: (message: string) => void }) {
  const { item, count, onCount, lang, s, onClose, onDeleted } = props;
  const t = s.forraad;

  const { confirm, sheet } = useConfirm();
  const remove = async () => {
    if (!(await confirm({ title: t.removeConfirm(item.name), body: s.cannotUndo, confirmLabel: t.remove, cancelLabel: s.cancel, danger: true }))) return;
    forraad.removeItem(item.id);
    onDeleted(t.deleted(item.name));
  };

  return (
    <>
      <div className="flex items-start justify-between gap-[12px] px-1">
        <div className="pt-1">
          <h2 id={SHEET_TITLE_ID} className="text-xl font-semibold">
            {item.name}
          </h2>
          <p className="text-sm text-muted">{summaryText({ ...item, count: Math.max(1, count) }, lang, t)}</p>
        </div>
        <IconButton label={t.close} Icon={X} onClick={onClose} className="-mr-1 bg-surface" />
      </div>

      <div className="mt-4 flex flex-col gap-3 rounded-card bg-surface px-[20px] py-5">
        <Stepper
          label={t.count}
          value={count}
          min={0}
          max={MAX_COUNT}
          onChange={(n) => {
            onCount(n);
            if (n >= 1) forraad.setCount(item.id, n);
          }}
        />
        {count === 0 ? (
          <p className="text-sm font-medium" role="status">
            {t.removeOnClose}
          </p>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-[8px]">
        <ButtonLink variant="onPage" href={hrefs.forraadItem(item.id)} className="min-h-12 flex-1">
          <Pencil aria-hidden="true" className="size-4" />
          {t.editDetails}
        </ButtonLink>
        <Button variant="danger" onClick={remove} className="flex-1">
          <Trash2 aria-hidden="true" className="size-5" />
          {t.remove}
        </Button>
      </div>
      {sheet}
    </>
  );
}
