// Interface strings (D-003: the UI is Danish + English; source text stays in its own language).

export type Lang = 'da' | 'en';

export interface Strings {
  appTitle: string;
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
  sourceHeading: string;
  dataDate: (version: string) => string;
  packErrorTitle: string;
  packErrorBody: string;
  notFound: string;
  back: string;
  loading: string;
  offlineReady: string;
  updateReady: string;
  updateAction: string;
  dismiss: string;
  languageName: Record<Lang, string>;
  homeTitle: string;
  homeSearchPlaceholder: string;
  homeSearchLabel: string;
  startHere: string;
  storingFood: string;
  storingFoodSubtitle: (n: number) => string;
  storageIntro: string;
  emergencyTitle: string;
  emergencySubtitle: string;
  emergencyCallLabel: string;
  offlineReadyStatus: string;
  preparingOffline: string;
  navLabel: string;
  tabs: Record<'home' | 'map' | 'tools' | 'settings', string>;
  mapTitle: string;
  mapLabel: string;
  mapLoading: string;
  mapErrorTitle: string;
  mapErrorBody: string;
  mapArea: {
    open: string;
    close: string;
    title: string;
    yourAreas: string;
    getArea: string;
    choices: Record<'home' | 'region' | 'country', string>;
    noHome: string;
    pickOnMap: string;
    pickHint: string;
    useMyPosition: string;
    positionDenied: string;
    homeSet: string;
    changeHome: string;
    radius: (km: number) => string;
    aroundHome: (km: number) => string;
    calculating: string;
    freeSpace: (size: string) => string;
    notEnoughSpace: string;
    download: (size: string) => string;
    needsNetwork: string;
    states: Record<'ready' | 'downloading' | 'paused', string>;
    progress: (percent: number) => string;
    pause: string;
    resume: string;
    remove: string;
    confirmRemove: string;
    noAreasYet: string;
    downloadFailed: string;
  };
  toolsTitle: string;
  settingsTitle: string;
  comingLater: string;
  showOriginal: string;
  showTranslation: string;
  sensesTitle: string;
  sensesBody: string;
  downloadingTitle: string;
  downloadingBody: string;
  downloadProgress: (done: number, total: number) => string;
  openingPack: string;
  firstLaunchNote: string;
  guideSections: Record<'about' | 'prefers' | 'avoid' | 'together' | 'coolStorage' | 'drying' | 'pickling' | 'canning', string>;
  kitchenTimes: string;
  foodTabsLabel: string;
  foodTabs: Record<'about' | 'storage' | 'preserving' | 'sources', string>;
  noAboutYet: string;
  noPreservingYet: string;
  recipeFacts: Record<'time' | 'keeps' | 'yield', string>;
  ingredientsHeading: string;
  stepsHeading: string;
  originalWording: string;
  verdicts: {
    drying: Record<'excellent' | 'good' | 'fair' | 'poor' | 'described' | 'notRecommended' | 'noSource', string>;
    pickling: Record<'tested' | 'noTestedMethod', string>;
    canning: Record<'pressure' | 'waterBath' | 'asPickles' | 'notRecommended' | 'noTestedMethod', string>;
  };
  apartFromProducers: string;
  apartFromSensitive: string;
  storeWith: string;
  ethyleneNeutral: string;
  textTranslated: string;
  textOriginal: string;
  sourcesHeading: string;
  basedOn: (names: string) => string;
}

