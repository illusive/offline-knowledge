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

## D-008 — Offline maps deferred (superseded by D-036)

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
- **Built 2026-10-27 (owner):** "Gem" on every guide, crop and food page. The saved list (`#/saved`) is grouped by category (Førstehjælp, Dyrkning, Opbevaring af mad); a bookmark records its category when saved. The bookmark button sits top right on Home (whole list, with a count) and on each category page, where it opens the list at that category (scrolled to and focused). Stored in `localStorage` (`stead.bookmarks.v1`). The Home header's "Klar offline" text is replaced by the asterisk turning green when the app is ready offline (the state is still announced to screen readers).

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
- **Wording and sizes (owner, 2026-10-27):** the download steps use plain language for people who do not know how map data works: the map fetches roads, paths and place names from the internet while you use it; if internet and mobile data disappear, only what you downloaded beforehand works. Sizes are shown before choosing (intro: "10–50 MB – cirka som en håndfuld fotos", choices: the measured ranges below; the 50 km radius is not measured, so no figure); the exact size still follows for each option.
- **Places on the map (owner, 2026-10-27):** the basemap's own place layer (37 kinds) is replaced by ours (`web/src/map/pois.ts`): every place kind in the OpenStreetMap data can be shown, in groups the user switches on or off under "Steder" (remembered on the device). On by default: Nødhjælp og sundhed, Vand og ly, Forsyninger, Transport. Off: Offentlige steder, Natur og udsigt, Mad og drikke, Kultur og seværdigheder, Alt andet (every kind not in a group). Drawn as a dot coloured by group, names from zoom 15; tapping a place shows its name and type. Defibrillators from hjertestarter.dk: postponed (owner); the register's public map endpoint was found (about 26,900 devices) but nothing is fetched yet.
- **Updates (slice 5, 2026-10-29):** an area records the map version it came from and shows it as a date. A newer version on the host offers "Hent den nye udgave": the new copy downloads as its own area that `replaces` the old one; the old one stays in use (areas are read oldest first) and is deleted only after the new one is complete and every tile is stored. An interrupted update leaves the working map untouched.
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

## D-040 — "Når det sker": situations and stock lists

