// Editing one thing in Forråd (D-046), opened from its sheet ("Redigér", D-049, D-054): the same
// fields as when adding (D-053, with the category bar), plus the stock-list line it counts as,
// which can be undone. Adding is in sheets (AddSheet, ScanScreen).

import { Trash2, X } from 'lucide-react';
import { useRef } from 'react';
import { BackButton, Button, Card, MessageState, Page, SubPageHeader } from '../components/ui';
import type { DbClient } from '../db/client';
import type { Lang, Strings } from '../i18n/strings';
import { usePageTitle } from '../lib/usePageTitle';
import { goBack, hrefs, type Route } from '../router';
import { ItemFields } from './ItemFields';
import { useStockLists, type StockLists } from './recommendations';
import { forraad, useForraad, type Product, type StoreItem } from './store';
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
            draft.counts ? (
              <p className="-mt-3 flex items-center gap-x-[4px] text-sm text-muted">
                {t.countsAs(draft.counts.name)}
                <button type="button" onClick={draft.unlink} aria-label={t.unlink} className="grid size-11 shrink-0 place-items-center rounded-full">
                  <X aria-hidden="true" className="size-4" />
                </button>
              </p>
            ) : null
          }
        />
        <Button type="submit" variant="primary">
          {t.save}
        </Button>
        <Button variant="danger" onClick={remove}>
          <Trash2 aria-hidden="true" className="size-5" />
          {t.remove}
        </Button>
      </Card>
    </Page>
  );
}
