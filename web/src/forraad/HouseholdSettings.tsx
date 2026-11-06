// Forråd in Settings (D-046): the household the water target is worked out for, the water unit, and
// a copy of the stores as a file. Set once, so it lives here rather than on the Forråd page.

import { Card, Choice, Stepper } from '../components/ui';
import type { Strings } from '../i18n/strings';
import { setPreference, usePreferences, type WaterUnitPref } from '../settings/preferences';
import { Backup } from './Backup';
import { forraad, TARGET_DAYS, useForraad, type TargetDays } from './store';

export function HouseholdSettings({ s }: { s: Strings }) {
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
      <Backup s={s} />
    </>
  );
}
