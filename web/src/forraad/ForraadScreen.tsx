// Forråd (D-046): the household's stores. Water at the top (how much, against the stock list's
// 3 litres per person per day; when it was last checked), then the household, what expires soon,
// each category with what the stock lists also recommend, and a copy of it all as a file.

import { ChevronRight, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Card, Choice, MessageState, Page, TabHeader } from '../components/ui';
import type { DbClient } from '../db/client';
import type { Lang, Strings } from '../i18n/strings';
import { hrefs } from '../router';
import { usePreferences } from '../settings/preferences';
import { Backup } from './Backup';
import { daysUntil, expiring, formatGrams, formatVolume, fromUnit, missing, nextCheck, scaleAmount, toUnit, waterNeeded, waterTotal, type Recommendation } from './calc';
import { useStockLists, type StockLists } from './recommendations';
import { CATEGORIES, forraad, TARGET_DAYS, today, useForraad, type Category, type ForraadData, type StoreItem, type TargetDays } from './store';

// How many recommendations a category shows before "Vis alle".
const CONSIDER_SHOWN = 4;

export const locale = (lang: Lang) => (lang === 'da' ? 'da-DK' : 'en-GB');

export function formatDate(iso: string, lang: Lang): string {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y!, m! - 1, d!);
  const sameYear = date.getFullYear() === new Date().getFullYear();
  return new Intl.DateTimeFormat(locale(lang), { day: 'numeric', month: 'short', ...(sameYear ? {} : { year: 'numeric' }) }).format(date);
}

export function ForraadScreen({ db, lang, s }: { db: DbClient; lang: Lang; s: Strings }) {
  const t = s.forraad;
  const data = useForraad();
  const lists = useStockLists(db);

  useEffect(() => {
    document.title = `${t.title} – ${s.appTitle}`;
  }, [t, s]);

  return (
    <Page>
      <TabHeader title={t.title} settingsLabel={s.settingsOpen} />
      <p className="-mt-2 mb-4 px-1 text-muted">{t.subtitle}</p>
      <div className="flex flex-col gap-4">
        {data.items.length === 0 ? (
          <Card>
            <h2 className="text-xl font-semibold">{t.emptyTitle}</h2>
            <p className="mt-1 text-muted">{t.emptyBody}</p>
          </Card>
        ) : null}
        <WaterCard data={data} lists={lists} lang={lang} s={s} />
        <HouseholdCard data={data} lang={lang} s={s} />
        <Expiring items={data.items} lang={lang} s={s} />
        {lists ? (
          CATEGORIES.map((c) => <CategoryCard key={c} category={c} data={data} lists={lists} lang={lang} s={s} />)
        ) : (
          <MessageState title={t.loading} />
        )}
        <Backup lang={lang} s={s} />
      </div>
    </Page>
  );
}

