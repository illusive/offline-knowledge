// Builds the core knowledge pack into content/dist/core/ (pack.sqlite + manifest.json).
// Pack version = content/package.json "version".

import { readdir, readFile } from 'node:fs/promises';
import { GUIDES_DIR, loadGuides as loadReadingGuides, validateGuides as validateReadingGuides, verbatimText } from '../lib/guides.ts';
import { buildPack } from '../lib/pack.ts';
import { ethyleneProfiles, htmlToText, loadGuides, pdfText, PRODUCE_DIR, relations, validateGuides, type CompatibilityEntry } from '../lib/produce.ts';
import { loadRegistry, readSnapshot, SOURCES_DIR } from '../lib/registry.ts';
import type { StorageDataset } from '../schema/storage.ts';

const root = new URL('../', import.meta.url);
const { version } = JSON.parse(await readFile(new URL('package.json', root), 'utf8')) as { version: string };
const sources = await loadRegistry();
const storage = [JSON.parse(await readFile(new URL('storage/foodkeeper-produce.json', root), 'utf8')) as StorageDataset];

// Re-verify each used source's snapshot checksum at build time.
for (const dataset of storage) {
  const source = sources.find((s) => s.id === dataset.sourceId);
  if (source) await readSnapshot(source);
}

// Food guides (D-033): validate against the registry, and check quotes against the snapshots
// (HTML directly; PDF through the extracted text in sources/text/).
const guides = await loadGuides();
const guideSourceIds = new Set(guides.flatMap((g) => g.sections.flatMap((s) => s.blocks.map((b) => b.sourceRef.sourceId))));
const snapshotText = new Map<string, string>();
for (const id of [...guideSourceIds, 'us-ars-ah66-2016']) {
  const source = sources.find((s) => s.id === id);
  if (!source) continue;
  const bytes = await readSnapshot(source);
  if (source.snapshot?.endsWith('.html')) snapshotText.set(id, htmlToText(bytes.toString('utf8')));
  if (source.snapshot?.endsWith('.pdf')) snapshotText.set(id, pdfText(await readFile(`${SOURCES_DIR}text/${id}.txt`, 'utf8'), id, source.snapshotSha256 ?? ''));
}
const itemIds = new Set(storage.flatMap((d) => d.items.map((i) => i.id)));
const guideProblems = validateGuides(guides, itemIds, sources, snapshotText);
if (guideProblems.length > 0) throw new Error(`Food guide validation failed:\n- ${guideProblems.join('\n- ')}`);
const byEye = guides.flatMap((g) => g.sections.flatMap((s) => s.blocks.filter((b) => b.sourceRef.visualOnly).map(() => g.id)));
if (byEye.length > 0) console.log(`${byEye.length} quote(s) transcribed from images, not checked automatically: ${[...new Set(byEye)].join(', ')}`);

const compat = JSON.parse(await readFile(new URL('hb66-compatibility.json', `file://${PRODUCE_DIR}`), 'utf8')) as { entries: CompatibilityEntry[] };
const mapping = JSON.parse(await readFile(new URL('foodkeeper-to-hb66.json', `file://${PRODUCE_DIR}`), 'utf8')) as { map: Record<string, string[]> };
const ethylene = ethyleneProfiles(compat.entries, mapping.map);

// Guides (D-037): every shown text verbatim in the joined-up source text; second-authority quotes too.
const readingGuides = await loadReadingGuides();
const guideTexts = new Map<string, string>();
for (const id of new Set(readingGuides.flatMap((g) => [g.sourceId, ...g.checks.map((c) => c.sourceId)]))) {
  const source = sources.find((s) => s.id === id);
  if (!source?.snapshot) continue;
  const bytes = await readSnapshot(source);
  if (source.snapshot.endsWith('.html')) guideTexts.set(id, htmlToText(bytes.toString('utf8')));
  if (source.snapshot.endsWith('.pdf')) {
    const raw = await readFile(`${SOURCES_DIR}text/${id}.txt`, 'utf8');
    pdfText(raw, id, source.snapshotSha256 ?? ''); // refuses text extracted from another snapshot
    guideTexts.set(id, verbatimText(raw.split('\n').slice(1).join('\n')));
  }
}
const imageDir = `${GUIDES_DIR}images/`;
const imageFiles = (await readdir(imageDir).catch(() => [] as string[])).filter((f) => /\.(jpe?g|png|webp)$/.test(f));
const readingProblems = validateReadingGuides(readingGuides, sources, guideTexts, new Set(imageFiles));
if (readingProblems.length > 0) throw new Error(`Guide validation failed:\n- ${readingProblems.join('\n- ')}`);
const images = new Map<string, { mime: string; data: Uint8Array }>();
for (const f of imageFiles) {
  const mime = f.endsWith('.png') ? 'image/png' : f.endsWith('.webp') ? 'image/webp' : 'image/jpeg';
  images.set(f, { mime, data: await readFile(imageDir + f) });
}

const outDir = new URL('dist/core/', root).pathname;
const manifest = await buildPack(
  {
    packId: 'core',
    version,
    storage,
    sources,
    guides,
    ethylene,
    relations: relations(ethylene),
    extraSourceIds: ['us-ars-ah66-2016'],
    guideSet: { guides: readingGuides, images },
  },
  outDir,
);
console.log(`Built pack '${manifest.packId}' ${manifest.version}: ${manifest.counts.storageItems} storage items, ${manifest.counts.produceGuides} food guides, ${manifest.counts.guides} guides, ${manifest.counts.sources} sources.`);
console.log(`${outDir}${manifest.file}: ${manifest.sizeBytes} bytes, sha256 ${manifest.sha256}`);
