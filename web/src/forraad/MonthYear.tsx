// A month and a year (D-046): precise enough for long-life stores, and quick on an iPhone, where the
// two native selects open as wheels without a keyboard. The value is yyyy-mm, or '' for no date.

import { inputClass } from '../components/ui';
import { monthName } from '../i18n/format';
import type { Lang } from '../i18n/strings';

export function MonthYear(props: { id: string; label: string; help?: string; value: string; onChange: (value: string) => void; lang: Lang; noDate?: string; monthLabel: string; yearLabel: string; firstYear?: number; years?: number }) {
  const { id, label, help, value, onChange, lang, noDate, monthLabel, yearLabel } = props;
  const now = new Date();
  const firstYear = props.firstYear ?? now.getFullYear() - 1;
  const years = Array.from({ length: props.years ?? 12 }, (_, i) => firstYear + i);
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
  const select = `${inputClass} text-base`;

  return (
    <fieldset className="min-w-0" aria-describedby={help ? `${id}-help` : undefined}>
      <legend className="font-semibold">{label}</legend>
      {help ? (
        <p id={`${id}-help`} className="text-sm text-muted">
          {help}
        </p>
      ) : null}
      {/* Always one row: the month takes the room, the year is as wide as its numbers. */}
      <div className="mt-1 flex gap-[8px]">
        <select id={`${id}-month`} aria-label={monthLabel} value={m ?? ''} onChange={(e) => setMonth(e.target.value ? Number(e.target.value) : null)} className={`${select} min-w-0 flex-1`}>
          <option value="">{noDate ?? monthLabel}</option>
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i} value={i + 1}>
              {monthName(i, lang)}
            </option>
          ))}
        </select>
        <select id={`${id}-year`} aria-label={yearLabel} value={y ?? ''} onChange={(e) => setYear(e.target.value ? Number(e.target.value) : null)} className={`${select} shrink-0`}>
          <option value="">{yearLabel}</option>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
    </fieldset>
  );
}