function WaterCard({ data, lists, lang, s }: { data: ForraadData; lists: StockLists | null; lang: Lang; s: Strings }) {
  const t = s.forraad;
  const unit = usePreferences().waterUnit;
  const have = waterTotal(data.items);
  const need = waterNeeded(data.household, lists?.litresPerPersonDay ?? null);
  const share = need ? Math.min(1, have / need) : 0;
  const check = nextCheck(data.water.lastChecked, today());
  const vol = (l: number) => formatVolume(l, unit, locale(lang));

  return (
    <Card aria-labelledby="forraad-water">
      <div className="flex items-baseline justify-between gap-[12px]">
        <h2 id="forraad-water" className="text-xl font-semibold">
          {t.water}
        </h2>
        <a href={hrefs.forraadNew('water')} className="flex min-h-11 items-center gap-[4px] font-medium">
          <Plus aria-hidden="true" className="size-5" />
          {t.addWater}
        </a>
      </div>
      <p className="mt-2 text-[min(2.25rem,10vw)] leading-tight tracking-tight tabular-nums">{need ? t.waterOf(vol(have), vol(need)) : t.waterHave(vol(have))}</p>
      {need ? (
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-background" aria-hidden="true">
          <div className="h-full rounded-full bg-accent" style={{ width: `${share * 100}%` }} />
        </div>
      ) : null}
      {lists?.litresPerPersonDay ? <p className="mt-3 text-sm text-muted">{t.waterTarget(data.household.targetDays, vol(lists.litresPerPersonDay))}</p> : null}
      {data.household.petLitresPerDay === 0 ? <p className="mt-1 text-sm text-muted">{t.waterPetsNote}</p> : null}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-x-[12px] gap-y-2 border-t border-border pt-4">
        <div>
          <p className="font-medium">{data.water.lastChecked ? t.lastChecked(formatDate(data.water.lastChecked, lang)) : t.neverChecked}</p>
          {check ? (
            <p className={`text-sm ${check.due ? 'font-semibold text-text' : 'text-muted'}`} role={check.due ? 'status' : undefined}>
              {check.due ? t.checkDue(formatDate(check.date, lang)) : t.checkAgain(formatDate(check.date, lang))}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => forraad.checkWater()}
          disabled={data.water.lastChecked === today()}
          className="min-h-11 rounded-full bg-ink px-[18px] font-medium text-on-ink disabled:opacity-50"
        >
          {t.checkedToday}
        </button>
      </div>
      <p className="mt-2 text-sm text-muted">{t.checkSource}</p>
    </Card>
  );
}

function HouseholdCard({ data, lang, s }: { data: ForraadData; lang: Lang; s: Strings }) {
  const t = s.forraad;
  const unit = usePreferences().waterUnit;
  const [open, setOpen] = useState(false);
  const h = data.household;
  const petLitres = h.petLitresPerDay > 0 ? formatVolume(h.petLitresPerDay, unit, locale(lang)) : null;

  return (
    <Card aria-labelledby="forraad-household">
      <div className="flex items-center justify-between gap-[12px]">
        <div>
          <h2 id="forraad-household" className="font-semibold">
            {t.household}
          </h2>
          <p className="text-muted">{t.householdSummary(h.people, h.targetDays, petLitres)}</p>
        </div>
        <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="min-h-11 shrink-0 rounded-full bg-background px-[16px] font-medium">
          {open ? t.done : t.editHousehold}
        </button>
      </div>
      {open ? (
        <div className="mt-4 flex flex-col gap-4">
          <Stepper label={t.people} value={h.people} min={1} max={50} onChange={(people) => forraad.setHousehold({ ...h, people })} />
          <label className="flex flex-col gap-1">
            <span className="font-semibold">{t.petLitres}</span>
            <span className="text-sm text-muted">{t.petLitresHelp}</span>
            <span className="flex items-center gap-[8px]">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={0.1}
                value={h.petLitresPerDay ? Math.round(toUnit(h.petLitresPerDay, unit) * 10) / 10 : ''}
                placeholder="0"
                onChange={(e) => {
                  const v = Number(e.target.value.replace(',', '.'));
                  forraad.setHousehold({ ...h, petLitresPerDay: Number.isFinite(v) && v > 0 ? fromUnit(v, unit) : 0 });
                }}
                className="min-h-11 w-28 rounded-xl border border-border bg-background px-[12px]"
              />
              <span>{unit === 'gallons' ? 'gal' : 'L'}</span>
            </span>
          </label>
          <div>
            <Choice<`${TargetDays}`>
              name="targetDays"
              legend={t.targetDays}
              value={`${h.targetDays}`}
              onChange={(v) => forraad.setHousehold({ ...h, targetDays: Number(v) as TargetDays })}
              options={TARGET_DAYS.map((d) => ({ value: `${d}` as `${TargetDays}`, label: t.days(d) }))}
            />
            <p className="mt-1 text-sm text-muted">{t.targetHelp}</p>
          </div>
        </div>
      ) : null}
    </Card>
  );
}

export function Stepper({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (n: number) => void }) {
  return (
    <div className="flex items-center justify-between gap-[12px]">
      <span className="font-semibold" id={`stepper-${label}`}>
        {label}
      </span>
      <span className="flex items-center gap-[4px]" role="group" aria-labelledby={`stepper-${label}`}>
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label={`${label} −1`} className="grid size-11 place-items-center rounded-full bg-background text-xl disabled:opacity-40">
          −
        </button>
        <output className="min-w-10 text-center text-lg tabular-nums" aria-live="polite">
          {value}
        </output>
        <button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label={`${label} +1`} className="grid size-11 place-items-center rounded-full bg-background text-xl disabled:opacity-40">
          +
        </button>
      </span>
    </div>
  );
}

function Expiring({ items, lang, s }: { items: StoreItem[]; lang: Lang; s: Strings }) {
  const t = s.forraad;
  const { expired, soon } = expiring(items, today());
  if (expired.length + soon.length === 0) return null;
  return (
    <Card aria-labelledby="forraad-expiring" className="bg-note-bg text-note-text">
      <h2 id="forraad-expiring" className="text-xl font-semibold">
        {t.expiringTitle}
      </h2>
      <ul className="mt-2 flex flex-col">
        {[...expired, ...soon].map((item) => (
          <li key={item.id}>
            <a href={hrefs.forraadItem(item.id)} className="flex min-h-11 items-center justify-between gap-[12px] py-1">
              <span className="font-medium">{item.name}</span>
              <span className={`shrink-0 text-sm ${expired.includes(item) ? 'font-semibold' : ''}`}>
                {expired.includes(item) ? t.expired(formatDate(item.expires!, lang)) : t.expires(formatDate(item.expires!, lang))}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function CategoryCard({ category, data, lists, lang, s }: { category: Category; data: ForraadData; lists: StockLists; lang: Lang; s: Strings }) {
  const t = s.forraad;
  const unit = usePreferences().waterUnit;
  const items = data.items.filter((i) => i.category === category).sort((a, b) => a.name.localeCompare(b.name, 'da'));
  const recs = missing(
    lists.recommendations.filter((r) => r.category === category),
    data.items,
  );
  const guideId = Object.entries(lists.guideTitles).find(([id]) => lists.recommendations.some((r) => r.guideId === id && r.category === category))?.[0];
  const id = `forraad-${category}`;
  const [showAll, setShowAll] = useState(false);
  const shown = showAll ? recs : recs.slice(0, CONSIDER_SHOWN);

  return (
    <Card aria-labelledby={id}>
      <div className="flex items-baseline justify-between gap-[12px]">
        <h2 id={id} className="text-xl font-semibold">
          {t.categories[category]}
        </h2>
        <a href={hrefs.forraadNew(category)} aria-label={t.addIn(t.categories[category])} className="flex min-h-11 items-center gap-[4px] font-medium">
          <Plus aria-hidden="true" className="size-5" />
          {t.add}
        </a>
      </div>
      {items.length === 0 ? (
        <p className="mt-1 text-muted">{t.categoryEmpty}</p>
      ) : (
        <ul className="mt-1 flex flex-col divide-y divide-border">
          {items.map((item) => (
            <li key={item.id}>
              <a href={hrefs.forraadItem(item.id)} aria-label={t.edit(item.name)} className="flex min-h-12 items-center gap-[12px] py-2">
                <span className="flex-1">
                  <span className="block font-medium">{item.name}</span>
                  <span className="block text-sm text-muted">
                    {[
                      item.litresEach ? `${t.countLabel(item.count)} × ${formatVolume(item.litresEach, unit, locale(lang))}` : t.countLabel(item.count),
                      item.expires ? (daysUntil(item.expires, today()) < 0 ? t.expired : t.expires)(formatDate(item.expires, lang)) : null,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </span>
                </span>
                <ChevronRight aria-hidden="true" className="size-5 shrink-0 text-muted" />
              </a>
            </li>
          ))}
        </ul>
      )}
      {recs.length > 0 ? (
        <div className="mt-4 border-t border-border pt-3">
          <h3 className="font-semibold">{t.consider}</h3>
          <ul className="mt-1 flex flex-col">
            {shown.map((r) => (
              <li key={r.id}>
                <a href={hrefs.forraadNew(category, r.id)} className="flex min-h-11 items-center gap-[10px] py-1">
                  <Plus aria-hidden="true" className="size-4 shrink-0 text-muted" />
                  <span className="flex-1">
                    {r.name}
                    {r.amount ? <span className="block text-sm text-muted">{t.forHousehold(amountText(r, data, unit, lang))}</span> : null}
                  </span>
                </a>
              </li>
            ))}
          </ul>
          {recs.length > CONSIDER_SHOWN ? (
            <button type="button" onClick={() => setShowAll(!showAll)} aria-expanded={showAll} className="mt-1 min-h-11 font-medium underline underline-offset-4">
              {showAll ? t.showFewer : t.showAll(recs.length)}
            </button>
          ) : null}
        </div>
      ) : null}
      {guideId ? (
        <a href={hrefs.guide(guideId)} className="mt-3 flex min-h-11 items-center gap-[4px] text-sm font-medium underline underline-offset-4">
          {t.readStockList(lists.guideTitles[guideId]!)}
        </a>
      ) : null}
    </Card>
  );
}

function amountText(r: Recommendation, data: ForraadData, unit: 'litres' | 'gallons', lang: Lang): string {
  const total = scaleAmount(r.amount!, data.household);
  return r.amount!.unit === 'L' ? formatVolume(total, unit, locale(lang)) : formatGrams(total, locale(lang));
}
