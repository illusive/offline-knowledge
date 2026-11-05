// Forråd (D-046): an overview of what the household has. Water first (one figure against the stock
// list's 3 litres per person per day; when it was last checked), then a button to add, what expires
// soon and each category with its things and a link to its stock list. Household and the backup
// are in Settings; the page itself stays short.

import { ChevronRight, Pencil, Plus } from 'lucide-react';
import { useState } from 'react';
import { Button, ButtonLink, Card, IconButton, inputClass, MessageState, Page, Sheet, TabHeader } from '../components/ui';
import type { DbClient } from '../db/client';
import type { Lang, Strings } from '../i18n/strings';
import { hrefs } from '../router';
import { usePreferences } from '../settings/preferences';
import { decimalForInput, localeOf, formatMonth, formatVolume, fromUnit, parseDecimal, thisMonth, toUnit, unitLabel } from '../i18n/format';
import { expiring, nextCheck, waterNeeded } from './calc';
import { ItemSheet, itemSummary, SHEET_TITLE_ID } from './ItemSheet';
import { MonthYear } from './MonthYear';
import { useStockLists, type StockLists } from './recommendations';
import { CATEGORIES, forraad, useForraad, type Category, type ForraadData, type StoreItem, type Water } from './store';
import { usePageTitle } from '../lib/usePageTitle';

export function ForraadScreen({ db, lang, s }: { db: DbClient; lang: Lang; s: Strings }) {
  const t = s.forraad;
  const data = useForraad();
  const lists = useStockLists(db);
  const empty = data.items.length === 0;
  // The thing whose sheet is open (D-049), and what was last done to one.
  const [openId, setOpenId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const openItem = data.items.find((i) => i.id === openId);
  const onOpen = (id: string) => {
    setStatus(null);
    setOpenId(id);
  };

  usePageTitle(t.title, s.appTitle);

  return (
    <Page>
      <TabHeader title={t.title} settingsLabel={s.settingsOpen} />
      <div className="flex flex-col gap-4">
        <WaterCard data={data} lists={lists} lang={lang} s={s} />
        <ButtonLink variant="primary" href={hrefs.forraadNew()}>
          <Plus aria-hidden="true" className="size-5" />
          {t.addTitle}
        </ButtonLink>
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
        ) : (
          <>
            <Expiring items={data.items} lang={lang} s={s} onOpen={onOpen} />
            {lists ? CATEGORIES.map((c) => <CategoryCard key={c} category={c} items={data.items} lists={lists} lang={lang} s={s} onOpen={onOpen} />) : <MessageState title={t.loading} />}
          </>
        )}
      </div>
      <Sheet open={Boolean(openItem)} onClose={() => setOpenId(null)} labelledBy={SHEET_TITLE_ID}>
        {openItem ? (
          <ItemSheet
            key={openItem.id}
            item={openItem}
            lang={lang}
            s={s}
            onClose={() => setOpenId(null)}
            onDone={(message) => {
              setStatus(message);
              setOpenId(null);
            }}
          />
        ) : null}
      </Sheet>
    </Page>
  );
}

function WaterCard({ data, lists, lang, s }: { data: ForraadData; lists: StockLists | null; lang: Lang; s: Strings }) {
  const t = s.forraad;
  const unit = usePreferences().waterUnit;
  const [editing, setEditing] = useState(false);
  const have = data.water.litres;
  const need = waterNeeded(data.household, lists?.litresPerPersonDay ?? null);
  const share = need ? Math.min(1, have / need) : 0;
  const check = nextCheck(data.water.lastChecked, thisMonth());
  const vol = (l: number) => formatVolume(l, unit, lang);
  const month = (m: string) => formatMonth(m, lang);
  const needsCheck = !data.water.lastChecked || check?.due;

  return (
    <Card aria-labelledby="forraad-water">
      <div className="-mt-2 -mr-2 flex items-center justify-between gap-[12px]">
        <h2 id="forraad-water" className="text-xl font-semibold">
          {t.water}
        </h2>
        {editing ? null : (
          <IconButton label={t.waterEdit} Icon={Pencil} onClick={() => setEditing(true)} className="" />
        )}
      </div>
      <p className="mt-1 text-[min(2.25rem,10vw)] leading-tight tracking-tight tabular-nums">{need ? t.waterOf(vol(have), vol(need)) : t.waterHave(vol(have))}</p>
      {need ? (
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-background" aria-hidden="true">
          <div className="h-full rounded-full bg-accent" style={{ width: `${share * 100}%` }} />
        </div>
      ) : null}
      {editing ? (
        <WaterEditor water={data.water} unit={unit} lang={lang} s={s} onDone={() => setEditing(false)} />
      ) : (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-x-[12px] text-sm">
          <p className={needsCheck ? 'font-semibold' : 'text-muted'} role={check?.due ? 'status' : undefined}>
            {!data.water.lastChecked
              ? t.neverChecked
              : check?.due
                ? t.checkDue(month(check.month))
                : `${t.lastChecked(month(data.water.lastChecked))} · ${t.checkAgain(month(check!.month))}`}
          </p>
          {needsCheck ? (
            <button type="button" onClick={() => forraad.checkWater()} className="min-h-11 font-medium underline underline-offset-4">
              {t.checkedToday}
            </button>
          ) : null}
        </div>
      )}
    </Card>
  );
}

