// Sunrise and sunset (D-056): for a place and a day, when the sun rises and sets and in which
// direction, when it is light enough outside (civil twilight) and how long the day is. Worked out
// on the phone (sun/sun.ts); nothing is fetched. The place is the phone's position (asked for on
// a tap, once), the map's home point, or a town; it is kept on the device until changed.

import { useEffect, useId, useState, type ReactNode } from 'react';
import { Button, inputClass, Page, Sheet, SubPageHeader } from '../components/ui';
import { cardinal } from '../compass/heading';
import { formatClock, formatDuration, today } from '../i18n/format';
import type { Lang, Strings } from '../i18n/strings';
import { usePageTitle } from '../lib/usePageTitle';
import { mapClient } from '../map/client';
import type { Home } from '../map/protocol';
import { hrefs } from '../router';
import { coordsOf, placeStore, roundCoord, type Place } from '../sun/place';
import { dayBefore, sunDay, type Pass } from '../sun/sun';
import { TOWNS, townById } from '../sun/towns';
import { YearChart } from '../sun/YearChart';

type GpsState = 'idle' | 'searching' | 'refused' | 'unavailable';

const CHOOSER_TITLE_ID = 'sun-place-title';
const field = `${inputClass} h-12 min-h-12 text-lg`;

export function SunScreen({ lang, s }: { lang: Lang; s: Strings }) {
  const t = s.sun;
  usePageTitle(t.title, s.appTitle);
  const place = placeStore.use();
  const [home, setHome] = useState<Home | null | undefined>(undefined); // undefined while the map store opens
  const [date, setDate] = useState(today);
  const [choosing, setChoosing] = useState(false);
  const [gps, setGps] = useState<GpsState>('idle');

  useEffect(() => {
    let live = true;
    mapClient().ready.then(
      (r) => live && setHome(r.home),
      () => live && setHome(null),
    );
    return () => {
      live = false;
    };
  }, []);

  // With nothing chosen yet, the home point is used if there is one; a moved home point is followed.
  useEffect(() => {
    if (!home) return;
    const at = { lat: roundCoord(home.lat), lon: roundCoord(home.lon) };
    if (!place || (place.kind === 'home' && (place.lat !== at.lat || place.lon !== at.lon))) placeStore.set({ kind: 'home', ...at });
  }, [home, place]);

  const choose = (next: Place) => {
    placeStore.set(next);
    setGps('idle');
    setChoosing(false);
  };

  const useMyPosition = () => {
    setGps('searching');
    navigator.geolocation.getCurrentPosition(
      (p) => choose({ kind: 'gps', lat: roundCoord(p.coords.latitude), lon: roundCoord(p.coords.longitude) }),
      (error) => setGps(error.code === error.PERMISSION_DENIED ? 'refused' : 'unavailable'),
      { enableHighAccuracy: false, timeout: 15_000, maximumAge: 600_000 },
    );
  };

  const chooser = (
    <PlaceChooser
      home={home ?? null}
      gps={gps}
      townId={place?.kind === 'town' ? place.id : ''}
      onGps={useMyPosition}
      onHome={() => home && choose({ kind: 'home', lat: roundCoord(home.lat), lon: roundCoord(home.lon) })}
      onTown={(id) => choose({ kind: 'town', id })}
      t={t}
    />
  );

  return (
    <Page>
      <SubPageHeader backLabel={s.back} backTo={hrefs.tools} title={t.title} subtitle={t.subtitle} />
      {!place ? (
        home === undefined ? null : (
          <section aria-labelledby={CHOOSER_TITLE_ID} className="flex flex-col gap-4 rounded-card bg-surface px-[20px] py-5">
            <h2 id={CHOOSER_TITLE_ID} className="text-xl font-semibold">
              {t.choosePlace}
            </h2>
            {chooser}
          </section>
        )
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-4 rounded-card bg-surface px-[20px] py-5">
            <div className="flex flex-wrap items-center justify-between gap-[12px]">
              <div className="min-w-0">
                <p className="text-sm text-muted">{t.place}</p>
                <p className="text-lg font-semibold">{placeName(place, t)}</p>
              </div>
              <Button onClick={() => setChoosing(true)} aria-label={t.changePlace}>
                {t.change}
              </Button>
            </div>
            <DateField date={date} onDate={setDate} t={t} />
          </div>
          <Results place={place} date={date} lang={lang} t={t} />
          <YearChart {...chartProps(place, date)} lang={lang} t={t} />
          <p className="px-1 text-sm text-muted">{t.note}</p>
        </div>
      )}
      <Sheet open={choosing} onClose={() => setChoosing(false)} labelledBy={`${CHOOSER_TITLE_ID}-sheet`}>
        <h2 id={`${CHOOSER_TITLE_ID}-sheet`} className="px-1 text-xl font-semibold">
          {t.choosePlace}
        </h2>
        <div className="mt-4 flex flex-col gap-4 rounded-card bg-surface px-[20px] py-5">{chooser}</div>
        <Button variant="onPage" className="mt-4 w-full" onClick={() => setChoosing(false)}>
          {s.forraad.close}
        </Button>
      </Sheet>
    </Page>
  );
}

