// Scanning things into Forråd, one after another (D-053). The camera stays on until "Færdig". Each
// code opens a sheet with the name (from the device, or looked up online, D-047), the size, how many
// and an optional month; "Tilføj" saves it, says so in a toast and goes back to the camera. A
// barcode already in Forråd adds to that thing instead (the earlier month is kept, D-049).
// "Uden stregkode" opens the same sheet with an empty name.

import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Button, Sheet, Stepper, Toast, type ToastMessage } from '../components/ui';
import type { DbClient } from '../db/client';
import type { Lang, Strings } from '../i18n/strings';
import { usePageTitle } from '../lib/usePageTitle';
import { goBack, hrefs, replaceRoute } from '../router';
import { lookUp, OFF_ATTRIBUTION } from './barcode';
import type { CameraState } from './BarcodeScanner';
import { ItemFields, Optional } from './ItemFields';
import { summaryText } from './ItemSheet';
import { MonthYear } from './MonthYear';
import { useStockLists, type StockLists } from './recommendations';
import { findByBarcode, forraad, useForraad, type Product, type StoreItem } from './store';
import { useItemDraft } from './useItemDraft';

const BarcodeScanner = lazy(() => import('./BarcodeScanner'));

const SHEET_TITLE_ID = 'forraad-scan-sheet-title';

// What the sheet is open for: a scanned code, or null for a thing without a barcode.
type Entry = { key: number; code: string | null };

export function ScanScreen({ db, lang, s }: { db: DbClient; lang: Lang; s: Strings }) {
  const t = s.forraad;
  const data = useForraad();
  const lists = useStockLists(db);
  const [camera, setCamera] = useState<CameraState>('starting');
  const [entry, setEntry] = useState<Entry | null>(null);
  const [added, setAdded] = useState(0);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  usePageTitle(t.scan, s.appTitle);

  const onCode = useCallback((code: string) => setEntry({ key: Date.now(), code }), []);
  const onAdded = (message: string) => {
    setEntry(null);
    setAdded((n) => n + 1);
    setToast({ id: Date.now(), text: message });
  };
  const blocked = camera === 'denied' || camera === 'unavailable';

  return (
    <main className="fixed inset-0 z-30 flex flex-col bg-black text-white">
      <div className="flex items-center justify-between gap-[12px] px-[16px] pt-[max(1rem,env(safe-area-inset-top))] pb-3">
        <div>
          <h1 className="text-lg font-semibold">{t.scan}</h1>
          <p className="text-sm text-white/70">{added > 0 ? t.addedCount(added) : ' '}</p>
        </div>
        <Button variant="primary" onClick={() => goBack(hrefs.forraad)}>
          {t.done}
        </Button>
      </div>
      <div className="relative flex-1 overflow-hidden">
        <Suspense fallback={null}>
          <BarcodeScanner paused={entry !== null} onCode={onCode} onState={setCamera} />
        </Suspense>
      </div>
      <div className="flex flex-col items-center gap-2 px-[20px] pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-center">
        <p role="status" className={camera === 'struggling' && entry === null ? 'font-semibold text-amber-300' : ''}>
          {camera === 'denied' ? t.scanDenied : camera === 'unavailable' ? t.scanUnavailable : camera === 'starting' ? t.scanStarting : camera === 'struggling' ? t.scanSeenNotRead : t.scanHelp}
        </p>
        {blocked ? (
          <Button variant="primary" onClick={() => replaceRoute(hrefs.forraadNew())}>
            {t.typeInstead}
          </Button>
        ) : (
          <button type="button" onClick={() => setEntry({ key: Date.now(), code: null })} className="min-h-11 px-[8px] font-medium underline underline-offset-4">
            {t.noBarcode}
          </button>
        )}
        <p className="text-xs text-white/60">{t.scanPrivacy}</p>
      </div>
      <Sheet open={entry !== null} onClose={() => setEntry(null)} labelledBy={SHEET_TITLE_ID} dismissOnBackdrop={false}>
        {entry ? (
          <EntrySheet key={entry.key} code={entry.code} lists={lists} items={data.items} products={data.products} lang={lang} s={s} onAdded={onAdded} onCancel={() => setEntry(null)} />
        ) : null}
      </Sheet>
      <Toast message={toast} onHide={() => setToast(null)} />
    </main>
  );
}

type SheetProps = { code: string | null; lists: StockLists | null; items: StoreItem[]; products: Record<string, Product>; lang: Lang; s: Strings; onAdded: (message: string) => void; onCancel: () => void };

