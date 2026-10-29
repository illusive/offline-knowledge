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
- [x] Feedback round (2026-10-25): search placeholder "Søg", green "Klar offline" status, first-launch download progress, Danish translation of storage notes with a switch to the original (D-031), "Brug dine sanser" pill (D-032).
- [ ] Food guides for all 101 foods (D-033). **Status 2026-10-26: 21 of 101 written and checked by the build.** Format agreed on Kartofler and Agurker. Done: 248 æbler, 249 abrikoser, 250 avocadoer, 251 bananer, 252 kirsebær/stikkelsbær/litchi, 253 brombær/boysenbær/ribs, 254 blåbær, 256 citrusfrugter, 258 kokosnødder, 259 tranebær, 260 dadler, 261 vindruer, 262 guava, 263 kiwi, 268 madbananer, 283 agurker, 297 kartofler, 414 kumquats (verdicts only), 481 jordbær, 482 hindbær, 483 kirsebær.
  - **Continue from here (batch 4, fruit):** 264 meloner, 495 vandmelon, 496 cantaloupe, 497 honningmelon, 265 papaya/mango/feijoa/passionsfrugt, 266 ferskner/nektariner/blommer/pærer/sapote, 267 ananas, 269 granatæble, 255 cherimoya, 478 stjernefrugt, 479 kaktusfigen, 480 dragefrugt. The Handbook 66 chapters and NCHFP recipe pages for these are already registered and were read; nothing was written for them yet.
  - **Then:** vegetables (270–308 and 415–423, 491–494, 547–550, 596–600, 640–678), then herbs (288, 505–513, 611), then the processed items (257, 493, 508, 562, 570; see OPEN_QUESTIONS).
  - **Then:** shared method guides for drying, pickling and canning; replace the one image-transcribed potato quote with the NCHFP page; e2e check of a guide page.
  - Food pages are split into Om / Holdbarhed / Konservering / Kilder (D-034). When writing drying, pickling and canning, use recipes with numbered steps (`r(...)` in `content/authoring/mk.py`, D-035), look for a Danish pickle recipe first (D-034), and end canned recipes with the "Sådan opbevarer du henkogte glas" recipe. **Æbler is done this way; the other 20 written guides still use paragraphs and need converting.**
  - How to work: `content/authoring/README.md`.
