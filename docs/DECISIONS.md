# Decision Log

Each entry records the decision, its rationale and the alternatives considered. Superseded decisions are marked, not deleted.

---

## D-001 — Project location and repository

- **Date:** 2026-10-24
- **Decision:** The project lives in `~/projects/offline-knowledge` as a git repository on `main`.
- **Rationale:** Consistent with the owner's other projects.

## D-002 — iOS first, Expo + strict TypeScript (Expo part superseded by D-021)

- **Date:** 2026-10-24
- **Decision:** Target iOS (iPhone) first, using Expo and TypeScript in strict mode. Android is deferred.
- **Rationale:** Device testing (offline behavior, persistence, later GPS/maps) is planned on real iPhones. Supporting two platforms from the start doubles the testing load.
- **Alternatives:** iOS + Android from v1. Rejected for now; Expo keeps the option open.
- **Note:** Specific Expo SDK and library versions are chosen and verified at scaffolding time (M1), not in this decision.
- **Update 2026-10-25:** The iPhone remains the primary test device and TypeScript strict stays, but the app is a PWA, not an Expo app (D-021).

## D-003 — Danish + English interface, guides in source language

- **Date:** 2026-10-24
- **Decision:** The interface is localized in Danish and English. Each guide is shown in the language of its source, labeled with that language. No translation of guides in v1.
- **Rationale:** A translation is an adaptation for licensing purposes and is a new text that would need its own check against the source. Safety-critical content would need checking twice.
- **Alternatives:** Translate every guide into both languages. Rejected for v1. The content model still supports multiple language versions of a guide later.

## D-004 — Subject scope: practical preparedness, northern hemisphere

- **Date:** 2026-10-24
- **Decision:** Content covers practical preparedness and self-sufficiency for the northern hemisphere, primarily Denmark: emergency supplies, water, food storage and preservation, growing food, first aid, shelter and heating, basic repairs.
- **Alternatives:** General encyclopedia-style reference (too broad, dilutes quality); outdoor/wilderness with maps at the center (maps are a later subsystem).

## D-005 — Curate existing sources, do not author guidance

- **Date:** 2026-10-24
- **Decision:** The project packages existing, trusted, freely available information from authorities, international bodies and well-regarded wikis. It does not write original guidance.
- **Rationale:** Accuracy comes from the sources. The project's value is structure, findability and offline availability.

## D-006 — Restructure, keep original wording, block-level traceability

- **Date:** 2026-10-24
- **Decision:** Sources are restructured into summaries, steps, warnings and checklists, keeping the original wording wherever possible. Each content block references the source passage it came from. AI may assist restructuring at build time only. A human checks every guide against its sources before publishing.
- **Rationale:** Keeps accuracy close to the source and makes checking a direct comparison, while still improving readability.
- **Alternatives:** Free rewriting into plain language (higher error risk, heavier checking, more licensing friction). Verbatim excerpts only (safest, but hard to read).
- **Licensing implication:** Restructured content is an adaptation. "No derivatives" sources cannot be used this way without permission. See `CONTENT_POLICY.md`.

## D-007 — Bundled core pack only in v1

- **Date:** 2026-10-24
- **Decision:** v1 ships one versioned core knowledge pack inside the app binary. Content updates arrive with app updates. The pack manifest format (version, size, checksum, dependencies) is defined now so that downloadable packs can be added later without a format change.
- **Rationale:** Avoids hosting, download recovery and atomic-swap complexity until the core reading experience is proven.
- **Alternatives:** Bundled + downloadable packs in v1. Deferred to M4.

## D-008 — Offline maps deferred

- **Date:** 2026-10-24
- **Decision:** Offline maps are not part of v1. They start as a separate proof of concept (MapLibre React Native was the candidate; with D-021 it is MapLibre GL JS) rendering fully offline on an iPhone, after the core app is stable.
- **Rationale:** Maps are a separate subsystem with their own licensing (tile source), storage and testing concerns.

## D-009 — Initial audience: personal / small group

- **Date:** 2026-10-24
- **Decision:** The first audience is the owner and a small group, distributed via TestFlight. Correctness, attribution and licensing rules apply in full regardless.
- **Update 2026-10-25:** Distribution is now a shared link to the PWA, added to the Home Screen (D-021). TestFlight is no longer used.
- **Consequence:** Content under non-commercial (NC) licenses may be used for now but must be flagged, because a later App Store or commercial release would require a new decision.

## D-011 — Pilot sources: UK first, US as backup

