// Interface strings (D-003: the UI is Danish + English; source text stays in its own language).

export type Lang = 'da' | 'en';

export interface Strings {
  appTitle: string;
  storageTitle: string;
  searchPlaceholder: string;
  searchLabel: string;
  clearSearch: string;
  noResults: (query: string) => string;
  itemCount: (n: number) => string;
  locations: Record<'pantry' | 'fridge' | 'freezer', string>;
  basis: Record<'fromPurchase' | 'afterOpening' | 'afterThawing' | 'unspecified', string | null>;
  units: Record<'hours' | 'days' | 'weeks' | 'months' | 'years', [singular: string, plural: string]>;
  durations: Record<'notRecommended' | 'indefinitely' | 'untilRipe' | 'packageUseByDate', string>;
  noTimeGiven: string;
  sourceLanguageNote: string;
  sourceHeading: string;
  dataDate: (version: string) => string;
  disclaimer: string;
  packErrorTitle: string;
  packErrorBody: string;
  notFound: string;
  back: string;
}

export const strings: Record<Lang, Strings> = {
  da: {
    appTitle: 'Offline Knowledge',
    storageTitle: 'Holdbarhed',
    searchPlaceholder: 'Søg efter en fødevare',
    searchLabel: 'Søg efter fødevare',
    clearSearch: 'Ryd søgning',
    noResults: (q) => `Ingen fødevarer matcher "${q}".`,
    itemCount: (n) => `${n} fødevarer`,
    locations: { pantry: 'Spisekammer', fridge: 'Køleskab', freezer: 'Fryser' },
    basis: { fromPurchase: 'fra købsdato', afterOpening: 'efter åbning', afterThawing: 'efter optøning', unspecified: null },
    units: {
      hours: ['time', 'timer'],
      days: ['dag', 'dage'],
      weeks: ['uge', 'uger'],
      months: ['måned', 'måneder'],
      years: ['år', 'år'],
    },
    durations: {
      notRecommended: 'Anbefales ikke',
      indefinitely: 'Ubegrænset',
      untilRipe: 'Indtil moden',
      packageUseByDate: 'Se datoen på pakken',
    },
    noTimeGiven: 'Ingen tid angivet',
    sourceLanguageNote: 'Kildetekst på engelsk',
    sourceHeading: 'Kilde',
    dataDate: (v) => `Dataversion ${v}`,
    disclaimer: 'Vejledende tider fra kilden. Brug din egen vurdering: lugt, udseende og opbevaring betyder noget.',
    packErrorTitle: 'Indholdet kunne ikke åbnes',
    packErrorBody: 'Appens indbyggede vidensbase kunne ikke indlæses. Prøv at genstarte appen.',
    notFound: 'Fødevaren blev ikke fundet.',
    back: 'Tilbage',
  },
  en: {
    appTitle: 'Offline Knowledge',
    storageTitle: 'Food storage',
    searchPlaceholder: 'Search for a food',
    searchLabel: 'Search for a food',
    clearSearch: 'Clear search',
    noResults: (q) => `No foods match "${q}".`,
    itemCount: (n) => `${n} foods`,
    locations: { pantry: 'Pantry', fridge: 'Fridge', freezer: 'Freezer' },
    basis: { fromPurchase: 'from purchase', afterOpening: 'after opening', afterThawing: 'after thawing', unspecified: null },
    units: {
      hours: ['hour', 'hours'],
      days: ['day', 'days'],
      weeks: ['week', 'weeks'],
      months: ['month', 'months'],
      years: ['year', 'years'],
    },
    durations: {
      notRecommended: 'Not recommended',
      indefinitely: 'Indefinitely',
      untilRipe: 'Until ripe',
      packageUseByDate: 'See the date on the package',
    },
    noTimeGiven: 'No time given',
    sourceLanguageNote: 'Source text',
    sourceHeading: 'Source',
    dataDate: (v) => `Data version ${v}`,
    disclaimer: 'Guideline times from the source. Use your own judgement: smell, appearance and storage conditions matter.',
    packErrorTitle: 'Content could not be opened',
    packErrorBody: "The app's built-in knowledge base could not be loaded. Try restarting the app.",
    notFound: 'Food not found.',
    back: 'Back',
  },
};
