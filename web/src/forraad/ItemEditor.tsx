// Add or edit one thing in Forråd (D-046), with as little to do as possible: a name (suggestions
// while typing, or a scanned barcode, D-047), a count, and an optional best-before month. The
// category is guessed from the name (unknown names go to Mad) and can be changed; a size can be
// added under "Mere". "Gem og tilføj en til" keeps the form open for the next thing, same month.

import { ScanBarcode, X } from 'lucide-react';
import { lazy, Suspense, useCallback, useMemo, useRef, useState } from 'react';
import { BackButton, Button, Card, Choice, inputClass, MessageState, Page, Stepper, SubPageHeader } from '../components/ui';
import type { DbClient } from '../db/client';
import type { Lang, Strings } from '../i18n/strings';
import { goBack, hrefs, type Route } from '../router';
import { lookUp, OFF_ATTRIBUTION } from './barcode';
import { MonthYear } from './MonthYear';
import { matchRecommendation, suggest, useStockLists, type Suggestion } from './recommendations';
import { CATEGORIES, forraad, useForraad, type Category, type Product, type StoreItem } from './store';
import { usePageTitle } from '../lib/usePageTitle';

const BarcodeScanner = lazy(() => import('./BarcodeScanner'));

type EditRoute = Extract<Route, { name: 'forraadEdit' }>;
type Start = Omit<StoreItem, 'id' | 'added' | 'category'> & { id?: string; added?: string; category: Category | null };

export function ItemEditor({ db, route, lang, s }: { db: DbClient; route: EditRoute; lang: Lang; s: Strings }) {
  const t = s.forraad;
  const data = useForraad();
  const lists = useStockLists(db);
  const existing = route.id ? data.items.find((i) => i.id === route.id) : undefined;

  usePageTitle(existing ? existing.name : t.addTitle, s.appTitle);

  if (route.id && !existing) {
    return (
      <Page>
        <BackButton label={s.back} onClick={() => goBack(hrefs.forraad)} />
        <MessageState title={t.notFound} />
      </Page>
    );
  }
  // Wait for the stock lists when the link names one of their lines, so the form starts filled in.
  if (route.recommendationId && !lists) return <Page><MessageState title={t.loading} /></Page>;
  const rec = route.recommendationId ? lists?.recommendations.find((r) => r.id === route.recommendationId) : undefined;
  const routeCategory = CATEGORIES.find((c) => c === route.category) ?? null;
  const start: Start = existing ?? {
    name: rec?.name ?? '',
    category: rec && rec.category !== 'water' ? rec.category : routeCategory, // null: guessed from the name
    count: 1,
    ...(rec ? { recommendationId: rec.id } : {}),
  };
  return <Form start={start} isNew={!existing} lists={lists} items={data.items} products={data.products} lang={lang} s={s} />;
}

