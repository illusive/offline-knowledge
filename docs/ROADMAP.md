# Roadmap

## Done: M0 — Documentation and decisions

- [x] Product scope and decisions recorded (`PROJECT.md`, `DECISIONS.md`).
- [x] Content policy, proposed architecture, open questions.

## Current: M1 — Vertical slice

Goal: one end-to-end path from source to an offline guide on an iPhone.

- [x] Source registry started (`content/sources/registry.json`): 2 UK OGL sources verified, with snapshots and checksums (D-011).
- [ ] Danish source: send the reuse request to Styrelsen for Samfundssikkerhed (D-012). If no grant arrives during M1, M1 ships English guides with a Danish + English UI, and the Danish guide moves to M2.
- [ ] 3–5 **low-risk** pilot guides. First: "Home emergency supplies for 3 days" from the UK Be Ready checklist. Others need further sources (e.g. storing drinking water, drying food).
- [x] Food storage import (D-014, D-017): the 101 fresh fruits and vegetables from FoodKeeper (version 128, 2018-09-06) are imported into `content/storage/foodkeeper-produce.json`; tested and cross-checked against the source.
- [x] Danish names checked: all 101 approved by the project owner (2026-10-24).
- [ ] Decide the guide file format (Markdown + front matter or JSON) together with the pipeline's dependencies.
- [x] Pack build (D-018): `npm run build:pack` validates, then writes `pack.sqlite` + `manifest.json` (currently 101 storage items, about 150 KB).
- [ ] Guides in the pack (after the guide format is decided).
- [x] Minimal Expo app (D-019): storage lookup (search list + detail, Danish/English, light/dark) runs in the iOS Simulator (debug build). Verified: pack opens and passes its launch check, trigram search on device ('kal' finds all six kål items, exact match first), source notes and attribution, dark mode, largest accessibility text size.
- [ ] Guide reader once the first guide exists.
- Verify the production build on an iPhone in airplane mode from a fresh install.

Acceptance: a fresh install with no network shows the pilot guides, search finds them (in both languages if a Danish guide is cleared), and each guide shows its sources and licenses.

## M2 — Breadth and design system

- Content across all low and elevated risk categories.
- Design tokens, component primitives, light/dark theme.
- Accessibility pass: Dynamic Type at the largest sizes, VoiceOver, contrast.
- Empty, loading and error states.

## M3 — High-risk content

- First aid, water treatment, food safety, electricity under the `high` process (`CONTENT_POLICY.md` §6).
- Second-source cross-check workflow in place.

## M4 — Downloadable packs

- Optional packs, atomic update with integrity verification (`ARCHITECTURE.md` §7).
- Tests for interrupted downloads, low storage and restarts.

## M5 — Offline maps proof of concept

- MapLibre rendering fully offline on an iPhone with local style, fonts, sprites and tiles.
- Tile source with a license that permits offline storage.
- Then decide whether maps enter the product.
