// Forråd in Settings (D-046): the household the water target is worked out for, the water unit, and
// a copy of the stores as a file. Set once, so it lives here rather than on the Forråd page.

import { Card, Choice, Stepper } from '../components/ui';
import type { Lang, Strings } from '../i18n/strings';
import { setPreference, usePreferences, type WaterUnitPref } from '../settings/preferences';
import { Backup } from './Backup';
import { fromUnit, toUnit } from './calc';
import { forraad, TARGET_DAYS, useForraad, type TargetDays } from './store';

export function HouseholdSettings({ lang, s }: { lang: Lang; s: Strings }) {
  const t = s.forraad;
  const unit = usePreferences().waterUnit;
  const h = useForraad().household;
  return (
    <>
      <Card aria-labelledby="settings-forraad" className="flex flex-col gap-5">
        <h2 id="settings-forraad" className="text-xl font-semibold">
          {t.title}
        </h2>
        <Stepper label={t.people} value={h.people} min={1} max={50} onChange={(people) => forraad.setHousehold({ ...h, people })} />
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
        <label className="flex flex-col gap-1">
          <span className="font-semibold">{t.petLitres}</span>
          <span className="text-sm text-muted">{t.petLitresHelp}</span>
          <span className="flex items-center gap-[8px]">
            <input
              type="text"
              inputMode="decimal"
              defaultValue={h.petLitresPerDay ? String(Math.round(toUnit(h.petLitresPerDay, unit) * 10) / 10).replace('.', lang === 'da' ? ',' : '.') : ''}
              key={unit}
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
        <Choice<WaterUnitPref>
          name="waterUnit"
          legend={s.settings.waterUnit}
          value={unit}
          onChange={(v) => setPreference('waterUnit', v)}
          options={[
            { value: 'litres', label: s.settings.litres },
            { value: 'gallons', label: s.settings.gallons },
          ]}
        />
        <p className="text-sm text-muted">{t.checkSource}</p>
      </Card>
      <Backup lang={lang} s={s} />
    </>
  );
}
