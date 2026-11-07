// HLR-metronom (D-067): a steady beat for chest compressions, 110 a minute, counting 1–30, then
// "Giv 2 indblæsninger" until Fortsæt. The 30 clicks of a round are scheduled on the audio clock so
// the beat stays even; a frame loop drives the count and the pulse. The screen is kept awake while
// it runs (where the browser can). Sound needs a tap on iPhone, so it starts on Start.

import { useEffect, useRef, useState } from 'react';
import { Button, ButtonLink, Page, SubPageHeader } from '../components/ui';
import { beatMs, COMPRESSIONS, roundState } from '../cpr/beat';
import type { Strings } from '../i18n/strings';
import { usePageTitle } from '../lib/usePageTitle';
import { hrefs } from '../router';

const CPR_GUIDE_ID = 'hlr-voksne';

type WakeLock = { release: () => Promise<void> };
type WakeLockNavigator = Navigator & { wakeLock?: { request: (type: 'screen') => Promise<WakeLock> } };

export function CprMetronomeScreen({ s }: { s: Strings }) {
  const t = s.cpr;
  usePageTitle(t.title, s.appTitle);
  const [roundStart, setRoundStart] = useState<number | null>(null); // performance.now() of beat 1
  const [view, setView] = useState({ count: 1, phase: 0, breaths: false });
  const audio = useRef<AudioContext | null>(null);
  const clicks = useRef<GainNode | null>(null);
  const wake = useRef<WakeLock | null>(null);
  const [reducedMotion] = useState(() => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches);

  const stopSound = () => {
    clicks.current?.disconnect();
    clicks.current = null;
  };

  // The 30 clicks of one round, ahead of time on the audio clock; returns when beat 1 sounds.
  const scheduleRound = (): number => {
    stopSound();
    const now = performance.now();
    const ctx = audio.current;
    if (!ctx) return now;
    const lead = 0.05;
    const master = ctx.createGain();
    master.connect(ctx.destination);
    clicks.current = master;
    for (let i = 0; i < COMPRESSIONS; i++) {
      const at = ctx.currentTime + lead + (i * beatMs()) / 1000;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = 1000;
      gain.gain.setValueAtTime(0.4, at);
      gain.gain.exponentialRampToValueAtTime(0.001, at + 0.06);
      osc.connect(gain).connect(master);
      osc.start(at);
      osc.stop(at + 0.07);
    }
    return now + lead * 1000;
  };

  const lockScreen = async () => {
    try {
      wake.current ??= (await (navigator as WakeLockNavigator).wakeLock?.request('screen')) ?? null;
    } catch {
      // not offered here; the beat still runs
    }
  };
  const unlockScreen = () => {
    void wake.current?.release().catch(() => undefined);
    wake.current = null;
  };

  const start = () => {
    try {
      audio.current ??= new AudioContext();
      void audio.current.resume();
    } catch {
      // no sound on this device; the count and the pulse remain
    }
    void lockScreen();
    setRoundStart(scheduleRound());
  };

  const stop = () => {
    stopSound();
    unlockScreen();
    setRoundStart(null);
    setView({ count: 1, phase: 0, breaths: false });
  };

  // The count and the pulse follow the clock; after 30 the round waits for Fortsæt. A timer, not
  // animation frames: frames stop when the page is hidden, and the count must not.
  useEffect(() => {
    if (roundStart === null) return;
    const timer = setInterval(() => {
      const next = roundState(performance.now() - roundStart);
      setView(next);
      if (next.breaths) {
        clearInterval(timer);
        navigator.vibrate?.(200);
      }
    }, 40);
    return () => clearInterval(timer);
  }, [roundStart]);

  // The browser drops the wake lock when the app is hidden; take it again on return while running.
  useEffect(() => {
    if (roundStart === null) return;
    const again = () => {
      if (document.visibilityState === 'visible') {
        wake.current = null;
        void lockScreen();
      }
    };
    document.addEventListener('visibilitychange', again);
    return () => document.removeEventListener('visibilitychange', again);
  }, [roundStart]);

  // Leaving the page: silence, let the screen sleep, close the audio.
  useEffect(
    () => () => {
      clicks.current?.disconnect();
      void wake.current?.release().catch(() => undefined);
      void audio.current?.close().catch(() => undefined);
    },
    [],
  );

  const running = roundStart !== null;
  const beat = running && !view.breaths ? 1 - Math.min(1, view.phase / 0.35) : 0; // 1 on the beat, then fading
  const pulse = view.breaths ? { opacity: 0.35 } : reducedMotion ? { opacity: 0.4 + 0.6 * beat } : { transform: `scale(${1 + 0.18 * beat})` };

  return (
    <Page>
      <SubPageHeader backLabel={s.back} backTo={hrefs.tools} title={t.title} subtitle={t.subtitle} />
      <div className="flex flex-col gap-3">
        <div className="flex flex-col items-center gap-5 rounded-card bg-surface px-[20px] py-6 text-center">
          {!running ? (
            <>
              <p className="text-lg font-semibold">{t.how}</p>
              <p className="text-sm text-muted">{t.sound}</p>
              <Button variant="primary" className="w-full" onClick={start}>
                {t.start}
              </Button>
            </>
          ) : (
            <>
              <div aria-hidden="true" className="grid size-48 place-items-center rounded-full bg-accent text-on-accent" style={pulse}>
                <span className="text-7xl font-semibold tabular-nums">{view.count}</span>
              </div>
              <p role="status" className={view.breaths ? 'text-2xl font-semibold' : 'sr-only'}>
                {view.breaths ? t.breaths : ''}
              </p>
              {view.breaths ? (
                <Button variant="primary" className="w-full" onClick={() => setRoundStart(scheduleRound())}>
                  {t.resume}
                </Button>
              ) : (
                <p className="text-sm text-muted">{t.counting(COMPRESSIONS)}</p>
              )}
              <Button variant="secondary" className="w-full" onClick={stop}>
                {t.stop}
              </Button>
            </>
          )}
        </div>
        {/* What the metronome does not cover stays in view (D-071): adults only; compressions only is allowed. */}
        <p className="px-1">{t.adultsOnly}</p>
        <p className="px-1">{t.handsOnly}</p>
        <p className="px-1 text-sm text-muted">{t.source}</p>
        <ButtonLink href={hrefs.guide(CPR_GUIDE_ID)} variant="onPage">
          {t.guide}
        </ButtonLink>
        <ButtonLink href={hrefs.guide('hlr-boern')} variant="onPage">
          {t.childGuide}
        </ButtonLink>
      </div>
    </Page>
  );
}
