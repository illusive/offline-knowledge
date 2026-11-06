// "Kog vand" (D-058): one minute at a rolling boil, as the guide "Der er intet vand" says (CDC).
// The start is kept on the device, so a locked screen does not lose the time; at the end the phone
// vibrates where it can and plays a short tone made on the spot (no sound file).

import { useEffect, useRef } from 'react';
import { Button, ButtonLink, Page, SubPageHeader } from '../components/ui';
import type { Strings } from '../i18n/strings';
import { createLocalStore } from '../lib/localStore';
import { useNow } from '../lib/useNow';
import { usePageTitle } from '../lib/usePageTitle';
import { hrefs } from '../router';

export const BOIL_SECONDS = 60;
const WATER_GUIDE_ID = 'der-er-intet-vand';

const boilStore = createLocalStore<number | null>({
  key: 'stead.boil.v1',
  parse: (stored) => (typeof stored === 'number' && Number.isFinite(stored) ? stored : null),
});

// Seconds left of the boil, or 0 when it is done.
export const secondsLeft = (startedAt: number, now: number) => Math.max(0, Math.ceil(BOIL_SECONDS - (now - startedAt) / 1000));

export function BoilTimerScreen({ s }: { s: Strings }) {
  const t = s.boil;
  usePageTitle(t.title, s.appTitle);
  const startedAt = boilStore.use();
  const now = useNow(250);
  const left = startedAt === null ? null : secondsLeft(startedAt, now);
  const audio = useRef<AudioContext | null>(null);
  const signalled = useRef<number | null>(null);

  useEffect(() => {
    if (startedAt === null || left !== 0 || signalled.current === startedAt) return;
    signalled.current = startedAt;
    navigator.vibrate?.([300, 150, 300]);
    const ctx = audio.current;
    if (ctx && Date.now() - startedAt < (BOIL_SECONDS + 30) * 1000) {
      const tone = ctx.createOscillator();
      const gain = ctx.createGain();
      tone.frequency.value = 880;
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
      tone.connect(gain).connect(ctx.destination);
      tone.start();
      tone.stop(ctx.currentTime + 1.2);
    }
  }, [startedAt, left]);

  const start = () => {
    // The tone needs a tap to be allowed on iPhone, so the audio is opened here.
    try {
      audio.current ??= new AudioContext();
      void audio.current.resume();
    } catch {
      // no sound on this device; the text and the vibration remain
    }
    boilStore.set(Date.now());
  };

  return (
    <Page>
      <SubPageHeader backLabel={s.back} backTo={hrefs.tools} title={t.title} subtitle={t.subtitle} />
      <div className="flex flex-col gap-3">
        <div className="flex flex-col items-center gap-4 rounded-card bg-surface px-[20px] py-6 text-center">
          {left === null ? (
            <>
              <p className="text-sm text-muted">{t.cloudy}</p>
              <p className="text-lg font-semibold">{t.how}</p>
              <Button variant="primary" className="w-full" onClick={start}>
                {t.start}
              </Button>
            </>
          ) : (
            <>
              <p className="text-6xl tabular-nums" aria-hidden="true">
                {`0:${String(left).padStart(2, '0')}`}
              </p>
              <p role="status" className={left === 0 ? 'text-xl font-semibold' : 'sr-only'}>
                {left === 0 ? t.done : left % 15 === 0 ? t.left(left) : ''}
              </p>
              <Button variant={left === 0 ? 'primary' : 'secondary'} className="w-full" onClick={left === 0 ? start : () => boilStore.set(null)}>
                {left === 0 ? t.again : t.stop}
              </Button>
            </>
          )}
        </div>
        <ButtonLink href={hrefs.guide(WATER_GUIDE_ID)} variant="onPage">
          {t.guide}
        </ButtonLink>
      </div>
    </Page>
  );
}
