# Content Policy

How sources are chosen, how content is processed, how it is attributed and when it may be published. This policy applies to every guide in every knowledge pack.

## 1. Principle

The project curates; it does not author (D-005). Every statement in a published guide must trace back to a named, retrievable source. If a statement cannot be traced, it is removed.

## 2. Source tiers

| Tier | Type | Examples (licenses to be verified per source) | Use |
|------|------|-----------------------------------------------|-----|
| 1 | Danish and Nordic public authorities | Emergency management, food safety and health authorities | Preferred primary source |
| 2 | International bodies and established organizations | WHO, Red Cross / Red Crescent, national extension services, university agricultural guidance | Primary source where Tier 1 is missing or thin |
| 3 | Vetted collaborative sources | Wikipedia and similar wikis with active editorial review | Supporting source, general background, low-risk topics |

The examples are categories, not cleared sources. A source is usable only once it is in the source registry with a verified license (§3).

Prefer the most authoritative available source for each topic. Prefer sources written for the Danish / northern-hemisphere context (climate, seasons, regulations, emergency numbers).

## 3. Source registry

Every source is recorded before any of its content is used. Required fields:

- `id` — stable identifier.
- `title`, `publisher`, `url`.
- `language`.
- `license` — SPDX identifier or exact license text/URL. `unknown` is allowed in the registry but blocks publishing.
- `licenseVerifiedAt` and a note on where the license terms were found.
- `retrievedAt` — date the snapshot was taken.
- `snapshot` — local copy (or exact excerpt) of the material used, with a checksum, so that what was checked can be compared later.
- `attribution` — the exact attribution text the license requires.

## 4. Licensing rules

- **Unknown license = not published.** No exceptions.
- **Attribution** is shown on every guide, for every source used, as the license requires.
- **CC BY / CC BY-SA:** usable. Restructured content is an adaptation; content derived from a CC BY-SA source is published under CC BY-SA, and the guide states this.
- **Non-commercial (NC):** usable while distribution is personal / small group (D-009). Each such guide is flagged `nonCommercial: true` so that a future App Store or commercial decision can find them.
- **No derivatives (ND):** may not be restructured. Usable only for verbatim `high` guides (D-027) if the licence allows verbatim redistribution; otherwise only with explicit written permission, recorded in the registry.
- **All rights reserved:** only with explicit written permission from the rights holder, recorded in the registry.
- **Public-sector information:** reuse terms differ per authority and per document. Verify the actual terms; do not assume public material is free to redistribute.
  - **UK Open Government Licence v3.0:** usable, including adaptation, with the OGL attribution statement. Covers only what the publisher may license: photos and other third-party material on OGL sites are excluded unless stated otherwise.
  - **US federal government works:** public domain in the US. Check each page for third-party material (e.g. content co-published with the Red Cross).
  - **Danish authorities:** the reuse act (videreanvendelsesloven, LBK 1764/2021 § 4) lets an authority *grant* reuse on request; it does not grant it automatically. Without a published licence, send a reuse request under § 4(3) and treat the source as `unknown` until it is answered. Keep the request and reply in `content/sources/requests/`.
  - **Private organisations** (companies, trade bodies, charities) are not covered by the reuse act. Use only with a published open licence or explicit written permission.
- **Aggregators are not sources.** Kiwix/openZIM collections, archive sites and download portals redistribute documents without granting rights. Register and clear each underlying document with its original publisher.
- **Structured data** (e.g. storage-time tables) follows the same rules. Every value keeps a reference to its source record.
- **Images** follow the same rules as text and are registered as separate sources.

Licensing judgements are recorded per source. When in doubt, leave it out and add an entry to `OPEN_QUESTIONS.md`.

## 5. Processing: restructure, keep wording

Per D-006:

- Applies to `low` and `elevated` guides. `high` guides are verbatim (§6, D-027).
- Allowed: splitting text into steps, warnings, checklists and notes; adding headings; reordering for task flow; removing material that is not relevant; minimal grammatical joins needed after splitting.
- Not allowed: adding facts, quantities, times, temperatures, doses or advice not present in the source; changing meaning; merging claims from different sources into one block.
- Each block (`step`, `warning`, `checklist` item, `note`, `image`) carries a `sourceRef`: source id, section or anchor, and the quoted original passage.
- The guide summary is also traced to source passages.
- Guides are presented in their source language (D-003). Content from sources in different languages is not mixed in one guide.

### AI assistance

AI may help restructure source text at build time. It may not introduce new claims. The output is treated as a draft, and the human check (§7) compares every block against its quoted source passage. AI output is never the sole basis for any instruction (`AGENTS.md` §6).

## 6. Risk classification

| Level | Topics | Extra requirement |
|-------|--------|-------------------|
| `low` | Supplies lists, storage, growing, general preparedness | Source check (§7) |
| `elevated` | Preservation methods, heating, basic repairs, tool use | Source check; prefer Tier 1–2 source |
| `high` | First aid, water treatment, food safety, electricity, gas, carbon monoxide | **Verbatim only (D-027):** the source's text and structure unchanged; whole sections may be selected, nothing split, merged, reordered, reworded or translated. Owner check of exact reproduction, **plus** agreement from a second independent authority. Primary source must be current and Tier 1 or 2; a Tier 3 source alone is never sufficient. The guide shows the emergency card (112) and the source date |

When sources disagree on a high-risk point, the guide is not published until the disagreement is resolved or the point is removed. Record it in `OPEN_QUESTIONS.md`.

## 7. Status lifecycle and checking

```
draft → checked → published
                ↘ retired
```

- **draft** — being assembled. Never included in a pack.
- **checked** — a human has compared every block to its quoted source passage, confirmed the licenses and attribution, and (for `high`) completed the second-source cross-check. Record who checked and when (`reviewedAt`, `reviewedBy`).
- **published** — included in the next pack build.
- **retired** — withdrawn (source changed, error found, superseded). Retired guides are removed from the next pack.

The pack build fails if any included guide lacks a verified license, a `sourceRef` on any block, or the required check for its risk level.

## 8. Maintenance

- Sources change. Each guide records the source `retrievedAt`. Guides should be re-checked against current sources periodically; the interval is an open question.
- Errors reported by users are fixed by correcting the guide against the source or retiring it, never by adding unsourced corrections.
- Every published guide shows its sources, licenses, retrieval date and check date in the app.
