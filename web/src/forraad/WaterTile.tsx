// Water on Home (D-054): a square tile with a ring showing how much of what the household needs is
// stored. Shown only once some water is entered; a tap opens Forråd. The ring is in the text
// colour on a border-coloured track, since lime is too faint on the light background.

import type { DbClient } from '../db/client';
import { formatVolume } from '../i18n/format';
import type { Lang, Strings } from '../i18n/strings';
import { hrefs } from '../router';
import { usePreferences } from '../settings/preferences';
import { waterNeeded } from './calc';
import { useStockLists } from './recommendations';
import { useForraad } from './store';

const R = 42;
const CIRCUMFERENCE = 2 * Math.PI * R;

export function WaterTile({ db, lang, s }: { db: DbClient; lang: Lang; s: Strings }) {
  const t = s.forraad;
  const data = useForraad();
  const lists = useStockLists(db);
  const unit = usePreferences().waterUnit;
  const have = data.water.litres;
  if (have <= 0) return null;
  const need = waterNeeded(data.household, lists?.litresPerPersonDay ?? null);
  const share = need ? Math.min(1, have / need) : 0;
  const vol = (l: number) => formatVolume(l, unit, lang);

  return (
    <a href={hrefs.forraad} aria-label={`${t.water}: ${need ? t.waterOf(vol(have), vol(need)) : t.waterHave(vol(have))}`} className="flex min-h-36 flex-col justify-between gap-4 rounded-card bg-surface px-[20px] py-5">
      <span className="flex items-start justify-between gap-[8px]" aria-hidden="true">
        {need ? (
          <svg viewBox="0 0 100 100" className="size-16 shrink-0 -rotate-90">
            <circle cx="50" cy="50" r={R} fill="none" strokeWidth="12" className="stroke-border" />
            <circle cx="50" cy="50" r={R} fill="none" strokeWidth="12" strokeLinecap="round" className="stroke-accent" strokeDasharray={`${share * CIRCUMFERENCE} ${CIRCUMFERENCE}`} />
          </svg>
        ) : null}
        {need ? <span className="text-sm text-muted">{t.waterOfShort(vol(need))}</span> : null}
      </span>
      <span aria-hidden="true">
        <span className="block text-2xl leading-tight tabular-nums">{vol(have)}</span>
        <span className="block text-xl font-semibold">{t.water}</span>
      </span>
    </a>
  );
}