export const strings: Record<Lang, Strings> = {
  da: {
    appTitle: 'stead',
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
    sourceHeading: 'Kilde',
    dataDate: (v) => `Dataversion ${v}`,
    packErrorTitle: 'Indholdet kunne ikke åbnes',
    packErrorBody: 'Appens indbyggede vidensbase kunne ikke indlæses. Prøv at genstarte appen.',
    notFound: 'Fødevaren blev ikke fundet.',
    back: 'Tilbage',
    loading: 'Indlæser…',
    offlineReady: 'Appen virker nu uden internet.',
    updateReady: 'En ny version er klar.',
    updateAction: 'Opdater',
    dismiss: 'Luk',
    languageName: { da: 'dansk', en: 'engelsk' },
    homeTitle: 'Hvad har du brug for?',
    homeSearchPlaceholder: 'Søg',
    homeSearchLabel: 'Søg i indholdet',
    startHere: 'Start her',
    storingFood: 'Opbevaring af mad',
    storingFoodSubtitle: (n) => `${n} fødevarer · holdbarhed`,
    storageIntro: 'Hvor længe holder maden i spisekammer, køleskab og fryser?',
    emergencyTitle: 'Livstruende nødsituation?',
    emergencySubtitle: 'Ring til alarmcentralen',
    emergencyCallLabel: 'Ring 112, alarmcentralen',
    offlineReadyStatus: 'Klar offline',
    preparingOffline: 'Gør klar til offline…',
    navLabel: 'Hovedmenu',
    tabs: { home: 'Hjem', map: 'Kort', tools: 'Værktøjer', settings: 'Indstillinger' },
    mapTitle: 'Kort',
    mapLabel: 'Kort over Danmark',
    mapLoading: 'Åbner kortet …',
    mapErrorTitle: 'Kortet kunne ikke vises',
    mapErrorBody: 'Enheden kan ikke tegne kortet (WebGL mangler). Resten af appen virker som normalt.',
    mapArea: {
      open: 'Hent kort',
      close: 'Luk',
      title: 'Kort uden net',
      yourAreas: 'Dine områder',
      getArea: 'Hent et område',
      choices: { home: 'Omkring mit hjem', region: 'Region', country: 'Hele landet' },
      noHome: 'Vælg først, hvor du bor.',
      pickOnMap: 'Tryk på kortet',
      pickHint: 'Tryk på kortet der, hvor du bor.',
      useMyPosition: 'Brug min position',
      positionDenied: 'Din position kunne ikke bruges. Tryk på kortet i stedet.',
      homeSet: 'Dit hjem er valgt.',
      changeHome: 'Skift',
      radius: (km) => `${km} km`,
      aroundHome: (km) => `${km} km omkring hjemmet`,
      calculating: 'Beregner størrelse …',
      freeSpace: (size) => `Ledig plads på enheden: ${size}`,
      notEnoughSpace: 'Der er ikke plads nok på enheden.',
      download: (size) => `Hent ${size}`,
      needsNetwork: 'Du skal være på nettet for at hente kort. Det, du allerede har hentet, virker uden net.',
      states: { ready: 'Klar uden net', downloading: 'Henter', paused: 'Sat på pause' },
      progress: (percent) => `${percent} %`,
      pause: 'Pause',
      resume: 'Fortsæt',
      remove: 'Slet',
      confirmRemove: 'Tryk igen for at slette',
      noAreasYet: 'Du har ikke hentet nogen områder endnu. Uden et område viser kortet kun et overblik.',
      downloadFailed: 'Kortet kunne ikke hentes:',
    },
    toolsTitle: 'Værktøjer',
    settingsTitle: 'Indstillinger',
    comingLater: 'Kommer i et senere trin.',
    showOriginal: 'Vis original',
    showTranslation: 'Vis på dansk',
    sensesTitle: 'Brug dine sanser',
    sensesBody: 'Tiderne er vejledende. Ser eller lugter maden forkert, så kassér den – og er du i tvivl, så smid den ud.',
    downloadingTitle: 'Henter appen til offline brug',
    downloadingBody: 'Det kan tage lidt tid. Du kan bruge appen imens.',
    downloadProgress: (done, total) => `${done} af ${total} filer`,
    openingPack: 'Henter indholdet …',
    firstLaunchNote: 'Første gang kan det tage lidt tid.',
    guideSections: {
      about: 'Om',
      prefers: 'Det trives den med',
      avoid: 'Undgå',
      together: 'Sammen med andre',
      coolStorage: 'Langtidsopbevaring',
      drying: 'Tørring',
      pickling: 'Syltning',
      canning: 'Henkogning',
    },
    kitchenTimes: 'Holdbarhed i køkkenet',
    foodTabsLabel: 'Om fødevaren',
    foodTabs: { about: 'Om', storage: 'Holdbarhed', preserving: 'Konservering', sources: 'Kilder' },
    noAboutYet: 'Der er endnu ingen beskrivelse af denne fødevare.',
    noPreservingYet: 'Der er endnu ingen vejledning i tørring, syltning eller henkogning af denne fødevare.',
    recipeFacts: { time: 'Tid', keeps: 'Holdbarhed', yield: 'Giver' },
    ingredientsHeading: 'Du skal bruge',
    stepsHeading: 'Sådan gør du',
    originalWording: 'Kildens ord',
    verdicts: {
      drying: {
        excellent: 'Egner sig rigtig godt til tørring',
        good: 'Egner sig godt til tørring',
        fair: 'Egner sig nogenlunde til tørring',
        poor: 'Egner sig dårligt til tørring',
        described: 'Kilderne beskriver, hvordan den tørres',
        notRecommended: 'Tørring frarådes',
        noSource: 'Ingen af kilderne beskriver tørring af denne fødevare.',
      },
      pickling: { tested: 'Der findes opskrifter', noTestedMethod: 'Ingen af kilderne har en testet opskrift.' },
      canning: {
        pressure: 'Kun i trykkoger',
        waterBath: 'I vandbad',
        asPickles: 'Kun som syltede, efter en testet opskrift',
        notRecommended: 'Henkogning frarådes',
        noTestedMethod: 'Ingen af kilderne har en testet metode.',
      },
    },
    apartFromProducers: 'Er følsom over for ethylen. Hold den væk fra disse, som danner meget ethylen:',
    apartFromSensitive: 'Danner meget ethylen. Hold den væk fra disse, som er følsomme over for det:',
    storeWith: 'Kan opbevares sammen med (i op til 7 dage):',
    ethyleneNeutral: 'Hverken følsom over for ethylen eller danner meget af det.',
    textTranslated: 'Teksten er skrevet på dansk ud fra kilderne.',
    textOriginal: 'Teksten vises med kildernes egne ord.',
    sourcesHeading: 'Kilder',
    basedOn: (names) => `Kilde: ${names}`,
  },
  en: {
    appTitle: 'stead',
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
    sourceHeading: 'Source',
    dataDate: (v) => `Data version ${v}`,
    packErrorTitle: 'Content could not be opened',
    packErrorBody: "The app's built-in knowledge base could not be loaded. Try restarting the app.",
    notFound: 'Food not found.',
    back: 'Back',
    loading: 'Loading…',
    offlineReady: 'The app now works without internet.',
    updateReady: 'A new version is ready.',
    updateAction: 'Update',
    dismiss: 'Dismiss',
    languageName: { da: 'Danish', en: 'English' },
    homeTitle: 'What do you need?',
    homeSearchPlaceholder: 'Search',
    homeSearchLabel: 'Search the content',
    startHere: 'Start here',
    storingFood: 'Storing food',
    storingFoodSubtitle: (n) => `${n} foods · storage times`,
    storageIntro: 'How long does food keep in the pantry, fridge and freezer?',
    emergencyTitle: 'Life-threatening emergency?',
    emergencySubtitle: 'Call the emergency number (Denmark)',
    emergencyCallLabel: 'Call 112, emergency services',
    offlineReadyStatus: 'Offline ready',
    preparingOffline: 'Preparing offline use…',
    navLabel: 'Main menu',
    tabs: { home: 'Home', map: 'Map', tools: 'Tools', settings: 'Settings' },
    mapTitle: 'Map',
    mapLabel: 'Map of Denmark',
    mapLoading: 'Opening the map …',
    mapErrorTitle: 'The map could not be shown',
    mapErrorBody: 'This device cannot draw the map (WebGL is missing). The rest of the app works as usual.',
    mapArea: {
      open: 'Get maps',
      close: 'Close',
      title: 'Maps without a connection',
      yourAreas: 'Your areas',
      getArea: 'Get an area',
      choices: { home: 'Around my home', region: 'Region', country: 'Whole country' },
      noHome: 'First choose where you live.',
      pickOnMap: 'Tap the map',
      pickHint: 'Tap the map where you live.',
      useMyPosition: 'Use my position',
      positionDenied: 'Your position could not be used. Tap the map instead.',
      homeSet: 'Your home is set.',
      changeHome: 'Change',
      radius: (km) => `${km} km`,
      aroundHome: (km) => `${km} km around home`,
      calculating: 'Working out the size …',
      freeSpace: (size) => `Free space on this device: ${size}`,
      notEnoughSpace: 'There is not enough space on this device.',
      download: (size) => `Download ${size}`,
      needsNetwork: 'You need a connection to download maps. What you already have works offline.',
      states: { ready: 'Ready offline', downloading: 'Downloading', paused: 'Paused' },
      progress: (percent) => `${percent} %`,
      pause: 'Pause',
      resume: 'Resume',
      remove: 'Delete',
      confirmRemove: 'Tap again to delete',
      noAreasYet: 'You have not downloaded any areas yet. Without one, the map only shows an overview.',
      downloadFailed: 'The map could not be downloaded:',
    },
    toolsTitle: 'Tools',
    settingsTitle: 'Settings',
    comingLater: 'Coming in a later step.',
    showOriginal: 'Show original',
    showTranslation: 'Show translation',
    sensesTitle: 'Use your senses',
    sensesBody: 'The times are guidelines. If food looks or smells wrong, throw it out – and when in doubt, throw it out.',
    downloadingTitle: 'Downloading the app for offline use',
    downloadingBody: 'This can take a little while. You can use the app meanwhile.',
    downloadProgress: (done, total) => `${done} of ${total} files`,
    openingPack: 'Loading the content …',
    firstLaunchNote: 'The first time can take a little while.',
    guideSections: {
      about: 'About',
      prefers: 'What it likes',
      avoid: 'Avoid',
      together: 'With other produce',
      coolStorage: 'Long-term storage',
      drying: 'Drying',
      pickling: 'Pickling',
      canning: 'Canning',
    },
    kitchenTimes: 'Storage times in the kitchen',
    foodTabsLabel: 'About this food',
    foodTabs: { about: 'About', storage: 'Storage', preserving: 'Preserving', sources: 'Sources' },
    noAboutYet: 'There is no description of this food yet.',
    noPreservingYet: 'There is no guidance on drying, pickling or canning this food yet.',
    recipeFacts: { time: 'Time', keeps: 'Keeps', yield: 'Makes' },
    ingredientsHeading: 'You need',
    stepsHeading: 'Steps',
    originalWording: 'In the source\'s words',
    verdicts: {
      drying: {
        excellent: 'Excellent for drying',
        good: 'Good for drying',
        fair: 'Fair for drying',
        poor: 'Poor for drying',
        described: 'The sources describe how to dry it',
        notRecommended: 'Drying not recommended',
        noSource: 'None of the sources describe drying this food.',
      },
      pickling: { tested: 'Recipes exist', noTestedMethod: 'None of the sources has a tested recipe.' },
      canning: {
        pressure: 'Pressure canner only',
        waterBath: 'Boiling-water bath',
        asPickles: 'Only as pickles, following a tested recipe',
        notRecommended: 'Canning not recommended',
        noTestedMethod: 'None of the sources has a tested method.',
      },
    },
    apartFromProducers: 'Sensitive to ethylene. Keep it away from these, which produce a lot of ethylene:',
    apartFromSensitive: 'Produces a lot of ethylene. Keep it away from these, which are sensitive to it:',
    storeWith: 'Can be stored with (for up to 7 days):',
    ethyleneNeutral: 'Neither sensitive to ethylene nor a strong producer of it.',
    textTranslated: 'The text is written in Danish from the sources.',
    textOriginal: 'The text is shown in the sources\' own words.',
    sourcesHeading: 'Sources',
    basedOn: (names) => `Source: ${names}`,
  },
};
