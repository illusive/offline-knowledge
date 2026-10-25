# Open Questions

Unresolved questions and working assumptions. When one is resolved, move the outcome to `DECISIONS.md` and remove it here.

## Platform (being tested)

0. **PWA instead of a native app?** Raised 2026-10-25. Reasons to consider it: TestFlight builds expire after 90 days, which is risky for an emergency app (D-009); no Apple developer account or review; Android for free. Risks: storage deletion and quota on iOS, EU policy history (home-screen web apps were briefly removed in the EU in 2024), large offline maps later.
   - WebKit's policy (webkit.org/blog/14403): an origin may use up to 60 % of total disk; Home Screen web apps get the same quota as Safari; persistent mode exempts storage from eviction and is granted "based on heuristics like whether the website is opened as a Home Screen Web App".
   - Test page: `pwa-spike/` (SQLite WebAssembly 3.53.4 + OPFS "opfs-sahpool"). In the iOS 26 Simulator (Safari): pack imported into OPFS, trigram search works ('kal' → 6 results in 6 ms), a 1 GB OPFS write completed. Not yet tested on a real iPhone: quota, persistent mode, airplane mode, survival over days and reboots.
   - **Real iPhone, 2026-10-25** (test page on GitHub Pages, https://illusive.github.io/prep-storage-test/, added to the Home Screen and opened from there): persistent storage **granted**; 256 MB, 1 GB and 4 GB OPFS writes all **completed**; search ('kål') works online and in **airplane mode**. Quota number not yet recorded.
   - Still to check: data survives a reboot and several days without use ("First seen" keeps its date).
   - The native app (`app/`, D-019/D-020) is kept until this is decided.

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
4. **Expert review for high-risk guides.** `AGENTS.md` §6 says content that needs expert review stays unpublished until reviewed. Does a close-to-verbatim restructuring of Tier 1–2 authority guidance, checked by the project owner against two sources, meet that bar? Or does first aid / water / food safety need a qualified reviewer? Until this is decided, no `high` guide is published. Must be resolved before M3.
5. **Re-check interval.** How often should published guides be re-checked against their sources?
6. **Images.** Which illustration sources have suitable licenses, and what is the size budget for images in the core pack?

## Food storage data (FoodKeeper)

14. **Unqualified times.** FoodKeeper has both "from date of purchase" columns (`DOP_*`, added in data version 115, 2015) and older columns without a stated starting point. Herbs, for example, only have the older kind. The app must not present `unspecified` as "from purchase". How should it be worded in the UI?
15. **Contradictions in the source.** Example: Taro lists 2–3 days in the fridge and the note "Refrigeration not recommended." Show both as the source does, or hold such items back? Working assumption: show both, as in the source.
16. **US assumptions.** "Pantry" means room temperature in a US home; freezer times assume 0 °F (−18 °C). Danish homes often have a cool cellar or utility room. Do we need to say what each location assumes? (Possible source for cellar conditions: USDA Agriculture Handbook 66, once cleared.)
17. **Data age.** The data is from 2018-09-06 (version 128). Show "data from 2018" in the app, and check for a newer FoodKeeper release before each pack build.

## Product

7. **App name.** "Offline Knowledge" is the working name.
8. **UI language.** Does the interface follow the device language, or is it a setting? Working assumption: follow the device, with a manual override.
9. **Mixed-language browsing.** Are all guides shown regardless of language, or filtered by language with an option to show all? Working assumption: show all, labeled by language.
10. **Bookmarks / personal notes.** Are they in scope for v1? Working assumption: not in v1.

## Technical

18. **Bundle identifier.** `app/app.json` uses the placeholder `com.example.offlineknowledge`. Choose a real identifier before the first device or TestFlight build.
19. **Old pack copies.** Each new pack version is imported as a new database file (D-019); old files stay on the device until a cleanup step is added (needed before M4 at the latest).
20. **Text size changes while running.** In the Simulator, app text picked up a new Dynamic Type size only after the app was restarted (the native header updated at once). Check on a device; React Native should normally re-render on font scale changes.
21. **Linting.** No linter yet. `npx expo lint` would add ESLint with Expo's config; decide when setting up the app's checks.

11. **Danish search quality.** Storage names use a trigram index (D-018), which handles compound words. Still open: guide text search (trigram or `unicode61`), and inflection (e.g. 'gulerod' does not match 'gulerødder').
12. **Pack size budget.** Target maximum size for the bundled core pack.
13. **Map tile source (M5).** Which dataset or provider permits offline storage and redistribution?
