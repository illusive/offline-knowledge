# Architecture

> **Status: proposed.** Nothing is implemented yet. Library versions are chosen and verified for compatibility at scaffolding time (M1) and recorded in `DECISIONS.md`.

## 1. Overview

Two separate parts, matching `AGENTS.md` §6 (separate ingestion from runtime consumption):

```
content/   Build-time pipeline: sources → guides → validated, versioned pack
app/       Expo iOS app: reads the bundled pack, never fetches or transforms content
```

The app depends only on the pack format, not on how the pack was produced.

## 2. Content pipeline (`content/`)

```
content/
  sources/        Source registry (registry.json), snapshots, reuse requests
  storage/        Food storage data: generated imports + Danish names (names-da.json)
  guides/         One file per guide per language (format not decided yet)
  schema/         Shared TypeScript types
  lib/            Pure mapping/validation code (unit tested)
  scripts/        Entry points: import-foodkeeper, later validate and build-pack
  test/           node:test tests
  dist/           Build output (pack.sqlite, manifest.json) — not committed

Commands (in `content/`): `npm run typecheck`, `npm test`, `npm run import:foodkeeper`.
```

- **Validate:** schema check, every block has a `sourceRef`, every source has a verified license, risk-level requirements met, only `published` guides selected.
- **Build:** produces a SQLite database with an FTS5 index plus `manifest.json`. Fails on any validation error.
- The build output is copied into the app as a bundled asset.

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

## 4. App (`app/`)

Candidate stack (per `AGENTS.md` §5, to verify at M1): Expo, Expo Router, expo-sqlite, TypeScript strict. Styling and icon libraries are decided at M1/M2.

Proposed structure:

```
app/
  src/
    app/          Routes / screens (presentation)
    components/   Reusable UI primitives and content renderers
    theme/        Design tokens: spacing, typography, color (light/dark), radii
    domain/       Content types, guide/search use cases
    data/         SQLite access, pack loading, schema migrations
    i18n/         UI strings (da, en)
```

- On first launch, the bundled pack is copied to app storage (if needed) and opened read-only.
- User data (e.g. bookmarks, if decided later) lives in a separate database, so replacing a pack never touches user data.
- The app does no network requests in v1. Fonts, icons and images are all bundled.

## 5. Search

- Search runs fully on-device against the prebuilt FTS5 index in the pack.
- **Storage names (implemented, D-018):** table `storage_search`, one row per item per language (name, subtitle, English keywords), tokenizer `trigram remove_diacritics 1`. Verified: 'kål' finds Grønkål/Blomkål/Rosenkål/Kålrabi, 'kal' finds 'kål', 'potato' finds Kartofler. 'ø' and 'æ' are separate letters and are not folded.
- Queries under 3 characters return nothing from a trigram index; the app falls back to a prefix match on names.
- Ranking: plain `bm25` ranks 'Grønkål' above 'Kål' for 'kål'. The app should rank exact and prefix name matches first.
- **Guides (not built yet):** title, summary, tags and block text. Choose between trigram and `unicode61` when guide text exists; test with real Danish queries.

## 5a. Pack schema (version 1)

Defined in `content/lib/pack.ts`; manifest type in `content/schema/pack.ts`.

- `meta` (packId, version, schemaVersion, createdAt)
- `sources`: id, title, publisher, url, lang, license, licence URL, attribution, retrieval date, data version. Only sources the pack uses.
- `storage_items`, `storage_periods`, `storage_notes`: one row per item / period / note, with source field names kept for traceability.
- `storage_search`: FTS5 index (see §5).

Build: `cd content && npm run build:pack`. Output goes to `content/dist/core/` (not committed). Pack version = `content/package.json` version.

## 6. Offline guarantees

- No runtime dependency on any network resource (`AGENTS.md` §4).
- Verified by running the production build on an iPhone in airplane mode from a fresh install.
- Every dependency added is checked for hidden network access.

## 7. Deferred subsystems

- **Downloadable packs (M4):** download to temporary storage, verify size and checksum against the manifest, then switch atomically; the previous pack stays until the new one is verified.
- **Offline maps (M5):** separate subsystem, proof of concept first (D-008).
