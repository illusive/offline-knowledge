// Add or edit one thing in Forråd (D-046). The name is free text; while typing, the stock lists'
// lines and names used before are suggested. A thing that counts as a stock-list line says so and
// can be unlinked. The expiry date is optional. A barcode can be scanned to fill in the name
// (D-047): from the device if seen before, else looked up online when there is a connection.

import { ScanBarcode, X } from 'lucide-react';
import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { BackButton, Choice, MessageState, Page } from '../components/ui';
import type { DbClient } from '../db/client';
import type { Lang, Strings } from '../i18n/strings';
import { goBack, hrefs, type Route } from '../router';
import { usePreferences } from '../settings/preferences';
import { formatVolume, fromUnit, toUnit } from './calc';
import { locale, Stepper } from './ForraadScreen';
import { matchRecommendation, suggest, useStockLists, type Suggestion } from './recommendations';
import { lookUp, OFF_ATTRIBUTION } from './barcode';
import { CATEGORIES, forraad, useForraad, type Category, type Product, type StoreItem } from './store';

const BarcodeScanner = lazy(() => import('./BarcodeScanner'));

type EditRoute = Extract<Route, { name: 'forraadEdit' }>;

export function ItemEditor({ db, route, lang, s }: { db: DbClient; route: EditRoute; lang: Lang; s: Strings }) {
  const t = s.forraad;
  const data = useForraad();
  const lists = useStockLists(db);
  const existing = route.id ? data.items.find((i) => i.id === route.id) : undefined;

  useEffect(() => {
    document.title = `${existing ? existing.name : t.addTitle} – ${s.appTitle}`;
  }, [existing, t, s]);

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
  const category = CATEGORIES.find((c) => c === route.category);
  const start: Omit<StoreItem, 'id' | 'added'> & { id?: string; added?: string } = existing ?? {
    name: rec?.name ?? '',
    category: rec?.category ?? category ?? 'food',
    count: 1,
    ...(rec ? { recommendationId: rec.id } : {}),
  };
  return <Form start={start} isNew={!existing} lists={lists} items={data.items} products={data.products} lang={lang} s={s} />;
}

