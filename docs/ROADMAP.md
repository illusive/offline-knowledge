# Roadmap

## Done: M0 — Documentation and decisions

- [x] Product scope and decisions recorded (`PROJECT.md`, `DECISIONS.md`).
- [x] Content policy, proposed architecture, open questions.

## Current: M1 — Vertical slice

Goal: one end-to-end path from source to an offline guide on an iPhone.

- [x] Source registry started (`content/sources/registry.json`): 2 UK OGL sources verified, with snapshots and checksums (D-011).
- [x] Danish source: Danish authority guidance used directly (Styrelsen for Samfundssikkerhed's *Forberedt på kriser*, Fødevarestyrelsen, Miljøstyrelsen, sundhed.dk, the ABC first aid handbook); reuse requests paused (D-028).
- [x] ~~3–5 low-risk pilot guides~~: overtaken by "Når det sker" (D-040), whose stock lists replace the planned UK Be Ready supplies guide.
- [x] Food storage import (D-014, D-017): the 101 fresh fruits and vegetables from FoodKeeper (version 128, 2018-09-06) are imported into `content/storage/foodkeeper-produce.json`; tested and cross-checked against the source.
- [x] Danish names checked: all 101 approved by the project owner (2026-10-24).
- [x] Guide file format: JSON per guide in `content/guides/<category>/`, typed by `content/schema/guide.ts` and validated by `content/lib/guides.ts` (pipeline D-016, guide model D-037).
- [x] Pack build (D-018): `npm run build:pack` validates, then writes `pack.sqlite` + `manifest.json`. **2026-11-05:** schema 13 (stock-list amounts and keywords, D-046), 101 storage items, 21 food guides, 43 guides, 75 sources; about 2.6 MB.
- [x] Guides in the pack: first aid, growing and "Når det sker", with blocks, checks, sources per block and search.
- [x] ~~Minimal Expo app (D-019)~~: built and tested in the Simulator, then replaced by the PWA (D-021). Code in Git history (`f301841`).
- [x] iOS PWA storage test (`pwa-spike/`): persistent storage, 4 GB, airplane mode verified on a real iPhone; reboot and multi-day use since confirmed by the owner's regular use.
- [x] PWA app (D-021–D-023, `web/`): food storage lookup (search + detail, Danish/English, light/dark), installable, offline. Unit tests and WebKit offline tests pass.
- [x] Published on GitHub Pages via GitHub Actions (D-030): https://illusive.github.io/offline-knowledge/ — all cached files served; online and offline search verified in WebKit against the live site (2026-10-25).
- [x] Live app tested on the iPhone from the Home Screen, including airplane mode; the owner tests on the phone regularly (confirmed 2026-11-05). VoiceOver belongs to the M2 accessibility pass.
- [x] App shell to the design brief (D-024, D-025): name "stead", Inter, tokens (lime/ink/paper, light and dark), tab bar (then Home, Tools, Settings; now Hjem, Kort, Forråd, Værktøjer, D-046), Home with search, the "Storing food" category and the 112 emergency card. Tools and Settings are placeholders until their steps.
- [x] Feedback round (2026-10-25): search placeholder "Søg", green "Klar offline" status, first-launch download progress, Danish translation of storage notes with a switch to the original (D-031), "Brug dine sanser" pill (D-032).
- [ ] Food guides for all 101 foods (D-033). **Status 2026-10-26: 21 of 101 written and checked by the build.** Format agreed on Kartofler and Agurker. Done: 248 æbler, 249 abrikoser, 250 avocadoer, 251 bananer, 252 kirsebær/stikkelsbær/litchi, 253 brombær/boysenbær/ribs, 254 blåbær, 256 citrusfrugter, 258 kokosnødder, 259 tranebær, 260 dadler, 261 vindruer, 262 guava, 263 kiwi, 268 madbananer, 283 agurker, 297 kartofler, 414 kumquats (verdicts only), 481 jordbær, 482 hindbær, 483 kirsebær.
  - **Continue from here (batch 4, fruit):** 264 meloner, 495 vandmelon, 496 cantaloupe, 497 honningmelon, 265 papaya/mango/feijoa/passionsfrugt, 266 ferskner/nektariner/blommer/pærer/sapote, 267 ananas, 269 granatæble, 255 cherimoya, 478 stjernefrugt, 479 kaktusfigen, 480 dragefrugt. The Handbook 66 chapters and NCHFP recipe pages for these are already registered and were read; nothing was written for them yet.
  - **Then:** vegetables (270–308 and 415–423, 491–494, 547–550, 596–600, 640–678), then herbs (288, 505–513, 611), then the processed items (257, 493, 508, 562, 570; see OPEN_QUESTIONS).
  - **Then:** shared method guides for drying, pickling and canning; replace the one image-transcribed potato quote with the NCHFP page; e2e check of a guide page.
  - Food pages are split into Om / Holdbarhed / Konservering / Kilder (D-034). When writing drying, pickling and canning, use recipes with numbered steps (`r(...)` in `content/authoring/mk.py`, D-035), look for a Danish pickle recipe first (D-034), and end canned recipes with the "Sådan opbevarer du henkogte glas" recipe. **Æbler is done this way; the other 20 written guides still use paragraphs and need converting.**
  - How to work: `content/authoring/README.md`.
- [ ] Growing food (D-038). **Status 2026-10-27: 19 crops** (radiser, ærter, kartofler, gulerødder, hestebønner, salat, spinat, løg, porrer, rødbeder, jordbær, hvidløg, jordskokker, rabarber, krydderurter, tomater, kål, broccoli, busk- og stangbønner; salat/spinat/løg are short, from Bolius' "10 nemme afgrøder"; hvidløg/jordskokker/rabarber/krydderurter from "5 afgrøder, der er dyre i butikkerne"). Next ideas: grønkål, blomkål, squash (Bolius has no own page), persille, bærbuske, and fuller pages for salat/spinat/løg. How: find the crop's Bolius page, snapshot it to `content/sources/snapshots/dk-bolius-<crop>.html`, register it, write `content/guides/growing/<id>.json`; `npm run build:pack` checks the text. Watch for sentences that are about another crop in the source.
- [x] Home to the design brief: first aid card, category tiles with counts (2026-10-27).
- [x] Language pass (D-042): all texts rewritten in plain language, source words kept; review step and follow-ups in `docs/LANGUAGE_REVIEW.md`.
- [ ] "Når det sker" (D-040, D-043). **Status 2026-11-05: 13 guides in three groups**, all with the source words kept (D-042) and "Prøveversion" until reviewed.
  - **Hvis det sker (6):** Strømmen er gået, Der er intet vand (Miljøstyrelsen, Bolius, CDC translated, D-041), Der er ingen varme, Telefon og net er nede, Der er vand i kælderen (Bolius; checked against GOV.UK), Kulilte (sundhed.dk and the ABC handbook; checked against NHS).
  - **Før det sker (3):** Storm (before, during, after; Bolius; checked against Edinburgh City Council), Stormflod og forhøjet vandstand, Snestorm (incl. a car checklist from UK Be Ready).
  - **Hjemmeberedskab (4 stock lists with ticks):** Vand til tre døgn, Mad til tre døgn, Medicin, førstehjælp og hygiejne, Lys, varme og andre ting (samsik's *Forberedt på kriser*; Hjørring Kommune for food).
  - **Next:** a Danish authority source for storm, storm surge and snow (none found yet from the police or Beredskabsstyrelsen); Bolius' groundwater page (needs a browser to fetch); owner decision on adding GOV.UK's "do not touch a switch while standing in water" to Der er vand i kælderen.
- [x] Bookmarks (D-026): "Gem" on guides, crops and foods; saved list by category, opened at the current category; green asterisk for offline ready (2026-10-27).
- [x] Settings (D-044, 2026-11-05): "På telefonen" card (content version and date, counts, size, downloaded maps with a link to Kort, space used), Sprog and Udseende (Følg telefonen / fixed; kept on the device; the theme is set before the first paint), text size follows the phone (Dynamic Type, explained), all pack sources by publisher with links, About. Offline e2e test.
- [x] Tools: compass with "Hold kursen" (D-045, 2026-11-05): turning dial, direction as text (magnetic north), course kept on the device with "Drej N° til højre/venstre"; states for permission (asked after a tap, remembered), refused, uncertain (iOS accuracy) and no compass. Offline e2e tests with a simulated sensor. **Still to check on the iPhone:** real readings, accuracy messages, landscape. The planned supply checklist is covered by the "Hjemmeberedskab" stock lists (D-040, D-043).
- [x] Forråd (D-046, D-047, 2026-11-05): a tab replacing Settings, which moved to a gear at the top right. It holds:
  - Water as one figure (litres and the month last checked) against 3 litres per person per day for 3/7/14 days, checked again after six months.
  - The household, including water for animals in the user's own figure.
  - Expiry by month, and three categories, each linking to its stock list (the "Overvej også" lists were removed for a shorter overview). Household, water unit and backup are in Settings.
  - Quick adding (simplified the same day): a name, a count and a best-before month; category guessed; "Gem og tilføj en til"; suggestions and automatic links to the stock-list lines.
  - Barcode scanning with the bundled reader, plus an optional Open Food Facts lookup; the barcode is remembered offline.
  - Litres or US gallons, and a backup file.

  Tested by offline e2e tests, including a real EAN-13 decoded from a canvas "camera". **Still to check on the iPhone:** scanning with the real camera (permission prompt, focus, speed), saving the copy to Filer and restoring it, and the month/year wheels.
- [x] Whole-app review and clean-up (2026-11-05, D-048):
  - **Concept:** one category order (growing last, a Kort tile on Home), and Forråd now drives the stock-list ticks.
  - **Fixes:**
    - screens no longer stay on "loading" when a query fails
    - a backup restore that fails puts the earlier data back
    - map errors are shown in the user's language
    - the router catches an address change made while the app starts
  - **Shared code:**
    - helpers for stored values, worker requests, pack queries, formatting and page titles
    - UI primitives and one frame for the guide categories
    - `storage/` renamed `food/`
    - the content pipeline's text cleaning and quote checks moved into `content/lib/text.ts`
  - **Tests added:** router, stored values, strings in both languages, backup rollback, registry snapshots and the Home order. `tsc` now refuses unused code.
- [x] Guide reader (D-037): `#/first-aid` list and `#/guide/<id>` with steps, step photos, warnings, the 112 card, source with pages and "Sammenholdt med" line.

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
