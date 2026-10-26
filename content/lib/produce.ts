// Food guides (D-033): loading, validation, and "store with / apart" relations from
// USDA Handbook 66 Table 1 (content/produce/hb66-compatibility.json).

import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { SECTION_ORDER, VERDICTS, type ProduceGuide } from '../schema/produce.ts';
import type { RegistrySource } from './registry.ts';

export const PRODUCE_DIR = new URL('../produce/', import.meta.url).pathname;

export async function loadGuides(dir = join(PRODUCE_DIR, 'guides')): Promise<ProduceGuide[]> {
  const files = (await readdir(dir)).filter((f) => f.endsWith('.json')).sort();
  return Promise.all(files.map(async (f) => JSON.parse(await readFile(join(dir, f), 'utf8')) as ProduceGuide));
}

const NAMED_ENTITIES: Record<string, string> = {
  nbsp: ' ', amp: '&', quot: '"', apos: "'", lt: '<', gt: '>',
  aelig: 'æ', AElig: 'Æ', oslash: 'ø', Oslash: 'Ø', aring: 'å', Aring: 'Å',
  auml: 'ä', ouml: 'ö', uuml: 'ü', Auml: 'Ä', Ouml: 'Ö', Uuml: 'Ü', eacute: 'é', Eacute: 'É', egrave: 'è',
  ndash: '–', mdash: '—', hellip: '…', deg: '°', frac12: '½', frac14: '¼', frac34: '¾', times: '×',
  lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”', laquo: '«', raquo: '»', shy: '',
  ordm: 'º', ordf: 'ª', middot: '·', bull: '•', micro: 'µ', plusmn: '±', sup2: '²', sup3: '³', frac13: '⅓',
  ntilde: 'ñ', aacute: 'á', iacute: 'í', oacute: 'ó', uacute: 'ú', ccedil: 'ç', agrave: 'à', ecirc: 'ê',
  reg: '®', trade: '™', copy: '©', minus: '−', le: '≤', ge: '≥', rarr: '→',
};

// Inline elements do not separate words; everything else does.
const INLINE_TAGS = /<\/?(a|abbr|b|em|i|span|strong|sub|sup|u|small|mark|font)(\s[^>]*)?>/gi;