// How much water there is and when it was last checked: the only two things to enter for water.
function WaterEditor({ water, unit, lang, s, onDone }: { water: Water; unit: 'litres' | 'gallons'; lang: Lang; s: Strings; onDone: () => void }) {
  const t = s.forraad;
  const [amount, setAmount] = useState(water.litres ? decimalForInput(toUnit(water.litres, unit), lang) : '');
  const [checked, setChecked] = useState(water.lastChecked ?? thisMonth());
  const save = () => {
    const value = parseDecimal(amount);
    forraad.setWater({ litres: value !== null && value > 0 ? Math.round(fromUnit(value, unit) * 100) / 100 : 0, lastChecked: checked || null });
    onDone();
  };
  return (
    <form
      className="mt-4 flex flex-col gap-4 border-t border-border pt-4"
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      <label className="flex flex-col gap-1">
        <span className="font-semibold">{t.waterLitres(unitLabel(unit))}</span>
        <span className="flex items-center gap-[8px]">
          <input
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            autoFocus
            className={`${inputClass} min-h-12 w-32 text-lg`}
          />
          <span>{unitLabel(unit)}</span>
        </span>
      </label>
      <MonthYear id="water-checked" label={t.waterCheckedLabel} value={checked} onChange={setChecked} lang={lang} monthLabel={t.month} yearLabel={t.year} firstYear={new Date().getFullYear() - 5} years={6} />
      <div className="flex flex-wrap gap-[8px]">
        <Button type="submit" variant="primary" className="flex-1">
          {t.save}
        </Button>
        <Button onClick={onDone} variant="secondary">
          {t.cancel}
        </Button>
      </div>
    </form>
  );
}

function Expiring({ items, lang, s, onOpen }: { items: StoreItem[]; lang: Lang; s: Strings; onOpen: (id: string) => void }) {
  const t = s.forraad;
  const { expired, soon } = expiring(items, thisMonth());
  const month = (m: string) => formatMonth(m, lang);
  if (expired.length + soon.length === 0) return null;
  return (
    <Card aria-labelledby="forraad-expiring" className="bg-note-bg text-note-text">
      <h2 id="forraad-expiring" className="font-semibold">
        {t.expiringTitle}
      </h2>
      <ul className="mt-1 flex flex-col">
        {[...expired, ...soon].map((item) => (
          <li key={item.id}>
            <button type="button" aria-haspopup="dialog" onClick={() => onOpen(item.id)} className="flex min-h-11 w-full items-center justify-between gap-[12px] text-left">
              <span className="font-medium">{item.name}</span>
              <span className={`shrink-0 text-sm ${expired.includes(item) ? 'font-semibold' : ''}`}>
                {expired.includes(item) ? t.expired(month(item.expires!)) : t.expires(month(item.expires!))}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function CategoryCard({ category, items: all, lists, lang, s, onOpen }: { category: Category; items: StoreItem[]; lists: StockLists; lang: Lang; s: Strings; onOpen: (id: string) => void }) {
  const t = s.forraad;
  const items = all.filter((i) => i.category === category).sort((a, b) => a.name.localeCompare(b.name, localeOf(lang)));
  const guideId = lists.recommendations.find((r) => r.category === category)?.guideId;
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
            <li key={item.id}>
              <button type="button" aria-haspopup="dialog" onClick={() => onOpen(item.id)} className="flex min-h-12 w-full items-center gap-[12px] py-2 text-left">
                <span className="flex-1">
                  <span className="block font-medium">{item.name}</span>
                  <span className="block text-sm text-muted">{itemSummary(item, lang, t)}</span>
                </span>
                <ChevronRight aria-hidden="true" className="size-5 shrink-0 text-muted" />
              </button>
            </li>
          ))}
        </ul>
      )}
      {guideId ? (
        <a href={hrefs.guide(guideId)} className="mt-1 flex min-h-11 items-center text-sm font-medium underline underline-offset-4">
          {t.seeRecommendations(lists.guideTitles[guideId]!)}
        </a>
      ) : null}
    </Card>
  );
}
