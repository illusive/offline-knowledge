// The day's length through the year at the chosen place (D-056): one area from 0 to 24 hours, a
// dot on the chosen day, and the shortest and longest day as text. Drawn from the theme's tokens,
// so it follows light and dark. The picture is described in words (role="img"), and the same
// figures are written under it.

import { formatDayMonth, formatDuration, monthLetters } from '../i18n/format';
import type { Lang, Strings } from '../i18n/strings';
import { Card } from '../components/ui';
import { yearOfDayLengths } from './sun';

const W = 320;
const H = 168;
const LEFT = 36; // room for "18 t"
const RIGHT = 6;
const TOP = 8;
const BOTTOM = 24; // room for the month letters
const PLOT_W = W - LEFT - RIGHT;
const PLOT_H = H - TOP - BOTTOM;

export function YearChart({ year, month, day, lat, lon, lang, t }: { year: number; month: number; day: number; lat: number; lon: number; lang: Lang; t: Strings['sun'] }) {
  const days = yearOfDayLengths(year, lat, lon);
  const x = (i: number) => LEFT + (i / (days.length - 1)) * PLOT_W;
  const y = (minutes: number) => TOP + PLOT_H - (minutes / 1440) * PLOT_H;
  const base = y(0);

  const line = days.map((d, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(d.minutes).toFixed(1)}`).join('');
  const area = `${line}L${x(days.length - 1).toFixed(1)},${base}L${x(0).toFixed(1)},${base}Z`;

  const chosen = days.findIndex((d) => d.month === month && d.day === day);
  let shortest = 0;
  let longest = 0;
  days.forEach((d, i) => {
    if (d.minutes < days[shortest]!.minutes) shortest = i;
    if (d.minutes > days[longest]!.minutes) longest = i;
  });
  const describe = (i: number) => [formatDayMonth(days[i]!.month, days[i]!.day, lang), formatDuration(days[i]!.minutes, lang)] as const;
  const shortestText = t.shortestDay(...describe(shortest));
  const longestText = t.longestDay(...describe(longest));

  // Each month's letter under the middle of the month.
  const letters = monthLetters(lang);
  const monthMid = letters.map((_, m) => {
    const first = days.findIndex((d) => d.month === m + 1);
    const last = days.findLastIndex((d) => d.month === m + 1);
    return x((first + last) / 2);
  });

  return (
    <Card aria-labelledby="sun-year-title" className="flex flex-col gap-3">
      <h2 id="sun-year-title" className="text-lg font-semibold">
        {t.yearTitle}
      </h2>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={t.yearChart(shortestText, longestText)}>
        {[6, 12, 18].map((h) => (
          <g key={h}>
            <line x1={LEFT} x2={W - RIGHT} y1={y(h * 60)} y2={y(h * 60)} className="stroke-border" strokeWidth="1" />
            <text x={LEFT - 6} y={y(h * 60)} textAnchor="end" dominantBaseline="middle" className="fill-muted text-[13px]">
              {t.hoursShort(h)}
            </text>
          </g>
        ))}
        <path d={area} className="fill-accent" fillOpacity="0.55" />
        <path d={line} fill="none" className="stroke-text" strokeWidth="2" strokeLinejoin="round" />
        <line x1={LEFT} x2={W - RIGHT} y1={base} y2={base} className="stroke-muted" strokeWidth="1" />
        {letters.map((letter, m) => (
          <text key={m} x={monthMid[m]} y={H - 5} textAnchor="middle" className="fill-muted text-[13px]">
            {letter}
          </text>
        ))}
        {chosen >= 0 ? (
          <g>
            <line x1={x(chosen)} x2={x(chosen)} y1={base} y2={y(days[chosen]!.minutes)} className="stroke-text" strokeWidth="1" />
            <circle cx={x(chosen)} cy={y(days[chosen]!.minutes)} r="5" className="fill-text stroke-surface" strokeWidth="2" />
          </g>
        ) : null}
      </svg>
      <div className="text-sm text-muted">
        <p>{shortestText}</p>
        <p>{longestText}</p>
      </div>
    </Card>
  );
}
