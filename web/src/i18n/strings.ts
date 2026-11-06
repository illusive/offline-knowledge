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
  homeTitle: string;
  homeSearchPlaceholder: string;
  homeSearchLabel: string;
  startHere: string;
  storingFood: string;
  storageIntro: string;
  emergencyTitle: string;
  emergencySubtitle: string;
  emergencyCallLabel: string;
  offlineReadyStatus: string;
  preparingOffline: string;
  navLabel: string;
  tabs: Record<'home' | 'map' | 'forraad' | 'tools', string>;
  settingsOpen: string;
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
    downloadFailed: string;
    areaErrors: Record<'changed' | 'network' | 'incomplete' | 'unknown', string>;
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
    mapDate: (date: string) => string;
    newerMap: string;
    update: string;
    updating: string;
    showPosition: string;
    hidePosition: string;
    positionSearching: string;
    positionUnavailable: string;
    positionRefused: string;
  };
  toolsTitle: string;
  toolSections: { timers: string; direction: string; firstAid: string; food: string };
  compass: {
    title: string;
    subtitle: string;
    start: string;
    starting: string;
    magnetic: string;
    uncertain: string;
    denied: string;
    tryAgain: string;
    unsupported: string;
    holdCourse: string;
    clearCourse: string;
    course: (deg: number) => string;
    onCourse: string;
    turnRight: (deg: number) => string;
    turnLeft: (deg: number) => string;
    howTo: string;
  };
  sun: {
    title: string;
    subtitle: string;
    place: string;
    changePlace: string;
    change: string;
    yearTitle: string;
    yearChart: (shortest: string, longest: string) => string;
    shortestDay: (date: string, length: string) => string;
    longestDay: (date: string, length: string) => string;
    hoursShort: (h: number) => string;
    choosePlace: string;
    myPosition: string;
    homePoint: string;
    useMyPosition: string;
    useHomePoint: string;
    town: string;
    chooseTown: string;
    searching: string;
    refused: string;
    unavailable: string;
    date: string;
    today: string;
    sunrise: string;
    sunset: string;
    risesIn: (dir: string, deg: number) => string;
    setsIn: (dir: string, deg: number) => string;
    neverSets: string;
    neverRises: string;
    light: string;
    lightHelp: string;
    lightAllNight: string;
    darkAllDay: string;
    dayLength: string;
    longer: (min: number) => string;
    shorter: (min: number) => string;
    sameAsYesterday: string;
    note: string;
    nowTitle: string;
    nowDirection: (dir: string, deg: number, height: number) => string;
    nowDown: string;
    faceSun: string;
    northLeft: (deg: number) => string;
    northRight: (deg: number) => string;
    northAhead: string;
    northBehind: string;
    moonTitle: string;
    moonPhases: Record<'new' | 'waxingCrescent' | 'firstQuarter' | 'waxingGibbous' | 'full' | 'waningGibbous' | 'lastQuarter' | 'waningCrescent', string>;
    moonLit: (pct: number) => string;
    moonrise: string;
    moonset: string;
    moonNoRise: string;
    moonNoSet: string;
  };
  power: {
    title: string;
    subtitle: string;
    intro: string;
    startNow: string;
    startEarlier: string;
    earlierLabel: string;
    start: string;
    outFor: string;
    since: (time: string) => string;
    fridge: string;
    freezerFull: string;
    freezerHalf: string;
    holds: (hours: number) => string;
    coldFor: (left: string) => string;
    over: string;
    keepClosed: string;
    fridgeOver: string;
    refreeze: string;
    back: string;
    backDone: string;
    source: string;
    guide: string;
  };
  boil: {
    title: string;
    subtitle: string;
    cloudy: string;
    how: string;
    start: string;
    left: (seconds: number) => string;
    done: string;
    again: string;
    stop: string;
    guide: string;
  };
  forraad: {
    title: string;
    loading: string;
    water: string;
    waterOf: (have: string, need: string) => string;
    waterHave: (have: string) => string;
    waterOfShort: (need: string) => string;
    lastChecked: (date: string) => string;
    neverChecked: string;
    checkAgain: (date: string) => string;
    checkDue: (date: string) => string;
    checkedToday: string;
    ok: string;
    checkSource: string;
    emptyStore: string;
    searchPlaceholder: string;
    searchLabel: string;
    noMatches: (query: string) => string;
    seeAllRecommendations: string;
    seeRecommendations: (title: string) => string;
    waterLitres: (unit: string) => string;
    people: string;
    targetDays: string;
    days: (n: number) => string;
    targetHelp: string;
    expiringTitle: string;
    expired: (date: string) => string;
    expires: (date: string) => string;
    categories: Record<'food' | 'medicine' | 'other', string>;
    categoryShort: Record<'food' | 'medicine' | 'other', string>;
    categoryEmpty: string;
    datesGuide: string;
    add: string;
    addIn: (category: string) => string;
    editTitle: string;
    addTitle: string;
    name: string;
    namePlaceholder: string;
    suggestionsLabel: string;
    fromStockList: string;
    usedBefore: string;
    scannedBefore: string;
    category: string;
    count: string;
    bestBefore: string;
    bestBeforeHelp: string;
    noDate: string;
    clearDate: string;
    month: string;
    year: string;
    optional: string;
    size: string;
    sizePlaceholder: string;
    sizeAmount: string;
    sizeUnit: string;
    sizeText: string;
    sizeOther: string;
    units: Record<'g' | 'kg' | 'ml' | 'cl' | 'dl' | 'l' | 'stk', string>;
    done: string;
    typeAdd: string;
    addedTo: (name: string, category: string) => string;
    addedCount: (n: number) => string;
    alreadyHave: string;
    noBarcode: string;
    typeInstead: string;
    save: string;
    cancel: string;
    remove: string;
    removeConfirm: (name: string) => string;
    editDetails: string;
    bestBeforeNew: string;
    bestBeforeNewHelp: string;
    stocked: (name: string, n: number, total: number) => string;
    deleted: (name: string) => string;
    removeOnClose: string;
    waterChecked: string;
    close: string;
    countLabel: (n: number) => string;
    countsAs: (name: string) => string;
    unlink: string;
    notFound: string;
    nameMissing: string;
    scan: string;
    scanHelp: string;
    scanStarting: string;
    scanSeenNotRead: string;
    scanDenied: string;
    scanUnavailable: string;
    lookingUp: string;
    lookupNotFound: string;
    lookupOffline: string;
    productFrom: (source: string) => string;
    scanPrivacy: string;
    backup: string;
    backupBody: string;
    saveCopy: string;
    restoreCopy: string;
    restoreConfirm: (items: number) => string;
    restoreDone: string;
    restoreFailed: string;
  };
  settingsTitle: string;
  settings: {
    library: string;
    content: (version: string, date: string) => string;
    guides: string;
    foodGuides: string;
    foods: string;
    sources: string;
    maps: string;
    mapsNone: string;
    mapsSummary: (areas: number, size: string) => string;
    used: string;
    language: string;
    appearance: string;
    followPhone: string;
    light: string;
    dark: string;
    textSize: string;
    textSizeBody: string;
    waterUnit: string;
    litres: string;
    gallons: string;
    sourcesIntro: string;
    sourcesCount: (n: number) => string;
    appVersion: string;
    appBuild: (date: string, commit: string) => string;
    checkUpdate: string;
    checking: string;
    upToDate: string;
    updateFound: string;
    updateProgress: (done: number, total: number) => string;
    updateOffline: string;
    updateFailed: string;
    about: string;
    aboutBody: string[];
  };
  showOriginal: string;
  showTranslation: string;
  partlyTranslated: string;
  plainLanguage: string;
  sourceWordsShown: string;
  translatedFromEnglish: string;
  originalEnglish: string;
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
  places: {
    open: string;
    title: string;
    intro: string;
    note: string;
    groups: Record<'emergency' | 'water' | 'supplies' | 'transport' | 'public' | 'nature' | 'food' | 'culture' | 'other', string>;
    examples: Record<'emergency' | 'water' | 'supplies' | 'transport' | 'public' | 'nature' | 'food' | 'culture' | 'other', string>;
    kinds: Record<string, string>;
  };
  totalTopics: (n: number) => string;
  foodCount: (n: number) => string;
  growing: string;
  foodGroups: Record<'fruit' | 'vegetables' | 'herbs' | 'meat' | 'fish', string>;
  growingIntro: string;
  growingCount: (n: number) => string;
  growingSections: Record<'sowing' | 'conditions' | 'care' | 'harvest' | 'seeds' | 'neighbours' | 'noPrep' | 'somePrep' | 'needsPrep', string>;
  prepare: string;
  prepareIntro: string;
  prepareCount: (n: number) => string;
  prepareWeather: string;
  prepareSituations: string;
  prepareSupplies: string;
  prepareSkills: string;
  prepareSearchPlaceholder: string;
  prepareSearchLabel: string;
  checklistProgress: (done: number, total: number) => string;
  checklistInForraad: (names: string) => string;
  checklistWaterInForraad: string;
  checklistHave: string;
  checklistMissing: string;
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
    searchLabel: 'Søg efter en fødevare',
    clearSearch: 'Ryd søgning',
    noResults: (q) => `Ingen fødevarer matcher "${q}".`,
    itemCount: (n) => `${n} fødevarer`,
    locations: { pantry: 'Køkkenskab', fridge: 'Køleskab', freezer: 'Fryser' },
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
    packErrorBody: 'Appens indhold kunne ikke åbnes. Luk appen helt, og åbn den igen.',
    notFound: 'Fødevaren blev ikke fundet.',
    back: 'Tilbage',
    loading: 'Indlæser…',
    offlineReady: 'Appen er nu klar til brug uden internet.',
    updateReady: 'En ny version er klar.',
    updateAction: 'Opdater',
    dismiss: 'Luk',
    homeTitle: 'Hvad har du brug for?',
    homeSearchPlaceholder: 'Søg',
    homeSearchLabel: 'Søg i indholdet',
    startHere: 'Start her',
    storingFood: 'Opbevaring',
    storageIntro: 'Hvor længe holder maden i køkkenskab, køleskab og fryser?',
    emergencyTitle: 'Livstruende nødsituation?',
    emergencySubtitle: 'Ring til alarmcentralen',
    emergencyCallLabel: 'Ring 112',
    offlineReadyStatus: 'Klar uden internet',
    preparingOffline: 'Gør klar til brug uden net …',
    navLabel: 'Hovedmenu',
    tabs: { home: 'Hjem', map: 'Kort', forraad: 'Forråd', tools: 'Værktøjer' },
    settingsOpen: 'Indstillinger',
    mapTitle: 'Kort',
    mapLabel: 'Kort over Danmark',
    mapLoading: 'Åbner kortet …',
    mapErrorTitle: 'Kortet kunne ikke vises',
    mapErrorBody: 'Din telefon eller browser kan ikke vise kortet. Resten af appen virker som normalt.',
    mapCrashBody: 'Der opstod en fejl. Tryk på en anden knap nederst, og tryk derefter på Kort igen. Resten af appen virker som normalt.',
    mapArea: {
      open: 'Hent kort',
      close: 'Luk',
      title: 'Kort uden net',
      yourAreas: 'Dine områder',
      choices: { home: 'Omkring mit hjem', region: 'Region', country: 'Hele landet' },
      noHome: 'Vælg først, hvor du bor.',
      pickOnMap: 'Tryk på kortet',
      pickHint: 'Tryk på kortet dér, hvor du bor.',
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
      states: { ready: 'Klar uden internet', downloading: 'Henter', paused: 'Sat på pause' },
      progress: (percent) => `${percent} %`,
      pause: 'Pause',
      resume: 'Fortsæt',
      remove: 'Slet',
      confirmRemove: 'Tryk igen for at slette',
      downloadFailed: 'Kortet kunne ikke hentes. Prøv igen, når du har internet.',
      areaErrors: {
        changed: 'Kortet er blevet opdateret, siden hentningen startede. Slet området, og hent det igen.',
        network: 'Forbindelsen blev afbrudt. Tryk Fortsæt, når du har internet.',
        incomplete: 'Ikke hele området blev gemt. Tryk Fortsæt for at prøve igen.',
        unknown: 'Hentningen stoppede. Tryk Fortsæt for at prøve igen.',
      },
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
      confirmKeepOpen: 'Brug gerne wi-fi. Hentningen fortsætter, så længe appen er åben. Du kan bruge resten af appen imens.',
      startDownload: 'Hent nu',
      progressTitle: (label) => `Henter ${label}`,
      keepUsing: 'Du kan lukke denne visning og bruge kortet imens.',
      doneTitle: 'Færdig',
      doneBody: (label) => `Nu kan du bruge kortet over ${label} – også uden internet.`,
      showOnMap: 'Vis på kortet',
      tryAgain: 'Prøv igen',
      addArea: 'Hent et område til',
      notCovered: 'Kun med net her',
      notCoveredOffline: 'Ikke hentet her',
      getThisArea: 'Hent',
      mapDate: (date) => `Kort fra ${date}`,
      newerMap: 'Der er kommet en nyere udgave af kortet. Du kan bruge den gamle, indtil den nye er hentet.',
      update: 'Hent den nye udgave',
      updating: 'Ny udgave – erstatter den gamle, når den er hentet',
      showPosition: 'Vis min position',
      hidePosition: 'Skjul position',
      positionSearching: 'Finder din position …',
      positionUnavailable: 'Din position kan ikke findes lige nu. Prøv udendørs.',
      positionRefused: 'Appen har ikke tilladelse til at bruge din position. Du kan ændre det i telefonens indstillinger.',
    },
    toolsTitle: 'Værktøjer',
    toolSections: { timers: 'Timere', direction: 'Retning og dagslys', firstAid: 'Førstehjælp', food: 'Mad' },
    compass: {
      title: 'Kompas',
      subtitle: 'Find retningen, og hold en kurs – uden internet og GPS.',
      start: 'Start kompas',
      starting: 'Starter kompasset …',
      magnetic: 'Retning fra magnetisk nord',
      uncertain: 'Kompasset er usikkert lige nu. Gå lidt væk fra metal, magneter og elektronik.',
      denied: 'Appen fik ikke lov til at bruge kompasset. Prøv igen, og vælg Tillad.',
      tryAgain: 'Prøv igen',
      unsupported: 'Denne enhed har ikke et kompas, som appen kan bruge.',
      holdCourse: 'Hold denne kurs',
      clearCourse: 'Slet kurs',
      course: (deg) => `Kurs ${deg}°`,
      onCourse: 'Du holder kursen',
      turnRight: (deg) => `Drej ${deg}° til højre`,
      turnLeft: (deg) => `Drej ${deg}° til venstre`,
      howTo: 'Hold telefonen fladt foran dig, så toppen peger frem. Vend dig, til retningen passer, og tryk på Hold denne kurs. Så viser appen, hvis du kommer ud af kurs.',
    },
    sun: {
      title: 'Sol op og ned',
      subtitle: 'Hvornår solen står op og går ned – uden internet.',
      place: 'Sted',
      changePlace: 'Skift sted',
      change: 'Skift',
      yearTitle: 'Dagens længde gennem året',
      yearChart: (shortest, longest) => `Dagens længde gennem året. ${shortest}. ${longest}.`,
      shortestDay: (date, length) => `Korteste dag: ${date}, ${length}`,
      longestDay: (date, length) => `Længste dag: ${date}, ${length}`,
      hoursShort: (h) => `${h} t`,
      choosePlace: 'Vælg sted',
      myPosition: 'Din position',
      homePoint: 'Hjemmepunktet på kortet',
      useMyPosition: 'Brug min position',
      useHomePoint: 'Brug hjemmepunktet på kortet',
      town: 'By',
      chooseTown: 'Vælg en by',
      searching: 'Finder din position …',
      refused: 'Appen har ikke tilladelse til at bruge din position. Du kan ændre det i telefonens indstillinger, eller vælge en by.',
      unavailable: 'Din position kan ikke findes lige nu. Prøv udendørs, eller vælg en by.',
      date: 'Dato',
      today: 'I dag',
      sunrise: 'Solopgang',
      sunset: 'Solnedgang',
      risesIn: (dir, deg) => `Står op i ${dir} (${deg}°)`,
      setsIn: (dir, deg) => `Går ned i ${dir} (${deg}°)`,
      neverSets: 'Solen går ikke ned denne dag.',
      neverRises: 'Solen står ikke op denne dag.',
      light: 'Lyst udenfor',
      lightHelp: 'Lyst nok til at være ude uden lygte.',
      lightAllNight: 'Det bliver ikke mørkt denne nat.',
      darkAllDay: 'Det bliver ikke rigtig lyst denne dag.',
      dayLength: 'Dagens længde',
      longer: (min) => `${min} min længere end i går`,
      shorter: (min) => `${min} min kortere end i går`,
      sameAsYesterday: 'Næsten som i går',
      note: 'Regnet ud fra stedet og datoen, i telefonens tid. Bakker, huse og skyer kan gøre det mørkt tidligere. Retningen er fra geografisk nord.',
      nowTitle: 'Solen lige nu',
      nowDirection: (dir, deg, height) => `Står i ${dir} (${deg}°), ${height}° over horisonten.`,
      nowDown: 'Solen er under horisonten lige nu.',
      faceSun: 'Stil dig med ansigtet mod solen.',
      northLeft: (deg) => `Så er nord ${deg}° til venstre for dig.`,
      northRight: (deg) => `Så er nord ${deg}° til højre for dig.`,
      northAhead: 'Så er nord lige foran dig.',
      northBehind: 'Så er nord lige bag dig.',
      moonTitle: 'Månen',
      moonPhases: {
        new: 'Nymåne',
        waxingCrescent: 'Tiltagende måne',
        firstQuarter: 'Halvmåne, tiltagende',
        waxingGibbous: 'Tiltagende måne',
        full: 'Fuldmåne',
        waningGibbous: 'Aftagende måne',
        lastQuarter: 'Halvmåne, aftagende',
        waningCrescent: 'Aftagende måne',
      },
      moonLit: (pct) => `${pct} % af månen er lyst op`,
      moonrise: 'Månen står op',
      moonset: 'Månen går ned',
      moonNoRise: 'Månen står ikke op denne dag.',
      moonNoSet: 'Månen går ikke ned denne dag.',
    },
    power: {
      title: 'Køleskab og fryser',
      subtitle: 'Hvor længe holder køleskab og fryser maden kold, når strømmen er gået?',
      intro: 'Tryk, når strømmen går. Uret holder øje med tiden – også hvis du lukker appen.',
      startNow: 'Strømmen gik nu',
      startEarlier: 'Strømmen gik tidligere',
      earlierLabel: 'Hvornår gik strømmen?',
      start: 'Start uret',
      outFor: 'Strømmen har været væk i',
      since: (time) => `Siden ${time}`,
      fridge: 'Køleskab',
      freezerFull: 'Fuld fryser',
      freezerHalf: 'Halvfuld fryser',
      holds: (hours) => `Holder kulden i omkring ${hours} timer med lukket dør`,
      coldFor: (left) => `Kold nok i ${left} endnu`,
      over: 'Over tiden',
      keepClosed: 'Åbn kun køleskab og fryser, når du skal. Så holder maden sig kold længere.',
      fridgeOver: 'Har strømmen været væk i mere end 4 timer, så smid let fordærvelig mad fra køleskabet ud: kød, fisk, skåret frugt og grønt, æg, mælk og rester. Smid også mad ud, der lugter, ser ud eller føles anderledes end normalt.',
      refreeze: 'Har frossen mad stadig iskrystaller, eller er den højst 4 °C, kan du fryse den igen.',
      back: 'Strømmen er tilbage',
      backDone: 'Godt. Tjek, at køleskabet er højst 5 °C.',
      source: 'Tiderne er fra USDA og CDC (USA), oversat. Fødevarestyrelsen anbefaler højst 5 °C i køleskabet.',
      guide: 'Læs mere i “Strømmen er gået”',
    },
    boil: {
      title: 'Kog vand',
      subtitle: 'Et ur til at koge vand, du ikke ved er rent.',
      cloudy: 'Er vandet grumset, så si det først gennem et rent klæde, køkkenrulle eller et kaffefilter.',
      how: 'Kog det klare vand kraftigt i 1 minut.',
      start: 'Vandet koger nu',
      left: (seconds) => `${seconds} sekunder tilbage`,
      done: 'Færdig. Lad vandet køle af.',
      again: 'Start igen',
      stop: 'Stop',
      guide: 'Læs mere i “Der er intet vand”',
    },
    forraad: {
      title: 'Forråd',
      loading: 'Henter forrådet …',
      water: 'Drikkevand',
      waterOf: (have, need) => `${have} af ${need}`,
      waterHave: (have) => `${have} på lager`,
      waterOfShort: (need) => `af ${need}`,
      lastChecked: (date) => `Sidst tjekket ${date}`,
      neverChecked: 'Ikke tjekket endnu',
      checkAgain: (date) => `Tjek igen i ${date}`,
      checkDue: (date) => `Tid til at tjekke vandet (siden ${date})`,
      checkedToday: 'Tjekket i dag',
      ok: 'OK',
      checkSource: 'Tjek forrådet hvert halve år: se datoerne, og skift det ud, der skal skiftes.',
      emptyStore: 'Der er intet i forrådet endnu.',
      searchPlaceholder: 'Søg i forrådet',
      searchLabel: 'Søg i forrådet',
      noMatches: (q) => `Intet i forrådet matcher "${q}".`,
      seeAllRecommendations: 'Se, hvad myndighederne anbefaler',
      seeRecommendations: (title) => `Se anbefalingerne: ${title}`,
      waterLitres: (unit) => `${unit === 'gal' ? 'Gallon' : 'Liter'} på lager`,
      people: 'Personer',
      targetDays: 'Forråd til',
      days: (n) => `${n} døgn`,
      targetHelp: 'Myndighederne anbefaler mindst 3 døgn.',
      expiringTitle: 'Nærmer sig udløb',
      expired: (date) => `Udløbet ${date}`,
      expires: (date) => `Bedst før ${date}`,
      categories: { food: 'Mad', medicine: 'Medicin og hygiejne', other: 'Lys, varme og andet' },
      categoryShort: { food: 'Mad', medicine: 'Pleje', other: 'Andet' },
      categoryEmpty: 'Intet her endnu.',
      datesGuide: 'Når datoen er overskredet',
      add: 'Tilføj',
      addIn: (category) => `Tilføj til ${category.toLowerCase()}`,
      editTitle: 'Redigér',
      addTitle: 'Tilføj til forrådet',
      name: 'Navn',
      namePlaceholder: 'Fx makrel i tomat',
      suggestionsLabel: 'Forslag',
      fromStockList: 'Fra listen',
      usedBefore: 'Brugt før',
      scannedBefore: 'Scannet før',
      category: 'Kategori',
      count: 'Antal',
      bestBefore: 'Bedst før',
      bestBeforeHelp: 'Måned og år er nok. Har du flere, så vælg den, der udløber først.',
      noDate: 'Ingen dato',
      clearDate: 'Fjern dato',
      month: 'Måned',
      year: 'År',
      optional: 'valgfri',
      size: 'Størrelse',
      sizePlaceholder: 'Fx familiepakke',
      sizeAmount: 'Mængde',
      sizeUnit: 'Enhed',
      sizeText: 'Beskriv størrelsen',
      sizeOther: 'Andet',
      units: { g: 'g', kg: 'kg', ml: 'ml', cl: 'cl', dl: 'dl', l: 'l', stk: 'stk.' },
      done: 'Færdig',
      typeAdd: 'Tilføj',
      addedTo: (name, category) => `${name} er tilføjet under ${category}`,
      addedCount: (n) => `${n} tilføjet`,
      alreadyHave: 'Den er allerede i forrådet. De nye lægges til.',
      noBarcode: 'Uden stregkode',
      typeInstead: 'Skriv i stedet',
      save: 'Gem',
      cancel: 'Annuller',
      remove: 'Slet',
      removeConfirm: (name) => `Vil du slette ${name}?`,
      editDetails: 'Redigér',
      bestBeforeNew: 'Bedst før på de nye',
      bestBeforeNewHelp: 'Udløber de nye før dem, du har, gemmes deres dato.',
      stocked: (name, n, total) => `${name}: ${n} stk. lagt til, nu ${total} stk.`,
      deleted: (name) => `${name} er slettet.`,
      removeOnClose: 'Den fjernes fra forrådet, når du lukker.',
      waterChecked: 'Vandet er tjekket.',
      close: 'Luk',
      countLabel: (n) => `${n} stk.`,
      countsAs: (name) => `Tæller som: ${name}`,
      unlink: 'Tæller ikke med på listen',
      notFound: 'Den ting findes ikke længere i forrådet.',
      nameMissing: 'Skriv, hvad det er.',
      scan: 'Scan varer',
      scanHelp: 'Hold stregkoden inden for rammen.',
      scanStarting: 'Starter kameraet …',
      scanSeenNotRead: 'Stregkoden ses, men kan ikke læses. Hold telefonen stille, lidt længere væk, og sørg for lys.',
      scanDenied: 'Appen fik ikke lov til at bruge kameraet. Du kan give lov i telefonens indstillinger – eller skrive navnet i stedet.',
      scanUnavailable: 'Kameraet kan ikke bruges her. Skriv navnet i stedet.',
      lookingUp: 'Slår varen op …',
      lookupNotFound: 'Varen blev ikke fundet. Skriv navnet – så husker appen stregkoden næste gang.',
      lookupOffline: 'Varen kan ikke slås op uden internet. Skriv navnet – så husker appen stregkoden næste gang.',
      productFrom: (source) => `Varens navn er fra ${source}.`,
      scanPrivacy: 'Med internet sender appen kun stregkoden til Open Food Facts for at finde varens navn.',
      backup: 'Kopi af forrådet',
      backupBody: 'Det, du gemmer i appen, ligger kun på telefonen. Sletter du appen, forsvinder det. Gem en kopi i Filer, så du kan hente det igen.',
      saveCopy: 'Gem en kopi',
      restoreCopy: 'Hent fra kopi',
      restoreConfirm: (items) => `Kopien har ${items === 1 ? '1 ting' : `${items} ting`} i forrådet. Vil du erstatte det, der er i appen nu?`,
      restoreDone: 'Forrådet er hentet fra kopien.',
      restoreFailed: 'Filen kunne ikke læses. Vælg en kopi, der er gemt fra stead.',
    },
    settingsTitle: 'Indstillinger',
    settings: {
      library: 'På telefonen',
      content: (version, date) => `Indhold ${version} fra ${date}`,
      guides: 'Guides',
      foodGuides: 'Madguides',
      foods: 'Fødevarer',
      sources: 'Kilder',
      maps: 'Kort',
      mapsNone: 'Ingen kort hentet',
      mapsSummary: (areas, size) => `${areas === 1 ? '1 område' : `${areas} områder`}, ${size}`,
      used: 'Appen bruger',
      language: 'Sprog',
      appearance: 'Udseende',
      followPhone: 'Følg telefonen',
      light: 'Lys',
      dark: 'Mørk',
      textSize: 'Tekststørrelse',
      textSizeBody: 'Teksten følger telefonens tekststørrelse. Du ændrer den i Indstillinger > Skærm og lysstyrke > Tekststørrelse.',
      waterUnit: 'Vand i',
      litres: 'Liter',
      gallons: 'Gallon (US)',
      sourcesIntro: 'Alt indhold kommer fra disse kilder. Hver guide viser sine egne kilder nederst.',
      sourcesCount: (n) => `${n} kilder`,
      appVersion: 'App og version',
      appBuild: (date, commit) => `Appen er fra ${date} (${commit})`,
      checkUpdate: 'Søg efter ny version',
      checking: 'Søger …',
      upToDate: 'Du har den nyeste version.',
      updateFound: 'Der er en ny version. Den hentes nu …',
      updateProgress: (done, total) => `Henter ${done} af ${total} filer …`,
      updateOffline: 'Du er ikke på nettet. Prøv igen, når du har forbindelse.',
      updateFailed: 'Kunne ikke søge. Prøv igen senere.',
      about: 'Om stead',
      aboutBody: [
        'stead samler råd fra myndigheder og andre pålidelige kilder, så du har dem – også uden internet. Vi skriver ikke selv rådene.',
        'Teksterne er skrevet om til et enkelt sprog. Med "Vis original" kan du altid se kildens egne ord.',
        'Står der "Prøveversion" på en guide, er den endnu ikke gennemlæst mod kilden.',
        'Alt, hvad du gemmer og vælger, bliver på din telefon. Appen har ingen konto og sender ingen data – bortset fra stregkoden, når du scanner en vare med internet. Den går til Open Food Facts, så appen kan finde varens navn.',
      ],
    },
    showOriginal: 'Vis original',
    showTranslation: 'Vis på dansk',
    partlyTranslated: 'Dele af guiden er oversat fra engelsk.',
    plainLanguage: 'Skrevet i et enkelt sprog ud fra kilden.',
    sourceWordsShown: 'Du ser kildens egne ord.',
    translatedFromEnglish: 'Oversat fra engelsk',
    originalEnglish: 'Original på engelsk',
    sensesTitle: 'Brug dine sanser',
    sensesBody: 'Tiderne er vejledende. Ser eller lugter maden forkert, så kassér den – og er du i tvivl, så smid den ud.',
    downloadingTitle: 'Gør appen klar til brug uden internet',
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
        noSource: 'Ingen af kilderne beskriver, hvordan denne fødevare tørres.',
      },
      pickling: { tested: 'Der findes opskrifter', noTestedMethod: 'Ingen af kilderne indeholder en afprøvet opskrift.' },
      canning: {
        pressure: 'Kun i trykkoger',
        waterBath: 'I vandbad',
        asPickles: 'Kun som syltede, efter en testet opskrift',
        notRecommended: 'Henkogning frarådes',
        noTestedMethod: 'Ingen af kilderne indeholder en afprøvet metode.',
      },
    },
    apartFromProducers: 'Tager skade af ethylen – en gas, som moden frugt afgiver. Hold den væk fra disse, som afgiver meget:',
    apartFromSensitive: 'Afgiver meget ethylen – en gas, der får frugt og grønt til at modne. Hold den væk fra disse, som tager skade af det:',
    storeWith: 'Kan opbevares sammen med (i op til 7 dage):',
    ethyleneNeutral: 'Afgiver ikke meget ethylen (en gas, der får frugt til at modne) og tager ikke skade af det.',
    textTranslated: 'Teksten er skrevet i et enkelt sprog med udgangspunkt i kilderne.',
    textOriginal: 'Teksten vises med kildernes egne ord.',
    sourcesHeading: 'Kilder',
    basedOn: (names) => `Kilde: ${names}`,
    firstAid: 'Førstehjælp',
    firstAidSubtitle: (n) => `${n} livreddende guides`,
    firstAidIntro: 'Skrevet i et enkelt sprog med udgangspunkt i Forsvarets håndbog Førstehjælpens ABC. Under hver guide kan du også se kildens egne ord.',
    guideNotFound: 'Guiden blev ikke fundet.',
    guideSource: (name, from, to) => `Kilde: ${name}, s. ${from === to ? from : `${from}–${to}`}`,
    checkedAgainst: 'Sammenholdt med',
    ownerNotChecked: 'Prøveversion: endnu ikke gennemlæst mod kilden.',
    relatedGuides: 'Se også',
    firstAidSearchPlaceholder: 'Søg i førstehjælp, fx blødning',
    firstAidSearchLabel: 'Søg i førstehjælp',
    noGuideResults: (q) => `Ingen guides matcher "${q}".`,
    allGuides: 'Alle guides',
    readMore: 'Læs mere',
    abbreviationsLabel: 'Forkortelser',
    places: {
      open: 'Vælg steder på kortet',
      title: 'Steder på kortet',
      intro: 'Vælg, hvilke steder kortet skal vise. Navnene kommer frem, når du zoomer tæt på.',
      note: 'Stederne kommer fra OpenStreetMap, som frivillige holder ved lige. Der kan mangle steder, især uden for byerne.',
      groups: { emergency: 'Nødhjælp og sundhed', water: 'Vand og ly', supplies: 'Forsyninger', transport: 'Transport', public: 'Offentlige steder', nature: 'Natur og udsigt', food: 'Mad og drikke', culture: 'Kultur og seværdigheder', other: 'Alt andet' },
      examples: {
        emergency: 'Hospital, læge, apotek, politi, brandstation',
        water: 'Drikkevand, shelter, toilet, lejrplads',
        supplies: 'Supermarked, købmand, tankstation, hæveautomat',
        transport: 'Tog, bus, færge, parkering, havn',
        public: 'Rådhus, posthus, bibliotek, skole, kirke',
        nature: 'Park, skov, strand, udsigt, legeplads',
        food: 'Restaurant, café, bar',
        culture: 'Museum, seværdighed, teater, mindesmærke',
        other: 'Butikker, bænke, træer og alt det øvrige',
      },
      kinds: {
        hospital: 'Hospital', clinic: 'Klinik', doctors: 'Læge', pharmacy: 'Apotek', dentist: 'Tandlæge', police: 'Politi', fire_station: 'Brandstation', ambulance_station: 'Ambulancestation',
        emergency_access_point: 'Redningspunkt', defibrillator: 'Hjertestarter', veterinary: 'Dyrlæge', drinking_water: 'Drikkevand', water_point: 'Vandpost', shelter: 'Shelter', toilets: 'Toilet',
        shower: 'Bruser', camp_site: 'Campingplads', caravan_site: 'Autocamperplads', firepit: 'Bålplads', bbq: 'Grill', spring: 'Kilde', supermarket: 'Supermarked', convenience: 'Købmand',
        kiosk: 'Kiosk', bakery: 'Bager', butcher: 'Slagter', greengrocer: 'Grønthandler', fuel: 'Tankstation', charging_station: 'Ladestander', atm: 'Hæveautomat', bank: 'Bank',
        hardware: 'Isenkræmmer', doityourself: 'Byggemarked', outdoor: 'Friluftsbutik', chemist: 'Materialist', station: 'Togstation', halt: 'Trinbræt', bus_station: 'Busstation', bus_stop: 'Busstoppested',
        ferry_terminal: 'Færgeleje', aerodrome: 'Lufthavn', subway_entrance: 'Metro', taxi: 'Taxi', parking: 'Parkering', marina: 'Lystbådehavn', townhall: 'Rådhus', post_office: 'Posthus',
        library: 'Bibliotek', school: 'Skole', kindergarten: 'Børnehave', place_of_worship: 'Kirke', community_centre: 'Forsamlingshus', park: 'Park', forest: 'Skov', beach: 'Strand', peak: 'Top',
        viewpoint: 'Udsigtspunkt', picnic_site: 'Rasteplads', playground: 'Legeplads', restaurant: 'Restaurant', cafe: 'Café', fast_food: 'Fastfood', bar: 'Bar', pub: 'Pub', museum: 'Museum',
        attraction: 'Seværdighed', theatre: 'Teater', cinema: 'Biograf', artwork: 'Kunstværk', zoo: 'Zoo', memorial: 'Mindesmærke', archaeological_site: 'Fortidsminde', castle: 'Slot',
      },
    },
    totalTopics: (n) => `${n} emner`,
    foodCount: (n) => `${n} fødevarer`,
    growing: 'Dyrkning',
    foodGroups: { fruit: 'Frugt', vegetables: 'Grøntsager', herbs: 'Krydderurter', meat: 'Kød', fish: 'Fisk' },
    growingIntro: 'Så, pas og høst – og gem frø til næste år. Nemme afgrøder til det danske klima.',
    growingCount: (n) => (n === 1 ? '1 afgrøde' : `${n} afgrøder`),
    growingSections: { sowing: 'Såning', conditions: 'Jord og placering', care: 'Pasning', harvest: 'Høst', seeds: 'Frø til næste år', neighbours: 'Naboplanter og nyt sted næste år', noPrep: 'Kræver ingen tilberedning', somePrep: 'Kræver lidt tilberedning', needsPrep: 'Kræver tilberedning' },
    prepare: 'Når det sker',
    prepareIntro: 'Sådan forbereder du dig på storm, stormflod og sne, hvad du gør, hvis strøm, vand eller varme forsvinder – og hvad du bør have derhjemme. Myndighederne anbefaler, at du kan klare dig selv i tre døgn.',
    prepareCount: (n) => (n === 1 ? '1 guide' : `${n} guides`),
    prepareWeather: 'Før det sker',
    prepareSituations: 'Hvis det sker',
    prepareSupplies: 'Hjemmeberedskab',
    prepareSkills: 'Gode at kunne',
    prepareSearchPlaceholder: 'Søg, fx strøm eller vand',
    prepareSearchLabel: 'Søg i Når det sker',
    checklistProgress: (done, total) => `Du har ${done} af ${total}`,
    checklistInForraad: (names) => `I forrådet: ${names}`,
    checklistWaterInForraad: 'Ret vandet i Forråd',
    checklistHave: 'Du har det',
    checklistMissing: 'Mangler',
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
    savedEmptyBody: 'Tryk på "Gem" ved en guide, en afgrøde eller en fødevare. Så finder du den her.',
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
    noResults: (q) => `No foods match “${q}”.`,
    itemCount: (n) => `${n} foods`,
    locations: { pantry: 'Cupboard', fridge: 'Fridge', freezer: 'Freezer' },
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
    packErrorBody: 'The app\'s content could not be opened. Close the app completely and open it again.',
    notFound: 'Food not found.',
    back: 'Back',
    loading: 'Loading…',
    offlineReady: 'The app now works without internet.',
    updateReady: 'A new version is ready.',
    updateAction: 'Update',
    dismiss: 'Dismiss',
    homeTitle: 'What do you need?',
    homeSearchPlaceholder: 'Search',
    homeSearchLabel: 'Search the content',
    startHere: 'Start here',
    storingFood: 'Storage',
    storageIntro: 'How long does food keep in the cupboard, refrigerator and freezer?',
    emergencyTitle: 'Life-threatening emergency?',
    emergencySubtitle: 'Call the emergency number (Denmark)',
    emergencyCallLabel: 'Call 112, emergency services',
    offlineReadyStatus: 'Ready without internet',
    preparingOffline: 'Getting ready for use without internet …',
    navLabel: 'Main menu',
    tabs: { home: 'Home', map: 'Map', forraad: 'Supplies', tools: 'Tools' },
    settingsOpen: 'Settings',
    mapTitle: 'Map',
    mapLabel: 'Map of Denmark',
    mapLoading: 'Opening the map …',
    mapErrorTitle: 'The map could not be shown',
    mapErrorBody: 'Your phone or browser cannot show the map. The rest of the app works as usual.',
    mapCrashBody: 'Something went wrong. Tap another button at the bottom, then Map again. The rest of the app works as usual.',
    mapArea: {
      open: 'Download maps',
      close: 'Close',
      title: 'Offline maps',
      yourAreas: 'Your areas',
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
      calculating: 'Calculating size …',
      freeSpace: (size) => `Free space on this device: ${size}`,
      notEnoughSpace: 'There is not enough space on this device.',
      download: (size) => `Download ${size}`,
      needsNetwork: 'You need an internet connection to download maps. Maps you have already downloaded also work offline.',
      states: { ready: 'Ready without internet', downloading: 'Downloading', paused: 'Paused' },
      progress: (percent) => `${percent} %`,
      pause: 'Pause',
      resume: 'Resume',
      remove: 'Delete',
      confirmRemove: 'Tap again to delete',
      downloadFailed: 'The map could not be downloaded. Try again when you have internet.',
      areaErrors: {
        changed: 'The map was updated after the download started. Delete the area and download it again.',
        network: 'The connection was lost. Tap Resume when you have internet.',
        incomplete: 'Not all of the area was stored. Tap Resume to try again.',
        unknown: 'The download stopped. Tap Resume to try again.',
      },
      back: 'Back',
      introTitle: 'Download the map to your phone',
      introBody: 'The map fetches roads, paths and place names from the internet while you use it. If internet and mobile data suddenly disappear where you are, you can only use the map in places you downloaded to your phone beforehand.',
      introWarning: 'Elsewhere you only see a rough overview with the largest towns and roads.',
      introSizes: 'A map around your home typically takes 10–50 MB – about the size of a few photos. A map of all Denmark takes about 600 MB.',
      kindSize: { home: '10 km: about 7–20 MB · 25 km: about 25–45 MB', region: 'About 80–175 MB', country: 'About 600 MB' },
      chooseArea: 'Choose an area',
      skipForNow: 'Not now – show the map',
      offlineNow: 'You are offline right now. Download the map next time you have an internet connection – Wi-Fi is best.',
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
      keepUsing: 'You can close this screen and use the map while the download continues.',
      doneTitle: 'Done',
      doneBody: (label) => `You can now use the map of ${label} – also without internet.`,
      showOnMap: 'Show on the map',
      tryAgain: 'Try again',
      addArea: 'Download another area',
      notCovered: 'Online only here',
      notCoveredOffline: 'Not downloaded here',
      getThisArea: 'Get',
      mapDate: (date) => `Map from ${date}`,
      newerMap: 'A newer edition of the map is available. You can use the old one until the new one is downloaded.',
      update: 'Download the updated map',
      updating: 'New edition – replaces the old one when downloaded',
      showPosition: 'Show my position',
      hidePosition: 'Hide position',
      positionSearching: 'Finding your position …',
      positionUnavailable: 'Your location cannot be found right now. Try again outdoors.',
      positionRefused: 'The app does not have permission to use your location. You can change this in your phone\'s settings.',
    },
    toolsTitle: 'Tools',
    toolSections: { timers: 'Timers', direction: 'Direction and daylight', firstAid: 'First aid', food: 'Food' },
    compass: {
      title: 'Compass',
      subtitle: 'Find the direction and hold a course – without internet or GPS.',
      start: 'Start compass',
      starting: 'Starting the compass …',
      magnetic: 'Direction from magnetic north',
      uncertain: 'The compass is uncertain right now. Move a little away from metal, magnets and electronics.',
      denied: 'The app was not allowed to use the compass. Try again and choose Allow.',
      tryAgain: 'Try again',
      unsupported: 'This device has no compass the app can use.',
      holdCourse: 'Hold this course',
      clearCourse: 'Clear course',
      course: (deg) => `Course ${deg}°`,
      onCourse: 'You are on course',
      turnRight: (deg) => `Turn ${deg}° right`,
      turnLeft: (deg) => `Turn ${deg}° left`,
      howTo: 'Hold the phone flat in front of you with the top pointing ahead. Turn until the direction is right and tap Hold this course. The app then shows when you drift off course.',
    },
    sun: {
      title: 'Sunrise and sunset',
      subtitle: 'When the sun rises and sets – without internet.',
      place: 'Place',
      changePlace: 'Change place',
      change: 'Change',
      yearTitle: 'Length of the day through the year',
      yearChart: (shortest, longest) => `Length of the day through the year. ${shortest}. ${longest}.`,
      shortestDay: (date, length) => `Shortest day: ${date}, ${length}`,
      longestDay: (date, length) => `Longest day: ${date}, ${length}`,
      hoursShort: (h) => `${h} h`,
      choosePlace: 'Choose a place',
      myPosition: 'Your position',
      homePoint: 'The home point on the map',
      useMyPosition: 'Use my position',
      useHomePoint: 'Use the home point on the map',
      town: 'Town',
      chooseTown: 'Choose a town',
      searching: 'Finding your position …',
      refused: 'The app does not have permission to use your location. You can change this in your phone\'s settings, or choose a town.',
      unavailable: 'Your location cannot be found right now. Try outdoors, or choose a town.',
      date: 'Date',
      today: 'Today',
      sunrise: 'Sunrise',
      sunset: 'Sunset',
      risesIn: (dir, deg) => `Rises in the ${dir} (${deg}°)`,
      setsIn: (dir, deg) => `Sets in the ${dir} (${deg}°)`,
      neverSets: 'The sun does not set on this day.',
      neverRises: 'The sun does not rise on this day.',
      light: 'Light outside',
      lightHelp: 'Light enough to be outside without a torch.',
      lightAllNight: 'It does not get dark this night.',
      darkAllDay: 'It does not really get light on this day.',
      dayLength: 'Length of the day',
      longer: (min) => `${min} min longer than yesterday`,
      shorter: (min) => `${min} min shorter than yesterday`,
      sameAsYesterday: 'About the same as yesterday',
      note: 'Worked out from the place and the date, in the phone\'s time. Hills, buildings and clouds can make it dark sooner. Directions are from true north.',
      nowTitle: 'The sun right now',
      nowDirection: (dir, deg, height) => `In the ${dir} (${deg}°), ${height}° above the horizon.`,
      nowDown: 'The sun is below the horizon right now.',
      faceSun: 'Stand facing the sun.',
      northLeft: (deg) => `North is then ${deg}° to your left.`,
      northRight: (deg) => `North is then ${deg}° to your right.`,
      northAhead: 'North is then straight ahead.',
      northBehind: 'North is then straight behind you.',
      moonTitle: 'The moon',
      moonPhases: {
        new: 'New moon',
        waxingCrescent: 'Waxing moon',
        firstQuarter: 'First quarter',
        waxingGibbous: 'Waxing moon',
        full: 'Full moon',
        waningGibbous: 'Waning moon',
        lastQuarter: 'Last quarter',
        waningCrescent: 'Waning moon',
      },
      moonLit: (pct) => `${pct} % of the moon is lit`,
      moonrise: 'Moonrise',
      moonset: 'Moonset',
      moonNoRise: 'The moon does not rise on this day.',
      moonNoSet: 'The moon does not set on this day.',
    },
    power: {
      title: 'Fridge and freezer',
      subtitle: 'How long do the fridge and freezer keep food cold when the power is out?',
      intro: 'Tap when the power goes. The clock keeps track of the time – also if you close the app.',
      startNow: 'The power went now',
      startEarlier: 'The power went earlier',
      earlierLabel: 'When did the power go?',
      start: 'Start the clock',
      outFor: 'The power has been out for',
      since: (time) => `Since ${time}`,
      fridge: 'Fridge',
      freezerFull: 'Full freezer',
      freezerHalf: 'Half-full freezer',
      holds: (hours) => `Keeps cold for about ${hours} hours with the door shut`,
      coldFor: (left) => `Cold enough for another ${left}`,
      over: 'Past the time',
      keepClosed: 'Only open the fridge and freezer when you need to. Then the food stays cold for longer.',
      fridgeOver: 'If the power has been out for more than 4 hours, throw out perishable food from the fridge: meat, fish, cut fruit and vegetables, eggs, milk and leftovers. Also throw out food with an unusual smell, colour or texture.',
      refreeze: 'If frozen food still has ice crystals or is at most 4 °C, you can freeze it again.',
      back: 'The power is back',
      backDone: 'Good. Check that the fridge is at most 5 °C.',
      source: 'The times are from USDA and CDC (USA). The Danish Veterinary and Food Administration recommends at most 5 °C in the fridge.',
      guide: 'Read more in “Strømmen er gået” (Danish)',
    },
    boil: {
      title: 'Boil water',
      subtitle: 'A timer for boiling water you are not sure is clean.',
      cloudy: 'If the water is cloudy, first filter it through a clean cloth, paper towel or coffee filter.',
      how: 'Bring the clear water to a rolling boil for 1 minute.',
      start: 'The water is boiling now',
      left: (seconds) => `${seconds} seconds left`,
      done: 'Done. Let the water cool.',
      again: 'Start again',
      stop: 'Stop',
      guide: 'Read more in “Der er intet vand” (Danish)',
    },
    forraad: {
      title: 'Supplies',
      loading: 'Loading your supplies …',
      water: 'Drinking water',
      waterOf: (have, need) => `${have} of ${need}`,
      waterHave: (have) => `${have} stored`,
      waterOfShort: (need) => `of ${need}`,
      lastChecked: (date) => `Last checked ${date}`,
      neverChecked: 'Not checked yet',
      checkAgain: (date) => `Check again in ${date}`,
      checkDue: (date) => `Time to check the water (since ${date})`,
      checkedToday: 'Checked today',
      ok: 'OK',
      checkSource: 'Check your supplies every six months: look at the dates and replace what needs replacing.',
      emptyStore: 'There is nothing in your supplies yet.',
      searchPlaceholder: 'Search your supplies',
      searchLabel: 'Search your supplies',
      noMatches: (q) => `Nothing in your supplies matches “${q}”.`,
      seeAllRecommendations: 'See what the authorities recommend',
      seeRecommendations: (title) => `See the recommendations: ${title}`,
      waterLitres: (unit) => `${unit === 'gal' ? 'Gallons' : 'Litres'} stored`,
      people: 'People',
      targetDays: 'Supplies for',
      days: (n) => `${n} days`,
      targetHelp: 'The authorities recommend at least 3 days.',
      expiringTitle: 'Expiring soon',
      expired: (date) => `Expired ${date}`,
      expires: (date) => `Best before ${date}`,
      categories: { food: 'Food', medicine: 'Medicine and hygiene', other: 'Light, heat and other' },
      categoryShort: { food: 'Food', medicine: 'Care', other: 'Other' },
      datesGuide: 'When the date has passed',
      categoryEmpty: 'Nothing here yet.',
      add: 'Add',
      addIn: (category) => `Add to ${category.toLowerCase()}`,
      editTitle: 'Edit',
      addTitle: 'Add to your supplies',
      name: 'Name',
      namePlaceholder: 'E.g. canned mackerel',
      suggestionsLabel: 'Suggestions',
      fromStockList: 'From the list',
      usedBefore: 'Used before',
      scannedBefore: 'Scanned before',
      category: 'Category',
      count: 'Number',
      bestBefore: 'Best before',
      bestBeforeHelp: 'Month and year are enough. If you have several, choose the one that expires first.',
      noDate: 'No date',
      clearDate: 'Remove date',
      month: 'Month',
      year: 'Year',
      optional: 'optional',
      size: 'Size',
      sizePlaceholder: 'E.g. family pack',
      sizeAmount: 'Amount',
      sizeUnit: 'Unit',
      sizeText: 'Describe the size',
      sizeOther: 'Other',
      units: { g: 'g', kg: 'kg', ml: 'ml', cl: 'cl', dl: 'dl', l: 'l', stk: 'pcs' },
      done: 'Done',
      typeAdd: 'Add',
      addedTo: (name, category) => `${name} added to ${category}`,
      addedCount: (n) => `${n} added`,
      alreadyHave: 'It is already in your supplies. The new ones are added to it.',
      noBarcode: 'No barcode',
      typeInstead: 'Type it instead',
      save: 'Save',
      cancel: 'Cancel',
      remove: 'Delete',
      removeConfirm: (name) => `Delete ${name}?`,
      editDetails: 'Edit',
      bestBeforeNew: 'Best before on the new ones',
      bestBeforeNewHelp: 'If the new ones expire before the ones you have, their date is kept.',
      stocked: (name, n, total) => `${name}: added ${n}, now ${total}.`,
      deleted: (name) => `${name} deleted.`,
      removeOnClose: 'It is removed from your supplies when you close this.',
      waterChecked: 'The water is checked.',
      close: 'Close',
      countLabel: (n) => `${n}×`,
      countsAs: (name) => `Counts as: ${name}`,
      unlink: 'Does not count on the list',
      notFound: 'That item is no longer in your supplies.',
      nameMissing: 'Enter what it is.',
      scan: 'Scan items',
      scanHelp: 'Hold the barcode inside the frame.',
      scanStarting: 'Starting the camera …',
      scanSeenNotRead: "The barcode is seen but can't be read. Hold the phone still, a bit further away, in good light.",
      scanDenied: 'The app was not allowed to use the camera. You can allow it in the phone settings – or type the name instead.',
      scanUnavailable: 'The camera cannot be used here. Type the name instead.',
      lookingUp: 'Looking up the product …',
      lookupNotFound: 'The product was not found. Type the name – the app remembers the barcode next time.',
      lookupOffline: 'The product cannot be looked up without internet. Type the name – the app remembers the barcode next time.',
      productFrom: (source) => `Product name from ${source}.`,
      scanPrivacy: 'With internet, the app sends only the barcode to Open Food Facts to find the product name.',
      backup: 'Copy of your supplies',
      backupBody: 'What you save in the app is only on this phone. If you delete the app, it is gone. Save a copy in Files so you can get it back.',
      saveCopy: 'Save a copy',
      restoreCopy: 'Restore from a copy',
      restoreConfirm: (items) => `The copy has ${items === 1 ? '1 item' : `${items} items`} in your supplies. Replace what is in the app now?`,
      restoreDone: 'Your supplies were restored from the copy.',
      restoreFailed: 'The file could not be read. Choose a copy saved from stead.',
    },
    settingsTitle: 'Settings',
    settings: {
      library: 'On this phone',
      content: (version, date) => `Content ${version} from ${date}`,
      guides: 'Guides',
      foodGuides: 'Food guides',
      foods: 'Foods',
      sources: 'Sources',
      maps: 'Maps',
      mapsNone: 'No maps downloaded',
      mapsSummary: (areas, size) => `${areas === 1 ? '1 area' : `${areas} areas`}, ${size}`,
      used: 'The app uses',
      language: 'Language',
      appearance: 'Appearance',
      followPhone: 'Follow phone',
      light: 'Light',
      dark: 'Dark',
      textSize: 'Text size',
      textSizeBody: "Text follows your phone's text size. Change it in Settings > Display & Brightness > Text Size.",
      waterUnit: 'Water in',
      litres: 'Litres',
      gallons: 'Gallons (US)',
      sourcesIntro: 'All content comes from these sources. Each guide lists its own sources at the bottom.',
      sourcesCount: (n) => `${n} sources`,
      appVersion: 'App and version',
      appBuild: (date, commit) => `The app is from ${date} (${commit})`,
      checkUpdate: 'Check for a new version',
      checking: 'Checking …',
      upToDate: 'You have the latest version.',
      updateFound: 'There is a new version. Downloading it now …',
      updateProgress: (done, total) => `Downloading ${done} of ${total} files …`,
      updateOffline: 'You are not online. Try again when you have a connection.',
      updateFailed: 'Could not check. Try again later.',
      about: 'About stead',
      aboutBody: [
        'stead collects advice from authorities and other trusted sources, so you have it – even without internet. We do not write the advice ourselves.',
        "The texts are rewritten in plain Danish. With \"Show original\" you can always see the source's own words.",
        'A guide marked "Preview version" has not yet been checked against its source.',
        'Everything you save and choose stays on your phone. The app has no account and sends no data – except the barcode, when you scan a product with internet. It goes to Open Food Facts so the app can find the product name.',
      ],
    },
    showOriginal: 'Show original',
    showTranslation: 'Show translation',
    partlyTranslated: 'Parts of this guide are translated from English.',
    plainLanguage: 'Written in plain language from the source.',
    sourceWordsShown: 'You are seeing the source\'s own words.',
    translatedFromEnglish: 'Translated from English',
    originalEnglish: 'Original in English',
    sensesTitle: 'Use your senses',
    sensesBody: 'The times are guidelines. If food looks or smells wrong, throw it out – and when in doubt, throw it out.',
    downloadingTitle: 'Getting the app ready for offline use',
    downloadingBody: 'This may take a little while. You can use the app while it loads.',
    downloadProgress: (done, total) => `${done} of ${total} files`,
    openingPack: 'Loading the content …',
    firstLaunchNote: 'The first launch may take a little while.',
    guideSections: {
      about: 'About',
      prefers: 'What it needs',
      avoid: 'Avoid',
      together: 'With other produce',
      coolStorage: 'Long-term storage',
      drying: 'Drying',
      pickling: 'Pickling',
      canning: 'Canning',
    },
    kitchenTimes: 'Storage times at home',
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
    apartFromProducers: 'Damaged by ethylene – a gas given off by ripe fruit. Keep it away from these, which give off a lot:',
    apartFromSensitive: 'Gives off a lot of ethylene – a gas that makes fruit and vegetables ripen. Keep it away from these, which are damaged by it:',
    storeWith: 'Can be stored with (for up to 7 days):',
    ethyleneNeutral: 'Gives off little ethylene (a gas that makes fruit ripen) and is not damaged by it.',
    textTranslated: 'The text is written in plain language, based on the sources.',
    textOriginal: 'The text uses the sources\' own wording.',
    sourcesHeading: 'Sources',
    basedOn: (names) => `Source: ${names}`,
    firstAid: 'First aid',
    firstAidSubtitle: (n) => `${n} life-saving guides (in Danish)`,
    firstAidIntro: 'Written in plain Danish from the Danish Defence handbook Førstehjælpens ABC. Each guide can also show the source\'s own words.',
    guideNotFound: 'Guide not found.',
    guideSource: (name, from, to) => `Source: ${name}, ${from === to ? `p. ${from}` : `pp. ${from}–${to}`}`,
    checkedAgainst: 'Compared with',
    ownerNotChecked: 'Preview version: not yet checked against the source.',
    relatedGuides: 'See also',
    firstAidSearchPlaceholder: 'Search in Danish, e.g. blødning',
    firstAidSearchLabel: 'Search first aid',
    noGuideResults: (q) => `No guides match “${q}”.`,
    allGuides: 'All guides',
    readMore: 'Read more',
    abbreviationsLabel: 'Abbreviations',
    places: {
      open: 'Choose places on the map',
      title: 'Places on the map',
      intro: 'Choose which places the map shows. Names appear when you zoom in close.',
      note: 'The places come from OpenStreetMap, kept up by volunteers. Some may be missing, especially outside towns.',
      groups: { emergency: 'Emergency and health', water: 'Water and shelter', supplies: 'Supplies', transport: 'Transport', public: 'Public places', nature: 'Nature and views', food: 'Food and drink', culture: 'Culture and sights', other: 'Everything else' },
      examples: {
        emergency: 'Hospital, doctor, pharmacy, police, fire station',
        water: 'Drinking water, shelter, toilet, campsite',
        supplies: 'Supermarket, grocer, fuel station, cash machine',
        transport: 'Train, bus, ferry, parking, harbour',
        public: 'Town hall, post office, library, school, church',
        nature: 'Park, forest, beach, viewpoint, playground',
        food: 'Restaurant, café, bar',
        culture: 'Museum, sight, theatre, memorial',
        other: 'Shops, benches, trees and everything else',
      },
      kinds: {
        hospital: 'Hospital', clinic: 'Clinic', doctors: 'Doctor', pharmacy: 'Pharmacy', dentist: 'Dentist', police: 'Police', fire_station: 'Fire station', drinking_water: 'Drinking water',
        shelter: 'Shelter', toilets: 'Toilets', supermarket: 'Supermarket', convenience: 'Convenience store', fuel: 'Petrol station', atm: 'ATM', station: 'Train station', bus_stop: 'Bus stop',
        ferry_terminal: 'Ferry terminal', defibrillator: 'Defibrillator', camp_site: 'Campsite', place_of_worship: 'Church', viewpoint: 'Viewpoint',
      },
    },
    totalTopics: (n) => `${n} topics`,
    foodCount: (n) => `${n} foods`,
    growing: 'Growing food',
    foodGroups: { fruit: 'Fruit', vegetables: 'Vegetables', herbs: 'Herbs', meat: 'Meat', fish: 'Fish' },
    growingIntro: 'Sow, care for and harvest crops – and save seeds for next year. Easy crops for the Danish climate. (In Danish.)',
    growingCount: (n) => (n === 1 ? '1 crop' : `${n} crops`),
    growingSections: { sowing: 'Sowing', conditions: 'Soil and site', care: 'Care', harvest: 'Harvest', seeds: 'Seed for next year', neighbours: 'Neighbouring plants and a new spot next year', noPrep: 'No preparation needed', somePrep: 'Some preparation', needsPrep: 'Needs preparation' },
    prepare: 'When it happens',
    prepareIntro: 'How to prepare for storms, storm surges and snow, what to do if you lose power, water or heat, and what to keep at home. The authorities recommend preparing to manage on your own for three days. (In Danish.)',
    prepareCount: (n) => (n === 1 ? '1 guide' : `${n} guides`),
    prepareWeather: 'Before it happens',
    prepareSituations: 'If it happens',
    prepareSupplies: 'Home emergency supplies',
    prepareSkills: 'Good to know',
    prepareSearchPlaceholder: 'Search in Danish, e.g. strøm or vand',
    prepareSearchLabel: 'Search emergency guides',
    checklistProgress: (done, total) => `You have ${done} of ${total}`,
    checklistInForraad: (names) => `In your supplies: ${names}`,
    checklistWaterInForraad: 'Change the water in Supplies',
    checklistHave: 'You have it',
    checklistMissing: 'Missing',
    storeThisCrop: 'Storing and preserving',
    growingSearchPlaceholder: 'Search for a crop',
    growingSearchLabel: 'Search growing guides',
    save: 'Save',
    saved: 'Saved',
    saveLabel: 'Save for later',
    savedOpenLabel: (n) => (n === 0 ? 'Saved' : `Saved (${n})`),
    savedTitle: 'Saved',
    savedIntro: 'What you save stays on this device only.',
    savedEmptyTitle: 'Nothing saved yet',
    savedEmptyBody: 'Tap "Save" on a guide, a crop or a food. Then you will find it here.',
    savedNoneHere: 'Nothing saved here yet.',
    savedCount: (n) => `${n} saved`,
    savedUnavailable: 'No longer in the app',
    remove: 'Remove',
  },
};
