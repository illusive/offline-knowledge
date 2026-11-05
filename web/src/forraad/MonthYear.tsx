// A month and a year (D-046): precise enough for long-life stores. The value is yyyy-mm, or '' for
// no date. Where the browser has a month field, as Safari on the iPhone does, it is one field that
// opens the phone's own roller with month and year side by side (D-051); an optional date has a
// button to remove it, since the roller's own reset is easy to miss. Elsewhere it is two selects in
// one row.

import { X } from 'lucide-react';
import { inputClass } from '../components/ui';
import { monthName } from '../i18n/format';
import type { Lang } from '../i18n/strings';

// Whether this browser has a month field (a type it does not know reads back as "text").
let monthField: boolean | undefined;
function hasMonthField(): boolean {
  if (monthField === undefined) {
    const input = document.createElement('input');
    input.setAttribute('type', 'month');
    monthField = input.type === 'month';
  }
  return monthField;
}

const field = `${inputClass} min-h-12 text-lg`; // as tall as the name field, for readability

type Props = {
  id: string;
  label: string;
  help?: string;
  value: string;
  onChange: (value: string) => void;
  lang: Lang;
  noDate?: string; // set for an optional date: the "no date" choice in the selects
  clearLabel?: string; // and the button that removes it next to the month field
  monthLabel: string;
  yearLabel: string;
  firstYear?: number;
  years?: number;
};
type Range = { firstYear: number; years: number };

export function MonthYear(props: Props) {
  const range: Range = { firstYear: props.firstYear ?? new Date().getFullYear() - 1, years: props.years ?? 12 };
  return hasMonthField() ? <MonthField {...props} {...range} /> : <MonthSelects {...props} {...range} />;
}

function Help({ id, help }: { id: string; help?: string }) {
  return help ? (
    <p id={`${id}-help`} className="text-sm text-muted">
      {help}
    </p>
  ) : null;
}

function MonthField({ id, label, help, value, onChange, noDate, clearLabel, firstYear, years }: Props & Range) {
  const optional = noDate !== undefined;
  return (
    <div className="min-w-0">
      <label htmlFor={`${id}-month`} className="font-semibold">
        {label}
      </label>
      <Help id={id} help={help} />
      <div className="mt-1 flex gap-[8px]">
        <input
          id={`${id}-month`}
          type="month"
          value={value}
          min={`${firstYear}-01`}
          max={`${firstYear + years - 1}-12`}
          onChange={(e) => {
            // The roller's reset gives '' (no date); a required date keeps its last month.
            if (e.target.value || optional) onChange(e.target.value);
          }}
          aria-describedby={help ? `${id}-help` : undefined}
          className={`${field} min-w-0 flex-1 text-left [&::-webkit-date-and-time-value]:text-left`}
        />
        {optional && value ? (
          <button type="button" onClick={() => onChange('')} aria-label={clearLabel} className="grid size-12 shrink-0 place-items-center rounded-xl bg-background">
            <X aria-hidden="true" className="size-5" />
          </button>
        ) : null}
      </div>
    </div>
  );
}

function MonthSelects({ id, label, help, value, onChange, lang, noDate, monthLabel, yearLabel, firstYear, years }: Props & Range) {
  const now = new Date();
  const yearList = Array.from({ length: years }, (_, i) => firstYear + i);
  const [y, m] = value ? value.split('-').map(Number) : [null, null];
  const pad = (n: number) => String(n).padStart(2, '0');
  // Choosing a month first takes this year (or next, if the month has passed); a year first takes January.
  const setMonth = (month: number | null) => {
    if (month === null) return onChange('');
    const year = y ?? (month < now.getMonth() + 1 ? now.getFullYear() + 1 : now.getFullYear());
    onChange(`${year}-${pad(month)}`);
  };
  const setYear = (year: number | null) => {
    if (year === null) return onChange('');
    onChange(`${year}-${pad(m ?? 1)}`);
  };

  return (
    <fieldset className="min-w-0" aria-describedby={help ? `${id}-help` : undefined}>
      <legend className="font-semibold">{label}</legend>
      <Help id={id} help={help} />
      {/* Always one row: the month takes the room, the year is as wide as its numbers. */}
      <div className="mt-1 flex gap-[8px]">
        <select id={`${id}-month`} aria-label={monthLabel} value={m ?? ''} onChange={(e) => setMonth(e.target.value ? Number(e.target.value) : null)} className={`${field} min-w-0 flex-1`}>
          <option value="">{noDate ?? monthLabel}</option>
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i} value={i + 1}>
              {monthName(i, lang)}
            </option>
          ))}
        </select>
        <select id={`${id}-year`} aria-label={yearLabel} value={y ?? ''} onChange={(e) => setYear(e.target.value ? Number(e.target.value) : null)} className={`${field} shrink-0`}>
          <option value="">{yearLabel}</option>
          {yearList.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
    </fieldset>
  );
}
