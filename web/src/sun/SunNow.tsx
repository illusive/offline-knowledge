// "Solen lige nu" and "Månen" in the sun tool (D-058). Where the sun is this minute lets you find
// north without a compass: face the sun, and north is the sun's direction away to the left. The
// moon's phase and its rise and set tell how light the night will be. Worked out on the phone.

import { cardinal } from '../compass/heading';
import { formatClock } from '../i18n/format';
import type { Lang, Strings } from '../i18n/strings';
import { useNow } from '../lib/useNow';
import { moonDay } from './moon';
import { coordsOf, type Place } from './place';
import { sunPosition } from './sun';
import { Row } from './SunRows';

const UP = -0.833; // the sun's upper edge on the horizon

// Which way north is for someone facing the sun.
export function northFromSun(azimuth: number, t: Strings['sun']): string {
  const a = Math.round(azimuth) % 360;
  if (a <= 5 || a >= 355) return t.northAhead;
  if (Math.abs(a - 180) <= 5) return t.northBehind;
  return a < 180 ? t.northLeft(a) : t.northRight(360 - a);
}

export function SunNow({ place, lang, t }: { place: Place; lang: Lang; t: Strings['sun'] }) {
  const now = useNow(60_000);
  const { lat, lon } = coordsOf(place);
  const { azimuth, elevation } = sunPosition(new Date(now), lat, lon);
  const up = elevation > UP;
  return (
    <section aria-labelledby="sun-now-title" className="flex flex-col gap-3 rounded-card bg-surface px-[20px] py-5">
      <h2 id="sun-now-title" className="text-lg font-semibold">
        {t.nowTitle}
      </h2>
      {up ? (
        <div className="flex items-center gap-[16px]">
          <NorthDial azimuth={azimuth} />
          <div className="flex flex-col gap-1">
            <p>{t.nowDirection(cardinal(azimuth, lang), Math.round(azimuth) % 360, Math.max(0, Math.round(elevation)))}</p>
            <p className="font-semibold">
              {t.faceSun} {northFromSun(azimuth, t)}
            </p>
          </div>
        </div>
      ) : (
        <p>{t.nowDown}</p>
      )}
    </section>
  );
}

// You face the sun (at the top); the arrow shows north. Decorative: the text says the same.
function NorthDial({ azimuth }: { azimuth: number }) {
  return (
    <svg viewBox="0 0 100 100" className="size-24 shrink-0" aria-hidden="true">
      <circle cx="50" cy="50" r="44" className="fill-background stroke-border" strokeWidth="2" />
      <circle cx="50" cy="14" r="8" className="fill-accent stroke-text" strokeWidth="1.5" />
      <g transform={`rotate(${-azimuth} 50 50)`}>
        <line x1="50" y1="50" x2="50" y2="20" className="stroke-text" strokeWidth="3" strokeLinecap="round" />
        <polygon points="50,12 43,24 57,24" className="fill-text" />
        <text x="50" y="40" textAnchor="middle" className="fill-text text-[12px] font-bold" transform={`rotate(${azimuth} 50 40)`}>
          N
        </text>
      </g>
      <circle cx="50" cy="50" r="3" className="fill-text" />
    </svg>
  );
}

export function MoonCard({ place, date, lang, t }: { place: Place; date: string; lang: Lang; t: Strings['sun'] }) {
  const [y, m, d] = date.split('-').map(Number) as [number, number, number];
  const { lat, lon } = coordsOf(place);
  const moon = moonDay(new Date(y, m - 1, d), new Date(y, m - 1, d + 1), lat, lon);
  const events = [
    { label: t.moonrise, at: moon.rise, none: t.moonNoRise },
    { label: t.moonset, at: moon.set, none: t.moonNoSet },
  ].sort((a, b) => (a.at?.getTime() ?? Infinity) - (b.at?.getTime() ?? Infinity));
  return (
    <section aria-labelledby="moon-title" className="flex flex-col rounded-card bg-surface px-[20px] pt-5">
      <h2 id="moon-title" className="text-lg font-semibold">
        {t.moonTitle}
      </h2>
      <dl className="flex flex-col divide-y divide-border">
        <Row label={t.moonPhases[moon.phase]} detail={t.moonLit(Math.round(moon.illuminated * 100))} />
        {events.map((e) => (
          <Row key={e.label} label={e.label} value={e.at ? formatClock(e.at, lang) : undefined} detail={e.at ? undefined : e.none} />
        ))}
      </dl>
    </section>
  );
}
