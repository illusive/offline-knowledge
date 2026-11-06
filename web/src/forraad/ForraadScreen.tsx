// Forråd (D-046): an overview of what the household has. Water first (one figure against the stock
// list's 3 litres per person per day; when it was last checked; a tap opens its sheet, D-054), a search
// on the names (D-060), then the two ways to add (D-053), what expires soon and each category with its
// things and a link to its stock list. Household and the backup are in Settings; the page itself stays short.
// The sheets (D-049, D-054): one per thing (its count), the water, and adding by typing, which has
// its own address (#/forraad/new) so the back button closes it.

import { ChevronRight, Pencil, Plus, ScanBarcode, X } from 'lucide-react';
import { useState } from 'react';
import { Button, ButtonLink, Card, IconButton, MessageState, Page, SearchField, Sheet, Stepper, TabHeader } from '../components/ui';
import type { DbClient } from '../db/client';
import type { Lang, Strings } from '../i18n/strings';
import { goBack, hrefs } from '../router';
import { usePreferences } from '../settings/preferences';
import { localeOf, formatMonth, formatVolume, fromUnit, thisMonth, toUnit, unitLabel } from '../i18n/format';
import { DATES_GUIDE_ID, expiring, matchName, nextCheck, waterNeeded } from './calc';
import { AddSheet, ADD_TITLE_ID, type AddRoute } from './AddSheet';
import { ItemSheet, itemSummary, SHEET_TITLE_ID } from './ItemSheet';
import { useStockLists, type StockLists } from './recommendations';
import { CATEGORIES, forraad, useForraad, type Category, type ForraadData, type StoreItem } from './store';
import { usePageTitle } from '../lib/usePageTitle';

const WATER_TITLE_ID = 'forraad-water-sheet-title';

export function ForraadScreen(props: { db: DbClient; adding: AddRoute | null; lang: Lang; s: Strings; query: string; onQueryChange: (q: string) => void }) {
  const { db, adding, lang, s, query, onQueryChange } = props;
  const t = s.forraad;
  const data = useForraad();
  const lists = useStockLists(db);
  const empty = data.items.length === 0;
  // Searching (D-060): only the things whose name holds the text, in their categories; the expiry
  // card and categories without a match step aside.
  const q = query.trim();
  const searching = q !== '';
  const shown = searching ? matchName(data.items, q) : data.items;
  // The thing whose sheet is open (D-049) and what its counter shows: 0 means it is removed when
  // the sheet closes (D-054).
  const [open, setOpen] = useState<{ id: string; count: number } | null>(null);
  const [waterOpen, setWaterOpen] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const openItem = open ? data.items.find((i) => i.id === open.id) : undefined;
  const onOpen = (id: string) => {
    setStatus(null);
    setOpen({ id, count: data.items.find((i) => i.id === id)?.count ?? 1 });
  };
  const closeItem = () => {
    if (open?.count === 0 && openItem) {
      forraad.removeItem(openItem.id);
      setStatus(t.deleted(openItem.name));
    }
    setOpen(null);
  };

  usePageTitle(adding ? t.addTitle : t.title, s.appTitle);

  return (
    <Page>
      <TabHeader title={t.title} settingsLabel={s.settingsOpen} />
      <div className="flex flex-col gap-4">
        <WaterCard
          data={data}
          lists={lists}
          lang={lang}
          s={s}
          onOpen={() => {
            setStatus(null);
            setWaterOpen(true);
          }}
        />
        {empty ? null : <SearchField id="forraad-search" value={query} onChange={onQueryChange} placeholder={t.searchPlaceholder} label={t.searchLabel} clearLabel={s.clearSearch} />}
        {/* Two ways to add (D-053): scanning one thing after another, or typing. They wrap at large text. */}
        <div className="flex flex-wrap gap-[8px]">
          <ButtonLink variant="primary" href={hrefs.forraadScan} className="min-w-[10rem] flex-1">
            <ScanBarcode aria-hidden="true" className="size-5" />
            {t.scan}
          </ButtonLink>
          <ButtonLink variant="ink" href={hrefs.forraadNew()} className="min-w-[10rem] flex-1">
            <Plus aria-hidden="true" className="size-5" />
            {t.typeAdd}
          </ButtonLink>
        </div>
        <p role="status" className={status ? 'rounded-2xl bg-surface px-[16px] py-3 font-medium' : 'sr-only'}>
          {status}
        </p>
        {empty ? (
          <>
            <p className="px-1 text-center text-muted">{t.emptyStore}</p>
            <a href={hrefs.prepare} className="mx-auto flex min-h-11 items-center text-sm font-medium underline underline-offset-4">
              {t.seeAllRecommendations}
            </a>
          </>
        ) : searching && shown.length === 0 ? (
          <MessageState title={t.noMatches(q)} />
        ) : (
          <>
            {searching ? null : <Expiring items={data.items} lang={lang} s={s} onOpen={onOpen} />}
            {lists ? (
              CATEGORIES.filter((c) => !searching || shown.some((i) => i.category === c)).map((c) => (
                <CategoryCard key={c} category={c} items={shown} lists={lists} searching={searching} lang={lang} s={s} onOpen={onOpen} />
              ))
            ) : (
              <MessageState title={t.loading} />
            )}
          </>
        )}
      </div>

      <Sheet open={Boolean(openItem)} onClose={closeItem} labelledBy={SHEET_TITLE_ID}>
        {openItem && open ? (
          <ItemSheet
            key={openItem.id}
            item={openItem}
            count={open.count}
            onCount={(n) => setOpen({ id: openItem.id, count: n })}
            lang={lang}
            s={s}
            onClose={closeItem}
            onDeleted={(message) => {
              setStatus(message);
              setOpen(null);
            }}
          />
        ) : null}
      </Sheet>

      <Sheet open={waterOpen} onClose={() => setWaterOpen(false)} labelledBy={WATER_TITLE_ID}>
        <WaterSheet
          data={data}
          lists={lists}
          lang={lang}
          s={s}
          onClose={() => setWaterOpen(false)}
          onChecked={() => {
            setStatus(t.waterChecked);
            setWaterOpen(false);
          }}
        />
      </Sheet>

      <Sheet open={adding !== null} onClose={() => goBack(hrefs.forraad)} labelledBy={ADD_TITLE_ID} dismissOnBackdrop={false}>
        {adding ? (
          // A fresh form for each new-item link.
          <AddSheet key={`${adding.category}/${adding.recommendationId}`} route={adding} lists={lists} items={data.items} products={data.products} lang={lang} s={s} onDone={() => goBack(hrefs.forraad)} />
        ) : null}
      </Sheet>
    </Page>
  );
}