function Form(props: { start: Start; isNew: boolean; lists: ReturnType<typeof useStockLists>; items: StoreItem[]; products: Record<string, Product>; lang: Lang; s: Strings }) {
  const { start, isNew, lists, items, products, lang, s } = props;
  const t = s.forraad;
  const nameField = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(start.name);
  // A category the user (or the link they came from) chose; null while it is guessed from the name.
  const [chosen, setChosen] = useState<Category | null>(start.category);
  const [showCategories, setShowCategories] = useState(false);
  const [count, setCount] = useState(start.count);
  const [expires, setExpires] = useState(start.expires ?? '');
  const [size, setSize] = useState(start.size ?? '');
  const [showMore, setShowMore] = useState(Boolean(start.size));
  const [recId, setRecId] = useState<string | undefined>(start.recommendationId);
  // A new thing whose name matches a stock-list line counts as it, unless the user says no; an
  // existing thing keeps what it was saved with.
  const [unlinked, setUnlinked] = useState(!isNew && !start.recommendationId);
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState(false);
  const [barcode, setBarcode] = useState(start.barcode);
  const [scanning, setScanning] = useState(false);
  const [lookup, setLookup] = useState<'looking' | 'found' | 'notFound' | 'offline' | null>(null);
  const [savedName, setSavedName] = useState<string | null>(null);

  const recommendations = useMemo(() => lists?.recommendations ?? [], [lists]);
  const picked = recommendations.find((r) => r.id === recId);
  const linked = picked ?? (unlinked ? undefined : matchRecommendation(name, chosen, recommendations));
  const category: Category = chosen ?? (linked && linked.category !== 'water' ? linked.category : 'food');
  const counts = linked && linked.category === category ? linked : undefined;
  const suggestions = useMemo(() => (typing ? suggest(name, recommendations, items) : []), [typing, name, recommendations, items]);

  const pick = (sug: Suggestion) => {
    setName(sug.name);
    setChosen(sug.category);
    setUnlinked(false);
    setRecId(sug.kind === 'recommendation' ? sug.recommendation.id : sug.item.recommendationId);
    if (sug.kind === 'own' && sug.item.size) {
      setSize(sug.item.size);
      setShowMore(true);
    }
    setTyping(false);
  };

  const onCode = useCallback(
    async (code: string) => {
      setScanning(false);
      setBarcode(code);
      setTyping(false);
      setSavedName(null);
      const fill = (p: Product) => {
        setName(p.name);
        if (p.quantity) {
          setSize(p.quantity);
          setShowMore(true);
        }
      };
      const known = products[code];
      if (known) {
        fill(known);
        setLookup(null);
        return;
      }
      setLookup('looking');
      const result = await lookUp(code);
      if (result.kind !== 'found') {
        setLookup(result.kind);
        return;
      }
      fill(result.product);
      forraad.rememberProduct(code, result.product);
      setLookup('found');
    },
    [products],
  );

  const save = (another: boolean) => {
    if (!name.trim()) {
      setError(true);
      nameField.current?.focus();
      return;
    }
    forraad.saveItem({
      ...(start.id ? { id: start.id, added: start.added } : {}),
      name: name.trim(),
      category,
      count,
      ...(size.trim() ? { size: size.trim() } : {}),
      ...(expires ? { expires } : {}),
      ...(counts ? { recommendationId: counts.id } : {}),
      ...(barcode ? { barcode } : {}),
    });
    // A barcode the lookup did not know is remembered with the name the user typed.
    if (barcode && !products[barcode]) forraad.rememberProduct(barcode, { name: name.trim(), ...(size.trim() ? { quantity: size.trim() } : {}) });
    if (!another) {
      goBack(hrefs.forraad);
      return;
    }
    // The next thing: an empty form, with the same month (things bought together often share it).
    setSavedName(name.trim());
    setName('');
    setCount(1);
    setSize('');
    setShowMore(false);
    setRecId(undefined);
    setUnlinked(false);
    setChosen(start.category);
    setShowCategories(false);
    setBarcode(undefined);
    setLookup(null);
    setTyping(false);
    nameField.current?.focus();
  };

  const remove = () => {
    if (start.id && window.confirm(t.removeConfirm(start.name))) {
      forraad.removeItem(start.id);
      goBack(hrefs.forraad);
    }
  };

  return (
    <Page>
      <SubPageHeader backLabel={s.back} backTo={hrefs.forraad} title={isNew ? t.addTitle : t.editTitle} />
      {savedName ? (
        <p className="mb-3 rounded-2xl bg-surface px-[16px] py-3 font-medium" role="status">
          {t.saved(savedName)}
        </p>
      ) : null}
      <Card
        as="form"
        className="flex flex-col gap-5"
        onSubmit={(e) => {
          e.preventDefault();
          save(false);
        }}
      >
        <div>
          <div className="mb-1 flex items-end justify-between gap-[12px]">
            <label htmlFor="forraad-name" className="font-semibold">
              {t.name}
            </label>
            <button type="button" onClick={() => setScanning(true)} className="flex min-h-11 items-center gap-[6px] rounded-full bg-background px-[14px] text-sm font-medium">
              <ScanBarcode aria-hidden="true" className="size-5" />
              {t.scan}
            </button>
          </div>
          <input
            ref={nameField}
            id="forraad-name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setTyping(true);
              setError(false);
              setSavedName(null);
            }}
            placeholder={t.namePlaceholder}
            autoComplete="off"
            enterKeyHint="done"
            aria-invalid={error || undefined}
            aria-describedby={error ? 'forraad-name-error' : undefined}
            className={`${inputClass} min-h-12 w-full text-lg`}
          />
          {error ? (
            <p id="forraad-name-error" className="mt-1 font-medium" role="alert">
              {t.nameMissing}
            </p>
          ) : null}
          {lookup ? (
            <p className="mt-2 text-sm" role="status">
              {lookup === 'looking' ? t.lookingUp : lookup === 'found' ? t.productFrom(OFF_ATTRIBUTION) : lookup === 'notFound' ? t.lookupNotFound : t.lookupOffline}
            </p>
          ) : null}
          {suggestions.length > 0 ? (
            <ul aria-label={t.suggestionsLabel} className="mt-2 flex flex-col divide-y divide-border overflow-hidden rounded-xl border border-border bg-background">
              {suggestions.map((sug) => (
                <li key={`${sug.kind}-${sug.name}`}>
                  <button type="button" onClick={() => pick(sug)} className="flex min-h-11 w-full items-center justify-between gap-[12px] px-[14px] py-2 text-left">
                    <span>{sug.name}</span>
                    <span className="shrink-0 text-xs text-muted">{sug.kind === 'recommendation' ? t.fromStockList : t.usedBefore}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          {/* The category, guessed from the name; changing it is one tap away but rarely needed. */}
          <div className="mt-2 flex flex-wrap items-center gap-x-[8px] text-sm">
            <span className="text-muted">
              {t.categories[category]}
              {counts ? ` · ${t.countsAs(counts.name)}` : ''}
            </span>
            {counts ? (
              <button
                type="button"
                onClick={() => {
                  setRecId(undefined);
                  setUnlinked(true);
                }}
                aria-label={t.unlink}
                className="grid size-11 place-items-center rounded-full"
              >
                <X aria-hidden="true" className="size-4" />
              </button>
            ) : null}
            <button type="button" onClick={() => setShowCategories(!showCategories)} aria-expanded={showCategories} aria-label={t.change(t.categories[category])} className="min-h-11 font-medium underline underline-offset-4">
              {t.changeShort}
            </button>
          </div>
          {showCategories ? (
            <div className="mt-2">
              <Choice<Category>
                name="category"
                legend={t.category}
                value={category}
                onChange={(c) => {
                  setChosen(c);
                  setShowCategories(false);
                }}
                options={CATEGORIES.map((c) => ({ value: c, label: t.categories[c] }))}
              />
            </div>
          ) : null}
        </div>

        <Stepper label={t.count} value={count} min={1} max={999} onChange={setCount} />

        <MonthYear id="forraad-expires" label={t.bestBefore} help={t.bestBeforeHelp} value={expires} onChange={setExpires} lang={lang} noDate={t.noDate} monthLabel={t.month} yearLabel={t.year} />

        {showMore ? (
          <label className="flex flex-col gap-1">
            <span className="font-semibold">{t.size}</span>
            <input value={size} onChange={(e) => setSize(e.target.value)} placeholder={t.sizePlaceholder} autoComplete="off" className={inputClass} />
          </label>
        ) : (
          <button type="button" onClick={() => setShowMore(true)} className="min-h-11 self-start font-medium underline underline-offset-4">
            {t.more}
          </button>
        )}

        <div className="flex flex-col gap-[8px] pt-1">
          <Button type="submit" variant="primary">
            {t.save}
          </Button>
          {isNew ? (
            <Button onClick={() => save(true)} variant="ink">
              {t.saveAndAddAnother}
            </Button>
          ) : null}
        </div>
        {!isNew ? (
          <button type="button" onClick={remove} className="min-h-11 self-start rounded-full px-[4px] font-medium underline">
            {t.remove}
          </button>
        ) : null}
      </Card>
      <p className="mt-3 px-1 text-sm text-muted">{t.scanPrivacy}</p>
      {scanning ? (
        <Suspense fallback={null}>
          <BarcodeScanner s={s} onCode={(code) => void onCode(code)} onClose={() => setScanning(false)} />
        </Suspense>
      ) : null}
    </Page>
  );
}
