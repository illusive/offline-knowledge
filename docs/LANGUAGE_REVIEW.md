# Language review

The language pass (D-042, 2026-10-29) rewrote every guide, food guide, storage note and interface text in plain language. This file holds what came out of it:

1. **Style rules**: how the texts are written, so later texts match.
2. **Suggestions**: inconsistencies and restructures noticed while reading. These are not done yet.
3. **Doubts**: statements to run again because the rewrite may have shifted the meaning, or the source itself is unclear.

The rewrites are unchecked. Before the app is shared, someone reviews them against the source (manual review step, owner decision). In the app, "Vis original" shows the source's own words for every rewritten block.

## 1. Style rules

- **Who we write for:** someone who is stressed, reads slowly or knows nothing about the subject. The text should never feel condescending.
- **Address the reader:** "du", in the imperative ("Ring 112", "Læg personen …"). No passive "skal udføres".
- **Sentences:** one action or fact per sentence. No semicolons; split the sentence instead.
- **Everyday words:**
  - "personen", not "den tilskadekomne"
  - "hjertemassage", not "brystkompressioner"
  - "kog", not "bring i kog"
  - "køkkenskab", not "spisekammer"
  - "uden net", not "offline"
- **Explaining necessary terms:** give the explanation in brackets the first time the word appears, e.g. "ethylen (en gas, som frugt og grønt selv afgiver …)", "pacemaker (en lille dims under huden)", "fiberdug (en tynd, hvid dug …)".
- **Numbers and units:**
  - 112 is always written "112", never "1-1-2".
  - Metric units only: US units (°F, tommer, lb) are removed where a metric value is given.
  - Ranges use an en dash: "3–4 uger".
  - US cups are still printed where the recipe gives no metric amount (see suggestions).
- **Warnings:** start with what to do or not do ("Brug aldrig grill …"), then why.
- **Headings:** short and active, e.g. "Sådan trykker du" or "Hold på varmen nu".
- **Names:** a plain name above the source's own title (`name`), e.g. "Trækker personen vejret?".
- **Safety content:** numbers, times, distances and conditions are carried over unchanged. Nothing is added or left out.

## 2. Suggestions

### First aid
- **Hjertestarter, order:** "Før du sætter elektroderne på" (dry the chest, shave hair, remove plasters and metal) comes after placing the electrodes. Move it before.
- **Hjertestarter, missing first step:** the guide never says "Tænd hjertestarteren, og følg stemmen". The source starts with it, so it should be the first step.
- **Hjertestarter, oxygen line:** the sentence about moving the oxygen mask begins with "Derfor" in the source. The sentence before it, which says why, was not taken in. Take it in.
- **Livsfarlige blødninger:** the guide does not say *how* to stop the bleeding beyond "tryk hårdt". Add the handbook's steps for a pressure bandage, if the handbook has them.
- **Hjertemassage til børn:** the two sentences about what the Defence Forces teach are of no use to the reader. Drop them or put them in a note.
- **Duplicated text:** the summary repeats a block word for word in Gør stedet sikkert, Førstehjælpens 3 trin, Salat and Spinat. Drop one of the two.
- **Names:** "Gør stedet sikkert" is now used both as the guide name and as Trin 1 in "Førstehjælpens 3 trin". Keep them identical if either changes.
- **Children's CPR:** the open question in OPEN_QUESTIONS (rate and depth) is still open.

### Når det sker
- **Repeated warnings:** "Strømmen er gået" repeats the heat and toilet advice that now has its own guides. Shorten it to one line each, with a link ("Se Der er ingen varme").
- **Water and the drain:** in "Der er intet vand", the advice to pour rainwater into the toilet (Bolius) and the advice not to pour water into the drain when the power is out (Bolius) sit next to each other. Both are now shown, joined by "Men:". Better: one rule with its condition ("Kun hvis strømmen virker …").
- **Order in Der er intet vand:** the guide could open with three short steps ("1. Tap vand fra rørene 2. Spar på vandet 3. Kog vand, du ikke ved er rent"), with the details below.
- **The stock list "Vand"** (planned) should reuse "3 liter pr. person pr. døgn" exactly as written here.

### Growing
- **Dangling first words:** some blocks still begin with "Derfor", "Men" or "Dels" because the sentence before was not taken in (e.g. Spinat "Spinat er derfor …", Bønner "I Danmark når …"). Read each crop once more, and take in the missing sentence or drop the block.
- **The F1 explanation** now appears in five crops in the same words. It could become one shared note on the Dyrkning page.
- **Rabarber:** the leaves are poisonous (oxalic acid), and the guide does not say so. Add it from a source.
- **Sections are uneven:** some crops lack "Jord og placering" or "Frø til næste år". Fill them from Bolius or hide empty sections (already done) and accept the difference.

