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
    case 'warning':
      return [...(block.text ? [block.text] : []), ...(block.items ?? [])];
    case 'image':
      return block.caption ? [block.caption] : [];
  }
}

// Problems that block publishing. `texts` maps source id -> verbatim/normalised text.
export function validateGuides(guides: Guide[], sources: RegistrySource[], texts: Map<string, string>, imageFiles: Set<string>): string[] {
  const problems: string[] = [];
  const known = new Map(sources.map((s) => [s.id, s]));
  const ids = new Set<string>();
  for (const guide of guides) {
    const at = `guide ${guide.id}`;
    if (ids.has(guide.id)) problems.push(`${at}: duplicate id`);
    ids.add(guide.id);
    if (guide.risk !== 'high') problems.push(`${at}: first aid guides are risk 'high'`);
    const source = texts.get(guide.sourceId);
    if (!known.has(guide.sourceId)) problems.push(`${at}: source '${guide.sourceId}' not in registry`);
    else if (!source) problems.push(`${at}: no text for source '${guide.sourceId}'`);
    // Shown text → the source's text: undo recorded corrections, then it must appear verbatim.
    const original = (text: string) => (guide.corrections ?? []).reduce((t, c) => t.split(c.to).join(c.from), text);
    for (const c of guide.corrections ?? []) {
      if (source && !source.includes(normalize(c.from))) problems.push(`${at}: correction source text not found: "${c.from}"`);
    }
    // Headings and titles ignore case (the source sets many in capitals); everything else is exact.
    const lowerSource = source?.toLocaleLowerCase('da');
    // A corrected word may also appear correctly elsewhere in the source, so the text as shown counts too.
    const check = (where: string, text: string, ignoreCase = false) => {
      const found = (t: string) => {
        const wanted = normalize(t);
        return ignoreCase ? (lowerSource ?? '').includes(wanted.toLocaleLowerCase('da')) : (source ?? '').includes(wanted);
      };
      if (!text.trim()) problems.push(`${where}: empty text`);
      else if (source && !found(text) && !found(original(text))) {
        problems.push(`${where}: not verbatim in ${guide.sourceId}: "${text.slice(0, 70)}"`);
      }
    };
    check(`${at} title`, guide.title, true);
    if (guide.summary) check(`${at} summary`, guide.summary);
    guide.blocks.forEach((block, i) => {
      const where = `${at} block ${i} (${block.kind})`;
      if (!Number.isInteger(block.page) || block.page < 1) problems.push(`${where}: page missing`);
      for (const text of shownTexts(block)) check(where, text, block.kind === 'heading');
      if ('title' in block && block.title) check(`${where} title`, block.title, true);
      if ((block.kind === 'steps' || block.kind === 'list') && block.items.length === 0) problems.push(`${where}: no items`);
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
    if (guide.checks.length === 0) problems.push(`${at}: no second-authority check (D-027)`);
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
