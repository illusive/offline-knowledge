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
  forraad: {
    title: string;
    subtitle: string;
    emptyTitle: string;
    emptyBody: string;
    loading: string;
    water: string;
    waterOf: (have: string, need: string) => string;
    waterHave: (have: string) => string;
    waterTarget: (days: number, perPerson: string) => string;
    waterPetsNote: string;
    waterNone: string;
    lastChecked: (date: string) => string;
    neverChecked: string;
    checkAgain: (date: string) => string;
    checkDue: (date: string) => string;
    checkedToday: string;
    checkSource: string;
    addWater: string;
    household: string;
    householdSummary: (people: number, days: number, petLitres: string | null) => string;
    editHousehold: string;
    people: string;
    petLitres: string;
    petLitresHelp: string;
    targetDays: string;
    days: (n: number) => string;
    targetHelp: string;
    done: string;
    expiringTitle: string;
    expired: (date: string) => string;
    expires: (date: string) => string;
    categories: Record<'water' | 'food' | 'medicine' | 'other', string>;
    categoryEmpty: string;
    consider: string;
    showAll: (n: number) => string;
    showFewer: string;
    forHousehold: (amount: string) => string;
    readStockList: (title: string) => string;
    add: string;
    addIn: (category: string) => string;
    editTitle: string;
    addTitle: string;
    name: string;
    namePlaceholder: string;
    suggestionsLabel: string;
    fromStockList: string;
    usedBefore: string;
    category: string;
    count: string;
    litresEach: (unit: string) => string;
    expiry: string;
    expiryHelp: string;
    clearExpiry: string;
    save: string;
    cancel: string;
    remove: string;
    removeConfirm: (name: string) => string;
    countLabel: (n: number) => string;
    edit: (name: string) => string;
    countsAs: (name: string) => string;
    unlink: string;
    notFound: string;
    nameMissing: string;
    scan: string;
    scanTitle: string;
    scanHelp: string;
    scanStarting: string;
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
    openMap: string;
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
  growingIntro: string;
  growingCount: (n: number) => string;
  growingSections: Record<'sowing' | 'conditions' | 'care' | 'harvest' | 'seeds' | 'neighbours' | 'noPrep' | 'somePrep' | 'needsPrep', string>;
  prepare: string;
  prepareIntro: string;
  prepareCount: (n: number) => string;
  prepareWeather: string;
  prepareSituations: string;
  prepareSupplies: string;
  prepareSearchPlaceholder: string;
  prepareSearchLabel: string;
  checklistProgress: (done: number, total: number) => string;
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
    languageName: { da: 'dansk', en: 'engelsk' },
    homeTitle: 'Hvad har du brug for?',
    homeSearchPlaceholder: 'Søg',
    homeSearchLabel: 'Søg i indholdet',
    startHere: 'Start her',
    storingFood: 'Opbevaring af mad',
    storingFoodSubtitle: (n) => `${n} fødevarer · holdbarhed`,
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
      getArea: 'Hent et område',
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
    forraad: {
      title: 'Forråd',
      subtitle: 'Hvad I har på lager derhjemme – og hvad der mangler.',
      emptyTitle: 'Dit forråd er tomt',
      emptyBody: 'Skriv det ind, I har på lager. Så holder appen styr på datoerne og viser, hvad myndighederne anbefaler, at I også har.',
      loading: 'Henter forrådet …',
      water: 'Drikkevand',
      waterOf: (have, need) => `${have} af ${need}`,
      waterHave: (have) => `${have} på lager`,
      waterTarget: (days, perPerson) => `Anbefalet til ${days} døgn: ${perPerson} pr. person pr. døgn.`,
      waterPetsNote: 'Husk også vand til dyr. Skriv selv, hvor meget de drikker, under husstanden.',
      waterNone: 'Ingen vand på lager endnu.',
      lastChecked: (date) => `Sidst tjekket ${date}`,
      neverChecked: 'Ikke tjekket endnu',
      checkAgain: (date) => `Tjek igen omkring ${date}`,
      checkDue: (date) => `Tid til at tjekke vandet (siden ${date})`,
      checkedToday: 'Tjekket i dag',
      checkSource: 'Tjek forrådet hvert halve år: se datoerne, og skift det ud, der skal skiftes.',
      addWater: 'Tilføj vand',
      household: 'Husstand',
      householdSummary: (people, days, petLitres) => `${people === 1 ? '1 person' : `${people} personer`}${petLitres ? `, dyr ${petLitres} pr. døgn` : ''} · ${days} døgn`,
      editHousehold: 'Ret husstand',
      people: 'Personer',
      petLitres: 'Vand til dyr pr. døgn',
      petLitresHelp: 'Kilderne siger ikke, hvor meget dyr skal have. Skriv det, dine dyr drikker på et døgn.',
      targetDays: 'Forråd til',
      days: (n) => `${n} døgn`,
      targetHelp: 'Myndighederne anbefaler mindst 3 døgn.',
      done: 'Færdig',
      expiringTitle: 'Holdbarhed',
      expired: (date) => `Udløbet ${date}`,
      expires: (date) => `Udløber ${date}`,
      categories: { water: 'Vand', food: 'Mad', medicine: 'Medicin og hygiejne', other: 'Lys, varme og andet' },
      categoryEmpty: 'Intet her endnu.',
      consider: 'Overvej også',
      showAll: (n) => `Vis alle ${n}`,
      showFewer: 'Vis færre',
      forHousehold: (amount) => `ca. ${amount} til jer`,
      readStockList: (title) => `Se listen: ${title}`,
      add: 'Tilføj',
      addIn: (category) => `Tilføj til ${category.toLowerCase()}`,
      editTitle: 'Ret',
      addTitle: 'Tilføj til forrådet',
      name: 'Hvad er det?',
      namePlaceholder: 'Fx makrel i tomat',
      suggestionsLabel: 'Forslag',
      fromStockList: 'Fra listen',
      usedBefore: 'Brugt før',
      category: 'Kategori',
      count: 'Antal',
      litresEach: (unit) => `Hver rummer (${unit})`,
      expiry: 'Holdbar til',
      expiryHelp: 'Valgfrit. Se datoen på pakken.',
      clearExpiry: 'Ingen dato',
      save: 'Gem',
      cancel: 'Annuller',
      remove: 'Slet',
      removeConfirm: (name) => `Vil du slette ${name}?`,
      countLabel: (n) => `${n} stk.`,
      edit: (name) => `Ret ${name}`,
      countsAs: (name) => `Tæller som: ${name}`,
      unlink: 'Tæller ikke med på listen',
      notFound: 'Den ting findes ikke længere i forrådet.',
      nameMissing: 'Skriv, hvad det er.',
      scan: 'Scan stregkode',
      scanTitle: 'Scan stregkoden',
      scanHelp: 'Hold stregkoden inden for rammen.',
      scanStarting: 'Starter kameraet …',
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
      openMap: 'Gå til Kort',
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
    growingIntro: 'Så, pas og høst – og gem frø til næste år. Nemme afgrøder til det danske klima.',
    growingCount: (n) => (n === 1 ? '1 afgrøde' : `${n} afgrøder`),
    growingSections: { sowing: 'Såning', conditions: 'Jord og placering', care: 'Pasning', harvest: 'Høst', seeds: 'Frø til næste år', neighbours: 'Naboplanter og nyt sted næste år', noPrep: 'Kræver ingen tilberedning', somePrep: 'Kræver lidt tilberedning', needsPrep: 'Kræver tilberedning' },
    prepare: 'Når det sker',
    prepareIntro: 'Sådan forbereder du dig på storm, stormflod og sne, hvad du gør, hvis strøm, vand eller varme forsvinder – og hvad du bør have derhjemme. Myndighederne anbefaler, at du kan klare dig selv i tre døgn.',
    prepareCount: (n) => (n === 1 ? '1 guide' : `${n} guides`),
    prepareWeather: 'Før det sker',
    prepareSituations: 'Hvis det sker',
    prepareSupplies: 'Hjemmeberedskab',
    prepareSearchPlaceholder: 'Søg, fx strøm eller vand',
    prepareSearchLabel: 'Søg i Når det sker',
    checklistProgress: (done, total) => `Du har ${done} af ${total}`,
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
    languageName: { da: 'Danish', en: 'English' },
    homeTitle: 'What do you need?',
    homeSearchPlaceholder: 'Search',
    homeSearchLabel: 'Search the content',
    startHere: 'Start here',
    storingFood: 'Storing food',
    storingFoodSubtitle: (n) => `${n} foods · storage times`,
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
      getArea: 'Download an area',
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
      noAreasYet: 'You have not downloaded a map yet, so without internet the map only shows a rough overview.',
      downloadFailed: 'The map could not be downloaded:',
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
    forraad: {
      title: 'Supplies',
      subtitle: 'What you have stored at home – and what is missing.',
      emptyTitle: 'Your supplies are empty',
      emptyBody: 'Add what you have stored. The app keeps track of the dates and shows what the authorities recommend that you also have.',
      loading: 'Loading your supplies …',
      water: 'Drinking water',
      waterOf: (have, need) => `${have} of ${need}`,
      waterHave: (have) => `${have} stored`,
      waterTarget: (days, perPerson) => `Recommended for ${days} days: ${perPerson} per person per day.`,
      waterPetsNote: 'Remember water for animals too. Enter how much they drink under household.',
      waterNone: 'No water stored yet.',
      lastChecked: (date) => `Last checked ${date}`,
      neverChecked: 'Not checked yet',
      checkAgain: (date) => `Check again around ${date}`,
      checkDue: (date) => `Time to check the water (since ${date})`,
      checkedToday: 'Checked today',
      checkSource: 'Check your supplies every six months: look at the dates and replace what needs replacing.',
      addWater: 'Add water',
      household: 'Household',
      householdSummary: (people, days, petLitres) => `${people === 1 ? '1 person' : `${people} people`}${petLitres ? `, animals ${petLitres} a day` : ''} · ${days} days`,
      editHousehold: 'Edit household',
      people: 'People',
      petLitres: 'Water for animals per day',
      petLitresHelp: 'The sources do not say how much animals need. Enter what your animals drink in a day.',
      targetDays: 'Supplies for',
      days: (n) => `${n} days`,
      targetHelp: 'The authorities recommend at least 3 days.',
      done: 'Done',
      expiringTitle: 'Dates',
      expired: (date) => `Expired ${date}`,
      expires: (date) => `Expires ${date}`,
      categories: { water: 'Water', food: 'Food', medicine: 'Medicine and hygiene', other: 'Light, heat and other' },
      categoryEmpty: 'Nothing here yet.',
      consider: 'Also consider',
      showAll: (n) => `Show all ${n}`,
      showFewer: 'Show fewer',
      forHousehold: (amount) => `about ${amount} for your household`,
      readStockList: (title) => `See the list: ${title}`,
      add: 'Add',
      addIn: (category) => `Add to ${category.toLowerCase()}`,
      editTitle: 'Edit',
      addTitle: 'Add to your supplies',
      name: 'What is it?',
      namePlaceholder: 'E.g. canned mackerel',
      suggestionsLabel: 'Suggestions',
      fromStockList: 'From the list',
      usedBefore: 'Used before',
      category: 'Category',
      count: 'Number',
      litresEach: (unit) => `Each holds (${unit})`,
      expiry: 'Best before',
      expiryHelp: 'Optional. See the date on the pack.',
      clearExpiry: 'No date',
      save: 'Save',
      cancel: 'Cancel',
      remove: 'Delete',
      removeConfirm: (name) => `Delete ${name}?`,
      countLabel: (n) => `${n}×`,
      edit: (name) => `Edit ${name}`,
      countsAs: (name) => `Counts as: ${name}`,
      unlink: 'Does not count on the list',
      notFound: 'That item is no longer in your supplies.',
      nameMissing: 'Enter what it is.',
      scan: 'Scan barcode',
      scanTitle: 'Scan the barcode',
      scanHelp: 'Hold the barcode inside the frame.',
      scanStarting: 'Starting the camera …',
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
      openMap: 'Go to Map',
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
    growingIntro: 'Sow, care for and harvest crops – and save seeds for next year. Easy crops for the Danish climate. (In Danish.)',
    growingCount: (n) => (n === 1 ? '1 crop' : `${n} crops`),
    growingSections: { sowing: 'Sowing', conditions: 'Soil and site', care: 'Care', harvest: 'Harvest', seeds: 'Seed for next year', neighbours: 'Neighbouring plants and a new spot next year', noPrep: 'No preparation needed', somePrep: 'Some preparation', needsPrep: 'Needs preparation' },
    prepare: 'When it happens',
    prepareIntro: 'How to prepare for storms, storm surges and snow, what to do if you lose power, water or heat, and what to keep at home. The authorities recommend preparing to manage on your own for three days. (In Danish.)',
    prepareCount: (n) => (n === 1 ? '1 guide' : `${n} guides`),
    prepareWeather: 'Before it happens',
    prepareSituations: 'If it happens',
    prepareSupplies: 'Home emergency supplies',
    prepareSearchPlaceholder: 'Search in Danish, e.g. strøm or vand',
    prepareSearchLabel: 'Search emergency guides',
    checklistProgress: (done, total) => `You have ${done} of ${total}`,
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
