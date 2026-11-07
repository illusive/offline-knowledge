// Omregn mål (D-068): an amount in a US unit (cups, spoons, ounces, pounds, inches, °F) to metric,
// as the food guides' US recipes need. The factors are NIST's (convert/units.ts); all on the phone.

import { useState } from 'react';
import { Card, inputClass, Page, SubPageHeader } from '../components/ui';
import { convert, UNITS, type Converted, type Unit } from '../convert/units';
import { localeOf, parseDecimal } from '../i18n/format';
import type { Lang, Strings } from '../i18n/strings';
import { usePageTitle } from '../lib/usePageTitle';
import { hrefs } from '../router';

export function ConvertScreen({ lang, s }: { lang: Lang; s: Strings }) {
  const t = s.convert;
  usePageTitle(t.title, s.appTitle);
  const [amount, setAmount] = useState('1');
  const [unit, setUnit] = useState<Unit>('cup');
  const value = parseDecimal(amount);
  const result = value === null ? null : convert(value, unit);

  return (
    <Page>
      <SubPageHeader backLabel={s.back} backTo={hrefs.tools} title={t.title} subtitle={t.subtitle} />
      <div className="flex flex-col gap-3">
        <Card as="div" className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-[12px]">
            <label className="flex min-w-[7rem] flex-1 flex-col gap-1">
              <span className="font-semibold">{t.amount}</span>
              <input type="text" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} className={inputClass} autoComplete="off" />
            </label>
            <label className="flex min-w-[10rem] flex-[2] flex-col gap-1">
              <span className="font-semibold">{t.unit}</span>
              <select value={unit} onChange={(e) => setUnit(e.target.value as Unit)} className={inputClass}>
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    {t.units[u]}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <p role="status" className="text-[min(2.25rem,10vw)] leading-tight tracking-tight tabular-nums">
            {result ? formatResult(result, lang) : amount.trim() === '' ? '' : t.notANumber}
          </p>
        </Card>
        <p className="px-1 text-sm text-muted">{t.note}</p>
        <p className="px-1 text-sm text-muted">{t.source}</p>
      </div>
    </Page>
  );
}

function formatResult(r: Converted, lang: Lang): string {
  const n = (x: number, digits: number) => new Intl.NumberFormat(localeOf(lang), { maximumFractionDigits: digits }).format(x);
  switch (r.kind) {
    case 'temperature':
      return `${n(Math.round(r.celsius), 0)} °C`;
    case 'length':
      return `${n(r.cm, 1)} cm`;
    case 'mass':
      return Math.abs(r.g) >= 1000 ? `${n(r.g / 1000, 2)} kg` : `${n(r.g, Math.abs(r.g) < 10 ? 1 : 0)} g`;
    case 'volume':
      if (Math.abs(r.ml) >= 1000) return `${n(r.ml / 1000, 2)} L`;
      if (Math.abs(r.ml) >= 100) return `${n(r.ml / 100, 1)} dl (${n(r.ml, 0)} ml)`;
      return `${n(r.ml, Math.abs(r.ml) < 10 ? 1 : 0)} ml`;
  }
}
