// Compass (D-045): a turning dial with a fixed mark at the top, the direction as text, and
// "hold a course": the locked direction is kept on the device until cleared.

import { useEffect, useState } from 'react';
import { BackButton, MessageState, Page } from '../components/ui';
import { cardinal, isUncertain, ON_COURSE_WITHIN, signedDelta } from '../compass/heading';
import { useCompass } from '../compass/useCompass';
import type { Lang, Strings } from '../i18n/strings';
import { goBack, hrefs } from '../router';

const COURSE_KEY = 'stead.compass.course.v1';

function readCourse(): number | null {
  try {
    const raw = localStorage.getItem(COURSE_KEY);
    const n = raw === null ? NaN : Number(raw);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

function useCourse(): [number | null, (deg: number | null) => void] {
  const [course, setCourse] = useState<number | null>(readCourse);
  const set = (deg: number | null) => {
    try {
      if (deg === null) localStorage.removeItem(COURSE_KEY);
      else localStorage.setItem(COURSE_KEY, String(deg));
    } catch {
      // Storage blocked: the course lasts until the app closes.
    }
    setCourse(deg);
  };
  return [course, set];
}

export function CompassScreen({ lang, s }: { lang: Lang; s: Strings }) {
  const t = s.compass;
  const { state, start } = useCompass();
  const [course, setCourse] = useCourse();

  useEffect(() => {
    document.title = `${t.title} – ${s.appTitle}`;
  }, [t, s]);

  const heading = state.kind === 'active' ? Math.round(state.heading) % 360 : null;
  const uncertain = state.kind === 'active' && isUncertain(state.accuracy);
  const delta = heading !== null && course !== null ? Math.round(signedDelta(heading, course)) : null;

  return (
    <Page>
      <BackButton label={s.back} onClick={() => goBack(hrefs.tools)} />
      <header className="mt-4 mb-4 px-1">
        <h1 className="text-3xl font-normal tracking-tight">{t.title}</h1>
        <p className="mt-1 text-muted">{t.subtitle}</p>
      </header>

      {state.kind === 'unsupported' ? (
        <MessageState title={t.unsupported} />
      ) : state.kind === 'idle' || state.kind === 'denied' ? (
        <div className="flex flex-col items-center gap-4 rounded-card bg-surface px-[20px] py-8 text-center">
          {state.kind === 'denied' ? <p role="alert">{t.denied}</p> : <p className="text-muted">{t.howTo}</p>}
          <button type="button" onClick={start} className="min-h-12 rounded-full bg-accent px-[24px] font-semibold text-on-accent">
            {state.kind === 'denied' ? t.tryAgain : t.start}
          </button>
        </div>
      ) : state.kind === 'starting' ? (
        <MessageState title={t.starting} />
      ) : (
        <div className="flex flex-col items-center gap-4">
          <Dial heading={state.heading} course={course} lang={lang} />
          <div className="text-center">
            <p className="text-[min(3rem,13vw)] leading-none font-normal tracking-tight tabular-nums" aria-live="off">
              {cardinal(state.heading, lang)} {heading}°
            </p>
            <p className="mt-1 text-sm text-muted">{t.magnetic}</p>
          </div>
          {uncertain ? (
            <p className="w-full rounded-2xl bg-note-bg px-[16px] py-3 text-note-text" role="status">
              {t.uncertain}
            </p>
          ) : null}
          <div className="flex w-full flex-col items-center gap-3 rounded-card bg-surface px-[20px] py-5 text-center">
            {course !== null && delta !== null ? (
              <>
                <p className="text-sm text-muted">{t.course(Math.round(course))}</p>
                <p className="text-xl font-semibold" role="status">
                  {Math.abs(delta) <= ON_COURSE_WITHIN ? t.onCourse : delta > 0 ? t.turnRight(delta) : t.turnLeft(-delta)}
                </p>
                <button type="button" onClick={() => setCourse(null)} className="min-h-11 rounded-full bg-background px-[20px] font-medium">
                  {t.clearCourse}
                </button>
              </>
            ) : (
              <button type="button" onClick={() => setCourse(heading)} className="min-h-12 rounded-full bg-accent px-[24px] font-semibold text-on-accent">
                {t.holdCourse}
              </button>
            )}
          </div>
          {course === null ? <p className="px-1 text-sm text-muted">{t.howTo}</p> : null}
        </div>
      )}
    </Page>
  );
}

// The dial turns so that north on the dial points to magnetic north; the mark at the top is the
// direction the phone points. Decorative: the direction is also given as text.
function Dial({ heading, course, lang }: { heading: number; course: number | null; lang: Lang }) {
  const letters = lang === 'da' ? ['N', 'Ø', 'S', 'V'] : ['N', 'E', 'S', 'W'];
  return (
    <svg viewBox="0 0 200 200" className="w-[min(18rem,80vw)]" aria-hidden="true">
      <polygon points="100,2 92,16 108,16" className="fill-text" />
      <g transform={`rotate(${-heading} 100 100)`}>
        <circle cx="100" cy="100" r="80" className="fill-surface stroke-border" strokeWidth="2" />
        {Array.from({ length: 36 }, (_, i) => i * 10).map((deg) => (
          <line
            key={deg}
            x1="100"
            y1={deg % 30 === 0 ? 24 : 28}
            x2="100"
            y2="34"
            transform={`rotate(${deg} 100 100)`}
            className={deg % 90 === 0 ? 'stroke-text' : 'stroke-muted'}
            strokeWidth={deg % 90 === 0 ? 3 : 1.5}
          />
        ))}
        {letters.map((letter, i) => (
          <text
            key={letter}
            x="100"
            y="52"
            transform={`rotate(${i * 90} 100 100)`}
            textAnchor="middle"
            dominantBaseline="middle"
            className={i === 0 ? 'fill-text text-[18px] font-bold' : 'fill-muted text-[15px] font-semibold'}
          >
            {letter}
          </text>
        ))}
        {course !== null ? (
          <polygon points="100,22 93,8 107,8" transform={`rotate(${course} 100 100)`} className="fill-accent stroke-text" strokeWidth="1.5" />
        ) : null}
      </g>
      <circle cx="100" cy="100" r="4" className="fill-text" />
    </svg>
  );
}
