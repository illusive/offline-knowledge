/// <reference types="node" />
// Copies the core knowledge pack from ../content/dist/core into assets/pack/
// after checking it against its manifest. Run `npm run build:pack` in ../content first.

import { createHash } from 'node:crypto';
import { copyFile, mkdir, readFile, rm } from 'node:fs/promises';

const from = new URL('../../content/dist/core/', import.meta.url);
const to = new URL('../assets/pack/', import.meta.url);

const manifest = JSON.parse(await readFile(new URL('manifest.json', from), 'utf8')) as {
  version: string;
  file: string;
  sizeBytes: number;
  sha256: string;
};
const bytes = await readFile(new URL(manifest.file, from));
const sha256 = createHash('sha256').update(bytes).digest('hex');
if (bytes.byteLength !== manifest.sizeBytes || sha256 !== manifest.sha256) {
  throw new Error(`Pack does not match its manifest (size ${bytes.byteLength}/${manifest.sizeBytes}, sha256 ${sha256}/${manifest.sha256})`);
}

await rm(to, { recursive: true, force: true });
await mkdir(to, { recursive: true });
await copyFile(new URL(manifest.file, from), new URL('core.sqlite', to));
await copyFile(new URL('manifest.json', from), new URL('manifest.json', to));
console.log(`Synced core pack ${manifest.version} (${manifest.sizeBytes} bytes, sha256 ${manifest.sha256.slice(0, 12)}…) into assets/pack/`);
