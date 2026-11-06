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
  guides/         Guides (D-037): <category>/<id>.json (schema/guide.ts) and images/ (JPEG cut from the source's pages)
  schema/         Shared TypeScript types
  lib/            Pure mapping/validation code (unit tested)
  scripts/        Entry points: import-foodkeeper, build-pack; extract-pdf-text.swift, render-pdf-region.swift (crop a page region to PNG); quote-context.ts (authoring aid)
  authoring/      Python helpers for writing food guides (not part of the build; see its README)
  test/           node:test tests
  dist/           Build output (pack.sqlite, manifest.json) — not committed

Commands (in `content/`): `npm run typecheck`, `npm test`, `npm run import:foodkeeper`, `npm run build:pack`.
```

- **Validate:** schema check, every block has a `sourceRef`, every source has a verified license, risk-level requirements met, only `published` guides selected.
- **Build:** produces a SQLite database with an FTS5 index plus `manifest.json`. Fails on any validation error.
- The build output is copied into the app as a bundled asset.
- **Food guide quote check (D-033):** every guide block quotes its source passage, and the build fails unless each quote is found in the snapshot: HTML snapshots through `htmlToText` (inline tags joined, entities decoded), PDF snapshots through `sources/text/<id>.txt`, the PDFKit text layer made by `scripts/extract-pdf-text.swift` (macOS). The text file's first line records the snapshot's SHA-256, and the build refuses text made from another snapshot. `[bracketed]` words in a quote are editorial; `visualOnly` quotes (printed as images) are skipped and listed in the build output.
- **Guide verbatim check (D-037):** every text a guide shows (title, summary, headings, block titles, paragraphs, steps, list items, warnings, captions) must be a substring of `verbatimText(source)`: the PDF text with page markers and page numbers dropped, words broken across lines joined, soft hyphens removed and bullet glyphs turned into spaces, whitespace collapsed. Titles and headings ignore case (the handbook sets many in capitals). Recorded corrections (`{from, to}`) are undone before matching. Each guide needs at least one second-authority check from another source, whose quote is checked the same way. Step photos must exist and have alt text.

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
  scripts/make-icons.ts           Generates the icons (the Home asterisk)
  src/
    main.tsx, App.tsx             Opens the pack, routes (one switch, every route handled), tab bar,
                                  each page's search text, per-page scroll positions
    router.ts                     Hash routes (D-023): Home, first aid, Når det sker, food storage, growing,
                                  guides, foods, saved, map, Forråd and its editor, tools, compass, sun, settings;
                                  SAVED_SECTIONS holds the category order (D-048)
    sw.ts                         Service worker: caches every built file; updates wait for "Update"
    lib/                          Shared helpers, used everywhere instead of hand-written copies:
      localStore.ts                 every value the user keeps on the device (validated, shared, synced)
      rpc.ts                        typed requests to a worker and one handler per request type
      usePageTitle.ts               the page title (and focus on the heading after loading)
    db/                           Knowledge pack: SQLite WebAssembly in a worker, pack in OPFS;
      queries.ts                    all SQL (runs in the worker and in tests against the real pack)
      useDbQuery.ts                 one request for a component: answer per request, error instead of
                                    loading forever
    i18n/strings.ts, format.ts    Strings (da, en; a test keeps them in step) and every date, number and unit
    components/ui.tsx             Primitives: Card, Button/ButtonLink/IconButton (variant `danger` deletes),
                                  inputClass, RowList/LinkRow, Section, SubPageHeader, TabHeader,
                                  SettingsButton, OriginalToggle, Choice (also a bar with a hidden legend),
                                  Stepper (− field +, the number can be typed, D-054), SearchField,
                                  MessageState, Page, SubNav, Toast, Sheet (a bottom sheet on the native
                                  modal <dialog>, D-049; slides in and out, index.css, D-054)
    components/                   TabBar, EmergencyCard (112), FoodList, GuideList, food guide parts
    guides/                       useGuides/useGuideSearch and GuideCategoryScreen, the frame the three guide
                                  categories share (header, search, results)
    food/                         Food keeping times: search ranking, formatting, useFoodSearch (pure parts tested)
    forraad/                      Forråd (D-046–D-054): store, month and water arithmetic, stock-list
                                  recommendations, item sheet (a counter), water sheet, adding (scan page
                                  with a continuous camera, typing sheet) and the edit page on shared
                                  fields (useItemDraft, ItemFields, NameField), sizes (number and unit),
                                  barcode lookup and the scanner (zxing-wasm on the frame region only,
                                  D-055), backup file, the water tile on Home
    supplies/checklist.ts         Stock-list ticks driven by Forråd (D-048)
    map/                          Offline maps (D-036): map worker, downloads, places, position
    compass/                      Compass sensor and maths (D-045)
    sun/                          Sunrise, sunset and twilight from a place and a day (NOAA equations),
                                  the chosen place, the town list and the graph through the year (D-056)
    food/groups.ts                The groups that divide Opbevaring and Dyrkning (D-057)
    bookmarks/, settings/, pwa/   Saved items, preferences and theme, offline status and updates
    screens/                      One file per page
  e2e/                            Playwright tests in WebKit, offline
```

**When writing new code:** keep values on the device with `createLocalStore`; ask the pack with `useDbQuery`; format with `i18n/format.ts`; build pages from the primitives in `components/ui.tsx`; give every user-facing text a key in both languages. `tsc` refuses unused imports and variables.

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
- **Guides (D-039):** `guide_search` (FTS5) over title, name and all shown text plus the source's words; titles only for one or two letters.

## 5a. Pack schema (version 13)

Defined in `content/lib/pack.ts`; manifest type in `content/schema/pack.ts`.

- `meta` (packId, version, schemaVersion, createdAt)
- `sources`: id, title, publisher, url, lang, license, licence URL, attribution, retrieval date, data version. Only sources the pack uses.
- `storage_items`, `storage_periods`, `storage_notes`: one row per item / period / note, with source field names kept for traceability.
- `storage_search`: FTS5 index (see §5).
- `sources.short_name`: the short label shown next to guide text (version 3).
- `produce_blocks.recipe`: a step-by-step recipe as JSON (title, intro, facts, ingredients, steps; version 5, D-035).
- Food guides (version 3, D-033): `produce_sections` (item, order, section, verdict), `produce_blocks` (item, section, order, Danish text, original quote, source id, locator), `produce_ethylene` (item, Handbook 66 storage groups, producer, sensitive) and `produce_relations` (item, other item, `apart` | `with`). Relations are computed at build time from Handbook 66 Table 1: `apart` when one produces significant ethylene and the other is sensitive; `with` when they share a storage group, have no conflict and are both producers or both not.

- Guides (version 6, D-037; growing in version 8, D-038: `guides.food_id`, `guide_blocks.source_id`, block kind `section`; `guide_search` FTS5 since version 7): `guides` (id, category, order, title, summary, source, risk, owner checked, related ids), `guide_blocks` (guide, order, kind `heading` | `text` | `steps` | `list` | `warning` | `image`, title, text, items JSON, step photos JSON, image, alt, caption, source page), `guide_images` (file name, MIME type, bytes; only images in use) and `guide_checks` (guide, order, second-authority source, locator, quote, note).

Build: `cd content && npm run build:pack`. Output goes to `content/dist/core/` (not committed). Pack version = `content/package.json` version.

## 6. Offline guarantees

- No runtime dependency on any network resource (`AGENTS.md` §4).
- Verified by running the production build on an iPhone in airplane mode from a fresh install.
- Every dependency added is checked for hidden network access.

## 7. Deferred subsystems

- **Downloadable packs (M4):** download to temporary storage, verify size and checksum against the manifest, then switch atomically; the previous pack stays until the new one is verified.
- **Offline maps (M5, D-036):** `web/src/map/` holds a PMTiles reader (`pmtiles.ts`), the area-to-tiles maths and range merging (`area.ts`), the manifest (`manifest.ts`), the tile provider (`tiles.ts`), the style (`style.ts`) and the lazily loaded `MapView.tsx`; MapLibre reads tiles through the `stead://` protocol. Downloaded areas: `map.worker.ts` (OPFS pool `stead-maps`, separate from the pack; `maps.db` holds areas, resume points and the home point; one `area-<id>.db` per area with `tiles(z, x, y, data)`), reached through `client.ts`; `AreaPanel.tsx` is the UI. The worker reads the hosted archive at `../stead-maps/dk/` (same origin) by range requests; the dev server answers that path from `web/dist-map/`, the preview server used by the tests from `web/e2e/fixtures/stead-maps/` (`scripts/map/make-fixture.ts`). `web/public/map/` holds the bundled overview and the fonts and sprites (precached). `web/scripts/map/` builds archives from a pinned Protomaps build (`build-map.ts`, `write-pmtiles.ts`); boundaries are in `content/map/boundaries/`. Local full builds go to `web/dist-map/` (not committed).
