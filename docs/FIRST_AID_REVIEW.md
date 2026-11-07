# First aid: review file (D-071)

This file is for the qualified reviewer. It lists what the first-aid guides lack as standalone instructions, proposes revisions from the registered sources, and states where the sources disagree. **Nothing in this file is in the app yet.** The guides in `content/guides/first-aid/` stay as they are until the open points below are decided (owner, 2026-11-07).

Three kinds of review are kept apart:

| Review | What it checks | Who | Recorded in |
|---|---|---|---|
| **Source comparison** | Every shown text is in the source (the build checks it word for word), and a second authority is compared (`checks` in each guide) | The build and the owner | The guide's `checks`; the build |
| **Language review** | Plain Danish, consistent words (D-042) | The owner | `docs/LANGUAGE_REVIEW.md` |
| **Clinical review** | That the sequence is complete, correct and safe for an untrained reader | A qualified person (e.g. a first-aid instructor or a doctor) | Here; then `ownerChecked` and the decision log |

Source comparison and language review do **not** make a guide clinically reviewed. Today no guide has had a clinical review, and all 21 first-aid guides show "Prøveversion" above their instructions (D-071).

## Sources

- **ABC:** Førstehjælpens ABC (`dk-fsk-abc-foerstehjaelp`), the guides' main source. Page numbers are the handbook's.
- **ERC-FA:** ERC Guidelines 2025, Førstehjælp, Danish translation by Dansk Råd for Genoplivning (`dk-drg-erc-first-aid-2025`).
- **ERC-BLS:** ERC Guidelines 2025, Basal genoplivning, Danish (`dk-drg-erc-bls-2025`).
- **DRG-ALG:** DRG's one-page BLS algorithm 2025 (`dk-drg-bls-algoritme-2025`).
- **Not registered:** ERC Guidelines 2025 for children (PBLS, "Basal pædiatrisk genoplivning"). ERC-BLS refers to it (p. 2, "Newborn …"). See the source gap under child CPR.

---

## 1. "Livsfarlige blødninger" (`massive-bloedninger`)

### What the guide has today
1. When a bleeding is life-threatening: a pool of blood, soaked clothing, blood spurting or running fast (ABC p. 18).
2. A warning: stop the bleeding before anything else (ABC p. 18, "inden A-B-C").
3. It is rare and needs action at once (ABC p. 18).
4. "Du stopper en blødning ved at trykke hårdt imod den." (from ABC p. 42, which is about minor bleeding).

### What is missing for an untrained reader
- **How to press:** where, with what, and for how long.
- **A dressing on the wound, and pressing on top of it.**
- **A pressure bandage** once the bleeding is under control.
- **What to do if it keeps bleeding through.**
- **Ringing 112.** Today only the guide-wide 112 card does this, below the instructions.
- **Next steps:** lying down, watching for kredsløbssvigt.
- **A link** to "Mindre blødninger" (which has the pressure-bandage steps) and to "Kredsløbssvigt".
- **Pictures:** none.

### Proposed sequence (every step from a registered source; wording to be made plain after the clinical review)
1. **Stop the bleeding first, before A-B-C.** ABC p. 18 ("behandle det som det første inden A-B-C"); ERC-FA p. 7, bleeding first.
2. **Press firmly and directly on the wound with your hand.** ERC-FA p. 13: "Giv et fast, direkte manuelt tryk på den blødende skade."
3. **Put a dressing directly on the wound, and press firmly on top of it.** ERC-FA p. 13: "Læg en standard- eller hæmostatisk forbinding direkte på blødningen, og tryk derefter fast ovenpå forbindingen."
4. **Ring 112, or get someone else to.** ABC p. 86: "Alarmér 1-1-2 ved en livstruende blødning …"
5. **When the bleeding is under control, put on a pressure bandage.** ERC-FA p. 13. The steps are in ABC p. 43, also used in "Mindre blødninger": keep pressing the whole time; tight enough that only a little finger fits under; the knot over the wound.
6. **If it bleeds through:** press with your fingers on top of the dressing, or use something hard (a pelotte). ABC p. 43, items 4–5.
7. **Arm or leg, and pressure does not stop it:** a tourniquet. **See conflict A.**
8. **Afterwards:** watch for kredsløbssvigt and keep the person warm. To be taken from "Kredsløbssvigt" (ABC); link there.

### Conflict A: when and where to put on a tourniquet

| ABC p. 18 | ERC-FA p. 14 and p. 33 |
|---|---|
| "Hvis du har et præfabrikeret Tourniquet til rådighed, må du anlægge det som det første på arme og ben". "Læg det altid 'high and tight'." | "Påfør en tourniquet så hurtigt som muligt ved livstruende blødning fra en arm eller et ben, som ikke kan kontrolleres med direkte manuelt tryk." Place it "5-7 cm over skaden, men ikke over et led". Note the time on it, and do not loosen it. |

- **The difference:** the handbook puts it first and high on the limb. ERC puts it on when pressure fails, just above the wound.
- **Today:** the guide leaves tourniquets out altogether (D-037). A household rarely has one.
- **For the clinical reviewer to decide:**
  - Mention a tourniquet at all?
  - If so, which rule?
  - Say that it is only for a factory-made tourniquet, as both sources do?

