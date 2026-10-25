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
- **Evidence:** Tested on your iPhone on 2026-10-25 with the test page (`pwa-spike/`, https://illusive.github.io/prep-storage-test/), opened from the Home Screen: persistent storage granted; 4 GB written to OPFS without errors; search works in airplane mode. WebKit's policy allows up to 60 % of disk per origin and lists Home Screen web apps as a reason to grant persistent storage. In the iOS 26 Simulator the same pack and trigram search ran in Safari (6 ms for 'kal').
- **Unchanged:** the content pipeline, source registry and pack format (D-016, D-017, D-018). The trigram requirement in D-018 is met by the bundled SQLite 3.53.4 build instead of the device's SQLite.
- **Risks:** Apple could change Home Screen web app behaviour (it briefly removed them in the EU in 2024). Long idle periods are still being tested (data must survive a reboot and days without use). Offline maps (M5) must be proven within the quota. The first visit needs a network connection, as any install does. No background location.
- **Alternatives:** Native Expo app via TestFlight (90-day expiry); native app via the App Store (developer account and review needed).
- **Superseded:** the Expo/native parts of D-002, D-019 and D-020.

## D-010 — No runtime AI, accounts, sync or telemetry

- **Date:** 2026-10-24
- **Decision:** The app contains no runtime AI, user accounts, cloud synchronization, social features or telemetry.
- **Rationale:** `AGENTS.md` §12. These add online dependencies and privacy concerns without improving access to reliable offline knowledge.