- **Date:** 2026-10-24
- **Decision:** M1 pilot guides use the UK Government "Be Ready" campaign (Cabinet Office, Open Government Licence v3.0) as the primary English source. US federal sources (Ready.gov, CDC; public domain) are used only where the UK material has no coverage, and are labeled with their region. Text only: campaign photos are third-party and excluded.
- **Rationale:** Clear licence that allows adaptation, metric units, recent (checklist uploaded October 2026), and closer to the Danish context than US material.
- **Alternatives:** UK only (fewer topics); UK + US with editorial unit-conversion notes (an exception to D-006, rejected for now).

## D-012 — Danish authority content via formal reuse requests

- **Date:** 2026-10-24
- **Decision:** Danish authority guidance is used once the authority grants reuse in response to a request under the reuse act (LBK 1764/2021 § 4(3)). The first request is to Styrelsen for Samfundssikkerhed for "Forberedt på kriser". Until a reply arrives, those sources are `unknown` and unpublished.
- **Rationale:** The owner preferred relying on the reuse act. On reading it, § 4(1) says authorities *may* make documents available ("kan stille ... til rådighed"); it creates a request procedure with a 7-working-day deadline (§ 4(4)), not an automatic right. The request is therefore the lawful route the act provides.
- **Context:** samsik.dk and foedevarestyrelsen.dk publish no reuse terms (checked 2026-10-24). Danish Wikipedia coverage of practical topics is too thin to serve as an alternative (e.g. "Konservering" ≈ 350 characters).
- **Alternatives:** Assume reuse is permitted without asking (rejected: not what the act says).

## D-013 — Kiwix collections are a discovery index, not a source