function Form(props: {
  start: Omit<StoreItem, 'id' | 'added'> & { id?: string; added?: string };
  isNew: boolean;
  lists: ReturnType<typeof useStockLists>;
  items: StoreItem[];
  products: Record<string, Product>;
  lang: Lang;
  s: Strings;
}) {
  const { start, isNew, lists, items, products, lang, s } = props;
  const t = s.forraad;
  const unit = usePreferences().waterUnit;
  const [name, setName] = useState(start.name);
  const [category, setCategory] = useState<Category>(start.category);
  const [count, setCount] = useState(start.count);
  const [volume, setVolume] = useState(start.litresEach ? String(Math.round(toUnit(start.litresEach, unit) * 100) / 100).replace('.', lang === 'da' ? ',' : '.') : '');
  const [expires, setExpires] = useState(start.expires ?? '');
  const [recId, setRecId] = useState<string | undefined>(start.recommendationId);
  // A new thing whose name matches a stock-list line counts as it, unless the user says no; an
  // existing thing keeps what it was saved with.
  const [unlinked, setUnlinked] = useState(!isNew && !start.recommendationId);
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState(false);
  const [barcode, setBarcode] = useState(start.barcode);
  const [scanning, setScanning] = useState(false);
  const [lookup, setLookup] = useState<'looking' | 'found' | 'notFound' | 'offline' | null>(null);

  const recommendations = lists?.recommendations ?? [];
  const chosen = recommendations.find((r) => r.id === recId);
  const linked = chosen ?? (unlinked ? undefined : matchRecommendation(name, category, recommendations));
  const suggestions = useMemo(() => (typing ? suggest(name, recommendations, items) : []), [typing, name, recommendations, items]);

  const pick = (sug: Suggestion) => {
    setName(sug.name);
    setCategory(sug.category);
    setUnlinked(false);
    if (sug.kind === 'recommendation') setRecId(sug.recommendation.id);
    else {
      setRecId(sug.item.recommendationId);
      if (sug.item.litresEach) setVolume(String(Math.round(toUnit(sug.item.litresEach, unit) * 100) / 100));
    }
    setTyping(false);
  };

  const onCode = useCallback(
    async (code: string) => {
      setScanning(false);
      setBarcode(code);
      setTyping(false);
      const known = products[code];
      if (known) {
        setName(known.name);
        setLookup(null);
        return;
      }
      setLookup('looking');
      const result = await lookUp(code);
      if (result.kind !== 'found') {
        setLookup(result.kind);
        return;
      }
      const p = result.product;
      setName(p.name);
      setCategory(p.category);
      if (p.litresEach) setVolume(String(Math.round(toUnit(p.litresEach, unit) * 100) / 100).replace('.', lang === 'da' ? ',' : '.'));
      forraad.rememberProduct(code, { name: p.name, ...(p.brand ? { brand: p.brand } : {}), ...(p.quantity ? { quantity: p.quantity } : {}) });
      setLookup('found');
    },
    [products, unit, lang],
  );

  const save = () => {
    if (!name.trim()) {
      setError(true);
      return;
    }
    const litres = Number(volume.replace(',', '.'));
    forraad.saveItem({
      ...(start.id ? { id: start.id, added: start.added } : {}),
      name: name.trim(),
      category,
      count,
      ...(category === 'water' && Number.isFinite(litres) && litres > 0 ? { litresEach: fromUnit(litres, unit) } : {}),
      ...(expires ? { expires } : {}),
      ...(linked?.category === category ? { recommendationId: linked.id } : {}),
      ...(barcode ? { barcode } : {}),
    });
    // A barcode the lookup did not know is remembered with the name the user typed.
    if (barcode && !products[barcode]) forraad.rememberProduct(barcode, { name: name.trim() });
    goBack(hrefs.forraad);
  };

  const remove = () => {
    if (start.id && window.confirm(t.removeConfirm(start.name))) {
      forraad.removeItem(start.id);
      goBack(hrefs.forraad);
    }
  };

  return (
    <Page>
      <BackButton label={s.back} onClick={() => goBack(hrefs.forraad)} />
      <h1 className="mt-4 mb-4 px-1 text-3xl font-normal tracking-tight">{isNew ? t.addTitle : t.editTitle}</h1>
      <form
        className="flex flex-col gap-5 rounded-card bg-surface px-[20px] py-5"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <div className="relative">
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
            id="forraad-name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setTyping(true);
              setError(false);
            }}
            placeholder={t.namePlaceholder}
            autoComplete="off"
            enterKeyHint="done"
            aria-invalid={error || undefined}
            aria-describedby={error ? 'forraad-name-error' : undefined}
            className="min-h-12 w-full rounded-xl border border-border bg-background px-[14px] text-lg"
          />
          {lookup ? (
            <p className="mt-2 text-sm" role="status">
              {lookup === 'looking' ? t.lookingUp : lookup === 'found' ? t.productFrom(OFF_ATTRIBUTION) : lookup === 'notFound' ? t.lookupNotFound : t.lookupOffline}
            </p>
          ) : null}
          {error ? (
            <p id="forraad-name-error" className="mt-1 font-medium" role="alert">
              {t.nameMissing}
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
          {linked && linked.category === category ? (
            <p className="mt-2 flex items-center gap-[8px] text-sm">
              <span className="flex-1 text-muted">{t.countsAs(linked.name)}</span>
              <button
                type="button"
                onClick={() => {
                  setRecId(undefined);
                  setUnlinked(true);
                }}
                aria-label={t.unlink} className="grid size-11 shrink-0 place-items-center rounded-full">
                <X aria-hidden="true" className="size-4" />
              </button>
            </p>
          ) : null}
        </div>

        <Choice<Category>
          name="category"
          legend={t.category}
          value={category}
          onChange={setCategory}
          options={CATEGORIES.map((c) => ({ value: c, label: t.categories[c] }))}
        />

        <Stepper label={t.count} value={count} min={1} max={999} onChange={setCount} />

        {category === 'water' ? (
          <label className="flex flex-col gap-1">
            <span className="font-semibold">{t.litresEach(unit === 'gallons' ? 'gal' : 'L')}</span>
            <input
              type="text"
              inputMode="decimal"
              value={volume}
              onChange={(e) => setVolume(e.target.value)}
              placeholder={unit === 'gallons' ? '1' : '1,5'}
              className="min-h-11 w-32 rounded-xl border border-border bg-background px-[12px]"
            />
            {Number(volume.replace(',', '.')) > 0 && count > 1 ? (
              <span className="text-sm text-muted">= {formatVolume(fromUnit(Number(volume.replace(',', '.')), unit) * count, unit, locale(lang))}</span>
            ) : null}
          </label>
        ) : null}

        <div className="flex flex-col gap-1">
          <label htmlFor="forraad-expires" className="font-semibold">
            {t.expiry}
          </label>
          <span className="text-sm text-muted">{t.expiryHelp}</span>
          <span className="flex items-center gap-[8px]">
            <input id="forraad-expires" type="date" value={expires} onChange={(e) => setExpires(e.target.value)} className="min-h-11 rounded-xl border border-border bg-background px-[12px]" />
            {expires ? (
              <button type="button" onClick={() => setExpires('')} className="min-h-11 rounded-full px-[12px] text-sm font-medium">
                {t.clearExpiry}
              </button>
            ) : null}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-[8px] pt-1">
          <button type="submit" className="min-h-12 flex-1 rounded-full bg-accent px-[24px] font-semibold text-on-accent">
            {t.save}
          </button>
          <button type="button" onClick={() => goBack(hrefs.forraad)} className="min-h-12 rounded-full bg-background px-[20px] font-medium">
            {t.cancel}
          </button>
        </div>
        {!isNew ? (
          <button type="button" onClick={remove} className="min-h-11 self-start rounded-full px-[4px] font-medium underline underline-offset-4">
            {t.remove}
          </button>
        ) : null}
      </form>
      <p className="mt-3 px-1 text-sm text-muted">{t.scanPrivacy}</p>
      {scanning ? (
        <Suspense fallback={null}>
          <BarcodeScanner s={s} onCode={(code) => void onCode(code)} onClose={() => setScanning(false)} />
        </Suspense>
      ) : null}
    </Page>
  );
}