function EntrySheet(props: SheetProps) {
  // Decided when the sheet opens: saving a new thing must not turn the sheet into "add more".
  const [existing] = useState(() => (props.code ? findByBarcode(props.items, props.code) : undefined));
  return existing ? <MoreOfSheet item={existing} {...props} /> : <NewThingSheet {...props} />;
}

function NewThingSheet({ code, lists, items, products, lang, s, onAdded, onCancel }: SheetProps) {
  const t = s.forraad;
  const draft = useItemDraft({ name: '', category: null, count: 1 }, lists?.recommendations ?? [], lang, true);
  const nameField = useRef<HTMLInputElement>(null);
  const [lookup, setLookup] = useState<'looking' | 'found' | 'notFound' | 'offline' | null>(null);
  const fill = useRef(draft);
  fill.current = draft;
  const known = useRef(products);

  useEffect(() => {
    if (!code) return;
    fill.current.setBarcode(code);
    const product = known.current[code];
    if (product) {
      fill.current.fillFromProduct(product);
      return;
    }
    let live = true;
    setLookup('looking');
    void lookUp(code).then((result) => {
      if (!live) return; // the sheet was closed
      if (result.kind !== 'found') {
        setLookup(result.kind);
        nameField.current?.focus();
        return;
      }
      fill.current.fillFromProduct(result.product);
      forraad.rememberProduct(code, result.product);
      setLookup('found');
    });
    return () => {
      live = false;
    };
  }, [code]);

  const status =
    lookup === 'looking' ? t.lookingUp : lookup === 'found' ? t.productFrom(OFF_ATTRIBUTION) : lookup === 'notFound' ? t.lookupNotFound : lookup === 'offline' ? t.lookupOffline : null;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const saved = draft.save();
        if (saved) onAdded(t.addedTo(saved.name, t.categories[saved.category]));
        else nameField.current?.focus();
      }}
    >
      <h2 id={SHEET_TITLE_ID} tabIndex={-1} data-autofocus={code ? '' : undefined} className="px-1 pt-1 text-xl font-semibold outline-none">
        {code ? t.addTitle : t.noBarcode}
      </h2>
      <div className="mt-4 flex flex-col gap-5 rounded-card bg-surface px-[20px] py-5">
        <ItemFields
          draft={draft}
          idPrefix="forraad-scan"
          lists={lists}
          items={items}
          products={products}
          lang={lang}
          s={s}
          nameRef={nameField}
          nameAutofocus={!code}
          status={status}
        />
        <SheetButtons s={s} onCancel={onCancel} />
      </div>
    </form>
  );
}

// A scanned barcode that is already in Forråd: how many more, and the month on the new ones.
function MoreOfSheet({ item, lang, s, onAdded, onCancel }: SheetProps & { item: StoreItem }) {
  const t = s.forraad;
  const [n, setN] = useState(1);
  const [month, setMonth] = useState('');
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        forraad.stock(item.id, n, month || undefined);
        onAdded(t.stocked(item.name, n, Math.min(9999, item.count + n)));
      }}
    >
      <div className="px-1 pt-1">
        <h2 id={SHEET_TITLE_ID} tabIndex={-1} data-autofocus="" className="text-xl font-semibold outline-none">
          {item.name}
        </h2>
        <p className="text-sm text-muted">{summaryText(item, lang, t)}</p>
        <p className="mt-2">{t.alreadyHave}</p>
      </div>
      <div className="mt-4 flex flex-col gap-5 rounded-card bg-surface px-[20px] py-5">
        <Stepper label={t.count} value={n} min={1} max={999} onChange={setN} />
        <MonthYear
          id="forraad-scan-more-month"
          label={
            <>
              {t.bestBeforeNew}
              <Optional s={s} />
            </>
          }
          help={t.bestBeforeNewHelp}
          value={month}
          onChange={setMonth}
          lang={lang}
          noDate={t.noDate}
          clearLabel={t.clearDate}
          monthLabel={t.month}
          yearLabel={t.year}
        />
        <SheetButtons s={s} onCancel={onCancel} />
      </div>
    </form>
  );
}

function SheetButtons({ s, onCancel }: { s: Strings; onCancel: () => void }) {
  return (
    <div className="flex flex-wrap gap-[8px]">
      <Button type="submit" variant="primary" className="flex-1">
        {s.forraad.add}
      </Button>
      <Button onClick={onCancel} variant="secondary">
        {s.forraad.cancel}
      </Button>
    </div>
  );
}