- [ ] Growing food (D-038). **Status 2026-10-27: 19 crops** (radiser, ærter, kartofler, gulerødder, hestebønner, salat, spinat, løg, porrer, rødbeder, jordbær, hvidløg, jordskokker, rabarber, krydderurter, tomater, kål, broccoli, busk- og stangbønner; salat/spinat/løg are short, from Bolius' "10 nemme afgrøder"; hvidløg/jordskokker/rabarber/krydderurter from "5 afgrøder, der er dyre i butikkerne"). Next ideas: grønkål, blomkål, squash (Bolius has no own page), persille, bærbuske, and fuller pages for salat/spinat/løg. How: find the crop's Bolius page, snapshot it to `content/sources/snapshots/dk-bolius-<crop>.html`, register it, write `content/guides/growing/<id>.json`; `npm run build:pack` checks the text. Watch for sentences that are about another crop in the source.
- [x] Home to the design brief: first aid card, category tiles with counts (2026-10-27).
- [x] Bookmarks (D-026): "Gem" on guides, crops and foods; saved list by category, opened at the current category; green asterisk for offline ready (2026-10-27).
- [ ] Settings: offline library card from the pack manifest, language, appearance, text size, about and sources.
- [ ] Tools: supply checklist (UK Be Ready, progress on the device) and compass (permission, no-sensor and inaccuracy states; test on a real iPhone).
- [x] Guide reader (D-037): `#/first-aid` list and `#/guide/<id>` with steps, step photos, warnings, the 112 card, source with pages and "Sammenholdt med" line.
- [ ] Verify on an iPhone: fresh install from the Home Screen, then airplane mode.

Acceptance: a fresh install with no network shows the pilot guides, search finds them (in both languages if a Danish guide is cleared), and each guide shows its sources and licenses.

## M2 — Breadth and design system

- Content across all low and elevated risk categories.
- Design tokens, component primitives, light/dark theme.
- Accessibility pass: Dynamic Type at the largest sizes, VoiceOver, contrast.
- Empty, loading and error states.

## M3 — High-risk content

- First aid, water treatment, food safety, electricity under the `high` process (`CONTENT_POLICY.md` §6).
- [x] Second-source cross-check in place for guides: quotes from the second authority are checked by the build (`content/lib/guides.ts`).
- [ ] First aid from Førstehjælpens ABC (D-037), about 20 guides. **Status 2026-10-27: 11 written, verbatim-checked by the build, not yet owner-checked.** Done: tre-hovedpunkter, skab-sikkerhed, bevidsthed, mabc, massive-bloedninger (tourniquet left out, D-037), frie-luftveje, vejrtraekning, stabilt-sideleje, hlr-voksne, hjertestarter, hlr-boern (OPEN_QUESTIONS 29).
  - Done 2026-10-27: search, main points section, abbreviations explained, "<M>" removed.
  - **Next:** the "Når der ikke kommer hjælp" section (D-037): register and snapshot the US field manuals (download needs the owner's OK), pick the problem list, then write handbook + field-manual pages per problem.
  - **Then:** kredsløbssvigt (p. 38–40), ikke livstruende blødninger and trykforbinding (p. 41–43, photos p. 43), ring 1-1-2 (p. 46–49), fremmedlegeme i luftvejene (p. 60–65), drukneulykker (p. 68), forbrændinger (p. 100), underafkøling (p. 102), alvorlige allergiske reaktioner (p. 129), stroke (p. 122), brystsmerter (p. 124). Second authority for these: `dk-drg-erc-first-aid-2025` (choking p. 10, anaphylaxis p. 9–10, stroke p. 13, chest pain p. 11, burns and hypothermia further on).
  - How to work: write `content/guides/first-aid/<id>.json` from `content/sources/text/dk-fsk-abc-foerstehjaelp.txt` (page markers `--- pNN`); crop photos with `content/scripts/render-pdf-region.swift`, save as JPEG in `content/guides/images/`; `npm run build:pack` lists any text that is not verbatim.

## M4 — Downloadable packs

- Optional packs, atomic update with integrity verification (`ARCHITECTURE.md` §7).
- Tests for interrupted downloads, low storage and restarts.

## M5 — Offline map trial (D-036, started 2026-10-26)

- [x] Slice 1 — measured: Denmark z15 591 MB, regions 78–174 MB, 25 km radius 25–45 MB; GitHub Pages answers range requests; our PMTiles reader and writer checked against the reference library.
- [x] Slice 2 — Kort tab with the bundled overview (z0–8), offline style, fonts and icons; offline WebKit test (renders, no request leaves the app's host); light and dark checked.
- [x] Denmark archive published from `illusive/stead-maps` (GitHub Actions runs `web/scripts/map/build-map.ts` for the build date in `map-version.txt`): https://illusive.github.io/stead-maps/dk/ — 575 MB in 9 parts; the build is reproducible (same size as the local build).
- [x] Slice 3 — area download: "Hent kort" panel on Kort with radius around home (10/25/50 km; home by tapping the map or the position once), region and whole country; exact size and free space shown first; downloads in `map.worker.ts` into OPFS (one SQLite file per area), 1 MB ranges, resume after interruption, check that every planned tile is stored. Offline tests: download → detail drawn offline → delete; interrupted download pauses, keeps its tiles and resumes. Low-storage: the download button is disabled when the size exceeds the free space (not yet tested on a full device).
- [x] Owner feedback round: online detail everywhere; offline notice for areas not downloaded; guided download flow shown before the map when nothing is downloaded (tests: flow → download → offline detail → delete; resume; notice).
- [x] Slice 4 — Kort opens zoomed in on the home point when one is set (no permission, offline); "Vis min position" button: permission asked when switched on, map flies to the first fix, accuracy circle, "finding" / "not found, try outdoors" / "refused" messages, remembered on the device, only while the map is open. Tests: position on/off, refusal, opens at home. Still to check on the iPhone in airplane mode.
- [x] Slice 5 — each area shows its map date ("Kort fra 24. oktober 2026"); when a newer map is published, "Hent den nye udgave" downloads it next to the old copy, which keeps working and is deleted only when the new one is complete and checked (tested with a preview-server switch that announces a newer version).
- [ ] Slice 6 — iPhone: install, download a 25 km radius, airplane mode, reboot, still renders; position on and off.
