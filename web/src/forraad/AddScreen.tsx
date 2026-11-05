// Adding to Forråd by typing (D-053), one thing after another like the scanner: "Tilføj" saves,
// says so in a toast and empties the form for the next thing (same month); "Færdig" goes back, and
// keeps a thing whose name is already written. The category is guessed from the name and only
// shown; it is changed on the edit page.

import { useRef, useState } from 'react';
import { Button, Card, MessageState, Page, SubPageHeader, Toast, type ToastMessage } from '../components/ui';
import type { DbClient } from '../db/client';
import type { Lang, Strings } from '../i18n/strings';
import { usePageTitle } from '../lib/usePageTitle';
import { goBack, hrefs, type Route } from '../router';
import { ItemFields } from './ItemFields';
import { useStockLists, type StockLists } from './recommendations';
import { CATEGORIES, useForraad, type Product, type StoreItem } from './store';
import { useItemDraft, type DraftStart } from './useItemDraft';

type NewRoute = Extract<Route, { name: 'forraadNew' }>;

export function AddScreen({ db, route, lang, s }: { db: DbClient; route: NewRoute; lang: Lang; s: Strings }) {
  const t = s.forraad;
  const data = useForraad();
  const lists = useStockLists(db);
  usePageTitle(t.addTitle, s.appTitle);

  // Wait for the stock lists when the link names one of their lines, so the form starts filled in.
  if (route.recommendationId && !lists) return <Page><MessageState title={t.loading} /></Page>;
  const rec = route.recommendationId ? lists?.recommendations.find((r) => r.id === route.recommendationId) : undefined;
  const routeCategory = CATEGORIES.find((c) => c === route.category) ?? null;
  const start: DraftStart = {
    name: rec?.name ?? '',
    category: rec && rec.category !== 'water' ? rec.category : routeCategory, // null: guessed from the name
    count: 1,
    ...(rec ? { recommendationId: rec.id } : {}),
  };
  return <AddForm start={start} lists={lists} items={data.items} products={data.products} lang={lang} s={s} />;
}

function AddForm(props: { start: DraftStart; lists: StockLists | null; items: StoreItem[]; products: Record<string, Product>; lang: Lang; s: Strings }) {
  const { start, lists, items, products, lang, s } = props;
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
    goBack(hrefs.forraad);
  };

  return (
    <Page>
      <SubPageHeader
        backLabel={s.back}
        backTo={hrefs.forraad}
        title={t.addTitle}
        action={
          <Button variant="onPage" onClick={done}>
            {t.done}
          </Button>
        }
      />
      <Card
        as="form"
        className="flex flex-col gap-5"
        onSubmit={(e) => {
          e.preventDefault();
          add();
        }}
      >
        <ItemFields draft={draft} idPrefix="forraad" lists={lists} items={items} products={products} lang={lang} s={s} nameRef={nameField} note={t.categories[draft.category]} />
        <Button type="submit" variant="primary">
          {t.add}
        </Button>
      </Card>
      <Toast message={toast} onHide={() => setToast(null)} />
    </Page>
  );
}
