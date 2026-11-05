// The fields for one thing in Forråd (D-053), the same on the typing page, in the scan sheet and on
// the edit page: the name (with suggestions), its size, how many and the best-before month. Size
// and month are optional and say so; nothing is hidden behind "Mere".

import { useMemo, type ReactNode, type Ref } from 'react';
import { inputClass, Stepper } from '../components/ui';
import type { Lang, Strings } from '../i18n/strings';
import { MonthYear } from './MonthYear';
import { NameField } from './NameField';
import { suggest, type StockLists, type Suggestion } from './recommendations';
import { SIZE_UNITS } from './size';
import type { Product, StoreItem } from './store';
import type { ItemDraft, UnitChoice } from './useItemDraft';

type Props = {
  draft: ItemDraft;
  idPrefix: string;
  lists: StockLists | null;
  items: StoreItem[];
  products: Record<string, Product>;
  lang: Lang;
  s: Strings;
  nameRef?: Ref<HTMLInputElement>;
  nameAutofocus?: boolean;
  note?: ReactNode; // a quiet line under the name, e.g. the guessed category
  status?: string | null; // what the barcode lookup found, read out when it changes
  afterName?: ReactNode; // the edit page puts the category here
};

// "(valgfri)" after a label.
export function Optional({ s }: { s: Strings }) {
  return <span className="font-normal text-muted"> ({s.forraad.optional})</span>;
}

export function ItemFields({ draft, idPrefix, lists, items, products, lang, s, nameRef, nameAutofocus, note, status, afterName }: Props) {
  const t = s.forraad;
  const recommendations = lists?.recommendations;
  const suggestions = useMemo(() => suggest(draft.name, recommendations ?? [], items, products), [draft.name, recommendations, items, products]);
  const hint = (sug: Suggestion) =>
    sug.kind === 'own' ? t.usedBefore : sug.kind === 'scanned' ? t.scannedBefore : sug.kind === 'product' ? sug.recommendation.name : t.fromStockList;
  const nameId = `${idPrefix}-name`;

  return (
    <>
      <div>
        <label htmlFor={nameId} className="mb-1 block font-semibold">
          {t.name}
        </label>
        <NameField
          id={nameId}
          value={draft.name}
          onChange={draft.type}
          suggestions={suggestions}
          onPick={draft.pick}
          hint={hint}
          listLabel={t.suggestionsLabel}
          placeholder={t.namePlaceholder}
          inputRef={nameRef}
          invalid={draft.missing}
          describedBy={draft.missing ? `${nameId}-error` : undefined}
          autofocus={nameAutofocus}
        />
        {draft.missing ? (
          <p id={`${nameId}-error`} className="mt-1 font-medium" role="alert">
            {t.nameMissing}
          </p>
        ) : null}
        {note ? <p className="mt-1 text-sm text-muted">{note}</p> : null}
        <p className={status ? 'mt-1 text-sm' : 'sr-only'} role="status">
          {status}
        </p>
      </div>

      {afterName}

      <fieldset className="min-w-0">
        <legend className="mb-1 font-semibold">
          {t.size}
          <Optional s={s} />
        </legend>
        {/* One row: the number (or a text, for "Andet") and the unit. */}
        <div className="flex gap-[8px]">
          {draft.unit === 'other' ? (
            <input value={draft.sizeOther} onChange={(e) => draft.setSizeOther(e.target.value)} aria-label={t.sizeText} placeholder={t.sizePlaceholder} autoComplete="off" className={`${inputClass} min-h-12 min-w-0 flex-1 text-lg`} />
          ) : (
            <input value={draft.amount} onChange={(e) => draft.setAmount(e.target.value)} aria-label={t.sizeAmount} inputMode="decimal" placeholder="0" autoComplete="off" className={`${inputClass} min-h-12 min-w-0 flex-1 text-lg`} />
          )}
          <select value={draft.unit} onChange={(e) => draft.setUnit(e.target.value as UnitChoice)} aria-label={t.sizeUnit} className={`${inputClass} min-h-12 shrink-0 text-lg`}>
            {SIZE_UNITS.map((u) => (
              <option key={u} value={u}>
                {t.units[u]}
              </option>
            ))}
            <option value="other">{t.sizeOther}</option>
          </select>
        </div>
      </fieldset>

      <Stepper label={t.count} value={draft.count} min={1} max={999} onChange={draft.setCount} />

      <MonthYear
        id={`${idPrefix}-expires`}
        label={
          <>
            {t.bestBefore}
            <Optional s={s} />
          </>
        }
        help={t.bestBeforeHelp}
        value={draft.expires}
        onChange={draft.setExpires}
        lang={lang}
        noDate={t.noDate}
        clearLabel={t.clearDate}
        monthLabel={t.month}
        yearLabel={t.year}
      />
    </>
  );
}