### Linked tools and images
- No tool is linked.
- ABC p. 43 has six photos of the pressure bandage. They could be added from the handbook once the picture question is settled (OPEN_QUESTIONS 6, 42).

---

## 2. "Hjertemassage til børn" (`hlr-boern`)

### What the guide has today (all ABC p. 32)
- "Barn" means under 18. A child who looks like an adult is treated as an adult.
- The rate is the same as for adults (100–120 a minute).
- **The differences from adults:**
  - less head tilt, and a baby's head in a neutral position
  - breaths adapted until the chest rises, perhaps over the nose and mouth
  - press at least ⅓ of the chest: 2 fingers for a baby, one hand otherwise
- The handbook's note that Forsvaret does not usually teach a separate method, and a suggestion to take a course.

### What is missing for an untrained reader
The guide is a list of **differences from the adult guide**, not a sequence. A reader must combine it with "Hjertemassage og kunstigt åndedræt" (`hlr-voksne`) under stress. In particular, it lacks:
- the order: safety, response, 112, airway, breathing
- **the 5 first breaths (see conflict B)**
- the ratio
- the hand position
- the hjertestarter
- keeping going until help arrives

The "baby" age is not stated. "Noget galt i halsen" uses "over 1 år" (ABC p. 64).

### Proposed sequence (from DRG-ALG, with the ABC's adaptations; to be completed from the PBLS source)
1. **Check whether the child responds.** DRG-ALG: "Undersøg for bevidstløshed".
2. **Ring 112, with the phone on speaker.** DRG-ALG: "Ring 1-1-2", "Sæt telefonen på højttaler". The visitator helps: "Følg visitatorens instruktioner".
3. **Open the airway and check for normal breathing.** DRG-ALG. With the ABC p. 32 adaptation: less head tilt, and a baby's head neutral.
4. **No normal breathing: give 5 breaths.** DRG-ALG, under "Børn", "Ikke uddannet i PBLS: Giv 5 indblæsninger". Adapt the breaths until the chest rises, perhaps over the nose and mouth (ABC p. 32).
5. **Then 30 presses and 2 breaths.** DRG-ALG: "Giv HLR 30:2". Press at least ⅓ of the chest: 2 fingers for a baby, one hand otherwise (ABC p. 32). Rate 100–120 a minute (ABC p. 32).
6. **Get a hjertestarter and follow its instructions.** DRG-ALG: "Tilslut hjertestarter (AED) så hurtigt som muligt". **Child pads and child settings are not covered by the registered sources** (source gap).
7. **Keep going until the ambulance arrives.** DRG-ALG: "Fortsæt HLR til ambulancen ankommer".

### Conflict B: 5 first breaths for children
- **ABC p. 32:** no separate algorithm; adapt the adult 30:2 to the child. No first breaths.
- **DRG-ALG:** for children, also for those not trained in paediatric BLS, give 5 breaths first and then 30:2. Those trained in PBLS give 5 breaths, then 15:2.
- **OPEN_QUESTIONS 29** said the guide was publishable because the handbook text does not contradict ERC. Leaving out the 5 breaths is still a gap in a guide meant to stand alone. Under CONTENT_POLICY §6, a high-risk disagreement must be settled, not combined silently.
- **For the clinical reviewer to decide:** follow DRG-ALG (the newer Danish guidance, recommended here) and add the 5 breaths. Say plainly that this differs from the handbook.

### Source gap: children's guideline
A complete child sequence also needs things DRG-ALG does not state:
- the age bands (spædbarn under 1 year?)
- how deep to press in cm
- child pads on a hjertestarter
- what to do when alone: ring first, or 1 minute of CPR first

These are in **ERC Guidelines 2025 PBLS** (Danish by DRG if available). Register that document and compare it before the guide is rewritten. **Nothing from it is assumed here.**

### Linked tools and images
- **HLR-metronom** is linked from this guide (`TOOL_FOR_GUIDE`). It counts the adult 30:2 and says so on the screen (D-071): "Metronomen følger hjertemassage til voksne." With DRG-ALG's 30:2 for untrained rescuers, the count fits. The 5 first breaths are not part of it. Decide whether the link stays.
- **No pictures.** The handbook has no child photos on p. 32.

---

## 3. The other first-aid guides (screened, not fully reviewed)

- **"Hjertemassage og kunstigt åndedræt" (`hlr-voksne`):** steps, rate, a warning (compressions only is allowed), and two images. 112 and the hjertestarter appear in the flowchart image and its alt text, not as text steps. Consider adding "Ring 112" and "Hent en hjertestarter" as text (DRG-ALG).
- **"Brug en hjertestarter" (`hjertestarter`):** ERC's "start 30:2 again straight after the shock" is recorded only in the check note. Consider showing it.
- **The remaining 17:** to be screened the same way (standalone sequence, 112, links) during the clinical review.

## 4. Before the guides go beyond the owner

- Clinical review of all 21 first-aid guides. Record the reviewer, the date and the sources compared, then set `ownerChecked`.
- Decide conflicts A and B, and register the PBLS source.
- Decide the release rule. Today drafts ship with "Prøveversion" above the instructions (D-071), which CONTENT_POLICY §7 allows only while the app is private (D-028).
