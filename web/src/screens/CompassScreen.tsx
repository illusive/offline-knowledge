// Compass (D-045): a turning dial with a fixed mark at the top, the direction as text, and
// "hold a course": the locked direction is kept on the device until stopped. While a course is held,
// the line under the direction says how to turn, and the same button stops it (D-070), so the page
// does not grow.

import { createLocalStore } from '../lib/localStore';
import { Button, Card, MessageState, Page, SubPageHeader } from '../components/ui';
import { cardinal, cardinalLetters, isUncertain, ON_COURSE_WITHIN, signedDelta } from '../compass/heading';
import { useCompass } from '../compass/useCompass';
import type { Lang, Strings } from '../i18n/strings';
import { hrefs } from '../router';
import { usePageTitle } from '../lib/usePageTitle';

// The locked course, kept on the device until cleared (D-045).
const courseStore = createLocalStore<number | null>({
  key: 'stead.compass.course.v1',
  parse: (stored) => (typeof stored === 'number' && Number.isFinite(stored) ? stored : null),
});

export function CompassScreen({ lang, s }: { lang: Lang; s: Strings }) {
  const t = s.compass;
  const { state, start } = useCompass();
  const course = courseStore.use();
  const setCourse = (deg: number | null) => courseStore.set(deg);

  usePageTitle(t.title, s.appTitle);

  const heading = state.kind === 'active' ? Math.round(state.heading) % 360 : null;
  const uncertain = state.kind === 'active' && isUncertain(state.accuracy);
  const delta = heading !== null && course !== null ? Math.round(signedDelta(heading, course)) : null;

  return (
    <Page>
      <SubPageHeader backLabel={s.back} backTo={hrefs.tools} title={t.title} subtitle={t.subtitle} />

      {state.kind === 'unsupported' ? (
        <MessageState title={t.unsupported} />
      ) : state.kind === 'idle' || state.kind === 'denied' ? (
        <div className="flex flex-col items-center gap-4 rounded-card bg-surface px-[20px] py-8 text-center">
          {state.kind === 'denied' ? <p role="alert">{t.denied}</p> : <p className="text-muted">{t.howTo}</p>}
          <Button onClick={start} variant="primary">
            {state.kind === 'denied' ? t.tryAgain : t.start}
          </Button>
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
            {course !== null && delta !== null ? (
              <p className="mt-2 text-lg font-semibold" role="status">
                {t.course(Math.round(course))} · {Math.abs(delta) <= ON_COURSE_WITHIN ? t.onCourse : delta > 0 ? t.turnRight(delta) : t.turnLeft(-delta)}
              </p>
            ) : (
              <p className="mt-1 text-sm text-muted">{t.magnetic}</p>
            )}
          </div>
          {uncertain ? (
            <p className="w-full rounded-2xl bg-note-bg px-[16px] py-3 text-note-text" role="status">
              {t.uncertain}
            </p>
          ) : null}
          <Card as="div" className="flex w-full flex-col items-center gap-3 text-center">
            {course !== null ? (
              <Button onClick={() => setCourse(null)} variant="secondary">
                {t.clearCourse}
              </Button>
            ) : (
              <Button onClick={() => setCourse(heading)} variant="primary">
                {t.holdCourse}
              </Button>
            )}
          </Card>
          {course === null ? <p className="px-1 text-sm text-muted">{t.howTo}</p> : null}
        </div>
      )}
    </Page>
  );
}

// The dial turns so that north on the dial points to magnetic north; the mark at the top is the
// direction the phone points. Decorative: the direction is also given as text.
function Dial({ heading, course, lang }: { heading: number; course: number | null; lang: Lang }) {
  const letters = cardinalLetters(lang);
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
