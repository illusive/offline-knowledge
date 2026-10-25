# Roadmap

## Done: M0 — Documentation and decisions

- [x] Product scope and decisions recorded (`PROJECT.md`, `DECISIONS.md`).
- [x] Content policy, proposed architecture, open questions.

## Current: M1 — Vertical slice

Goal: one end-to-end path from source to an offline guide on an iPhone.

- [x] Source registry started (`content/sources/registry.json`): 2 UK OGL sources verified, with snapshots and checksums (D-011).
- [ ] Danish source: use Danish authority guidance (e.g. Styrelsen for Samfundssikkerhed, "Forberedt på kriser") directly; reuse requests paused (D-028).
- [ ] 3–5 **low-risk** pilot guides. First: "Home emergency supplies for 3 days" from the UK Be Ready checklist. Others need further sources (e.g. storing drinking water, drying food).
- [x] Food storage import (D-014, D-017): the 101 fresh fruits and vegetables from FoodKeeper (version 128, 2018-09-06) are imported into `content/storage/foodkeeper-produce.json`; tested and cross-checked against the source.
- [x] Danish names checked: all 101 approved by the project owner (2026-10-24).
- [ ] Decide the guide file format (Markdown + front matter or JSON) together with the pipeline's dependencies.
- [x] Pack build (D-018): `npm run build:pack` validates, then writes `pack.sqlite` + `manifest.json` (currently 101 storage items, about 150 KB).
- [ ] Guides in the pack (after the guide format is decided).
- [x] ~~Minimal Expo app (D-019)~~: built and tested in the Simulator, then replaced by the PWA (D-021). Code in Git history (`f301841`).
- [x] iOS PWA storage test (`pwa-spike/`): persistent storage, 4 GB, airplane mode verified on a real iPhone. Running: reboot and multi-day check.
- [x] PWA app (D-021–D-023, `web/`): food storage lookup (search + detail, Danish/English, light/dark), installable, offline. Unit tests and WebKit offline tests pass.
- [x] Published on GitHub Pages via GitHub Actions (D-030): https://illusive.github.io/offline-knowledge/ — all cached files served; online and offline search verified in WebKit against the live site (2026-10-25).
- [ ] Test the live app on the iPhone from the Home Screen (install, airplane mode, VoiceOver last).
- [x] App shell to the design brief (D-024, D-025): name "stead", Inter, tokens (lime/ink/paper, light and dark), tab bar (Home, Tools, Settings), Home with search, the "Storing food" category and the 112 emergency card. Tools and Settings are placeholders until their steps.
- [ ] Bookmarks (D-026): local store separate from the pack; "Saved" on Home.
- [ ] Settings: offline library card from the pack manifest, language, appearance, text size, about and sources.
- [ ] Tools: supply checklist (UK Be Ready, progress on the device) and compass (permission, no-sensor and inaccuracy states; test on a real iPhone).
- [ ] Guide reader once the first guide exists.
- [ ] Verify on an iPhone: fresh install from the Home Screen, then airplane mode.

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
