# Open Questions

Unresolved questions and working assumptions. When one is resolved, move the outcome to `DECISIONS.md` and remove it here.

## Platform (PWA, D-021)

0. **Long-term persistence on iOS.** Accepted on the basis of WebKit's documented policy (persistent mode exempts storage from eviction) and the granted persistent storage on your iPhone. Kept as an informal check, not a blocker: if "First seen" on the test page ever resets, revisit D-021.
0b. **Production hosting.** GitHub Pages for now (D-023). Still to decide: publish from a separate public repository or from this one, and whether to move to another host later.
0c. **Update flow.** How a new app or pack version is installed safely, and how the user is told, without breaking the working offline copy (AGENTS.md §7).

## Content and licensing

1. **Danish authority reuse terms.** None of the Danish candidates checked so far publish reuse terms (samsik.dk, foedevarestyrelsen.dk, 2026-10-24). Route: reuse requests under D-012.
   - Styrelsen for Samfundssikkerhed, "Forberedt på kriser": request drafted (`content/sources/requests/samsik-videreanvendelse.md`), **not yet sent**.
   - Fødevarestyrelsen, Sundhedsstyrelsen, Dansk Førstehjælpsråd: not yet requested.
1a. **Candidate sources to clear** (status in `content/sources/registry.json`):
   - Food storage: USDA FoodKeeper (cleared, CC0); UK FSA chill/freeze/defrost (cleared, OGL); USDA Agriculture Handbook 66 (needs per-chapter authorship check).
   - From Kiwix collections, likely public domain as US federal works, each to verify: USDA *Complete Guide to Home Canning*; EPA *Giardia: Drinking Water Factsheet*; DoD *Emergency War Surgery*; US Army/Navy/Air Force *First Aid* field manual; USMC *Wilderness Medicine Course* handbook; USMC *Knots, Splices, Attachments and Ladders*. Pre-1930 and likely public domain: A. Hyatt Verrill, *Knots, Splices and Rope Work* (1917).
   - Need the publisher's permission: Hesperian (*Where There Is No Doctor*, *Where There Is No Dentist*; digital use needs permission); state and university extension publications (Washington State DOH, Michigan State, University of Georgia, University of Tennessee); FAO (check each document's licence).
   - Danish, reuse act route: Forsvarets Sanitetskommando (ABC Førstehjælp), Region Syddanmark. Private, permission needed: ØKO-Portalen / L&F (including its vegetable storage section). Excluded: Falck Førstehjælpsbogen.
2. **"WikiHealth".** Which source was meant: a specific medical wiki, Wikipedia's medical articles, or something else? Its license and editorial process determine its tier.
3. **International sources.** Verify per document; for example, many WHO publications carry non-commercial licenses, which would trigger the `nonCommercial` flag.
4. **Expert review for high-risk guides.** Resolved by D-027 (verbatim only; owner check of exact reproduction).
5. **Re-check interval.** How often should published guides be re-checked against their sources?
6. **Images.** Which illustration sources have suitable licenses, and what is the size budget for images in the core pack?

## Food storage data (FoodKeeper)

14. **Unqualified times.** FoodKeeper has both "from date of purchase" columns (`DOP_*`, added in data version 115, 2015) and older columns without a stated starting point. Herbs, for example, only have the older kind. The app must not present `unspecified` as "from purchase". How should it be worded in the UI?
15. **Contradictions in the source.** Example: Taro lists 2–3 days in the fridge and the note "Refrigeration not recommended." Show both as the source does, or hold such items back? Working assumption: show both, as in the source.
16. **US assumptions.** "Pantry" means room temperature in a US home; freezer times assume 0 °F (−18 °C). Danish homes often have a cool cellar or utility room. Do we need to say what each location assumes? (Possible source for cellar conditions: USDA Agriculture Handbook 66, once cleared.)
17. **Data age.** The data is from 2018-09-06 (version 128). Show "data from 2018" in the app, and check for a newer FoodKeeper release before each pack build.

## Product

7. **App name.** Resolved: "stead" (D-024). Trademark and domain not checked.
8. **UI language.** Does the interface follow the device language, or is it a setting? Working assumption: follow the device, with a manual override.
9. **Mixed-language browsing.** Are all guides shown regardless of language, or filtered by language with an option to show all? Working assumption: show all, labeled by language.
10. **Bookmarks.** Resolved: in v1, on the device only (D-026). Personal notes remain out of scope.

## Design (D-025)

24. **Typeface.** The brief's font is not identified. Use the system font, or bundle a specific open-licence font with the app (never loaded at runtime)?
25. **Tab bar at large text sizes.** Four labelled tabs overflow at accessibility text sizes; choose a fallback (e.g. icons with labels underneath, or labels hidden with accessible names kept).
26. **Brand mark.** The brief shows "stead" with an asterisk mark; the placeholder app icon (open book) should be replaced to match.

## Technical

19. **Old pack copies.** Each new pack version is imported as a new database file in OPFS; old files stay until a cleanup step is added (needed before M4 at the latest).
21. **Linting.** No linter yet in `web/`; add ESLint (React and TypeScript rules) or decide against it.
22. **App icon.** `web/public/icon-*.png` are generated placeholders (open book on the accent colour). Needs a designed icon.
23. **Unused SQLite worker files.** The build also emits SQLite's own worker helpers (`sqlite3-worker1`, `sqlite3-opfs-async-proxy`), about 40 KB, which the app does not use but caches. Harmless; remove if a clean way appears.

11. **Danish search quality.** Storage names use a trigram index (D-018), which handles compound words. Still open: guide text search (trigram or `unicode61`), and inflection (e.g. 'gulerod' does not match 'gulerødder').
12. **Pack size budget.** Target maximum size for the bundled core pack.
13. **Map tile source (M5).** Which dataset or provider permits offline storage and redistribution?
