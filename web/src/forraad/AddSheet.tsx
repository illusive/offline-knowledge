// Adding to Forråd by typing (D-053, D-054): a sheet over the Forråd page, one thing after another
// like the scanner. "Tilføj" saves, says so and empties the form for the next thing (same month);
// "Færdig" closes, and keeps a thing whose name is already written. The category bar on top starts
// at Mad, or at the category whose + opened the sheet.

import { useRef, useState } from 'react';
import { Button, MessageState, SheetHeader, Toast, type ToastMessage } from '../components/ui';
import type { Lang, Strings } from '../i18n/strings';
import type { Route } from '../router';
import { ItemFields } from './ItemFields';
import type { StockLists } from './recommendations';
import { CATEGORIES, type Product, type StoreItem } from './store';
import { useItemDraft, type DraftStart } from './useItemDraft';

export const ADD_TITLE_ID = 'forraad-add-title';

export type AddRoute = Extract<Route, { name: 'forraadNew' }>;

type Props = { route: AddRoute; lists: StockLists | null; items: StoreItem[]; products: Record<string, Product>; lang: Lang; s: Strings; onDone: () => void };

export function AddSheet(props: Props) {
  const { route, lists, s } = props;
  // Wait for the stock lists when the link names one of their lines, so the form starts filled in.
  if (route.recommendationId && !lists) return <MessageState title={s.forraad.loading} />;
  const rec = route.recommendationId ? lists?.recommendations.find((r) => r.id === route.recommendationId) : undefined;
  const routeCategory = CATEGORIES.find((c) => c === route.category) ?? null;
  const start: DraftStart = {
    name: rec?.name ?? '',
    category: rec && rec.category !== 'water' ? rec.category : routeCategory, // null: Mad, unless a stock-list line says otherwise
    count: 1,
    ...(rec ? { recommendationId: rec.id } : {}),
  };
  return <AddForm {...props} start={start} />;
}

function AddForm({ start, lists, items, products, lang, s, onDone }: Props & { start: DraftStart }) {
  const t = s.forraad;
  const draft = useItemDraft(start, lists?.recommendations ?? [], lang, true);
  const nameField = useRef<HTMLInputElement>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const add = () => {
    const saved = draft.save();
    if (saved) {
      setToast({ id: Date.now(), text: t.addedTo(saved.name, t.categories[saved.category]) });
      draft.reset({ keepMonth: true });
    }
    nameField.current?.focus();
  };

  const done = () => {
    if (draft.name.trim()) draft.save();
    onDone();
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        add();
      }}
    >
      <SheetHeader id={ADD_TITLE_ID} title={t.addTitle} closeLabel={s.close} onClose={done} />
      <div className="mt-4 flex flex-col gap-5 rounded-card bg-surface px-[20px] py-5">
        <ItemFields draft={draft} idPrefix="forraad-add" lists={lists} items={items} products={products} lang={lang} s={s} nameRef={nameField} nameAutofocus={!start.name} />
        <Button type="submit" variant="primary">
          {t.add}
        </Button>
      </div>
      {/* Inside the sheet, so it shows above the dimmed page (the sheet is in the top layer). */}
      <Toast message={toast} onHide={() => setToast(null)} />
    </form>
  );
}