// Visible text of an HTML snapshot, whitespace-normalised, for quote checks.
export function htmlToText(html: string): string {
  return normalize(
    html
      .replace(/<(script|style|noscript|svg)[\s\S]*?<\/\1>/gi, ' ')
      .replace(INLINE_TAGS, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&#(\d+);/g, (_, n: string) => String.fromCodePoint(Number(n)))
      .replace(/&#x([0-9a-f]+);/gi, (_, n: string) => String.fromCodePoint(parseInt(n, 16)))
      .replace(/&([a-zA-Z]+[0-9]*);/g, (whole, name: string) => NAMED_ENTITIES[name] ?? whole),
  );
}

// Text layer of a PDF snapshot (sources/text/<id>.txt, made by scripts/extract-pdf-text.swift),
// normalised, after checking that it was extracted from the snapshot the registry names.
export function pdfText(raw: string, sourceId: string, snapshotSha256: string): string {
  const [header = '', ...rest] = raw.split('\n');
  if (header !== `# ${sourceId} sha256 ${snapshotSha256}`) throw new Error(`Text of ${sourceId} was extracted from another snapshot; rerun extract-pdf-text.swift`);
  // Drop page markers and the printed page number that starts each page.
  const lines = rest.filter((line, i) => !/^--- p\d+$/.test(line) && !(/^\d+$/.test(line) && /^--- p\d+$/.test(rest[i - 1] ?? '')));
  // PDFKit gives U+FFFD for some table spaces and U+FFFC for embedded objects.
  return normalize(lines.join('\n').replace(/\uFFFD/g, ' ').replace(/\uFFFC/g, ''));
}

export function normalize(text: string): string {
  return text.replace(/[​‌‍﻿]/g, '').replace(/\s+/g, ' ').trim();
}

// Problems that block publishing. snapshotText maps source id -> normalised text of HTML snapshots.
export function validateGuides(
  guides: ProduceGuide[],
  itemIds: Set<string>,
  sources: RegistrySource[],
  snapshotText: Map<string, string>,
): string[] {
  const problems: string[] = [];
  const known = new Map(sources.map((s) => [s.id, s]));
  const seen = new Set<string>();
  for (const guide of guides) {
    const at = `guide ${guide.id}`;
    if (!itemIds.has(guide.id)) problems.push(`${at}: no storage item with this id`);
    if (seen.has(guide.id)) problems.push(`${at}: duplicate guide`);
    seen.add(guide.id);
    const keys = guide.sections.map((s) => s.key);
    if (new Set(keys).size !== keys.length) problems.push(`${at}: a section appears twice`);
    for (const section of guide.sections) {
      if (!SECTION_ORDER.includes(section.key)) problems.push(`${at}: unknown section '${section.key}'`);
      const allowed = (VERDICTS as Record<string, readonly string[]>)[section.key];
      if (allowed && (!section.verdict || !allowed.includes(section.verdict))) problems.push(`${at} ${section.key}: verdict must be one of ${allowed.join(', ')}`);
      if (!allowed && section.verdict) problems.push(`${at} ${section.key}: this section has no verdict`);
      section.blocks.forEach((block, i) => {
        const where = `${at} ${section.key}[${i}]`;
        if (!block.text.trim()) problems.push(`${where}: empty text`);
        if (block.note !== undefined && block.note !== 'untested') problems.push(`${where}: unknown note '${String(block.note)}'`);
        const ref = block.sourceRef;
        if (!known.has(ref.sourceId)) problems.push(`${where}: source '${ref.sourceId}' not in registry`);
        if (!ref.locator.trim()) problems.push(`${where}: no locator`);
        if (!ref.quote.trim()) problems.push(`${where}: no quote`);
        const text = snapshotText.get(ref.sourceId);
        if (text && !ref.visualOnly) {
          for (const part of ref.quote.split(' … ')) {
            // [Bracketed] words are editorial (e.g. table column names) and are not matched.
            if (!text.includes(normalize(part.replace(/\[[^\]]*\]/g, ' ')))) problems.push(`${where}: quote not found in the ${ref.sourceId} snapshot: "${part.slice(0, 60)}…"`);
          }
        }
      });
    }
  }
  return problems;
}

export interface CompatibilityEntry {
  name: string;
  group: string;            // '1A' | '1B' | '2' | '3'
  ethyleneSensitive: boolean;
  ethyleneProducer: boolean;
}

export interface EthyleneProfile {
  groups: string[];
  producer: boolean;        // at least one mapped entry produces significant ethylene
  sensitive: boolean;       // at least one mapped entry is sensitive to ethylene
}

export function ethyleneProfiles(entries: CompatibilityEntry[], map: Record<string, string[]>): Map<string, EthyleneProfile> {
  const byName = new Map(entries.map((e) => [e.name, e]));
  const out = new Map<string, EthyleneProfile>();
  for (const [recordId, names] of Object.entries(map)) {
    if (names.length === 0) continue;
    const mapped = names.map((n) => {
      const e = byName.get(n);
      if (!e) throw new Error(`Unknown Handbook 66 entry: ${n}`);
      return e;
    });
    out.set(`foodkeeper-${recordId}`, {
      groups: [...new Set(mapped.map((e) => e.group))].sort(),
      producer: mapped.some((e) => e.ethyleneProducer),
      sensitive: mapped.some((e) => e.ethyleneSensitive),
    });
  }
  return out;
}

// 'apart': one produces significant ethylene and the other is sensitive to it.
// 'with': same storage group in Table 1, no ethylene conflict, and not a mix of a significant
// producer with a non-producer: Table 1's footnote asks for ethylene below 1 µL/L in the storage area,
// and some non-sensitive produce still reacts to a lot of it (e.g. potatoes sprout, Potato chapter).
export function relations(profiles: Map<string, EthyleneProfile>): { itemId: string; otherId: string; relation: 'apart' | 'with' }[] {
  const out: { itemId: string; otherId: string; relation: 'apart' | 'with' }[] = [];
  for (const [a, pa] of profiles) {
    for (const [b, pb] of profiles) {
      if (a === b) continue;
      const conflict = (pa.sensitive && pb.producer) || (pa.producer && pb.sensitive);
      if (conflict) out.push({ itemId: a, otherId: b, relation: 'apart' });
      else if (pa.producer === pb.producer && pa.groups.some((g) => pb.groups.includes(g))) out.push({ itemId: a, otherId: b, relation: 'with' });
    }
  }
  return out;
}