function chartProps(place: Place, date: string) {
  const [year, month, day] = date.split('-').map(Number) as [number, number, number];
  return { year, month, day, ...coordsOf(place) };
}

function placeName(place: Place, t: Strings['sun']): string {
  if (place.kind === 'town') return townById(place.id)!.name;
  return place.kind === 'gps' ? t.myPosition : t.homePoint;
}

function PlaceChooser(props: { home: Home | null; gps: GpsState; townId: string; onGps: () => void; onHome: () => void; onTown: (id: string) => void; t: Strings['sun'] }) {
  const { home, gps, townId, onGps, onHome, onTown, t } = props;
  const id = useId();
  const message = gps === 'searching' ? t.searching : gps === 'refused' ? t.refused : gps === 'unavailable' ? t.unavailable : '';
  return (
    <>
      {'geolocation' in navigator ? (
        <Button variant="primary" onClick={onGps} disabled={gps === 'searching'}>
          {t.useMyPosition}
        </Button>
      ) : null}
      <p role="status" className={message ? (gps === 'searching' ? 'text-muted' : 'font-semibold') : 'sr-only'}>
        {message}
      </p>
      {home ? <Button onClick={onHome}>{t.useHomePoint}</Button> : null}
      <div className="flex flex-col gap-1">
        <label htmlFor={`${id}-town`} className="font-semibold">
          {t.town}
        </label>
        <select id={`${id}-town`} value={townId} onChange={(e) => e.target.value && onTown(e.target.value)} className={field}>
          <option value="">{t.chooseTown}</option>
          {TOWNS.map((town) => (
            <option key={town.id} value={town.id}>
              {town.name}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}

function DateField({ date, onDate, t }: { date: string; onDate: (date: string) => void; t: Strings['sun'] }) {
  const id = useId();
  const now = today();
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={`${id}-date`} className="font-semibold">
        {t.date}
      </label>
      <div className="flex gap-[8px]">
        <input
          id={`${id}-date`}
          type="date"
          value={date}
          // The roller's reset gives '' (no date): back to today.
          onChange={(e) => onDate(e.target.value || today())}
          className={`${field} min-w-0 flex-1 text-left [&::-webkit-date-and-time-value]:min-h-[1.5em] [&::-webkit-date-and-time-value]:text-left`}
        />
        {date !== now ? <Button onClick={() => onDate(now)}>{t.today}</Button> : null}
      </div>
    </div>
  );
}

function Results({ place, date, lang, t }: { place: Place; date: string; lang: Lang; t: Strings['sun'] }) {
  const [y, m, d] = date.split('-').map(Number) as [number, number, number];
  const { lat, lon } = coordsOf(place);
  const day = sunDay(y, m, d, lat, lon);
  const yesterday = sunDay(...dayBefore(y, m, d), lat, lon);
  const clock = (at: Date) => formatClock(at, lang);
  const direction = (deg: number) => [cardinal(deg, lang), Math.round(deg) % 360] as const;
  const diff = Math.round(day.dayLengthMin - yesterday.dayLengthMin);

  return (
    <dl className="flex flex-col divide-y divide-border rounded-card bg-surface px-[20px]">
      {day.sun.kind === 'riseSet' ? (
        <>
          <Row label={t.sunrise} value={clock(day.sun.rise)} detail={t.risesIn(...direction(day.sun.riseAzimuth))} />
          <Row label={t.sunset} value={clock(day.sun.set)} detail={t.setsIn(...direction(day.sun.setAzimuth))} />
        </>
      ) : (
        <Row label={t.sunrise} detail={day.sun.kind === 'up' ? t.neverSets : t.neverRises} />
      )}
      <Row label={t.light} {...lightRow(day.light, clock, t)} />
      <Row
        label={t.dayLength}
        value={formatDuration(day.dayLengthMin, lang)}
        detail={diff > 0 ? t.longer(diff) : diff < 0 ? t.shorter(-diff) : t.sameAsYesterday}
      />
    </dl>
  );
}

function lightRow(light: Pass, clock: (at: Date) => string, t: Strings['sun']): { value?: string; detail: string } {
  if (light.kind === 'riseSet') return { value: `${clock(light.rise)}–${clock(light.set)}`, detail: t.lightHelp };
  return { detail: light.kind === 'up' ? t.lightAllNight : t.darkAllDay };
}

function Row({ label, value, detail }: { label: string; value?: ReactNode; detail: string }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-[12px] py-4">
      <dt className="font-semibold">{label}</dt>
      {value ? <dd className="text-2xl tabular-nums">{value}</dd> : null}
      <dd className="col-span-2 text-sm text-muted">{detail}</dd>
    </div>
  );
}
