// Authoring aid: shows the snapshot text a guide quote is checked against (D-033).
// Usage: node scripts/quote-context.ts <source id> "<start of the passage>" [chars]

import { readFile } from 'node:fs/promises';
import { htmlToText, normalize, pdfText } from '../lib/produce.ts';
import { loadSource, readSnapshot, SOURCES_DIR } from '../lib/registry.ts';

const [id = '', needle = '', length = '600'] = process.argv.slice(2);
const source = await loadSource(id);
const bytes = await readSnapshot(source);
const text = source.snapshot?.endsWith('.pdf')
  ? pdfText(await readFile(`${SOURCES_DIR}text/${id}.txt`, 'utf8'), id, source.snapshotSha256 ?? '')
  : htmlToText(bytes.toString('utf8'));
const words = normalize(needle).split(' ');
for (let n = words.length; n > 0; n--) {
  const at = text.indexOf(words.slice(0, n).join(' '));
  if (at >= 0) {
    console.log(`${n}/${words.length} words match:\n${text.slice(at, at + Number(length))}`);
    process.exit(0);
  }
}
console.log('no match');