### Food guides
- **US cups** remain in tested USDA recipes ("12 cups sukker"). Suggestion: show "1 cup = 2,4 dl" once on the Konservering tab rather than converting each amount, so the tested amounts are not rounded.
- **Pint and quart jars** are explained in some texts and not in others. Explain them once on the tab: "pint-glas ≈ ½ liter, quart-glas ≈ 1 liter".
- **Ethylen** is now explained the first time in each guide. If people read several guides, a short explanation on the "Sammen med andre" section would be enough.
- **"Køkkenskab" (was "Spisekammer")** is used for FoodKeeper's "pantry". Check that it reads naturally in the storage table and the list subtitles.

### Interface
- **The "Vis original" button** now has two meanings: the source's Danish words (rewrites) and the English original (translations). Consider "Vis kildens ord" for clarity.
- **Search placeholders** in the English interface now say "Search in Danish, e.g. …", because the content is Danish. Consider a note on Home that the content is in Danish.
- **"Konservering"** as a tab name may be unfamiliar. Consider "Tør, sylt og henkog".

## 3. Doubts (run again)

Statements where the plain wording may differ from the source's meaning, or where the source itself is unclear. Each must be checked against the source (and a second authority for first aid) before publishing.

| Guide | Block | Doubt |
|---|---|---|
| Stabilt sideleje | step 5 | Source: "Ret personens knæ i 90 grader". Written as "Læg det øverste ben, så knæet er bøjet i en ret vinkel". Is this the same movement? |
| Stabilt sideleje | warning | Source: "for at forebygge kredsløbssvigt". Written as "så kroppen ikke bliver kold og går i chok". Is "chok" the right plain word here? |
| Hjertestarter | steps 2 and 4 | The shouted commands changed from "alle væk, der analyseres!" / "Her stødes!" to "Alle væk, den måler!" / "Der kommer stød!". Courses may teach fixed phrases. Keep the source's? |
| Hjertestarter | survival line | "op mod 1/3" → "op til hver tredje": same meaning, check the source year. |
| Hjertemassage til børn | list item 3 | "mindst trykke en 1/3 af brystkassen" → "tryk brystet mindst en tredjedel ned". ERC says about one third of the chest depth. Check the wording against DRG. |
| Hjertemassage til børn | list item 2 | "(til brystkassen hæver sig synligt)" → "pust kun, til brystet hæver sig". Check that "kun" does not suggest weaker breaths than intended. |
| Er personen vågen? | step 1 | "rusk behersket" → "ryst forsigtigt". Is that gentle enough or too gentle? |
| Frie luftveje | text 3 | "strangulering" → "noget, der strammer om halsen". |
| Trækker personen vejret? | warning | The word "agonal" was dropped. It is explained by "unormal" in the sentence. |
| M-ABC | steps | Turned into "M: … A: … B: … C: …" with plain explanations. B was "åndedræt", now "tjek vejrtrækningen"; C was "blodcirkulation", now "tjek blodomløbet". |
| Strømmen er gået | list item 2 | "Sæt nyindkøbte madvarer udenfor i kulden" → "Er det koldt udenfor, så stil …". Added condition: the source implies it but does not say it. |
| Strømmen er gået | warning title | "efter strømafbrydelsen" → "når strømmen kommer igen". Same meaning? |
| Der er intet vand | list "tre slags vand" | Item 3 now names examples ("fx regnvand eller vand fra varmtvandsbeholderen"). These are taken from elsewhere in the Bolius page, not from that sentence. |
| Der er intet vand | text 17 | "Bærbare vandfiltre" → "Et vandfilter fra fx en friluftsbutik". Is this example right? The CDC means portable filters. |
| Der er intet vand | CDC blocks | All Danish translations are unchecked (D-041). |
| Der er ingen varme | text 0 | Added "Så er der kun ét rum, der skal holdes varmt": an explanation not in the source. |
| Mad til tre døgn | checklist | "Planteolie" → "Olie til madlavning". Same item? |
| Food guides | botulism text | Reworded: "har for lidt syre … sporer, der næsten ikke dør ved almindelig kogning". Check against the USDA wording. |
| Food guides | dried fruit | "Efterbehandle" (conditioning) → "Lad frugten hvile". The purpose ("så fordeles den sidste fugt") is added. Check against the source. |
| Storage notes | "Blanch before freezing" | Added "(kog kort, og køl hurtigt ned)". |
| Storage notes | "Free from moisture; chilling injury …" | Rewritten freely: "For meget kulde kan få den til at rådne, skifte farve eller blive blød." |
| Kartofler (crop) | care | "Hypning" explained as "skubbe jord op omkring planten". |
| Bønner, Hestebønner | conditions | "kvælstoffikserende" → "kan selv hente næring fra luften". Simplified, but true? |
