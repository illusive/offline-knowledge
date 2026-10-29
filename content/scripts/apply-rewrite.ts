// Language pass (D-042): applies a plain-language rewrite to a guide. The rewrite file maps block
// indexes to new wording ({ text?, title?, items? }) and may give a new `summary` and `name`.
// The source's words move into `original` (lang 'da') the first time a block is rewritten, so the
// build keeps checking them verbatim; blocks already holding an original only get new wording.
// Usage: node scripts/apply-rewrite.ts <guide.json> <rewrite.json>

import { readFileSync, writeFileSync } from 'node:fs';
import type { BlockOriginal, Guide } from '../schema/guide.ts';

type Wording = { text?: string; title?: string; items?: string[] };
const [guidePath, rewritePath] = process.argv.slice(2);
if (!guidePath || !rewritePath) throw new Error('Usage: apply-rewrite.ts <guide.json> <rewrite.json>');
const guide = JSON.parse(readFileSync(guidePath, 'utf8')) as Guide;
const rewrite = JSON.parse(readFileSync(rewritePath, 'utf8')) as { name?: string; summary?: string; blocks?: Record<string, Wording> };

if (rewrite.name) guide.name = rewrite.name;
if (rewrite.summary && rewrite.summary !== guide.summary) {
  if (guide.summary) guide.originalSummary ??= guide.summary;
  guide.summary = rewrite.summary;
}
for (const [index, wording] of Object.entries(rewrite.blocks ?? {})) {
  const block = guide.blocks[Number(index)] as unknown as Wording & { original?: BlockOriginal; items?: (string | { text: string })[] };
  if (!block) throw new Error(`No block ${index} in ${guide.id}`);
  if (!block.original) {
    const o: BlockOriginal = { lang: 'da' };
    if (wording.text !== undefined && block.text) o.text = block.text;
    if (wording.title !== undefined && block.title) o.title = block.title;
    if (wording.items !== undefined && block.items) o.items = block.items.map((i) => (typeof i === 'string' ? i : (i as { text: string }).text));
    block.original = o;
  }
  if (wording.text !== undefined) block.text = wording.text;
  if (wording.title !== undefined) block.title = wording.title;
  if (wording.items !== undefined) {
    if (wording.items.length !== (block.items ?? []).length) throw new Error(`${guide.id} block ${index}: ${wording.items.length} items for ${(block.items ?? []).length}`);
    // Checklist lines keep their ids (ticks are stored by id).
    (block as { items?: unknown }).items = (block.items ?? []).map((old, i) => (typeof old === 'string' ? wording.items![i]! : { ...(old as object), text: wording.items![i]! }));
  }
}
writeFileSync(guidePath, JSON.stringify(guide, null, 2) + '\n');
console.log(`Rewrote ${Object.keys(rewrite.blocks ?? {}).length} blocks in ${guide.id}`);