// The water figure against what the household needs, and when it was last checked.
function useWater(data: ForraadData, lists: StockLists | null, lang: Lang) {
  const unit = usePreferences().waterUnit;
  const have = data.water.litres;
  const need = waterNeeded(data.household, lists?.litresPerPersonDay ?? null);
  const check = nextCheck(data.water.lastChecked, thisMonth());
  return {
    unit,
    have,
    need,
    share: need ? Math.min(1, have / need) : 0,
    check,
    needsCheck: !data.water.lastChecked || Boolean(check?.due),
    vol: (l: number) => formatVolume(l, unit, lang),
    month: (m: string) => formatMonth(m, lang),
  };
}

function waterFigure(w: ReturnType<typeof useWater>, t: Strings['forraad']) {
  return w.need ? t.waterOf(w.vol(w.have), w.vol(w.need)) : t.waterHave(w.vol(w.have));
}

function checkLine(data: ForraadData, w: ReturnType<typeof useWater>, t: Strings['forraad']) {
  if (!data.water.lastChecked) return t.neverChecked;
  if (w.check?.due) return t.checkDue(w.month(w.check.month));
  return `${t.lastChecked(w.month(data.water.lastChecked))} · ${t.checkAgain(w.month(w.check!.month))}`;
}

function WaterBar({ share }: { share: number }) {
  return (
    <div className="mt-3 h-3 overflow-hidden rounded-full bg-background" aria-hidden="true">
      <div className="h-full rounded-full bg-accent" style={{ width: `${share * 100}%` }} />
    </div>
  );
}

// The whole card opens the water sheet (D-054): the button is stretched over the card.
function WaterCard({ data, lists, lang, s, onOpen }: { data: ForraadData; lists: StockLists | null; lang: Lang; s: Strings; onOpen: () => void }) {
  const t = s.forraad;
  const w = useWater(data, lists, lang);
  return (
    <Card aria-labelledby="forraad-water" className="relative">
      <div className="flex items-center justify-between gap-[12px]">
        <h2 id="forraad-water" className="text-xl font-semibold">
          {t.water}
        </h2>
        <Pencil aria-hidden="true" className="size-5 text-muted" />
      </div>
      <button type="button" aria-haspopup="dialog" onClick={onOpen} className="block w-full text-left after:absolute after:inset-0 after:rounded-card">
        <span className="mt-1 block text-[min(2.25rem,10vw)] leading-tight tracking-tight tabular-nums">{waterFigure(w, t)}</span>
        {w.need ? <WaterBar share={w.share} /> : null}
        <span className={`mt-3 block text-sm ${w.needsCheck ? 'font-semibold' : 'text-muted'}`}>{checkLine(data, w, t)}</span>
      </button>
    </Card>
  );
}

