// Editing one thing in Forråd (D-046), opened from its sheet ("Ret navn, kategori og størrelse",
// D-049): the same fields as when adding (D-053), plus the category as three choices and the
// stock-list line it counts as, which can be undone. Adding is on its own pages (AddScreen,
// ScanScreen).

import { X } from 'lucide-react';
import { useRef } from 'react';
import { BackButton, Button, Card, Choice, MessageState, Page, SubPageHeader } from '../components/ui';
import type { DbClient } from '../db/client';
import type { Lang, Strings } from '../i18n/strings';
import { usePageTitle } from '../lib/usePageTitle';
import { goBack, hrefs, type Route } from '../router';
import { ItemFields } from './ItemFields';
import { useStockLists, type StockLists } from './recommendations';
import { CATEGORIES, forraad, useForraad, type Category, type Product, type StoreItem } from './store';
import { useItemDraft } from './useItemDraft';

type EditRoute = Extract<Route, { name: 'forraadEdit' }>;

export function ItemEditor({ db, route, lang, s }: { db: DbClient; route: EditRoute; lang: Lang; s: Strings }) {
  const t = s.forraad;
  const data = useForraad();
  const lists = useStockLists(db);
  const existing = data.items.find((i) => i.id === route.id);

  usePageTitle(existing ? existing.name : t.editTitle, s.appTitle);

  if (!existing) {
    return (
      <Page>
        <BackButton label={s.back} onClick={() => goBack(hrefs.forraad)} />
        <MessageState title={t.notFound} />
      </Page>
    );
  }
  return <Form item={existing} lists={lists} items={data.items} products={data.products} lang={lang} s={s} />;
}

function Form(props: { item: StoreItem; lists: StockLists | null; items: StoreItem[]; products: Record<string, Product>; lang: Lang; s: Strings }) {
  const { item, lists, items, products, lang, s } = props;
  const t = s.forraad;
  const nameField = useRef<HTMLInputElement>(null);
  const draft = useItemDraft(item, lists?.recommendations ?? [], lang, false);

  const remove = () => {
    if (window.confirm(t.removeConfirm(item.name))) {
      forraad.removeItem(item.id);
      goBack(hrefs.forraad);
    }
  };

  return (
    <Page>
      <SubPageHeader backLabel={s.back} backTo={hrefs.forraad} title={t.editTitle} />
      <Card
        as="form"
        className="flex flex-col gap-5"
        onSubmit={(e) => {
          e.preventDefault();
          if (draft.save()) goBack(hrefs.forraad);
          else nameField.current?.focus();
        }}
      >
        <ItemFields
          draft={draft}
          idPrefix="forraad"
          lists={lists}
          items={items}
          products={products}
          lang={lang}
          s={s}
          nameRef={nameField}
          afterName={
            <div className="flex flex-col gap-1">
              <Choice<Category> name="category" legend={t.category} value={draft.category} onChange={draft.chooseCategory} options={CATEGORIES.map((c) => ({ value: c, label: t.categories[c] }))} />
              {draft.counts ? (
                <p className="flex items-center gap-x-[4px] text-sm text-muted">
                  {t.countsAs(draft.counts.name)}
                  <button type="button" onClick={draft.unlink} aria-label={t.unlink} className="grid size-11 shrink-0 place-items-center rounded-full">
                    <X aria-hidden="true" className="size-4" />
                  </button>
                </p>
              ) : null}
            </div>
          }
        />
        <Button type="submit" variant="primary">
          {t.save}
        </Button>
        <button type="button" onClick={remove} className="min-h-11 self-start rounded-full px-[4px] font-medium underline">
          {t.remove}
        </button>
      </Card>
    </Page>
  );
}