- **Date:** 2026-10-29
- **Decision (owner):** a searchable section "Når det sker" with two groups: situations ("Hvis det sker": Strømmen er gået, Der er intet vand, Der er ingen varme, Telefon og net er nede …) and stock lists ("Hav det derhjemme": vand, mad, medicin og hygiejne, lys/varme/andre fornødenheder) that the user ticks off; ticks stay on the device (`stead.supplies.v1`, keyed by stable item id).
- **Sources:** Danish authorities, verbatim: Styrelsen for Samfundssikkerhed's *Forberedt på kriser* (pjece), Fødevarestyrelsen (*Forberedt på kriser*, *Køkkenråd ved strømafbrydelse*), Miljøstyrelsen (*Forberedt på kriser*: drinking water, toilet without water). UK Be Ready (OGL) is the second authority.
- **Owner's food levels:** "Kræver ingen / lidt / Kræver tilberedning" are fixed headings in the app's words; only items a source names go under them (from Fødevarestyrelsen's list per person for three days). Examples no source names (frugtgrød, tinned ready meals) are left out. Kiks, tørret frugt and energibarer (no preparation) and ris and kartoffelmos i pulverform (needs preparation) come from Hjørring Kommune's checklist leaflet (owner asked for biscuits, 2026-10-29); checklist lines may differ from the source in capital letters only.
- **Risk:** situation guides that touch carbon monoxide, food safety, electricity or water are `high` (second authority required). Unlike first aid, a situation guide may combine several Danish authorities, each block checked against its own source; first aid still takes all text from one source. Stock lists are `low`. Plain names ("Strømmen er gået") are the app's labels; the guide title stays verbatim.
- **Pack:** schema 10: `guides.grp`, block kind `checklist` (`items` as `{id, text}`), fixed headings `noPrep`, `somePrep`, `needsPrep`.

## D-041 — Translated English blocks in "Når det sker" (water treatment)

- **Date:** 2026-10-29
- **Decision (owner):** no Danish authority describes boiling time, filtering cloudy water or other water sources for emergencies, so "Der er intet vand" uses the U.S. CDC (*How to Make Water Safe in an Emergency*, *How to Find Clean Water in an Emergency*; public domain) **translated into Danish**. Each translated block stores the source's English words (`original`); the build checks those verbatim and that the translation has the same items. The app labels translated blocks "Oversat fra engelsk", and "Vis original" shows the English. Only "Når det sker" guides may have translated blocks; first aid stays verbatim Danish.
- **Deviation:** relaxes D-027 (water treatment is high-risk, verbatim only, no translation) as D-031/D-033 did for food. Translations were drafted by an AI assistant and are **not checked**. Mitigations: the original is one tap away; Fødevarestyrelsen ("Kog vandet!") and Bolius (rainwater can be used for cooking if boiled) are the second authority.
- **Left out on purpose:** melting snow (no source covers it); makeshift filters on their own (the CDC says portable filters do not remove all germs and filtered water still needs disinfecting); bleach doses (U.S. products and units); hot-water tank water for drinking (Bolius: toilet and cleaning only).
- **Heat (owner, same day):** "Der er ingen varme" uses Styrelsen for Samfundssikkerhed (one room) and Bolius (closing off rooms, electric heater, firewood, gas and paraffin heaters only in ventilated rooms, never a grill indoors). Candles appear as light with the fire-safety warning only: Bolius finds they barely heat a room.
- **Must be revisited before:** sharing the app beyond the owner (as D-028/D-031): check every translation.
- **Pack:** schema 11: `guide_blocks.original` (JSON).

## D-042 — Plain-language rewrite of all texts; source words kept (changes D-027)

- **Date:** 2026-10-29
- **Decision (owner):** every guide, food guide, storage note and interface text is rewritten in plain, consistent Danish (and the English interface to match), for readers who read slowly or know little of the subject. For guides, the source's exact words are kept with each rewritten block (`original`, lang 'da'; `originalSummary` for summaries). The build still checks those words verbatim, search covers both, and "Vis original" shows them. Rewrites are allowed in every category, first aid included.
- **Review:** the rewrites were drafted by an AI assistant and are **unchecked**. They are reviewed against the source by a person before publishing beyond the owner; that review is a step in the manual guide (owner, 2026-10-29). `ownerChecked` stays false until then, and the app shows "Prøveversion".
- **Changes D-027:** high-risk text is no longer shown word for word; the source's words are one tap away instead. The second-authority check is unchanged.
- **Log:** style rules, suggestions and statements to run again are in `docs/LANGUAGE_REVIEW.md`.
- **Pack:** schema 12: `guides.summary_original`; `guide_blocks.original` may be Danish.

## D-043 — "Før det sker": one card per kind of weather; "Hjemmeberedskab"

- **Date:** 2026-11-02
- **Decision (owner):** "Når det sker" gets three groups of cards on one page, in this order: **Før det sker** (group `weather`: one card per kind of weather, holding before, during and after together), **Hvis det sker** (situations) and **Hjemmeberedskab** (stock lists, was "Hav det derhjemme"). One entry from Home and one search for all three. A group with no cards is not shown.
- **Cards:** Storm (was "Der kommer storm"; Bolius before/during/after, checked against Edinburgh City Council), Stormflod og forhøjet vandstand (Bolius; one card, because a DMI warning of high water levels is what precedes a storm surge, and Bolius' page on rising groundwater could not be fetched), Snestorm (Bolius for the house; the car list is translated from UK Be Ready, D-041). "Der er vand i kælderen" stays a situation, since it is what to do once the water is in.
- **Alternatives:** a separate Home tile "Vær forberedt" (two entries and two searches; rejected); splitting storm into a "before" card and a "during and after" situation (storm in two places; rejected).
- **Pack:** no schema change; `guides.grp` may now be `'weather'`.

## D-044 — Settings: library, language, appearance, sources

- **Date:** 2026-11-05
- **Decision (owner):** Settings holds, top to bottom: the offline library (content version and date, counts, size, downloaded map areas with a link to Kort, space the app uses), **Sprog** and **Udseende** (each: Følg telefonen (default), or a fixed choice: Dansk/English, Lys/Mørk), text size, the source list, and About.
- **Text size:** follows the phone's own setting (iOS Dynamic Type, already in place via `font: -apple-system-body`). No control in the app; Settings says where to change it on the iPhone.
- **Sources:** every registered source, grouped by publisher, with title and link. No licence lines while the app is private (D-028); they are added before the app is shared.
- **Storage:** choices are kept on the device (localStorage), like bookmarks; nothing leaves the phone.
- **Alternatives:** an own text size control, or both (rejected: the user would set it twice); follow the phone only for language and appearance (rejected: no way to read in English on a Danish phone or keep dark mode at night); licence status shown now (deferred).
- **Closes:** OPEN_QUESTIONS 8 (UI language: follow the device, with a manual override).

## D-045 — Compass in Tools, with "hold a course"

- **Date:** 2026-11-05
- **Decision (owner):** Tools gets a compass: a turning dial with a fixed mark, the direction as text ("NØ 42°"), and **Hold kursen**: lock the current direction and see how far you are off it ("Drej 15° til højre"). No GPS, no network.
- **Sensor:** iOS `DeviceOrientationEvent` with `webkitCompassHeading` (magnetic north) and `webkitCompassAccuracy`; permission is asked when the user taps "Start kompas". Other browsers: `deviceorientationabsolute`. The sensor runs only while the compass is open.
- **States:** not started, waiting, active, uncertain (accuracy worse than ±20°, or iOS reports none), permission refused (how to allow it again), no compass on this device (no reading within 3 seconds).
- **Choices made in the slice:** magnetic north, labelled as such (true north needs a field model and the position; the difference in Denmark is a few degrees). The course is kept on the device until cleared, so it survives the app closing on the way. The screen is not kept awake (battery).
- **Alternatives:** a plain compass (owner chose the course too); pointing toward the home point (needs GPS; later); a heading cone on the map instead (left for the map).
- **Supersedes:** the supply checklist in Tools (PROJECT.md, D-025), covered by the "Hjemmeberedskab" stock lists (D-040, D-043).

## D-046 — Forråd: the household's own stores; Settings moves to a gear

- **Date:** 2026-11-05
- **Decision (owner):** a tracker for what the household has stored, as a tab of its own ("Forråd"; English "Supplies"), replacing the Settings tab. Settings opens from a gear at the top right of Hjem, Forråd and Værktøjer (not on the map, which has its own controls), and the tab bar keeps the tab it came from.
- **What it shows:** drinking water against the stock list's 3 litres per person per day for the chosen number of days, when the water was last checked and when to check again (six months, from the UK *Be ready* checklist: "Set a reminder every six months"). It also shows the household (people, water for animals, 3/7/14 days), what expires within 30 days or has expired, and the four categories with their items and "Overvej også": the stock-list lines not yet covered, with amounts scaled to the household.
- **Recommendations come from the stock lists (D-040):** each checklist line in the four "Hjemmeberedskab" guides may carry a short `name`, a structured `amount` (one person per day or for three days), and `keywords` for matching (pack schema 13). The build checks that the amount is the number in the line's own text. No new pack table: the app reads the four guides and matches in memory (about 30 lines). There is no amount for animals in the sources, so the user enters their own; the app does not invent one.
- **Adding:** free text, with suggestions from the stock lists and from names used before. A typed name that matches a line ("Makrel i tomat" matches the canned fish line) counts as that line unless the user unlinks it. The expiry date is optional. Water containers have a count and litres each. Litres or US gallons is a setting (litres by default).
- **Data:** on the device only (localStorage `stead.forraad.v1`, one versioned object, validated on every read so damaged data never breaks the screen).
- **Backup:** "Gem en kopi" writes every `stead.*` key to a JSON file through the share sheet (Filer on iPhone) or a download. "Hent fra kopi" checks the file, says how many items it holds and asks before replacing. This is because deleting the home screen app deletes its data.
- **Alternatives:** a separate pack table with FTS (unnecessary for ~30 lines); a fixed 3-day target (owner chose adjustable); IndexedDB (localStorage is enough for hundreds of items); sync (D-010).
- **Changed 2026-11-05 (owner, after trying it): less friction.** Adding to the stores must be quick, or it does not get done.
  - **Water is one figure:** litres stored plus the month it was last checked, edited in the water card. There are no water containers; data saved earlier is converted.
  - **Adding:** a name (suggestions or a barcode), a count and an optional best-before month. The category is guessed from the name through the stock-list keywords; unknown names go to Mad, and one tap changes it. An optional free-text size sits under "Mere". There are no other units, and the main button is "Tilføj til forrådet". "Gem og tilføj en til" keeps the form open with the same month. *(Replaced by D-053: two ways to add, no "Skift" or "Mere", and "Tilføj" keeps the form open.)*
  - **Month and year, not dates:** stores are long-life goods, where a few weeks either way do not matter. For several of the same thing, the user picks the one that expires first. The two pickers always sit in one row (owner, 2026-11-05), also at large text sizes.
  - "Holdbarhed" lists what passed its month and what reaches it this month or next.
- **Changed again 2026-11-05 (owner): an overview, not a form.** Forråd shows what the household has and little else:
  - The water card is first. It holds the figure, the bar, one line on the last and next check, and a pencil at the top right to edit. "Tjekket i dag" appears only when a check is due.
  - Next comes "Tilføj til forrådet", then Holdbarhed and the categories.
  - An empty store shows one line and a link to the stock lists. An empty category shows "Intet her endnu".
  - The "Overvej også" lists are replaced by one link per category to its stock list ("Se anbefalingerne: …").
  - The household (people, days, water for animals), the water unit and the backup moved to Settings, under "Forråd": they are set once.

## D-047 — Barcode scanning with an optional online lookup

- **Date:** 2026-11-05
- **Decision (owner):** Forråd can scan a product's barcode (EAN-13/8, UPC-A/E) to fill in the name.
  - The reader is `barcode-detector` 3.2.3 (a ponyfill on `zxing-wasm` 3.1.6, both MIT), because Safari has no native `BarcodeDetector`. *(Changed by D-055: `zxing-wasm` is used directly and `barcode-detector` is removed.)*
  - Its `.wasm` file is bundled, precached and loaded from the app. Its default CDN location is overridden, so scanning works offline.
  - The scanner code is loaded only when the user taps "Scan".
  - The camera is asked for only then and stops as soon as a code is read. *(Changed by D-053: it stays on until "Færdig", for scanning one thing after another.)*
- **The first optional online request (exception to "no runtime network" in AGENTS.md §4):** when there is a connection, the barcode, and nothing else, is sent to Open Food Facts (`world.openfoodfacts.org/api/v2/product/<code>.json`, no cookies, no referrer, 6-second timeout) to get the product's name, brand and size.
  - Offline, on a timeout, or for an unknown product, the user types the name, and the barcode is remembered on the device with it. A barcode seen once is filled in from the device from then on, without a request.
  - The app works fully without the lookup. Settings > Om stead and the editor say what is sent.
- **Licence:** Open Food Facts data is ODbL. The editor credits it when a name comes from there. Reuse terms are deferred while the app is private (D-028).
- **Alternatives:** a downloadable Danish product list (offline, but a few MB, patchy and ageing; possible later); no barcode (owner wanted it).

## D-048 — One category order; Forråd drives the stock lists

- **Date:** 2026-11-05
- **Decision (owner):**
  - **Order:** categories follow how many people need them: Førstehjælp, Når det sker, Opbevaring af mad, Kort (offline maps, now also a tile on Home), Dyrkning last. The Home tiles, the Home search results and the saved list follow this order.
  - **One record of what the household has:** Forråd. A stock-list line in "Hjemmeberedskab" is ticked when something in Forråd counts as it. Ticking a line adds a plain entry to Forråd (marked as added from the list); unticking removes only such entries, so things the user entered are never deleted from the list, and the line says "I forrådet: …". The water lines follow the water figure in Forråd and link there. Ticks kept before this are converted once.
  - **Værktøjer stays a tab** with room for more tools.
- **Rationale:** growing applies to the fewest people. Two records of "I have this" that did not know about each other would disagree.
- **Alternatives:** removing the ticks from the stock lists (owner chose to keep them, driven by Forråd); moving the compass into Kort and dropping the tab.
- **Changed 2026-11-06 (owner):** Kort is no longer a tile on Home, since it has its own tab. "Opbevaring af mad" is called "Opbevaring" ("Storage").

## D-049 — Forråd: a sheet on each thing (take out, add more)

- **Date:** 2026-11-05
- **Decision (owner):** tapping a thing in Forråd (in its category or in Holdbarhed) opens a sheet from the bottom of the screen, instead of the editor. It offers:
  - **Tag ud:** an amount (1 up to the count). When some are left, "Bedst før nu" is filled with the saved month and can be changed, because the one taken out is usually the one that expired first. Taking out all of them asks, then deletes the thing, as "Slet" does. The data model is unchanged (the count stays at 1 or more).
  - **Læg flere til:** an amount and an optional month for the new ones. The earlier of the two months is kept, following the D-046 rule that the user tracks the one that expires first; a month fills a thing that had none.
  - **Ret navn, kategori og størrelse:** the existing editor page.
  - **Slet alt:** asks, then deletes.
  - After an action, the sheet closes and one line under "Tilføj til forrådet" says what happened (`role="status"`).
- **Stock-list ticks (D-048)** follow by themselves: they are derived from the things, so deleting the last one unticks its line.
- **Sheet:** a shared `Sheet` primitive (`components/ui.tsx`) on the native modal `<dialog>` (Safari 15.4+): focus stays inside, the page behind is inert, Escape or a tap above it closes it, and it sits above the tab bar.
- **Rationale:** taking things out was three steps (open, lower the count, save), and D-046 says it must be quick or it does not get done.
- **Alternatives:** a − button on each row (fastest, but no way to change the month and easy to tap by mistake); a "Brug en" button in the editor (still two taps); keeping used-up things at 0 as a shopping reminder (needs a new state and a rule for the ticks; not now).
- **Changed 2026-11-06 (D-054):** "Tag ud" and "Læg flere til" are replaced by one counter; "Ret navn, kategori og størrelse" is "Redigér"; "Slet alt" is a red "Slet".

## D-050 — Sizes as a number and a unit, read from the scan

- **Date:** 2026-11-05
- **Decision (owner):** a thing's size is a number and a unit, for neater entry. There are no totals yet.
  - **Units:** g, kg, ml, cl, dl, l and stk. A parser (`forraad/size.ts`) reads the ways packs and Open Food Facts write them: "400g", "1,5 l", "1.5L", "33 cl ℮", "1.000 g", "12 stk.", "10 pcs".
  - **A scan fills them in.** The lookup also asks Open Food Facts for `product_quantity` and `product_quantity_unit`. Its size text comes first because it keeps a multipack; the number and unit are the fallback when the text cannot be read. Only the barcode is still sent (D-047).
  - **Multipacks:** "6 x 1,5 l" is saved as a count of 6 and a size of 1,5 l each, so "Tag ud" takes out one bottle at a time.
  - **Anything else stays as text** under "Andet" ("familiepakke"). Sizes saved as text before this that read as one number and a unit are converted when read; the rest stay as text.
  - In the editor, the number and the unit sit in one row, like month and year.
- **Rationale:** a scanned size was text the app could not use, and typing "400 g" by hand varied ("400g", "400 gr"). A number and a unit read the same everywhere and leave the door open to totals later.
- **Alternatives:** totals per category (owner chose entry only for now; the stock lists have no weights to compare against); a multipack as one thing of 9 l (taking out one bottle would mean changing the size); number and unit only (odd sizes could not be entered, and old text sizes would be lost).

## D-051 — Months on the phone's own roller; taller fields

- **Date:** 2026-11-05
- **Decision (owner):** a month (best before, water checked) is one month field (`<input type="month">`). On the iPhone it opens the phone's own roller, with month and year side by side. The value is yyyy-mm, as stored before, so no data changes.
  - An optional date has a button next to it ("Fjern dato"), since the roller's own reset is easy to miss. A required date (water last checked) ignores a reset.
  - Browsers without a month field (desktop Safari and Firefox) keep the two selects (month, year) in one row.
  - The month is shown as the phone writes it, in the phone's language, not always the app's.
  - The month, year and unit fields, and the size number, are as tall as the name field (48 pt, larger text), for readability.
- **Rationale:** one roller is quicker than two wheels and familiar on the phone. Larger fields are easier to read and hit.
- **Alternatives:** keeping the two selects everywhere (two wheels on the iPhone); a full date field (days are not wanted, D-046).
- **Still to check on the iPhone:** the roller itself, whether it respects the year range, and how an empty field looks.

## D-052 — Products under the stock-list lines, for finer suggestions

- **Date:** 2026-11-05
- **Problem (owner):** typing "makr" offered only the stock-list line "Dåser med fisk eller kød". Picking it replaced the typed name with that generic one, so the suggestions were too coarse.
- **Decision (owner):** each stock-list line may list `products`: common goods that count as it ("Makrel i tomat", "Tun i vand", "Hakkede tomater").
  - The lists sit in the Hjemmeberedskab guide JSON, next to the line's `name` and `keywords`.
  - The build checks that each product is trimmed and at most 60 characters, is not the line's own name, and belongs to one line only.
  - The first list has 220 products on 26 lines, drafted by Claude and awaiting the owner's review (`docs/LANGUAGE_REVIEW.md`). Water is left out: it is one figure (D-046).
- **Suggestions while typing, most specific first:**
  1. Names used before ("Brugt før").
  2. Products scanned before ("Scannet før"), with their barcode and size.
  3. Listed products, with their line under them.
  4. The stock-list lines themselves ("Fra listen").
  - Each name is offered once, at most six in all.
  - A picked product keeps its own name; its line and category follow, so the stock-list ticks (D-048) still work.
- **Matching a typed name:** a name that is a listed product links to that product's line before the keyword guess, so "Makrel i tomat" is canned fish, not tomatoes.
- **No size:** a product fills in only its name. Sizes vary by brand; a scan or the user gives the size (D-050).
- **Pack:** the field is optional JSON in the checklist items, which older apps ignore. The pack schema stays at 13, because the app accepts only its own schema version and a bump would make a new app refuse a pack already on the phone. Content version 0.14.0.
- **Alternatives:** showing the matched keyword as a suggestion (keywords such as "aa" are matching terms, not names); a list in the app code (content belongs in the pack, AGENTS §6); a separate pack table (unnecessary for about 200 names).

## D-053 — Forråd: two ways to add, scanning one thing after another

- **Date:** 2026-11-05
- **Problem (owner, after using it on the iPhone):** adding still took too much effort.
  - The suggestions pushed the rest of the form down while typing.
  - "Skift" (the category) and "Mere" (the size) were vague links, and the "Tæller som … ✕" line was hard to read.
  - Scanning took one thing at a time: the camera stopped after each code.
  - The owner expects most people to add by barcode when it works reasonably.
- **Decision (owner):** the overview has two buttons, **Scan varer** and **Skriv selv**, each opening its own page (`#/forraad/scan`, `#/forraad/new`).
  - **Scanning goes on until "Færdig".**
    - Each code opens a sheet over the camera with the name, the size, how many and the best-before month.
    - "Tilføj" saves, shows a short toast ("Makrel i tomat er tilføjet under Mad") and goes back to the camera. The header counts what was added.
    - While the sheet is open, the picture freezes on the pack and nothing is read. After it closes, the same code is ignored for 3 seconds, since the pack is usually still in front of the camera.
    - The camera stops when the app goes to the background and starts again when it comes back.
  - **A barcode already in Forråd adds to that thing.** The sheet says so, asks how many and for an optional month for the new ones; the earlier month is kept (D-049). This gives one row per product.
  - **"Uden stregkode"** in the scanner opens the same sheet with an empty name, for things without a barcode. When the camera is refused or missing, "Skriv i stedet" leads to typing.
  - **Typing works the same way:** "Tilføj" saves, shows the toast and empties the form for the next thing, with the same month. "Færdig" goes back and keeps a thing whose name is already written.
  - **The category is not a choice when adding.** It is guessed from the name (unknown names go to Mad), shown as a quiet line under the name and named in the toast. It is changed on the edit page, where it is three visible choices.
  - **Nothing is hidden.** The size (number and unit) and the month are always shown, marked "(valgfri)". "Mere" and "Skift" are gone.
  - **The stock-list link** is made without asking, as before (D-048). "Tæller som: …" and its ✕ moved to the edit page.
  - **Suggestions float over the form** as a combobox list instead of pushing it down. Arrow keys and Enter pick; Escape or a tap outside closes it.
- **Shared code:** `useItemDraft` (the state and saving), `ItemFields` (the fields) and `NameField` (the combobox) are used by the typing page, the scan sheet and the edit page. `Sheet` can keep a tap on the backdrop from closing it and focuses a marked element (`data-autofocus`), so a filled-in sheet does not open the keyboard. `Toast` is a new primitive.
- **Data:** unchanged. Only the barcode is still sent, and only when a code is unknown on the device (D-047).
- **Alternatives:**
  - The category as three visible pills when adding (one tap to fix a wrong guess, but more on screen), or as a small dropdown. The owner chose hidden.
  - A new row for each scan of the same product.
  - Typing that returns to the overview after one thing.
  - Scanning without "Uden stregkode".
- **Still to check on the iPhone:**
  - scanning several products in a row
  - the frozen picture
  - the sheet over the camera, with and without the keyboard
  - the month roller in the sheet
  - where the toast sits when the keyboard is open
  - the camera coming back after leaving the app
  - heat and battery over a few minutes
- **Changed 2026-11-06 (D-054):** typing opens a sheet over Forråd instead of its own page; the category is a visible bar on top; "Skriv selv" is "Tilføj".

## D-054 — Forråd after the iPhone test: counters, sheets that slide, a water sheet and dial, a guide on dates

- **Date:** 2026-11-06
- **Problem (owner, after using D-049–D-053 on the iPhone):**
  - In the scan sheet, a suggestion could not be picked: the list closed under the finger.
  - "Tag ud" and "Læg flere til" worked poorly.
  - "Slet alt" did not say what it does.
  - The add form's order and the empty month field's lower height felt off.
  - The sheets appeared without movement.
  - "Holdbarhed" said little.
  - Water had its own inline form.
- **Decisions (owner):**
  - **The bug:** inside a `<dialog>`, a tap on a suggestion moved focus to the dialog and the list closed before the tap landed. The list now keeps focus in the field (`pointerdown` cancelled), and focus moving to the dialog does not close it.
  - **A counter on each thing:** the sheet shows − [antal] +, and the number can be typed. Each change is saved at once. Counting down to 0 shows "Den fjernes fra forrådet, når du lukker", and the thing is removed when the sheet closes; counting up again keeps it. Below it are "Redigér" and a red "Slet" with a bin icon, which asks first. The best-before month is no longer changed when taking out or adding (see OPEN_QUESTIONS 35).
  - **Every counter can be typed into** (`Stepper`), including the household and the add form.
  - **Sheets slide** up and down, with the backdrop fading. Nothing moves with reduced motion. A sheet keeps its content while it slides down.
  - **Adding by typing is a sheet** on the Forråd page, adding one thing after another like the scanner. Its address (`#/forraad/new`) is kept, so the back button and a category's + work. The button is "Tilføj".
  - **The category is a bar** on top of the form: [Mad] [Pleje] [Andet]. It starts at Mad, or at the category whose + opened it. A name that is a stock-list line in another category moves it until the user taps one. The edit page uses the same bar. The cards keep their long names.
  - **Field order:** category, Navn, Antal, Størrelse (valgfri), Bedst før (valgfri). The empty month field is as tall as the others.
  - **"Nærmer sig udløb"** replaces "Holdbarhed". Its rows look like the categories' rows, with the date in red. A link leads to the new guide on dates.
  - **Water:** the whole card opens a sheet with a counter in the chosen unit, saved at once, and "Tjekket i dag". The month field for "last checked" is gone.
    - **Changed 2026-11-06 (owner):** the sheet's main button is "OK", which closes it; "Tjekket i dag" is a second button below.
  - **Home:** a water tile with a ring (have/need) comes first among the tiles, once some water is entered. An odd last tile fills its row.
    - **Changed 2026-11-06 (owner):** the filled part of the ring is the app's lime (accent).
  - **The Forråd tab** has one plain box (`Box`).
  - **A guide on dates:** "Når datoen er overskredet" (supplies group, risk `high`). It covers the difference between "bedst før" and "sidste anvendelsesdato", and how to look, smell and taste. It also lists examples of "bedst før" foods and the foods without a date.
    - **Sources:** Fødevarestyrelsen's "Sådan vurderer du madens holdbarhed" is the primary source. Forbrugerrådet Tænk is the second authority, and gives the list of examples.
    - **Samvirke left out:** the Samvirke article the owner named is a magazine piece. Its claims about single foods have no authority behind them, so it was not used.
  - **Barcode backfill stays on the phone:** a name typed for an unknown barcode is remembered on the device (as since D-053). Nothing is sent to Open Food Facts, since adding there needs an account (D-010, D-047).
- **Danger colour:** a new `danger` token (red; light #b3261e, dark #ff8a80) for deleting and for dates that have passed or soon will.
- **Alternatives:**
  - A "Gem" button for the counter.
  - A counter that stops at 1.
  - "Medicin" or "Apotek" as the bar name.
  - A link that opens Open Food Facts to add a product.
  - Keeping the typing page.
- **Still to check on the iPhone:**
  - picking a suggestion in the scan sheet
  - the empty month field's height
  - how the sliding feels
  - typing in the counters with the number keyboard

## D-055 — The scanner shows that it is looking, says when a code is seen but not read, and reads better

- **Date:** 2026-11-06
- **Problem (owner, on the iPhone):** the scanner often had trouble reading a code, and the screen gave no sign whether it was looking or whether it saw the code and failed.
- **Cause, as far as the code shows:** the camera ran at its default resolution (often 640×480 on iOS), and the whole picture was read, so a barcode was only a few hundred pixels wide. The only sign was a still frame.
- **Decision (owner):**
  - **Read better:**
    - The camera is asked for 1080p, and for continuous focus where the browser offers it.
    - Only the part under the frame is read (with a 15 % margin), at full resolution. The frame's position is one constant (`SCAN_FRAME`) shared by the drawing and the crop (`cropFor`, tested).
    - The next frame is read only after the last one is done, every 200 ms.
  - **A line moves** up and down in the frame while the camera looks. It stops while a sheet is open. With reduced motion, the frame's border slowly brightens and dims instead.
  - **"Seen but not read":** the reader is asked to return codes it found but could not decode (`returnErrors`). When it does, the frame and line turn amber, and the text under the camera says "Stregkoden ses, men kan ikke læses. Hold telefonen stille, lidt længere væk, og sørg for lys." It holds for 1.5 seconds after the last such frame.
    - **Not caught:** a very blurry code, which the reader does not see at all.
- **Dependency:** `zxing-wasm` 3.1.6 (MIT, already a direct dependency for its `.wasm` file) is used directly through `readBarcodes`. `barcode-detector` is removed, since Safari never had the native detector it wraps.
- **Alternatives:**
  - Tips after a few seconds without a read.
  - A torch button (iPhone Safari may not allow the torch).
  - Feedback only, without changing the reading.
- **Still to check on the iPhone:**
  - reading real packs at different distances
  - focus
  - the amber state on a worn or curved code
  - heat and battery over a few minutes, since 1080p frames cost more

## D-056 — Sunrise and sunset in Tools

- **Date:** 2026-11-06
- **Problem (owner):** with no internet there is no way to look up when the sun rises or sets, which matters in a power cut.
- **Decision (owner):** Tools gets **Sol op og ned**. For a place and a day it shows:
  - sunrise and sunset, with the direction ("Står op i SØ (133°)", from true north)
  - **Lyst udenfor**: civil twilight, when the sun is 6° below the horizon
  - the day's length, and how much longer or shorter it is than yesterday
  - It opens on today, with a date field (the phone's own roller) and "I dag".
- **Place:**
  - **Brug min position:** the phone's position, asked for only on a tap, read once and never watched. It works offline, since GPS needs no network.
  - **The map's home point,** used at first if one is set. A moved home point is followed.
  - **A town:** 15 towns spread over Denmark, with centre points from OpenStreetMap (Nominatim, 2026-11-06).
  - **Storage:** the choice is kept on the device (`stead.sun.place.v1`), rounded to 0.01° (about 1 km).
  - **Refused permission:** the screen says so and the town list remains.
- **Method:** NOAA's solar position equations (after Meeus; NOAA Global Monitoring Laboratory, public domain), in `web/src/sun/sun.ts`, with no dependency.
  - Sunrise and sunset are at a zenith of 90.833° (the upper edge, with average refraction); civil twilight at 96°.
  - Each event is refined from the sun's position at the time first found.
  - Times are in the phone's time zone, so summer time follows the phone.
  - Days without a sunrise or sunset (far north) are handled.
- **Checked against:**
  - the NOAA Solar Calculator, for sunrise, sunset and direction: København at both solstices and the equinox, Skagen and Rønne. Within a minute and half a degree.
  - the U.S. Naval Observatory's data service, for civil twilight: within its rounding to the minute.
  - The values are in `sun.test.ts`.
- **Wording:** "Lyst nok til at være ude uden lygte" follows the USNO definition: before morning civil twilight and after evening civil twilight, artificial light is normally needed for ordinary outdoor activities. The note says hills, buildings and clouds can make it dark sooner, which USNO also says.
- **Not content:** this is a calculation, not a guide, so it has no source block. It is accurate to about a minute for a level horizon.
- **Alternatives:**
  - `suncalc` (unmaintained since 2015; the same equations take about 80 lines).
  - The town list only (owner chose GPS and the home point too).
  - A year overview (owner chose a date field).
- **Changed 2026-11-06 (owner):**
  - The button shows "Skift"; VoiceOver still hears "Skift sted".
  - A graph of the day's length through the year at the place sits under the times: a 0–24 hour area, a dot on the chosen day, and the shortest and longest day as text (also the graph's description for VoiceOver). No tooltips: the date field picks the day.

## D-057 — Food and crop groups; a tab bar that stands out; the three first aid steps spelled out

- **Date:** 2026-11-06
- **Groups (owner):** Opbevaring and Dyrkning are divided into headed sections, with the count next to each heading.
  - **Order:** Frugt, Grøntsager, Krydderurter, Kød, Fisk (en: Fruit, Vegetables, Herbs, Meat, Fish), in `web/src/food/groups.ts`.
  - **Empty groups are not shown.** Meat and fish are defined (`StorageItem.category` may be `meat` or `fish`; FoodKeeper's meat and poultry would go to meat, seafood to fish) but no such foods are imported yet, so today Opbevaring shows Frugt (33) and Grøntsager (68).
  - **Crops:** each growing guide has a `group` (`vegetables`, `fruit` or `herbs`), required by the build and stored in `guides.grp`. Jordbær and rabarber are under Frugt (rabarber is eaten as fruit), krydderurter under Krydderurter, the rest under Grøntsager.
  - **Search** keeps the grouping on both pages. Home's search and Saved stay as they were.
  - **Alternatives:** a filter bar (one more tap to see the rest; owner chose sections); importing meat and fish now (owner: define them, show them once they have foods).
- **Tab bar (owner):** it blended into backgrounds of the same colour: the black 112 card in light mode, and every card in dark mode, where the bar (#262624) is almost the card colour (#1c1c1a).
  - **Fade:** the page colour now fades in behind the bar, so what scrolls under it softens away.
  - **Outline:** the bar has a thin light outline (`--c-nav-edge`).
  - **Alternatives:** an outline only (content still runs right up to the bar); a lighter bar in dark mode (no help over the 112 card).
- **The three first aid steps (owner):** "Førstehjælpens 3 trin" listed only the step names. It now spells out each step under its own heading, all from the same handbook (ABC Førstehjælpshåndbogen):
  - **Trin 1, Gør stedet sikkert (s. 9–10):** the same words as "Gør stedet sikkert".
  - **Trin 2, Giv førstehjælp (s. 16–17):** check whether the person is awake, call 112 at once if not, then M-ABC (the same words as "Er personen vågen?" and "M-ABC").
  - **Trin 3, Tilkald hjælp (s. 46–47):** new plain-language text: when to call, what the call handler asks, the golden rule (one calls while the others help), and staying on the line until told to hang up.
  - **Second authority:** ERC 2025 first aid (Tabel 2 and 3): call 1-1-2 straight away, follow the call handler's instructions, try to wake the person.
  - **Review flag:** `ownerChecked` stays false ("Prøveversion"). The new step 3 text needs the review in `LANGUAGE_REVIEW.md`.
- **Pack:** content 0.16.0. No schema change: `guides.grp` now also holds the crop group.

## D-058 — Tools for a power cut: fridge and freezer clock, boiling timer, sirens, the sun and moon right now

- **Date:** 2026-11-06
- **Decision (owner):** Tools gets four more things, all usable without internet or GPS:
  - **Køl og frys:** "Strømmen gik nu" (or an earlier time) starts a clock kept on the device (`stead.powerclock.v1`), so it survives closing the app and restarting the phone.
    - **What it shows:** how long the power has been out, and for the fridge (4 h), a full freezer (48 h) and a half-full freezer (24 h) whether they are still within their time. The status has an icon, not colour alone.
    - **Advice:** past the fridge's time, what to throw out; when the power is back, check the fridge is at most 5 °C.
  - **Kog vand:** a one-minute timer from a stored start (so a locked screen does not lose it), ending with a vibration where supported and a short tone made with Web Audio (no sound file).
  - **Radio og sirener:** a row that opens a new situation guide, "Når sirenen lyder", from Beredskabsstyrelsen's siren fact sheet (signals, what to do, text-tv 150, the May test, SMS for the deaf) and the crisis leaflet (DR on FM radio when everything else is down; 112 only for emergencies).
  - **Solen lige nu and Månen** in Sol op og ned:
    - **Sun:** the sun's direction and height this minute, with a small dial and "Stil dig med ansigtet mod solen. Så er nord …" to find north without a compass.
    - **Moon:** the moon's phase, how much is lit, and its rise and set on the chosen day.
- **Sources for the numbers:** Fødevarestyrelsen gives no hours.
  - **Hours:** USDA FSIS "Keeping Food Safe During an Emergency": fridge about 4 h unopened, full freezer about 48 h, half-full 24 h. Checked against CDC "Keep Food Safe After a Disaster or Emergency", which gives the same.
  - **Where they live:** both are snapshotted and registered. The hours, CDC's throw-out list and FSIS's refreeze rule are translated blocks in "Strømmen er gået", and `web/src/power/limits.ts` cites them.
  - **Boiling:** one minute, from CDC, as in "Der er intet vand".
- **Maths:**
  - **Sun position:** NOAA's equations, with NOAA's refraction. Tested against NOAA's calculator within 0.3°.
  - **Moon:** Meeus' main lunar terms, rise and set when the centre reaches 0.7275 × parallax − 34′. Tested against USNO on four days: within half a minute and 0.2 percentage points lit.
- **Left out:**
  - **DR's FM frequencies:** no official list was found as a stable page. The guide says DR on FM radio, without numbers.
  - **A siren sound:** the signals are described in words.
- **Alternatives:**
  - A screen of its own for sirens (a guide gets the source checks and "Vis original" for free).
  - Hours from memory (refused: high-risk numbers need a source).

## D-059 — "Gode at kunne": seven guides for doing without power and water

- **Date:** 2026-11-06
- **Decision (owner):** Når det sker gets a fourth group, **Gode at kunne** (`group: 'skills'`), with:
  - **Tænd et bål:** wood and kindling in sizes, building and lighting, lens, flint and steel, battery, bow drill, distances, wind and bans.
  - **Knob:** seven knots with drawings.
  - **Vask tøj uden strøm og vand.**
  - **Saml vand:** rain first; a plastic bag over leaves as a last resort.
  - **Lav mad uden strøm:** grill outdoors only, fuel, food hot through, cooling.
  - **Hold telefonen opladet.**
  - **Hygiejne med lidt vand.**
- **Sources:**
  - **Danish first:** Det Danske Spejderkorps (fire, knots), Bolius (fire and grill rules from Beredskabsstyrelsen; water), Fødevarestyrelsen, the crisis leaflet, sundhed.dk.
  - **US federal works, public domain, translated (D-041):** Army FM 3-05.70 (fire and water chapters; the LSU copy is gone, fetched from the Internet Archive), FM 5-125 (knots), CDC (hand sanitizer), FCC (phones).
  - **Page extracts:** only the chapters used are kept as snapshots, with the original PDF's sha256 in the registry.
  - **Second authorities for the high-risk guides:** fire (Bolius, the Army manual), water (CDC, Fødevarestyrelsen), cooking (NHS on grills and camping stoves indoors).
- **Washing (owner):** no authority describes hand-washing clothes. Which water to use comes from Bolius; the method comes from a Sierra magazine how-to, registered as `needs-review` and marked as a how-to.
  - **No laundry claim:** no source says rainwater is fine for laundry, so the guide says only what Bolius says (rainwater for the toilet and for washing yourself; save on laundry; no water down the drain during a power cut).
- **Knot drawings (owner: public domain only):** cropped from FM 5-125's figures (US federal work). The figures keep their English captions. Our own alt text.
- **Conflicts settled toward the Danish source:** the Army manual calls rainwater "usually safe for drinking"; Bolius says to boil it before cooking, and the guide follows Bolius.
- **Left out:**
  - **Retained-heat cooking (høkasse):** no source found.
  - **The belowground still:** complex; the bag still and the leafy-branch bag are kept.
  - **Gunpowder as tinder.**
- **Phone guide:** "Telefon og net er nede" stays a situation guide. The new guide adds the FCC's battery and charging advice.
- **Review flag:** `ownerChecked` is false for all seven ("Prøveversion").

## D-066 — Tools in headed sections; the timers under "Timere"

- **Date:** 2026-11-06
- **Decision (owner):** Tools is shown in headed sections, so it is clear what each tool is for:
  - **Timere:** "Køleskab og fryser" (was "Køl og frys") and "Kog vand"
  - **Retning og dagslys:** Kompas and Sol op og ned
  - **Førstehjælp** and **Mad** come with the new tools (D-067, D-068)
- **Renamed:** "Køl og frys" is "Køleskab og fryser" (en: "Fridge and freezer"), as the tool's title and on its page. The guide "Strømmen er gået" now says "Timeren ”Køleskab og fryser” under Værktøjer". Content 0.18.1.

## D-065 — "Søg efter ny version" in Settings

- **Date:** 2026-11-06
- **Decision (owner):** Settings gets a card "App og version" with the app's build (date and short Git commit, set at build time) and a button "Søg efter ny version".
- **How it works:** the button asks the browser to fetch the app's own `sw.js` again (`registration.update()`), which the browser already does by itself at every launch. A new version downloads in full before it can be used (D-022); then "Opdater" switches to it, as the banner does. Offline, the button says so without trying.
- **States:** Søger …, Du har den nyeste version, Der er en ny version (with the download progress), En ny version er klar + Opdater, Du er ikke på nettet, Kunne ikke søge.
- **Network (AGENTS §4):** a request to the app's own host only, the same one the browser makes at launch. No new host, no data about the user.
- **Code:** the service worker is registered once in `web/src/pwa/updates.tsx` and shared with the banner and Settings.
- **Dev setup:** `.claude/launch.json` gets "stead (built, no sh)", which serves a finished build without `sh` (Windows).

## D-064 — Kilder on its own page under Settings

- **Date:** 2026-11-06
- **Decision (owner):** the list of all sources moves out of Settings to its own page, `#/settings/sources`. Settings keeps one row, "Kilder", with the number of sources ("89 kilder").
- **Why:** the list is long (89 sources) and pushed About far down; few people need it.
- **Unchanged:** the grouping by publisher and the links to each source. Back returns to Settings.

## D-063 — No animal water figure in Settings

- **Date:** 2026-11-06
- **Decision (owner):** the setting "Vand til dyr pr. døgn" is removed. It was a daily total for all animals, added to the water target, but read as if it needed a number of animals, which the app never asks for.
- **Water target:** now people × 3 L × the chosen days (the stock list's figure).
- **Saved data:** old data and old backup files still load; the animal figure in them is ignored.
- **The stock-list line "vand-husdyr":** shown as a plain reminder with no box (it was ticked when the figure was above 0).
- **OPEN_QUESTIONS 31** (an authority figure for animals) is closed by this.

## D-062 — First aid core complete: ten more guides, two sundhed.dk pages as second authority

- **Date:** 2026-11-06
- **Decision (owner):** the life-saving core planned in D-037 is finished with ten guides from *Førstehjælpens ABC*, written like the first eleven (plain language with the handbook's words kept, D-042; `ownerChecked` false, "Prøveversion"):
  - Ring 112 (p. 46–49)
  - Noget galt i halsen (fremmedlegeme i luftvejene, p. 60–65)
  - Kredsløbssvigt, with bleeding inside the body (p. 38–40, 44)
  - Mindre blødninger and the pressure bandage (p. 41–43)
  - Drukning (p. 11, 68–69)
  - Forbrændinger (p. 100–101)
  - Underafkøling (p. 102–103)
  - Alvorlig allergisk reaktion (p. 129)
  - Stroke (p. 123)
  - Brystsmerter (p. 124–125)
- **Second authorities:** ERC 2025 First Aid in Danish (DRG) for eight of them. ERC 2025 no longer covers burns, and its choking advice covers adults only. Two pages from Patienthåndbogen on sundhed.dk were snapshotted and registered (owner OK, 2026-11-06):
  - `dk-sundhed-forbraendinger-foerstehjaelp` for burns
  - `dk-sundhed-fremmedlegeme-i-luftvejene` for choking in babies
- **Held back (D-037's rule: a point the second authority disagrees with):**
  - **Aspirin for chest pain (p. 125):** the handbook says 112 may advise chewing 150–300 mg acetylsalicylsyre. ERC's Danish translation says this is not recommended in Denmark and to wait for the ambulance (owner decision). The guide keeps "Giv ikke selv personen medicin, uden at alarmcentralen har sagt det."
  - **Aftersun on 1st degree burns (p. 101):** sundhed.dk advises against creams on burns a doctor will see.
- **Left out for now:**
  - **Stroke p. 122:** the page is set in two columns that the PDF text layer mixes line by line, so its running text cannot be checked word for word. The guide uses p. 123 (Stræk, Snak, Smil) and one line from p. 122.
  - **Pictures:** text first (owner). Each guide's `$comment` names the photos to add: the pressure bandage p. 43, the burn degrees p. 101, the "mummy" wrap p. 103 and Stræk, snak, smil p. 123. The crop script runs only on a Mac.
- **Reuse:** "Ring 112" shows the same 112 blocks as "Førstehjælpens 3 trin", word for word, so the two cannot drift apart.
- **Check on Windows:** the pack build cannot run on Windows yet (paths and line endings). The guides were checked with the build's own `validateGuides` from a script that works around both: 62 guides, no problems. A deliberately broken quote was caught.
- **Content:** 0.18.0.

## D-061 — No sirens row in Tools

- **Date:** 2026-11-06
- **Decision (owner):** the "Radio og sirener" row is removed from Tools. It was a guide, not a tool, and did not belong there.
- **What stays:** the guide "Når sirenen lyder" (D-058) is unchanged. It is still in "Når det sker" under "Hvis det sker", and it is linked from "Hold telefonen opladet".
- **Tools now holds:** Kompas, Sol op og ned, Køl og frys and Kog vand.

## D-060 — Forråd: a search on the names

- **Date:** 2026-11-06
- **Decision (owner):** Forråd gets a search field just under the water card, above the two add buttons. It filters as you type.
- **Matching:** the text may be anywhere in a thing's name (like SQL `%text%`), not only at the start. Case and accents are ignored with the same `fold()` as the other searches (å → a, é → e; æ and ø kept). Names only, not categories, sizes or products.
- **While searching:**
  - Only the categories with a match are shown, each with only its matches.
  - "Nærmer sig udløb" steps aside, so a thing does not show twice. Its month is still red in its row.
  - The links to the stock lists and the "Intet her endnu" lines step aside too.
  - With no match there is one line: "Intet i forrådet matcher …".
- **Field:** the shared `SearchField`, with the × inside the field that clears it, as on the other pages. It shows only once something is in the store.
- **Kept text:** the query lives in `App` with the other pages' searches, so it stays while opening a thing's editor, Settings or the scanner and coming back.
- **Alternatives:** a single flat list of results was rejected, because it would lose the category each thing lives in. A prefix match like the food search's short queries was rejected because the owner asked for a match anywhere in the name.

## D-010 — No runtime AI, accounts, sync or telemetry

- **Date:** 2026-10-24
- **Decision:** The app contains no runtime AI, user accounts, cloud synchronization, social features or telemetry.
- **Rationale:** `AGENTS.md` §12. These add online dependencies and privacy concerns without improving access to reliable offline knowledge.
