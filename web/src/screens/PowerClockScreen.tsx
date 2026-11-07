// "Køleskab og fryser" (D-058, named so in D-066): how long the power has been out, and how long the fridge and freezer
// keep food cold. The start time is kept on the device, so the clock survives closing the app and
// restarting the phone. The hours and the advice come from the guide "Strømmen er gået".

import { CircleAlert, Clock } from 'lucide-react';
import { useState } from 'react';
import { Button, ButtonLink, Card, inputClass, Page, SubPageHeader } from '../components/ui';
import { formatClock, formatDate, formatDuration } from '../i18n/format';
import type { Lang, Strings } from '../i18n/strings';
import { createLocalStore } from '../lib/localStore';
import { useNow } from '../lib/useNow';
import { usePageTitle } from '../lib/usePageTitle';
import { LIMITS, minutesLeft, minutesSince } from '../power/limits';
import { hrefs } from '../router';

const POWER_GUIDE_ID = 'stroemmen-er-gaaet';

export const powerClock = createLocalStore<number | null>({
  key: 'stead.powerclock.v1',
  parse: (stored) => (typeof stored === 'number' && Number.isFinite(stored) ? stored : null),
});

// A <input type="datetime-local"> value for a moment, in the phone's time.
const localInput = (ms: number) => {
  const d = new Date(ms - new Date(ms).getTimezoneOffset() * 60_000);
  return d.toISOString().slice(0, 16);
};

export function PowerClockScreen({ lang, s }: { lang: Lang; s: Strings }) {
  const t = s.power;
  usePageTitle(t.title, s.appTitle);
  const startedAt = powerClock.use();
  const now = useNow(15_000);
  const [earlier, setEarlier] = useState<string | null>(null);
  const [status, setStatus] = useState('');

  const start = (at: number) => {
    powerClock.set(Math.min(at, Date.now()));
    setEarlier(null);
    setStatus('');
  };

  return (
    <Page>
      <SubPageHeader backLabel={s.back} backTo={hrefs.tools} title={t.title} subtitle={t.subtitle} />
      <div className="flex flex-col gap-3">
        {startedAt === null ? (
          <Card as="div" className="flex flex-col gap-4">
            <p>{t.intro}</p>
            <Button variant="primary" onClick={() => start(Date.now())}>
              {t.startNow}
            </Button>
            {earlier === null ? (
              <Button onClick={() => setEarlier(localInput(Date.now() - 60 * 60_000))}>{t.startEarlier}</Button>
            ) : (
              <form
                className="flex flex-col gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  const at = new Date(earlier).getTime();
                  if (Number.isFinite(at)) start(at);
                }}
              >
                <label htmlFor="power-earlier" className="font-semibold">
                  {t.earlierLabel}
                </label>
                <input id="power-earlier" type="datetime-local" value={earlier} max={localInput(now)} onChange={(e) => setEarlier(e.target.value)} className={`${inputClass} h-12 min-h-12 text-lg`} />
                <Button type="submit">{t.start}</Button>
              </form>
            )}
            {status ? (
              <p role="status" className="font-semibold">
                {status}
              </p>
            ) : (
              <p role="status" className="sr-only" />
            )}
          </Card>
        ) : (
          <Running startedAt={startedAt} now={now} lang={lang} t={t} onBack={() => {
            powerClock.set(null);
            setStatus(t.backDone);
          }} />
        )}
        <p className="px-1 text-sm text-muted">{t.source}</p>
        <ButtonLink href={hrefs.guide(POWER_GUIDE_ID)} variant="onPage">
          {t.guide}
        </ButtonLink>
      </div>
    </Page>
  );
}

function Running({ startedAt, now, lang, t, onBack }: { startedAt: number; now: number; lang: Lang; t: Strings['power']; onBack: () => void }) {
  const elapsed = minutesSince(startedAt, now);
  const since = new Date(startedAt);
  const sameDay = new Date(now).toDateString() === since.toDateString();
  const fridgeOver = minutesLeft(LIMITS[0].hours, elapsed) === 0;
  const freezerOver = LIMITS.some(({ id, hours }) => id !== 'fridge' && minutesLeft(hours, elapsed) === 0);
  return (
    <>
      <Card as="div" className="flex flex-col gap-1">
        <p className="text-sm text-muted">{t.outFor}</p>
        <p className="text-4xl tabular-nums">{formatDuration(elapsed, lang)}</p>
        <p className="text-sm text-muted">{t.since(sameDay ? formatClock(since, lang) : `${formatDate(since, lang)} ${formatClock(since, lang)}`)}</p>
      </Card>
      {/* An estimate from elapsed time, with its assumptions beside it; nothing here says the food is safe (D-071). */}
      <ul className="flex flex-col divide-y divide-border rounded-card bg-surface px-[20px]">
        {LIMITS.map(({ id, hours }) => {
          const left = minutesLeft(hours, elapsed);
          const Icon = left > 0 ? Clock : CircleAlert;
          return (
            <li key={id} className="flex items-start gap-[12px] py-4">
              <Icon aria-hidden="true" className={`mt-0.5 size-6 shrink-0 ${left > 0 ? 'text-muted' : 'text-danger'}`} />
              <div>
                <p className="font-semibold">{t[id]}</p>
                <p className={left > 0 ? '' : 'font-semibold text-danger'}>{left > 0 ? t.timeLeft(formatDuration(left, lang)) : t.over}</p>
                <p className="text-sm text-muted">{t.holds(hours)}</p>
              </div>
            </li>
          );
        })}
        <li className="py-4 text-sm">{t.estimate}</li>
      </ul>
      <Card as="div" className="flex flex-col gap-3">
        <p>{t.keepClosed}</p>
        {fridgeOver ? <p className="rounded-2xl bg-note-bg px-[16px] py-3 text-note-text">{t.fridgeOver}</p> : null}
        <p className={freezerOver ? 'rounded-2xl bg-note-bg px-[16px] py-3 text-note-text' : 'text-sm text-muted'}>{t.refreeze}</p>
        <Button onClick={onBack}>{t.back}</Button>
      </Card>
    </>
  );
}
