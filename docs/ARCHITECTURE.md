# Architecture

> **Status: proposed.** Nothing is implemented yet. Library versions are chosen and verified for compatibility at scaffolding time (M1) and recorded in `DECISIONS.md`.

## 1. Overview

Two separate parts, matching `AGENTS.md` §6 (separate ingestion from runtime consumption):

```
content/   Build-time pipeline: sources → guides → validated, versioned pack
web/       PWA (planned, D-021): stores the pack in OPFS, never transforms content
```

The app depends only on the pack format, not on how the pack was produced.

## 2. Content pipeline (`content/`)

```
content/
  sources/        Source registry (registry.json), snapshots, text/ (PDF text layers), reuse requests
  storage/        Food storage data: generated imports + Danish names (names-da.json)
  produce/        Food guides (guides/foodkeeper-<id>.json, D-033), Handbook 66 compatibility table and FoodKeeper mapping
  guides/         One file per guide per language (format not decided yet)
  schema/         Shared TypeScript types
  lib/            Pure mapping/validation code (unit tested)
  scripts/        Entry points: import-foodkeeper, build-pack; extract-pdf-text.swift; quote-context.ts (authoring aid)
  authoring/      Python helpers for writing food guides (not part of the build; see its README)
  test/           node:test tests
  dist/           Build output (pack.sqlite, manifest.json) — not committed

Commands (in `content/`): `npm run typecheck`, `npm test`, `npm run import:foodkeeper`, `npm run build:pack`.
```

- **Validate:** schema check, every block has a `sourceRef`, every source has a verified license, risk-level requirements met, only `published` guides selected.
- **Build:** produces a SQLite database with an FTS5 index plus `manifest.json`. Fails on any validation error.
- The build output is copied into the app as a bundled asset.
- **Food guide quote check (D-033):** every guide block quotes its source passage, and the build fails unless each quote is found in the snapshot: HTML snapshots through `htmlToText` (inline tags joined, entities decoded), PDF snapshots through `sources/text/<id>.txt`, the PDFKit text layer made by `scripts/extract-pdf-text.swift` (macOS). The text file's first line records the snapshot's SHA-256, and the build refuses text made from another snapshot. `[bracketed]` words in a quote are editorial; `visualOnly` quotes (printed as images) are skipped and listed in the build output.

## 3. Content model (initial)

```ts
type Lang = 'da' | 'en';
type RiskLevel = 'low' | 'elevated' | 'high';
type GuideStatus = 'draft' | 'checked' | 'published' | 'retired';

interface SourceRef {
  sourceId: string;
  locator: string;      // section, heading or anchor in the source
  quote: string;        // original passage this block is derived from
}

type Block =
  | { type: 'step'; text: string; sourceRef: SourceRef }
  | { type: 'warning'; text: string; sourceRef: SourceRef }
  | { type: 'checklist'; items: { text: string; sourceRef: SourceRef }[] }
  | { type: 'note'; text: string; sourceRef: SourceRef }
  | { type: 'image'; assetId: string; caption: string; sourceRef: SourceRef };

interface Guide {
  id: string;           // stable across versions and languages
  lang: Lang;           // language of the source material
  title: string;
  summary: string;
  summarySourceRefs: SourceRef[];
  category: string;
  tags: string[];
  related: string[];    // guide ids
  blocks: Block[];
  riskLevel: RiskLevel;
  status: GuideStatus;
  version: number;
  sourceIds: string[];
  contentLicense: string;  // resulting license of this guide (e.g. CC-BY-SA-4.0)
  nonCommercial: boolean;
  publishedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

interface Source {
  id: string;
  title: string;
  publisher: string;
  url: string;
  lang: Lang;
  license: string;      // SPDX id, license URL, or 'unknown'
  licenseVerifiedAt?: string;
  attribution: string;
  retrievedAt: string;
  snapshotChecksum: string;
}

interface PackManifest {
  packId: string;       // e.g. 'core'
  version: string;
  schemaVersion: number;
  createdAt: string;
  sizeBytes: number;
  sha256: string;
  dependencies: { packId: string; minVersion: string }[];
  guideCount: number;
  languages: Lang[];
}
```

Storage reference data (D-014, D-015, D-017) is implemented in `content/schema/storage.ts`: a `StorageItem` has English and (checked) Danish names, storage periods per location (`pantry` / `fridge` / `freezer`) with what they are counted from (`fromPurchase`, `afterOpening`, `afterThawing`, `unspecified`) and a duration (a min–max range, or not recommended / indefinitely / until ripe / package use-by date), notes per location in the source language, and a reference to the source record.

The model is designed so that a later translation is another `Guide` record with the same `id` and a different `lang`, and so that downloadable packs (M4) reuse `PackManifest` unchanged.

## 4. App: Progressive Web App (D-021, D-022, D-023)