- **Date:** 2026-10-24
- **Decision:** Kiwix/openZIM collections (e.g. Water Treatment Library, Food for Preppers, Medical Library, Library of Knots, Military Medicine) are used to *find* documents. Each document is cleared individually with its original publisher before use.
- **Rationale:** The collections are bundles of PDFs from many publishers ("author: Various") with no licence of their own. Their contents range from US federal works (likely public domain) and pre-1930 books, through open-but-conditional licences (Hesperian), to clearly copyrighted commercial material (e.g. a manufacturer's wound-closure manual, commercial knot books).

## D-014 — Food storage lookup as a second content type

- **Date:** 2026-10-24
- **Decision:** The app gets a searchable "How long does it keep?" lookup next to the guides. Each food shows pantry, fridge and freezer times (min–max, from purchase and after opening) plus tips, with the source on every row. First source: USDA FoodKeeper (CC0).
- **Rationale:** You explicitly asked for a full overview of storage times under specific conditions. That is tabular reference data, which reads poorly as prose guides.
- **Alternatives:** Times embedded in written guides only (no per-food lookup); both (deferred: guides may link to rows later).

## D-015 — Storage table in Danish and English

- **Date:** 2026-10-24
- **Decision:** Food names, units and labels in the storage table are translated into Danish; a person checks each translated food name. Free-text tips stay in their source language and are labeled, consistent with D-003.
- **Rationale:** FoodKeeper is CC0, so translation raises no licensing issue, and translating names and units is mechanical and checkable, unlike translating guide prose.

## D-016 — Content pipeline tooling: Node 24 + TypeScript, no runtime dependencies

- **Date:** 2026-10-24
- **Decision:** The `content/` pipeline is TypeScript run directly by Node 24 (built-in type stripping; erasable syntax only). TypeScript 6.0.3 and @types/node 24.19.2 are dev dependencies used only for `tsc --noEmit`. Tests use the built-in `node:test`. No runtime dependencies.
- **Rationale:** Same language as the planned Expo app, strict typing, and nothing to vet or keep updated beyond the compiler. JSON needs no parser library.
- **Alternatives:** Python (a second language next to the app); TypeScript 7.0 (newer native compiler; deferred so that the app and pipeline pick one version together when the Expo app is scaffolded).

## D-017 — FoodKeeper import maps every value, keeps notes per location, fails loudly

- **Date:** 2026-10-24
- **Decision:** The import keeps every storage time and every tip from the source. Times counted "from date of purchase" (`DOP_*` columns) and times without a stated starting point are kept apart (`basis: 'fromPurchase' | 'unspecified'`). Tips are stored as notes on a location, because the source attaches them to pantry/fridge/freezer in general and sometimes gives a note with no time (e.g. herbs: "Freeze damage will appear."). Unknown units or inconsistent values stop the import.
- **Rationale:** Faithful to the source (D-006 applies to data too), and a later data update cannot silently change meaning.

## D-018 — Pack build with node:sqlite; trigram search for storage names

- **Date:** 2026-10-24
- **Decision:** `npm run build:pack` builds `content/dist/core/pack.sqlite` and `manifest.json` with Node's built-in `node:sqlite` (SQLite 3.53.1 in Node 24.18), so the pipeline still has no runtime dependencies. The full-text index for storage names uses FTS5 `trigram remove_diacritics 1`. The build validates first and writes nothing if any source is not cleared, a Danish name is unchecked, a snapshot does not match the registry, or an item has no data. It ends with `PRAGMA integrity_check`, and the manifest records size and SHA-256.
- **Rationale:** Trigram matching handles Danish compound words ('kål' finds Grønkål, Blomkål, Rosenkål), and diacritic folding lets 'kal' find 'kål'. A prebuilt index means the app only reads.
- **Alternatives:** `unicode61` word tokenizer (misses compound words: 'kål' does not find 'Hvidkål'); a third-party SQLite library (adds a dependency).
- **Constraints:** Trigram queries need at least 3 characters, so the app needs a prefix fallback for 1–2 characters. The device's SQLite must support FTS5 trigram with `remove_diacritics` (SQLite ≥ 3.45). Verify this in the Expo app before relying on it.

## D-019 — First app slice: storage lookup; local Xcode builds (build approach superseded by D-021)

- **Date:** 2026-10-24
- **Decision:** The first app screens are the food storage lookup (search list + detail). The app is built locally with Xcode (`npx expo run:ios`); no EAS or Expo account. Stack: Expo SDK 58 (React Native 0.88, React 19.3), Expo Router (routes in `app/src/app/`), expo-sqlite (FTS enabled), expo-localization, TypeScript 6.0.
- **Rationale:** Uses the pack that already exists, so the whole chain (pack → app → on-device search) is tested early. Local builds keep code and builds on this Mac; release builds embed the JavaScript bundle and can be tested in airplane mode. Expo Go was rejected because it loads code over the network.
- **Pack in the app:** `npm run sync:pack` copies `content/dist/core` into `app/assets/pack/` after checking size and SHA-256 against the manifest. The device database file name includes pack version and checksum, so an app update with a new pack imports a fresh copy. On launch the app checks the pack schema version and that FTS5 trigram search works before showing any screen; otherwise it shows an error state.

## D-020 — Styling with NativeWind 4 (superseded by D-021)

- **Date:** 2026-10-24
- **Decision:** NativeWind 4.2.7 with Tailwind CSS 3.4.19 (NativeWind 4 requires Tailwind 3). Design tokens are CSS variables in `app/global.css` with light and dark values (`prefers-color-scheme`), mapped to Tailwind colour names in `app/tailwind.config.js`. Components use only token colour names.
- **Rationale:** Your choice. Version 4.2.7 is the current stable release (5.0 is a release candidate), and its Babel setup supports Reanimated 4, which SDK 58 uses.
- **Alternatives:** React Native StyleSheet with a token file (no dependency; recommended but not chosen).
- **Risk:** NativeWind must keep pace with Expo and React Native releases; check compatibility before each SDK upgrade.

## D-021 — The app is a Progressive Web App

- **Date:** 2026-10-25
- **Decision:** The app is a PWA, installed from Safari to the Home Screen and shared as a link. The knowledge pack is stored in the Origin Private File System (OPFS) and queried with the official SQLite WebAssembly build (`@sqlite.org/sqlite-wasm`, `opfs-sahpool` VFS, so no special server headers). A service worker caches the app and the pack. The Expo app is removed; its code is kept in Git history (commit `f301841`).
- **Rationale:** TestFlight builds expire after 90 days, which is unacceptable for an emergency app that must work when it is finally needed. A PWA needs no Apple developer account or App Store review, and also runs on Android and desktop.
- **Evidence:** Tested on your iPhone on 2026-10-25 with the test page (`pwa-spike/`, https://illusive.github.io/prep-storage-test/), opened from the Home Screen: persistent storage granted; reported quota 38.40 GB; 4 GB written to OPFS without errors; search works in airplane mode. WebKit's policy allows up to 60 % of disk per origin and lists Home Screen web apps as a reason to grant persistent storage. In the iOS 26 Simulator the same pack and trigram search ran in Safari (6 ms for 'kal').
- **Unchanged:** the content pipeline, source registry and pack format (D-016, D-017, D-018). The trigram requirement in D-018 is met by the bundled SQLite 3.53.4 build instead of the device's SQLite.
- **Risks:** Apple could change Home Screen web app behaviour (it briefly removed them in the EU in 2024). Long idle periods are still being tested (data must survive a reboot and days without use). Offline maps (M5) must be proven within the quota. The first visit needs a network connection, as any install does. No background location.
- **Alternatives:** Native Expo app via TestFlight (90-day expiry); native app via the App Store (developer account and review needed).
- **Superseded:** the Expo/native parts of D-002, D-019 and D-020.

## D-022 — PWA stack: React + Vite, vite-plugin-pwa (inject manifest), Tailwind v4

- **Date:** 2026-10-25
- **Decision:** The PWA uses React with Vite and TypeScript strict. Offline caching uses vite-plugin-pwa on the stable 1.x line in "inject manifest" mode: the plugin generates the list of files to cache and the web app manifest; the service worker logic (offline behaviour, updates) is our own code. Styling uses Tailwind CSS v4 with design tokens as CSS variables (light/dark). Tests: Vitest for logic, Playwright (WebKit) for automated offline tests. Exact versions are chosen and verified when the app is set up.
- **Rationale:** React gives the largest ecosystem, including accessible component libraries (e.g. React Aria) and mature map wrappers for M5, and matches the component model of the earlier Expo app. Inject-manifest mode avoids hand-maintaining the cache list while keeping update behaviour explicit. Tailwind is build-time only and close to the earlier NativeWind choice.
- **Alternatives:** Preact 10 (recommended for its smaller download and fewer dependencies; not chosen); Svelte 5/SvelteKit; plain TypeScript; a hand-written service worker; plain CSS.
- **Costs to watch:** a larger first download than Preact; add accessibility and map libraries only when a screen needs them, and keep an eye on bundle size.

## D-023 — Hosting on GitHub Pages for now

- **Date:** 2026-10-25
- **Decision:** The PWA is hosted on GitHub Pages (account `illusive`) until a different host is chosen. The app uses hash-based navigation and relative paths so it works from a sub-path and can move to another static host without code changes.
- **Rationale:** Free static hosting, already proven by the iPhone storage test. Free Pages requires a public repository.
- **Open:** whether the built app is published from a separate public repository (keeping this source repository private) or from this repository; decide at the first deployment.

## D-024 — The app is called "stead"

- **Date:** 2026-10-25
- **Decision:** The user-facing name is **stead** (Home Screen name, manifest, app title). Repository and folder names stay `offline-knowledge`.
- **Note:** No trademark or domain check has been done.

## D-025 — Design brief adopted; v1 scope cut from it

- **Date:** 2026-10-25
- **Decision:** The design brief (`docs/design/2026-10-25-design-brief.webp`) sets the visual direction: off-white background, lime accent, near-black cards, line icons, large calm headings, floating bottom tab bar, "Offline ready" status. v1 contains: Home (search and categories, only categories that have content), category pages and the guide reader, the food storage lookup ("Storing food"), an emergency card that calls **112** (not 999 as in the brief), Tools with the **supply checklist** and the **compass**, Settings (offline library card with real pack size/version/date, language, appearance, text size, about and sources), and bookmarks (D-026).
- **Not in v1:** the Map tab and shelter map (M5, D-008); flashlight/torch and screen light; SOS signal; emergency contacts; "Update on Wi-Fi only" and "Low power mode" toggles. A web app on iOS cannot see the connection type or Low Power Mode, so those toggles would not work.
- **Adjustments to the brief:** small and pale text (status labels, guide metadata, tab labels) is enlarged and darkened to meet contrast requirements; the tab bar needs a large-text layout; dark mode is derived from the same tokens; any custom font is bundled with the app, never loaded at runtime, and its licence checked.

## D-026 — Bookmarks in v1, stored on the device only

- **Date:** 2026-10-25
- **Decision:** Users can save guides and foods ("Saved"). Bookmarks are the first user data the app keeps: stored locally only (no sync, D-010), kept separate from the knowledge pack so pack updates never touch them, and keyed by stable content IDs so they survive pack updates. A bookmark whose item no longer exists in a new pack is shown as unavailable, not silently dropped.

## D-027 — High-risk content is published verbatim only

- **Date:** 2026-10-25
- **Decision:** Guides classified `high` (first aid, water treatment, food safety, electricity, gas, carbon monoxide) reproduce the authority's published text **and its own structure** (headings, numbered steps, lists) unchanged. Whole sections may be selected; nothing is split, merged, reordered, reworded or translated. Under that rule the project owner's check against the source is the required review. All other `high` requirements remain: a current Tier 1–2 primary source, agreement from a second independent authority, the emergency card with 112, and the source and its date shown on the guide.
- **Rationale:** The authority's own editorial and medical review stands behind every word, and the owner's check verifies faithful reproduction rather than medical correctness. Resolves OPEN_QUESTIONS #4 for AGENTS.md §6 ("content requiring expert review").
- **Alternatives:** owner check with restructuring allowed; a qualified medical reviewer for every high-risk guide.
- **Consequences:** sources under "no derivatives" licences become usable for high-risk guides if the licence allows verbatim redistribution. The First aid category appears only once it has published guides. With D-028, licence clearance no longer blocks first-aid sources during the private phase; the verbatim and second-authority rules still apply.
- **Changed 2026-10-27 (owner decision, D-037):** the wording stays verbatim, but layout and order may change for readability: running text may become numbered steps and bullet lists, warnings may move to where they are needed, and sections may be put in the order they are needed in an emergency. Headings come from the source. Nothing is reworded, merged into new sentences or translated; obvious typos may be corrected only when recorded (original and correction, both checked by the build). The second-authority check stays.

## D-028 — Licensing and reuse permissions deferred while the project is private

- **Date:** 2026-10-25
- **Decision:** While stead is a private project, licences and reuse permissions are not a blocker. Sources may be used without cleared rights, and the reuse requests (D-012) are paused. The app stays on public GitHub Pages (D-023) with all content; the project owner accepts the licensing risk of that public, unlisted site.
- **What stays:** every source is still registered (publisher, address, licence and its status, retrieval date, saved copy with checksum); every piece of content stays traceable to its source; attribution is shown in the app. The pack manifest lists each source's licence status. Safety rules are unchanged: high-risk content is verbatim only (D-027), and AI output is never the only basis for an instruction.
- **Deviation:** AGENTS.md §6 asks for copyright to be verified before redistributing; public hosting is redistribution. This is a deliberate owner decision for the private phase.
- **Must be revisited before:** sharing the link with anyone else (D-009), any App Store or wider release, or making the source repository public.
- **Alternatives:** two builds (public with cleared sources only, private with everything); private hosting behind a login.

## D-029 — Typeface: Inter, bundled with the app

- **Date:** 2026-10-25
- **Decision:** The app uses Inter (variable font, SIL Open Font License 1.1) from `@fontsource-variable/inter` 5.3.0. Only the Latin and Latin Extended subsets are bundled (about 133 KB); they are cached by the service worker and never fetched from a font service at runtime. The licence text ships with the app (`web/public/licenses/`). On iOS the text size still follows Dynamic Type.
- **Alternatives:** the system font (no download; recommended but not chosen).

## D-030 — The whole repository is public; GitHub Actions publishes the app

- **Date:** 2026-10-25
- **Decision:** This repository is public on GitHub (`illusive/offline-knowledge`), and a GitHub Actions workflow (`.github/workflows/pages.yml`) runs the content pipeline and web tests, builds the pack and the app, and publishes `web/dist` to GitHub Pages on every push to `main`. Resolves the open part of D-023.
- **Consequences:** source code, docs, source snapshots and the design brief are public, as is the commit author email. Licensing risk is accepted under D-028.

## D-031 — Storage notes shown in Danish translation, unchecked

- **Date:** 2026-10-25
- **Decision:** The 57 English FoodKeeper notes (35 distinct texts) are translated into Danish (`content/storage/notes-da.json`) and shown in the Danish interface, labelled "Oversat fra engelsk". A page-wide switch ("Vis original") shows the English source text instead. The translations were drafted by an AI assistant and, by owner decision, are **not checked** (`checked: false`); the import refuses notes without a translation. Fahrenheit temperatures keep °F and get the Celsius equivalent in brackets, so they are not read as Celsius.
- **Deviation:** this departs from D-003/D-015 (source text stays in its language), from D-027 (food safety is high-risk, verbatim only) and from AGENTS.md §6 (AI output must not be the only basis for food-safety instructions). Mitigations: the original is always one tap away, translations are labelled, and the unchanged source text is stored next to each translation.
- **Must be revisited before:** sharing the app beyond the owner (as D-028): check every translation and set `checked: true`.
- **Alternatives:** translations checked by the owner before showing (recommended, not chosen); keep the notes in English.
- **Pack:** schema version 2 (`storage_notes.text_da`, `text_da_checked`); pack version 0.2.0.

## D-032 — "Brug dine sanser" element on food pages

- **Date:** 2026-10-25
- **Decision:** A reusable notice pill (dark pill, lime circle with an icon, title and short text; `web/src/components/SensesPill.tsx`) at the end of every food page, above the source. Text: "Brug dine sanser — Tiderne er vejledende. Ser eller lugter maden forkert, så kassér den – og er du i tvivl, så smid den ud." / "Use your senses — The times are guidelines. If food looks or smells wrong, throw it out – and when in doubt, throw it out." It replaces the earlier disclaimer line.
- **Rationale:** The wording deliberately does not suggest tasting or that the senses can detect all spoilage (e.g. listeria is not visible or smellable); it follows USDA's "When in doubt, throw it out".
- **Alternatives:** fixed on screen above the tab bar; a shorter text without advice.

## D-033 — A storage and preservation guide for every food

- **Date:** 2026-10-25
- **Decision:** Every food in the storage lookup (all 101) gets a guide with these sections: about the food (what it prefers and what it doesn't), storage times (kitchen: FoodKeeper; cool storage: Handbook 66), what to store it with and apart from (ethylene and compatibility), drying (including without power), pickling, and canning. Drying, pickling and canning each get one shared method guide; the food guide states only what applies to that food (e.g. "pressure canner only").
- **Sources:** USDA Agriculture Handbook 66 (2016), USDA Complete Guide to Home Canning, NCHFP / University of Georgia drying guides, Landbrug & Fødevarer / HortiAdvice storage guidance, Fødevarestyrelsen ("Opbevar maden korrekt"), Bolius, Madens Verden, Retnemt, Highonlife; more to be added as found. Licensing is deferred (D-028).
- **Conflicts between sources:** authorities (USDA, Fødevarestyrelsen, L&F/HortiAdvice, universities) take precedence. A commercial claim that an authority contradicts is left out (example: Retnemt says cucumbers give off ethylene and should be stored apart; Handbook 66 says cucumbers produce little ethylene and are very sensitive to it). Commercial sites (Retnemt, Highonlife) only fill gaps the authorities do not cover, and are never the basis for canning or food-safety statements.
- **Language:** written in Danish from the sources, every statement linked to its source passage, with the original one tap away; translations are unchecked by owner decision (as D-031).
- **Canning and pickling:** the method guides are translated as well, with the original one tap away. This relaxes D-027 (verbatim only) for canning and pickling by owner decision; the canning content must still follow the USDA tested methods exactly in substance (process type, times, headspace, acidification), and low-acid foods are only ever given a pressure-canning method.
- **Order of work:** the guide format is agreed on two example foods first, then all 101 are filled in.
- **Must be revisited before:** sharing the app beyond the owner (as D-028, D-031).
- **Format agreed (2026-10-26), on Kartofler and Agurker:** section order as built (about, prefers, avoid, kitchen times, long-term storage, with other produce, drying, pickling, canning); all "with other produce" foods shown (no "show all" cut-off); a section with no source says so plainly instead of being hidden; the licence line in the sources list is hidden while licensing is deferred.
- **Drying verdicts:** the Montana State suitability ratings for vegetables; `described` when a source gives a method but no rating (Colorado State's fruit table); `noSource` otherwise. Every food also states what applies without power (NCHFP: fruit may be sun-dried in hot, dry weather; vegetables must not be dried outdoors; herbs air-dry indoors).
- **Canning and pickling per food** come from the NCHFP recipe pages (USDA Complete Guide 2015 / So Easy to Preserve), because their process-time tables are text the build can check; in the USDA PDF the fruit tables are images. Times are given for 0–300 m (0–1,000 ft) above sea level only. Low-acid foods: pressure only, with the general USDA statement (Guide 1, p. 1-8).
- **Sources added:** Forbrugerrådet Tænk (Danish storage list), Colorado State University (drying fruits), NCHFP (herbs, vine drying, sun drying, 76 recipe pages), Penn State (broccoli and cauliflower). Checked and left out: Highonlife (a shop page that adds nothing for our foods, and claims such as lemons ripening other produce contradict Handbook 66). Not found: Madens Verden.

## D-034 — Food pages split into sub-pages; Danish pickle recipes

- **Date:** 2026-10-26
- **Decision:** A food page has four sub-pages under the heading: **Om** (about, what it prefers, what to avoid), **Holdbarhed** (kitchen times, langtidsopbevaring, "sammen med andre"; opens by default), **Konservering** (drying, pickling, canning) and **Kilder** (sources). Each has its own address (`#/food/<id>`, `/about`, `/preserving`, `/sources`); switching replaces the history entry, so "back" leaves the food. "Brug dine sanser" ends every sub-page. Related foods are listed one per row, sorted alphabetically in the interface language.
- **Pickling:** a Danish recipe comes first where one exists (owner's choice), with the keeping time the recipe states (or a statement that it gives none). The "not tested by an authority" label was dropped on 2026-10-26 by owner decision (D-035). The USDA/NCHFP tested recipe stays below it as the way to keep pickles in the cupboard, followed by NCHFP's guidance on storing canned jars (cool, dark, dry; use within a year). This is a narrow exception to D-033's rule that commercial sources are never the basis for food-safety statements: only for refrigerated vinegar or sugar pickles, always labelled, never for anything stored at room temperature.
- **First case:** æbler (GoCook/Arla Fonden: vinegar brine, 2 months in the fridge; Arla: sugar syrup, no keeping time given). Gastrofun was considered and left out: user-contributed recipes, no keeping time, nothing beyond GoCook.
- **Rejected:** one long page (too long to read); replacing the tested recipes with Danish ones (no safe option for the cupboard); tab name "Tilberedning" (means cooking a meal).

## D-035 — Drying, pickling and canning as step-by-step recipes

- **Date:** 2026-10-26
- **Decision:** Methods people follow are stored and shown as recipes, not paragraphs: title, optional intro, facts (time, keeps, yield), "Du skal bruge" (ingredients and equipment) and "Sådan gør du" (numbered steps). On Konservering each method card lists its recipes as rows that open; closed rows show the title and the facts, so the page can be scanned. Short notes (e.g. the low-acid warning) stay as paragraphs. Storage of canned jars is its own small recipe ("Sådan opbevarer du henkogte glas"). Recipes from recipe sites are not labelled as untested (owner decision).
- **Traceability:** a recipe is one block with one source; its quote covers the whole passage, and "Vis original" shows that quote in place of the steps. Shared methods (e.g. Colorado State's fruit drying) are folded into each food's recipe as steps instead of separate paragraphs.
- **Pack:** schema 5, `produce_blocks.recipe` (JSON); `text` may be empty for a recipe.
- **Rejected:** keeping paragraphs with better typography (steps still hard to follow); separate tables for ingredients and steps (more schema for no gain while recipes are only read whole).

## D-036 — Offline map trial: Protomaps/OpenStreetMap, user-chosen areas, own host

- **Date:** 2026-10-26
- **Decision:** The map is trialled now (updates D-008 and the "not in v1" line of D-025) as its own tab, **Kort**. Data: the Protomaps basemap (OpenStreetMap, ODbL; "© OpenStreetMap contributors" always shown), cut to the country outline from a pinned daily build (`20261024`) by our own script (`web/scripts/map/build-map.ts`), written as a standard PMTiles archive in parts under 100 MB, with a manifest listing parts and SHA-256, the outline and the regions (geoBoundaries, CC BY 4.0). Hosted in a separate GitHub Pages repo (`illusive/stead-maps`, same origin as the app, 1 GB per site), so the map is uploaded only when it changes.
- **On the device:** a small overview (z0–8, 2.9 MB) ships with the app and is precached, so the map opens offline on first launch. Users choose what detail (z9–15) to download: a radius around where they live (10, 25 or 50 km), a region (only where the country has known regions), or the whole country. The app reads the remote archive's directories by HTTP range requests and downloads only the tiles of that area (exact size shown first). Position is a toggle the user switches on; permission is asked then; no background location.
- **Rendering:** MapLibre GL JS 6.14.0 and `@protomaps/basemaps` 5.7.2 (both BSD-3), fonts (OFL) and sprites (MIT) from `protomaps/basemaps-assets` (pinned commit, Latin ranges only), all bundled. Two sources: the overview draws land and water underneath, so the map is never blank outside a downloaded area. The map tab works even if the knowledge pack cannot open.
- **Downloads (slice 3):** ranges are merged up to 1 MB (about 600 requests for the whole country): little memory on the phone and little to redo after an interruption. Each range is stored in one transaction with the new resume point. An area counts as ready only when every planned tile is stored; a newer map version on the server stops a resume with a message instead of mixing versions.
- **Detail while online, and making the offline limit clear (2026-10-26, owner feedback "details vanish when zooming"):** the overview alone (z0–8) cannot show streets. While online, detail tiles outside downloaded areas are fetched from the hosted map on demand and kept in memory only. Offline, missing detail tiles fail on purpose so MapLibre keeps drawing the overview's roads and names scaled up. A notice on the map says when the view is not downloaded ("Ikke hentet – virker ikke uden net", with "Hent"). Opening Kort without any downloaded area first shows a step explaining that the map only works offline in downloaded areas (once per app session, skippable); the "Hent kort" button opens the same guided flow: why → what (home / region / country) → which → confirm (size, free space, keep the app open) → progress → done.
- **Where the map opens and position (2026-10-27, slice 4):** browsers give no rough location without permission (an IP lookup would need an online third-party service), so the map opens zoomed in on the home point when the user has set one (offline, no permission). Exact position only through "Vis min position": the browser asks when it is switched on; it works offline (GPS needs no network; the first fix may be slower), is shown with its accuracy circle, and runs only while Kort is open.
- **Measured (2026-10-26, z15):** Denmark 591 MB (z14: 291 MB); regions 78–174 MB; a 25 km radius 25–45 MB; 10 km 7–20 MB. Range merging adds 1–3 %.
- **Rejected:** hot-linking Protomaps' daily builds (not meant for apps; deleted after about two months); hosting the map inside this repo's Pages site (every push would upload ~600 MB; close to the 1 GB limit); Danish official maps from SDFI (token-protected image tiles, heavy to download); a third-party PMTiles library (the reader we need is ~200 lines and checked against the reference library).

## D-037 — First aid guides from Førstehjælpens ABC, verbatim, rearranged for readability

- **Date:** 2026-10-27
- **Decision:** The first first-aid guides come from *Førstehjælpens ABC* (Forsvarets Sanitetskommando, Center for Sundheds- og Sanitetsuddannelse, 11. rev. 2026), the handbook mandatory for first-aid training in the Danish armed forces. First version: the life-saving core (the three main points, consciousness, airways, breathing, recovery position, HLR for adults and children, hjertestarter, massive bleeding, shock, calling 112, choking, then drowning, burns, hypothermia, allergic reaction, stroke and chest pain), about 20 guides, in the order of an emergency.
- **Verbatim, checked by the build:** every text shown (titles, paragraphs, steps, list items, warnings, captions) must be found word for word in the handbook's text, after joining words broken across lines and removing soft hyphens. Layout and order may change (D-027 as changed). The handbook's illustrations are used where they show a step, cut from its pages; alt text is ours (accessibility).
- **Second authority (D-027):** each guide records where Dansk Råd for Genoplivning agrees, with quotes checked by the build: the Danish ERC Guidelines 2025 (BLS chapter, BLS algorithm, First Aid chapter 8, translated by DRG and reviewed with Dansk Førstehjælpsråd among others) and DRG's public guide. A point the second authority disagrees with is held back and recorded in OPEN_QUESTIONS.
- **Owner check:** guides are shown to the owner in the app; each guide records whether the owner has checked it.
- **Owner feedback 2026-10-27:** no unexplained abbreviations: each guide lists the ones it uses (HLR, AED, A-B-C, M-ABC) with an explanation taken from the handbook, shown at the top of the guide and under titles in lists; the build refuses a guide that shows one without it. The handbook's "<M>" notation is dropped (the text without it is still verbatim). Førstehjælp gets a search over all guide text (FTS5 trigram, also in Home search) and shows "Førstehjælpens 3 hovedpunkter" as its own section above the other guides. Pack schema 7.
- **Next section, "when no help is coming" (owner decision 2026-10-27):** problem-based guidance (sprain, bleeding, gash, broken arm …) for when emergency services cannot be reached, as a separate section under Førstehjælp with a banner on every page (try 112 first). Each problem starts with the handbook's own section, then adds austere-care steps from public-domain US military field manuals, shown verbatim in English.
- **Tourniquet (owner decision 2026-10-27):** the handbook's "apply a ready-made tourniquet first on arms and legs, high and tight" (p. 18) is left out of "Massive blødninger", because ERC 2025 starts with direct pressure and uses a tourniquet only when pressure is not enough. No tourniquet advice until a source agrees with ERC's order.

## D-038 — Growing food from Danish sources (Bolius first)

- **Date:** 2026-10-27
- **Decision:** a "Dyrkning" category (tile on Home next to Opbevaring af mad) with one guide per crop, easy crops for the Danish climate first: radiser, ærter, kartofler (done), then salat, spinat, hestebønner, gulerødder, sætteløg. Danish sources first (owner decision): Videncentret Bolius (Realdania; "Indholdet må ikke gengives uden tilladelse", so a permission case, set aside while private, D-028). Frøsamlerne's material is a paid book; its Nordic plant lexicon (danskekulturplanter.dk) may serve old varieties later.
- **Format:** the guide model of D-037 at risk `low`: text verbatim from the crop's page (checked by the build), laid out under fixed sections in the app's own words (Såning, Jord og placering, Pasning, Høst, Frø til næste år, Naboer og sædskifte). A block may quote another registered source (e.g. Bolius' general seed-saving page), checked against that source; high-risk guides still take all text from one source. No second authority is required at low risk. A crop links to its food page (Holdbarhed og konservering).
- **Companion planting:** only what a credible source says. The popular "good/bad neighbours" lists online come from FAQ sites without sources and are not used; crop rotation and plant families (from Bolius) are.
- **Owner feedback 2026-10-27:** crops are listed and titled like foods in Opbevaring af mad, with a plain name ("Radiser") and the growing period as subtitle ("Så april–august · høst efter 2–6 uger"). The period is our wording, built from quoted source passages that the build checks (schema 9: `guides.name`, `guides.season`).
- **Pack:** schema 8: `guides.food_id`, `guide_blocks.source_id`, block kind `section`. Search covers growing guides; Home search groups hits by category.

## D-039 — Design rule: category pages start with search

- **Date:** 2026-10-27
- **Decision (owner):** every category page (Opbevaring af mad, Førstehjælp, Dyrkning and later ones) has a search field at the top that filters that category's content as you type; titles only for one or two letters, full text from three. Lists show a count line ("3 afgrøder") like the food list.
- **Food list subtitle (owner, same day):** the other-language name under each food is replaced by where it keeps longest, e.g. "Fryser · 10–12 måneder" (the range period with the longest maximum, not counting after opening or thawing). The English name stays searchable; it is no longer shown on the food page either.

## D-010 — No runtime AI, accounts, sync or telemetry

- **Date:** 2026-10-24
- **Decision:** The app contains no runtime AI, user accounts, cloud synchronization, social features or telemetry.
- **Rationale:** `AGENTS.md` §12. These add online dependencies and privacy concerns without improving access to reliable offline knowledge.
