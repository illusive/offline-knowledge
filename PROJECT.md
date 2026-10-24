# Offline Knowledge — Project

## Vision

Trusted, freely available practical knowledge, packaged so it is easy to read, easy to find and fully available on an iPhone when there is no network, no power grid or no time to search.

The project does not write its own guidance. It collects material from authorities and other trusted sources, restructures it into clear steps, warnings and checklists while keeping the original wording, and makes every statement traceable to its source. See `docs/CONTENT_POLICY.md`.

## Users and situations

Initial audience: the project owner and a small group of people they know, distributed through TestFlight (D-009).

Typical situations:

- Power or network outage lasting hours or days.
- A crisis at home: storm, flooding, disrupted water supply.
- Everyday preparedness: building a home emergency supply, storing water and food.
- Seasonal self-sufficiency: growing, harvesting and preserving food in a northern-hemisphere climate, primarily Denmark.

## Scope

### Subject areas

Practical preparedness for the northern hemisphere, with Denmark as the primary context (D-004):

- Emergency supplies and household preparedness.
- Water storage and treatment.
- Food storage, preservation and food safety.
- Growing food (vegetables, herbs, basic cultivation).
- First aid.
- Shelter, heating and staying warm.
- Basic repairs.

High-risk areas (first aid, water treatment, food safety, electricity) follow a stricter publishing process and are introduced after the low-risk pilot (see `docs/ROADMAP.md`).

### Languages

- The interface is available in Danish and English.
- Each guide is shown in the language of its source and labeled with that language. Guides are not translated in v1 (D-003).

### v1 requirements

- A bundled, versioned core knowledge pack is available on first launch without any network access (D-007).
- Browse guides by category.
- Read a guide: summary, steps, warnings, checklists, source attribution and license.
- Full-text local search across all guides.
- Food storage lookup: search a food and see how long it keeps in the pantry, fridge and freezer, in Danish and English, with its source (D-014, D-015).
- Works entirely in airplane mode.
- Light and dark appearance, Dynamic Type, VoiceOver.

### Non-goals for v1

- Offline maps (later milestone, D-008).
- Downloadable or updatable content packs inside the app (format designed now, delivery later).
- Android.
- Translation of guides.
- Runtime AI, accounts, cloud sync, social features, telemetry (D-010).
- Original, self-authored guidance.

## Design principles

- Calm and readable over impressive. The app may be used under stress.
- Large, legible typography. Long text and accessibility font sizes must work.
- Clear hierarchy inside a guide: what to do, what to watch out for, where it comes from.
- Warnings are visually distinct, without alarmist styling.
- Recognizable icons, concise labels, shallow navigation.
- No emojis, decorative effects or novelty interactions.
- Light and dark appearance through centralized theme tokens.
- Source and license are always one tap away from any guide.

## Related documents

- `AGENTS.md` — how agents work on this project.
- `docs/DECISIONS.md` — decision log (D-xxx references above).
- `docs/CONTENT_POLICY.md` — sources, licensing, traceability and publishing.
- `docs/ARCHITECTURE.md` — proposed system structure.
- `docs/ROADMAP.md` — milestones.
- `docs/OPEN_QUESTIONS.md` — unresolved questions.
