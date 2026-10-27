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
  mapCrashBody: string;
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
    back: string;
    introTitle: string;
    introBody: string;
    introWarning: string;
    introSizes: string;
    kindSize: Record<'home' | 'region' | 'country', string>;
    chooseArea: string;
    skipForNow: string;
    offlineNow: string;
    kindTitle: string;
    kindHelp: Record<'home' | 'region' | 'country', string>;
    radiusTitle: string;
    regionTitle: string;
    confirmTitle: string;
    confirmSize: (size: string) => string;
    confirmKeepOpen: string;
    startDownload: string;
    progressTitle: (label: string) => string;
    keepUsing: string;
    doneTitle: string;
    doneBody: (label: string) => string;
    showOnMap: string;
    tryAgain: string;
    addArea: string;
    notCovered: string;
    notCoveredOffline: string;
    getThisArea: string;
    showPosition: string;
    hidePosition: string;
    positionSearching: string;
    positionUnavailable: string;
    positionRefused: string;
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
  firstAid: string;
  firstAidSubtitle: (n: number) => string;
  firstAidIntro: string;
  guideNotFound: string;
  guideSource: (name: string, from: number, to: number) => string;
  checkedAgainst: string;
  ownerNotChecked: string;
  relatedGuides: string;
  firstAidSearchPlaceholder: string;
  firstAidSearchLabel: string;
  noGuideResults: (query: string) => string;
  allGuides: string;
  readMore: string;
  abbreviationsLabel: string;
  totalTopics: (n: number) => string;
  foodCount: (n: number) => string;
  growing: string;
  growingIntro: string;
  growingCount: (n: number) => string;
  growingSections: Record<'sowing' | 'conditions' | 'care' | 'harvest' | 'seeds' | 'neighbours', string>;
  storeThisCrop: string;
  growingSearchPlaceholder: string;
  growingSearchLabel: string;
  save: string;
  saved: string;
  saveLabel: string;
  savedOpenLabel: (n: number) => string;
  savedTitle: string;
  savedIntro: string;
  savedEmptyTitle: string;
  savedEmptyBody: string;
  savedNoneHere: string;
  savedCount: (n: number) => string;
  savedUnavailable: string;
  remove: string;
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
    mapCrashBody: 'Der skete en fejl. Prøv at åbne et andet faneblad og så Kort igen. Resten af appen virker som normalt.',
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
      needsNetwork: 'Du skal have internet for at hente kort. Det, du allerede har hentet, virker også uden.',
      states: { ready: 'Klar uden net', downloading: 'Henter', paused: 'Sat på pause' },
      progress: (percent) => `${percent} %`,
      pause: 'Pause',
      resume: 'Fortsæt',
      remove: 'Slet',
      confirmRemove: 'Tryk igen for at slette',
      noAreasYet: 'Du har ikke hentet noget kort endnu. Uden internet viser kortet derfor kun et groft overblik.',
      downloadFailed: 'Kortet kunne ikke hentes:',
      back: 'Tilbage',
      introTitle: 'Hent kortet til telefonen',
      introBody: 'Kortet henter veje, stier og stednavne fra internettet, mens du bruger det. Hvis internet og mobildata pludselig forsvinder i dit område, kan du kun bruge kortet de steder, du har hentet til telefonen på forhånd.',
      introWarning: 'Andre steder kan du kun se et groft overblik med de største byer og veje.',
      introSizes: 'Et område omkring dit hjem fylder typisk 10–50 MB – cirka som en håndfuld fotos. Hele Danmark fylder omkring 600 MB.',
      kindSize: { home: '10 km: ca. 7–20 MB · 25 km: ca. 25–45 MB', region: 'Ca. 80–175 MB', country: 'Ca. 600 MB' },
      chooseArea: 'Vælg område',
      skipForNow: 'Ikke nu – vis kortet',
      offlineNow: 'Du har ikke internet lige nu. Hent kortet, næste gang du har forbindelse – gerne på wifi.',
      kindTitle: 'Hvilket område vil du hente?',
      kindHelp: {
        home: 'En cirkel omkring dit hjem på 10, 25 eller 50 km.',
        region: 'En af Danmarks fem regioner.',
        country: 'Alle fem regioner. Fylder mest.',
      },
      radiusTitle: 'Hvor stort et område?',
      regionTitle: 'Vælg region',
      confirmTitle: 'Klar til at hente',
      confirmSize: (size) => `Det fylder ${size} på telefonen.`,
      confirmKeepOpen: 'Brug gerne wifi. Hentningen fortsætter, så længe appen er åben – du kan bruge resten af appen imens.',
      startDownload: 'Hent nu',
      progressTitle: (label) => `Henter ${label}`,
      keepUsing: 'Du kan lukke dette og bruge kortet imens.',
      doneTitle: 'Færdig',
      doneBody: (label) => `Nu kan du bruge kortet over ${label} – også uden internet.`,
      showOnMap: 'Vis på kortet',
      tryAgain: 'Prøv igen',
      addArea: 'Hent et område til',
      notCovered: 'Kun med net her',
      notCoveredOffline: 'Ikke hentet her',
      getThisArea: 'Hent',
      showPosition: 'Vis min position',
      hidePosition: 'Skjul position',
      positionSearching: 'Finder din position …',
      positionUnavailable: 'Din position kan ikke findes lige nu. Prøv udendørs.',
      positionRefused: 'Appen må ikke bruge din position. Det kan ændres i Indstillinger på telefonen.',
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
    firstAid: 'Førstehjælp',
    firstAidSubtitle: (n) => `${n} livreddende vejledninger`,
    firstAidIntro: 'Ordret fra Førstehjælpens ABC. Kun opsætningen er ændret, så trinene er nemme at følge.',
    guideNotFound: 'Vejledningen blev ikke fundet.',
    guideSource: (name, from, to) => `Kilde: ${name}, s. ${from === to ? from : `${from}–${to}`}`,
    checkedAgainst: 'Sammenholdt med',
    ownerNotChecked: 'Prøveversion: endnu ikke gennemlæst mod kilden.',
    relatedGuides: 'Se også',
    firstAidSearchPlaceholder: 'Søg i førstehjælp, fx blødning',
    firstAidSearchLabel: 'Søg i førstehjælp',
    noGuideResults: (q) => `Ingen vejledninger matcher "${q}".`,
    allGuides: 'Alle vejledninger',
    readMore: 'Læs mere',
    abbreviationsLabel: 'Forkortelser',
    totalTopics: (n) => `${n} emner`,
    foodCount: (n) => `${n} fødevarer`,
    growing: 'Dyrkning',
    growingIntro: 'Så, pas og høst – og gem frø til næste år. Nemme afgrøder til det danske klima.',
    growingCount: (n) => (n === 1 ? '1 afgrøde' : `${n} afgrøder`),
    growingSections: { sowing: 'Såning', conditions: 'Jord og placering', care: 'Pasning', harvest: 'Høst', seeds: 'Frø til næste år', neighbours: 'Naboer og sædskifte' },
    storeThisCrop: 'Holdbarhed og konservering',
    growingSearchPlaceholder: 'Søg efter en afgrøde',
    growingSearchLabel: 'Søg i dyrkning',
    save: 'Gem',
    saved: 'Gemt',
    saveLabel: 'Gem til senere',
    savedOpenLabel: (n) => (n === 0 ? 'Gemte' : `Gemte (${n})`),
    savedTitle: 'Gemte',
    savedIntro: 'Det, du har gemt, ligger kun på denne enhed.',
    savedEmptyTitle: 'Du har ikke gemt noget endnu',
    savedEmptyBody: 'Tryk "Gem" på en vejledning, en afgrøde eller en fødevare, så finder du den her.',
    savedNoneHere: 'Intet gemt her endnu.',
    savedCount: (n) => (n === 1 ? '1 gemt' : `${n} gemt`),
    savedUnavailable: 'Findes ikke længere i appen',
    remove: 'Fjern',
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
    mapCrashBody: 'Something went wrong. Open another tab and then Map again. The rest of the app works as usual.',
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
      needsNetwork: 'You need internet to download maps. What you have already downloaded also works without it.',
      states: { ready: 'Ready offline', downloading: 'Downloading', paused: 'Paused' },
      progress: (percent) => `${percent} %`,
      pause: 'Pause',
      resume: 'Resume',
      remove: 'Delete',
      confirmRemove: 'Tap again to delete',
      noAreasYet: 'You have not downloaded a map yet, so without internet the map only shows a rough overview.',
      downloadFailed: 'The map could not be downloaded:',
      back: 'Back',
      introTitle: 'Download the map to your phone',
      introBody: 'The map fetches roads, paths and place names from the internet while you use it. If internet and mobile data suddenly disappear where you are, you can only use the map in places you downloaded to your phone beforehand.',
      introWarning: 'Elsewhere you only see a rough overview with the largest towns and roads.',
      introSizes: 'An area around your home typically takes 10–50 MB – about a handful of photos. All of Denmark takes about 600 MB.',
      kindSize: { home: '10 km: about 7–20 MB · 25 km: about 25–45 MB', region: 'About 80–175 MB', country: 'About 600 MB' },
      chooseArea: 'Choose an area',
      skipForNow: 'Not now – show the map',
      offlineNow: 'You have no internet right now. Download the map next time you are connected – Wi-Fi is best.',
      kindTitle: 'Which area do you want to download?',
      kindHelp: {
        home: 'A circle of 10, 25 or 50 km around your home.',
        region: 'One of the five regions of Denmark.',
        country: 'All five regions. Takes the most space.',
      },
      radiusTitle: 'How large an area?',
      regionTitle: 'Choose a region',
      confirmTitle: 'Ready to download',
      confirmSize: (size) => `It takes ${size} on your phone.`,
      confirmKeepOpen: 'Wi-Fi is a good idea. The download continues while the app is open – you can use the rest of the app meanwhile.',
      startDownload: 'Download now',
      progressTitle: (label) => `Downloading ${label}`,
      keepUsing: 'You can close this and use the map meanwhile.',
      doneTitle: 'Done',
      doneBody: (label) => `You can now use the map of ${label} – also without internet.`,
      showOnMap: 'Show on the map',
      tryAgain: 'Try again',
      addArea: 'Get another area',
      notCovered: 'Online only here',
      notCoveredOffline: 'Not downloaded here',
      getThisArea: 'Get',
      showPosition: 'Show my position',
      hidePosition: 'Hide position',
      positionSearching: 'Finding your position …',
      positionUnavailable: 'Your position cannot be found right now. Try outdoors.',
      positionRefused: 'The app may not use your position. You can change this in the phone\'s Settings.',
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
    firstAid: 'First aid',
    firstAidSubtitle: (n) => `${n} life-saving guides (in Danish)`,
    firstAidIntro: 'Word for word from the Danish handbook Førstehjælpens ABC. Only the layout is changed, so the steps are easy to follow.',
    guideNotFound: 'Guide not found.',
    guideSource: (name, from, to) => `Source: ${name}, ${from === to ? `p. ${from}` : `pp. ${from}–${to}`}`,
    checkedAgainst: 'Compared with',
    ownerNotChecked: 'Trial version: not yet read against the source.',
    relatedGuides: 'See also',
    firstAidSearchPlaceholder: 'Search first aid, e.g. blødning',
    firstAidSearchLabel: 'Search first aid',
    noGuideResults: (q) => `No guides match "${q}".`,
    allGuides: 'All guides',
    readMore: 'Read more',
    abbreviationsLabel: 'Abbreviations',
    totalTopics: (n) => `${n} topics`,
    foodCount: (n) => `${n} foods`,
    growing: 'Growing food',
    growingIntro: 'Sow, tend and harvest – and save seed for next year. Easy crops for the Danish climate (in Danish).',
    growingCount: (n) => (n === 1 ? '1 crop' : `${n} crops`),
    growingSections: { sowing: 'Sowing', conditions: 'Soil and site', care: 'Care', harvest: 'Harvest', seeds: 'Seed for next year', neighbours: 'Neighbours and rotation' },
    storeThisCrop: 'Storing and preserving',
    growingSearchPlaceholder: 'Search for a crop',
    growingSearchLabel: 'Search growing',
    save: 'Save',
    saved: 'Saved',
    saveLabel: 'Save for later',
    savedOpenLabel: (n) => (n === 0 ? 'Saved' : `Saved (${n})`),
    savedTitle: 'Saved',
    savedIntro: 'What you save stays on this device only.',
    savedEmptyTitle: 'Nothing saved yet',
    savedEmptyBody: 'Tap "Save" on a guide, a crop or a food and you will find it here.',
    savedNoneHere: 'Nothing saved here yet.',
    savedCount: (n) => `${n} saved`,
    savedUnavailable: 'No longer in the app',
    remove: 'Remove',
  },
};
