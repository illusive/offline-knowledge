// Guides (D-037): loading and the verbatim check. A guide's shown texts must be found word for
// word in its source; second-authority quotes are checked like the food guides' quotes.

import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { Guide, GuideBlock } from '../schema/guide.ts';
import { normalize } from './produce.ts';
import type { RegistrySource } from './registry.ts';

export const GUIDES_DIR = new URL('../guides/', import.meta.url).pathname;

export async function loadGuides(dir = GUIDES_DIR): Promise<Guide[]> {
  const guides: Guide[] = [];
  for (const category of (await readdir(dir, { withFileTypes: true })).filter((d) => d.isDirectory() && d.name !== 'images')) {
    for (const file of (await readdir(join(dir, category.name))).filter((f) => f.endsWith('.json')).sort()) {
      guides.push(JSON.parse(await readFile(join(dir, category.name, file), 'utf8')) as Guide);
    }
  }
  return guides.sort((a, b) => a.category.localeCompare(b.category) || a.order - b.order);
}

// Text of a PDF source for the verbatim check: page markers and printed page numbers dropped,
// words broken across lines joined ("Situa-\ntionen" → "Situationen"), soft hyphens removed,
// bullet glyphs and replacement characters turned into spaces. `raw` is sources/text/<id>.txt
// without its first (checksum) line.
export function verbatimText(raw: string): string {
  const lines = raw.split('\n');
  const kept = lines.filter((line, i) => {
    if (/^--- p\d+$/.test(line)) return false;
    const pageNumber = /^\d{1,3}$/.test(line) && (/^--- p\d+$/.test(lines[i - 1] ?? '') || /^--- p\d+$/.test(lines[i + 1] ?? '') || i === lines.length - 1);
    return !pageNumber;
  });
  const joined = kept
    .join('\n')
    .replace(/­/g, '')
    .replace(/-\n(?=[a-zæøå])/g, '')
    .replace(/[•�￼]/g, ' ');
  return normalize(joined);
}

export function shownTexts(block: GuideBlock): string[] {
  switch (block.kind) {
    case 'heading':
    case 'text':
      return [block.text];
    case 'steps':
    case 'list':
      return block.items; // block titles are checked separately, ignoring case
    case 'checklist':
      return block.items.map((i) => i.text);
    case 'warning':
      return [...(block.text ? [block.text] : []), ...(block.items ?? [])];
    case 'image':
      return block.caption ? [block.caption] : [];
    case 'section':
      return [];
  }
}

// Abbreviations the handbook uses that a reader may not know.
const KNOWN_ABBREVIATIONS = ['HLR', 'AED', 'A-B-C', 'M-ABC'];

