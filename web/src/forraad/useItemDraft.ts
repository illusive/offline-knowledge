// One thing being added or edited in Forråd (D-046, D-053): its name, count, size and month, and
// the stock-list line it counts as. The category is guessed from the name (unknown names go to Mad)
// unless one was chosen. Shared by the typing page, the scan sheet and the edit page.

import { useState } from 'react';
import { decimalForInput, parseDecimal } from '../i18n/format';
import type { Lang } from '../i18n/strings';
import type { Recommendation } from './calc';
import { matchRecommendation, type Suggestion } from './recommendations';
import { parseSize, sizeText, type SizeUnit } from './size';
import { forraad, type Category, type Product, type StoreItem } from './store';

export type DraftStart = Omit<StoreItem, 'id' | 'added' | 'category'> & { id?: string; added?: string; category: Category | null };
export type UnitChoice = SizeUnit | 'other'; // 'other': the size is written as text

export function useItemDraft(start: DraftStart, recommendations: Recommendation[], lang: Lang, isNew: boolean) {
  const [name, setName] = useState(start.name);
  // A category the user (or the link they came from) chose; null while it is guessed from the name.
  const [chosen, setChosen] = useState<Category | null>(start.category);
  const [count, setCount] = useState(start.count);
  const [expires, setExpires] = useState(start.expires ?? '');
  // The size: a number and a unit, or a text ("Andet") for anything else.
  const [amount, setAmount] = useState(start.amount ? decimalForInput(start.amount, lang, 2) : '');
  const [unit, setUnit] = useState<UnitChoice>(start.unit ?? (start.size ? 'other' : 'g'));
  const [sizeOther, setSizeOther] = useState(start.size ?? '');
  const [recId, setRecId] = useState<string | undefined>(start.recommendationId);
  // A new thing whose name matches a stock-list line counts as it, unless the user says no (on the
  // edit page); an existing thing keeps what it was saved with.
  const [unlinked, setUnlinked] = useState(!isNew && !start.recommendationId);
  const [barcode, setBarcode] = useState(start.barcode);
  const [missing, setMissing] = useState(false);

  const picked = recommendations.find((r) => r.id === recId);
  const linked = picked ?? (unlinked ? undefined : matchRecommendation(name, chosen, recommendations));
  const category: Category = chosen ?? (linked && linked.category !== 'water' ? linked.category : 'food');
  const counts = linked && linked.category === category ? linked : undefined;

  // A size text from a scan or a remembered product: a number and a unit when it reads as one,
  // with a multipack's count ("6 x 1,5 l" is 6 of 1,5 l); otherwise kept as text.
  const fillSize = (text: string, withCount: boolean) => {
    const read = parseSize(text);
    if (read) {
      setAmount(decimalForInput(read.amount, lang, 2));
      setUnit(read.unit);
      setSizeOther('');
      if (withCount && read.count) setCount(read.count);
    } else {
      setAmount('');
      setUnit('other');
      setSizeOther(text);
    }
  };

  return {
    name,
    category,
    counts,
    count,
    setCount,
    expires,
    setExpires,
    amount,
    setAmount,
    unit,
    setUnit,
    sizeOther,
    setSizeOther,
    missing,
    setBarcode,
    type: (text: string) => {
      setName(text);
      setMissing(false);
    },
    chooseCategory: setChosen,
    unlink: () => {
      setRecId(undefined);
      setUnlinked(true);
    },

    // A picked name keeps its own words; the stock-list line and the category follow from it.
    pick: (sug: Suggestion) => {
      setName(sug.name);
      setMissing(false);
      setUnlinked(false);
      if (sug.kind === 'scanned') {
        // A product scanned before: its barcode and size; the line and category are guessed from the name.
        setChosen(start.category);
        setRecId(undefined);
        setBarcode(sug.barcode);
        if (sug.product.quantity) fillSize(sug.product.quantity, false);
      } else {
        setChosen(sug.category);
        setRecId(sug.kind === 'own' ? sug.item.recommendationId : sug.recommendation.id);
        if (sug.kind === 'own' && sug.item.amount && sug.item.unit) fillSize(sizeText({ amount: sug.item.amount, unit: sug.item.unit }), false);
        else if (sug.kind === 'own' && sug.item.size) fillSize(sug.item.size, false);
      }
    },

    // A scanned product's name and size. A name the user has started typing is kept.
    fillFromProduct: (p: Product) => {
      setName((typed) => (typed.trim() ? typed : p.name));
      if (p.quantity) fillSize(p.quantity, true);
    },

    // Saves the thing; null (and the name marked as missing) when there is no name yet.
    save: (): { name: string; category: Category } | null => {
      const trimmed = name.trim();
      if (!trimmed) {
        setMissing(true);
        return null;
      }
      const value = parseDecimal(amount);
      const sized = unit !== 'other' && value !== null && value > 0 ? { amount: Math.min(100_000, value), unit } : null;
      const text = unit === 'other' ? sizeOther.trim() : '';
      forraad.saveItem({
        ...(start.id ? { id: start.id, added: start.added } : {}),
        name: trimmed,
        category,
        count,
        ...(sized ?? (text ? { size: text } : {})),
        ...(expires ? { expires } : {}),
        ...(counts ? { recommendationId: counts.id } : {}),
        ...(barcode ? { barcode } : {}),
      });
      // A barcode the lookup did not know is remembered with the name the user typed.
      const quantity = sized ? sizeText(sized) : text;
      if (barcode && !forraad.get().products[barcode]) forraad.rememberProduct(barcode, { name: trimmed, ...(quantity ? { quantity } : {}) });
      return { name: trimmed, category };
    },

    // The next thing: an empty form. The month can stay, since things bought together often share it.
    reset: ({ keepMonth }: { keepMonth: boolean }) => {
      setName('');
      setChosen(start.category);
      setCount(1);
      if (!keepMonth) setExpires('');
      setAmount('');
      setUnit('g');
      setSizeOther('');
      setRecId(undefined);
      setUnlinked(false);
      setBarcode(undefined);
      setMissing(false);
    },
  };
}

export type ItemDraft = ReturnType<typeof useItemDraft>;
