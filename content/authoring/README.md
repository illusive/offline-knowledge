# Food guide authoring aids (D-033)

Helpers for writing `content/produce/guides/foodkeeper-<id>.json`. They are not part of the build; the guide JSON files are the source of truth, and `npm run build:pack` checks every quote against the source snapshots.

- `mk.py`: `g(id, about=…, prefers=…, avoid=…, together=…, cool=…, drying=(verdict, […]), pickling=…, canning=…)` writes one guide. `b(text, source, locator, quote)` makes a block. `H(text, chapter, section, quote)` makes a Handbook 66 block and finds the printed page from the quote. `N(text, slug, locator, quote)` makes a block for an NCHFP recipe page. It also holds the shared blocks used across many foods, so the wording stays the same everywhere (`FRUIT_SUN`, `VEG_NOSUN`, `FRUIT_DRY`, `FRUIT_COND`, `PRETREAT`, `VEG_DRY`, `LOW_ACID`, `BERRY_*`, `STONE_BERRY`).
- `hb66_chapters.py <dir>`: splits the Handbook 66 text into one file per chapter for reading.
- `nchfp.py <slug>…`: prints the recipe part of NCHFP snapshot pages.
- `html2text.py <file>`: readable text of any HTML snapshot.
- `node scripts/quote-context.ts <source id> "<start of passage>"` (run in `content/`): shows the exact snapshot text a quote is checked against.

Typical batch: write a small script that does `import sys; sys.path.insert(0, 'authoring'); from mk import *`, call `g(...)` for each food, run it with `python3 -I` from `content/`, then run `npm run build:pack`.

Quote rules: parts of one passage are joined with ` … `; `[brackets]` are editorial (e.g. table column names) and are not matched; `visualOnly: true` marks a passage printed as an image (listed by the build, checked by eye).