// How much water there is, as a counter in the chosen unit, saved at once; and "Tjekket i dag",
// which is what most people do when they look at it.
function WaterSheet({ data, lists, lang, s, onClose, onChecked }: { data: ForraadData; lists: StockLists | null; lang: Lang; s: Strings; onClose: () => void; onChecked: () => void }) {
  const t = s.forraad;
  const w = useWater(data, lists, lang);
  const shown = Math.round(toUnit(w.have, w.unit) * 10) / 10;
  return (
    <>
      <div className="flex items-start justify-between gap-[12px] px-1">
        <div className="pt-1">
          <h2 id={WATER_TITLE_ID} className="text-xl font-semibold">
            {t.water}
          </h2>
          <p className="text-sm text-muted">{waterFigure(w, t)}</p>
        </div>
        <IconButton label={t.close} Icon={X} onClick={onClose} className="-mr-1 bg-surface" />
      </div>
      <div className="mt-4 flex flex-col gap-3 rounded-card bg-surface px-[20px] py-5">
        <Stepper
          label={t.waterLitres(unitLabel(w.unit))}
          value={shown}
          min={0}
          max={9999}
          decimal={{ lang }}
          onChange={(n) => forraad.setWater({ ...data.water, litres: Math.round(fromUnit(n, w.unit) * 100) / 100 })}
        />
        {w.need ? <WaterBar share={w.share} /> : null}
        <p className={`text-sm ${w.needsCheck ? 'font-semibold' : 'text-muted'}`}>{checkLine(data, w, t)}</p>
      </div>
      {/* OK closes (the amount is already saved); checking is the second step (owner 2026-11-06). */}
      <Button variant="primary" className="mt-4 w-full" onClick={onClose}>
        {t.ok}
      </Button>
      <Button
        variant="onPage"
        className="mt-3 w-full"
        onClick={() => {
          forraad.checkWater();
          onChecked();
        }}
      >
        {t.checkedToday}
      </Button>
    </>
  );
}

// A thing in a list: its name, then how many, the size and the month; the month is red when the
// thing has expired or soon will (D-054). The row opens the thing's sheet.
function ItemRow({ item, warn, lang, s, onOpen }: { item: StoreItem; warn: boolean; lang: Lang; s: Strings; onOpen: (id: string) => void }) {
  const { rest, date } = itemSummary(item, lang, s.forraad);
  return (
    <li>
      <button type="button" aria-haspopup="dialog" onClick={() => onOpen(item.id)} className="flex min-h-12 w-full items-center gap-[12px] py-2 text-left">
        <span className="flex-1">
          <span className="block font-medium">{item.name}</span>
          <span className="block text-sm text-muted">
            {rest}
            {date ? (
              <>
                {' · '}
                <span className={warn ? 'font-semibold text-danger' : ''}>{date}</span>
              </>
            ) : null}
          </span>
        </span>
        <ChevronRight aria-hidden="true" className="size-5 shrink-0 text-muted" />
      </button>
    </li>
  );
}

function Expiring({ items, lang, s, onOpen }: { items: StoreItem[]; lang: Lang; s: Strings; onOpen: (id: string) => void }) {
  const t = s.forraad;
  const { expired, soon } = expiring(items, thisMonth());
  if (expired.length + soon.length === 0) return null;
  return (
    <Card aria-labelledby="forraad-expiring">
      <h2 id="forraad-expiring" className="text-xl font-semibold">
        {t.expiringTitle}
      </h2>
      <ul className="flex flex-col divide-y divide-border">
        {[...expired, ...soon].map((item) => (
          <ItemRow key={item.id} item={item} warn lang={lang} s={s} onOpen={onOpen} />
        ))}
      </ul>
      {/* "Bedst før" is often fine after the date: look, smell, taste (D-054). */}
      <a href={hrefs.guide(DATES_GUIDE_ID)} className="mt-1 flex min-h-11 items-center text-sm font-medium underline underline-offset-4">
        {t.datesGuide}
      </a>
    </Card>
  );
}

// While searching, the card shows only its matches, without the link to its stock list.
function CategoryCard(props: { category: Category; items: StoreItem[]; lists: StockLists; searching: boolean; lang: Lang; s: Strings; onOpen: (id: string) => void }) {
  const { category, items: all, lists, searching, lang, s, onOpen } = props;
  const t = s.forraad;
  const items = all.filter((i) => i.category === category).sort((a, b) => a.name.localeCompare(b.name, localeOf(lang)));
  const guideId = lists.recommendations.find((r) => r.category === category)?.guideId;
  const { expired, soon } = expiring(items, thisMonth());
  const id = `forraad-${category}`;

  return (
    <Card aria-labelledby={id}>
      <div className="-mt-2 -mr-2 flex items-center justify-between gap-[12px]">
        <h2 id={id} className="text-xl font-semibold">
          {t.categories[category]}
        </h2>
        <a href={hrefs.forraadNew(category)} aria-label={t.addIn(t.categories[category])} className="grid size-11 place-items-center rounded-full">
          <Plus aria-hidden="true" className="size-5" />
        </a>
      </div>
      {items.length === 0 ? (
        <p className="text-muted">{t.categoryEmpty}</p>
      ) : (
        <ul className="flex flex-col divide-y divide-border">
          {items.map((item) => (
            <ItemRow key={item.id} item={item} warn={expired.includes(item) || soon.includes(item)} lang={lang} s={s} onOpen={onOpen} />
          ))}
        </ul>
      )}
      {guideId && !searching ? (
        <a href={hrefs.guide(guideId)} className="mt-1 flex min-h-11 items-center text-sm font-medium underline underline-offset-4">
          {t.seeRecommendations(lists.guideTitles[guideId]!)}
        </a>
      ) : null}
    </Card>
  );
}