```
web/
  index.html, vite.config.ts      Vite + React; PWA plugin in "inject manifest" mode; base './'
  scripts/sync-pack.ts            Copies and verifies the pack from ../content/dist into public/pack/
  scripts/make-icons.ts           Generates the placeholder icons
  src/
    main.tsx, App.tsx             Opens the pack, routes, tab bar, search state, per-page scroll positions
    router.ts                     Hash routes: #/ (Home), #/storage, #/food/<id>, #/tools, #/settings;
                                  "back" falls back to the parent page after a direct launch
    sw.ts                         Service worker: caches every built file; updates wait for "Update"
    db/db.worker.ts               SQLite WebAssembly in a worker; pack in OPFS ("opfs-sahpool")
    db/queries.ts                 All SQL; runs in the worker and in tests against the real pack
    db/client.ts, protocol.ts     Typed messages between app and worker
    screens/                      Home, Storage ("Storing food"), Food, Placeholder (Tools, Settings)
    components/                   ui.tsx (Card, SourceNote, SearchField, BackButton, MessageState, Page),
                                  TabBar, EmergencyCard (112), FoodList
    storage/useFoodSearch.ts      Food search shared by Home and Storing food
    i18n/                         Strings (da, en) and browser-language selection
    storage/                      Formatting and search ranking (pure, unit tested)
    pwa/UpdateBanner.tsx          "Works offline now" and "New version ready" messages
    pwa/useOfflineReady.ts        "Offline ready" = pack open and a service worker in control
  e2e/                            Playwright tests in WebKit
```

- **Pack lifecycle:** the worker reads `pack/manifest.json`, imports `core.sqlite` into OPFS only after checking its SHA-256 against the manifest, opens it, runs the launch check (schema version, trigram search), and only then deletes older pack copies. The database file name includes version and checksum.
- **Offline and updates:** the service worker downloads every file into a new cache during install; if any download fails, the install fails and the current version keeps working. A new version waits until the user taps "Update". Navigations are answered with the cached `index.html`; everything else is cache-first.
- **Persistence:** the app calls `navigator.storage.persist()` on start.
- **First launch:** the service worker downloads the files four at a time past the HTTP cache (`cache: 'reload'`) and posts progress; Home shows a download card with a progress bar until the app is ready offline, and a spinner while the pack is opened. A failed download deletes the new cache, so the working version stays.
- **Translated notes:** `storage_notes.text_da` holds the Danish translation (D-031); the food page shows it with a page-wide switch to the original.
- **Text size:** the root font follows iOS Dynamic Type (`font: -apple-system-body`). Text and vertical spacing are rem-based; horizontal padding is in px so large text does not squeeze the column; the largest headings are capped relative to screen width; the tab bar has a fixed pixel size and capped labels, as iOS does. Checked by screenshots at 17, 28 and 40 px base size.
- **Design tokens:** colours in `src/index.css` (light and dark), checked against WCAG AA; lime is only used as a fill behind dark text (1.15:1 on the light background).
- **Tests:** `npm test` (Vitest: formatting, ranking, and all queries against the real pack); `npm run test:e2e` (Playwright, WebKit at iPhone 15 size: search, detail, offline reload, English UI). Playwright's default WebKit contexts are in-memory and refuse OPFS, so each test uses a temporary persistent profile (`e2e/fixtures.ts`).
- **Commands (in `web/`):** `npm run dev`, `npm run build` (sync pack + typecheck + build to `dist/`), `npm run preview`.
- **Typeface:** Inter, Latin subsets bundled from `@fontsource-variable/inter` (`src/fonts.css`, D-029).
- **Publishing:** `.github/workflows/pages.yml` builds the pack and the app and deploys `web/dist` to GitHub Pages on every push to `main` (D-030).

## 5. Search

- Search runs fully on-device against the prebuilt FTS5 index in the pack.
- **Storage names (implemented, D-018):** table `storage_search`, one row per item per language (name, subtitle, English keywords), tokenizer `trigram remove_diacritics 1`. Verified: 'kål' finds Grønkål/Blomkål/Rosenkål/Kålrabi, 'kal' finds 'kål', 'potato' finds Kartofler. 'ø' and 'æ' are separate letters and are not folded.
- Queries under 3 characters return nothing from a trigram index; the app falls back to a prefix match on names.
- Ranking: plain `bm25` ranks 'Grønkål' above 'Kål' for 'kål'. The app should rank exact and prefix name matches first.
- **Guides (not built yet):** title, summary, tags and block text. Choose between trigram and `unicode61` when guide text exists; test with real Danish queries.

## 5a. Pack schema (version 3)

Defined in `content/lib/pack.ts`; manifest type in `content/schema/pack.ts`.

- `meta` (packId, version, schemaVersion, createdAt)
- `sources`: id, title, publisher, url, lang, license, licence URL, attribution, retrieval date, data version. Only sources the pack uses.
- `storage_items`, `storage_periods`, `storage_notes`: one row per item / period / note, with source field names kept for traceability.
- `storage_search`: FTS5 index (see §5).
- `sources.short_name`: the short label shown next to guide text (version 3).
- Food guides (version 3, D-033): `produce_sections` (item, order, section, verdict), `produce_blocks` (item, section, order, Danish text, original quote, source id, locator), `produce_ethylene` (item, Handbook 66 storage groups, producer, sensitive) and `produce_relations` (item, other item, `apart` | `with`). Relations are computed at build time from Handbook 66 Table 1: `apart` when one produces significant ethylene and the other is sensitive; `with` when they share a storage group, have no conflict and are both producers or both not.

Build: `cd content && npm run build:pack`. Output goes to `content/dist/core/` (not committed). Pack version = `content/package.json` version.

## 6. Offline guarantees

- No runtime dependency on any network resource (`AGENTS.md` §4).
- Verified by running the production build on an iPhone in airplane mode from a fresh install.
- Every dependency added is checked for hidden network access.

## 7. Deferred subsystems

- **Downloadable packs (M4):** download to temporary storage, verify size and checksum against the manifest, then switch atomically; the previous pack stays until the new one is verified.
- **Offline maps (M5):** separate subsystem, proof of concept first (D-008).