// Problems that block publishing. `texts` maps source id -> verbatim/normalised text.
export function validateGuides(guides: Guide[], sources: RegistrySource[], texts: Map<string, string>, imageFiles: Set<string>): string[] {
  const problems: string[] = [];
  const known = new Map(sources.map((s) => [s.id, s]));
  const ids = new Set<string>();
  const checklistIds = new Set<string>(); // across all guides
  for (const guide of guides) {
    const at = `guide ${guide.id}`;
    if (ids.has(guide.id)) problems.push(`${at}: duplicate id`);
    ids.add(guide.id);
    if (guide.category === 'first-aid' && guide.risk !== 'high') problems.push(`${at}: first aid guides are risk 'high'`);
    if (guide.category === 'growing' && guide.risk !== 'low') problems.push(`${at}: growing guides are risk 'low'`);
    if (guide.blocks.some((b) => b.kind === 'section') && guide.category === 'first-aid') problems.push(`${at}: first aid uses the source's own headings`);
    if (guide.category === 'preparedness' && guide.group !== 'situation' && guide.group !== 'supplies') problems.push(`${at}: preparedness guides need a group ('situation' or 'supplies')`);
    if (guide.category !== 'preparedness' && guide.group) problems.push(`${at}: only preparedness guides have a group`);
    const source = texts.get(guide.sourceId);
    if (!known.has(guide.sourceId)) problems.push(`${at}: source '${guide.sourceId}' not in registry`);
    else if (!source) problems.push(`${at}: no text for source '${guide.sourceId}'`);
    // Shown text → the source's text: undo recorded corrections, then it must appear verbatim.
    const original = (text: string) => (guide.corrections ?? []).reduce((t, c) => t.split(c.to).join(c.from), text);
    for (const c of guide.corrections ?? []) {
      if (source && !source.includes(normalize(c.from))) problems.push(`${at}: correction source text not found: "${c.from}"`);
    }
    // Headings and titles ignore case (the source sets many in capitals); everything else is exact.
    // A corrected word may also appear correctly elsewhere in the source, so the text as shown counts too.
    const check = (where: string, text: string, ignoreCase = false, sourceId = guide.sourceId) => {
      const src = texts.get(sourceId);
      const found = (t: string) => {
        const wanted = normalize(t);
        return ignoreCase ? (src ?? '').toLocaleLowerCase('da').includes(wanted.toLocaleLowerCase('da')) : (src ?? '').includes(wanted);
      };
      if (!text.trim()) problems.push(`${where}: empty text`);
      else if (!src) problems.push(`${where}: no text for source '${sourceId}'`);
      else if (!found(text) && !found(original(text))) problems.push(`${where}: not verbatim in ${sourceId}: "${text.slice(0, 70)}"`);
    };
    check(`${at} title`, guide.title, true);
    if (guide.originalSummary) {
      check(`${at} summary original`, guide.originalSummary);
      if (!guide.summary?.trim()) problems.push(`${at}: a rewritten summary needs the summary`);
    } else if (guide.summary) check(`${at} summary`, guide.summary);
    guide.blocks.forEach((block, i) => {
      const where = `${at} block ${i} (${block.kind})`;
      if (!Number.isInteger(block.page) || block.page < 1) problems.push(`${where}: page missing`);
      const sid = block.sourceId ?? guide.sourceId;
      // First aid takes all text from one source (D-037). Situation guides combine several
      // authorities' advice, each block checked against its own source (D-040).
      if (block.sourceId && guide.category === 'first-aid') problems.push(`${where}: first aid guides take all text from one source`);
      if (block.sourceId && !known.has(block.sourceId)) problems.push(`${where}: source '${block.sourceId}' not in registry`);
      // Headings ignore case; so do checklist lines, which often lift a word from a running sentence.
      if (block.original) {
        // A translated (D-041) or rewritten (D-042) block: the source's words are checked; ours must match them in shape.
        const o = block.original;
        if (o.lang === 'en' && guide.category !== 'preparedness') problems.push(`${where}: only 'Når det sker' guides may show translated blocks`);
        if (o.lang !== 'en' && o.lang !== 'da') problems.push(`${where}: originals are English or Danish`);
        const shownItems = 'items' in block ? (block.items ?? []).length : 0;
        if ((o.items ?? []).length !== shownItems) problems.push(`${where}: the original has ${(o.items ?? []).length} items, the translation ${shownItems}`);
        if (!!o.text !== !!('text' in block && block.text)) problems.push(`${where}: text and original text must both be given`);
        if (!!o.title !== !!('title' in block && block.title)) problems.push(`${where}: title and original title must both be given`);
        for (const text of shownTexts(block)) if (!text.trim()) problems.push(`${where}: empty text`);
        for (const text of [...(o.text ? [o.text] : []), ...(o.items ?? [])]) check(where, text, block.kind === 'heading' || block.kind === 'checklist', sid);
        if (o.title) check(`${where} title`, o.title, true, sid);
      } else {
        for (const text of shownTexts(block)) check(where, text, block.kind === 'heading' || block.kind === 'checklist', sid);
        if ('title' in block && block.title) check(`${where} title`, block.title, true, sid);
      }
      if ((block.kind === 'steps' || block.kind === 'list' || block.kind === 'checklist') && block.items.length === 0) problems.push(`${where}: no items`);
      if (block.kind === 'checklist') {
        for (const item of block.items) {
          if (!/^[a-z0-9-]+$/.test(item.id)) problems.push(`${where}: checklist id '${item.id}' must be lower-case letters, digits and dashes`);
          if (checklistIds.has(item.id)) problems.push(`${where}: checklist id '${item.id}' is used twice (ticks are stored by id)`);
          checklistIds.add(item.id);
        }
      }
      const images = block.kind === 'image' ? [block] : block.kind === 'steps' ? (block.images ?? []) : [];
      for (const image of images) {
        if (!imageFiles.has(image.file)) problems.push(`${where}: image '${image.file}' not found in guides/images`);
        if (!image.alt.trim()) problems.push(`${where}: image needs alt text`);
      }
      if (block.kind === 'steps') {
        for (const image of block.images ?? []) {
          if (!Number.isInteger(image.after) || image.after < 1 || image.after > block.items.length) problems.push(`${where}: image '${image.file}' after step ${image.after}, which does not exist`);
        }
      }
    });
    for (const a of guide.abbreviations ?? []) {
      for (const part of a.long.split(', ')) check(`${at} abbreviation ${a.short}`, part, true);
    }
    // Every abbreviation in this list must be explained; the guide may not show it unexplained.
    const shown = [guide.title, guide.summary ?? '', ...guide.blocks.flatMap(shownTexts)].join(' ');
    for (const short of KNOWN_ABBREVIATIONS) {
      if (new RegExp(`(^|[^\\p{L}])${short}([^\\p{L}]|$)`, 'u').test(shown) && !guide.abbreviations?.some((a) => a.short === short)) {
        problems.push(`${at}: uses ${short} without explaining it (add it to "abbreviations")`);
      }
    }
    if (guide.category === 'growing' && !guide.name?.trim()) problems.push(`${at}: growing guides need a plain name`);
    if (guide.season) {
      if (guide.risk === 'high') problems.push(`${at}: high-risk guides show no text of ours`);
      for (const part of guide.season.quote.split(' … ')) {
        if (!(texts.get(guide.sourceId) ?? '').includes(normalize(part))) problems.push(`${at} season: quote not found in ${guide.sourceId}: "${part.slice(0, 60)}"`);
      }
    }
    if (guide.risk === 'high' && guide.checks.length === 0) problems.push(`${at}: no second-authority check (D-027)`);
    guide.checks.forEach((c, i) => {
      const where = `${at} check ${i}`;
      if (!known.has(c.sourceId)) problems.push(`${where}: source '${c.sourceId}' not in registry`);
      if (c.sourceId === guide.sourceId) problems.push(`${where}: the second authority must be another source`);
      const text = texts.get(c.sourceId);
      if (!text) problems.push(`${where}: no text for source '${c.sourceId}'`);
      else for (const part of c.quote.split(' … ')) {
        if (!text.includes(normalize(part.replace(/\[[^\]]*\]/g, ' ')))) problems.push(`${where}: quote not found in ${c.sourceId}: "${part.slice(0, 60)}"`);
      }
      if (!c.note.trim()) problems.push(`${where}: say what agrees`);
    });
  }
  for (const guide of guides) for (const r of guide.related ?? []) if (!ids.has(r)) problems.push(`guide ${guide.id}: related guide '${r}' does not exist`);
  return problems;
}
