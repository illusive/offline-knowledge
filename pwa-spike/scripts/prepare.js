// Copies the SQLite WebAssembly files, the knowledge pack and an icon into public/.
import { copyFile, mkdir, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const root = new URL('../', import.meta.url);
const pub = new URL('public/', root);
await mkdir(new URL('vendor/', pub), { recursive: true });
await mkdir(new URL('pack/', pub), { recursive: true });

const dist = new URL('node_modules/@sqlite.org/sqlite-wasm/dist/', root);
for (const f of ['index.mjs', 'sqlite3.wasm']) await copyFile(new URL(f, dist), new URL(`vendor/${f}`, pub));

// Same integrity check as app/scripts/sync-pack.ts.
const packDir = new URL('../content/dist/core/', root);
const manifest = JSON.parse(await readFile(new URL('manifest.json', packDir), 'utf8'));
const bytes = await readFile(new URL(manifest.file, packDir));
if (createHash('sha256').update(bytes).digest('hex') !== manifest.sha256) throw new Error('Pack does not match its manifest');
await copyFile(new URL(manifest.file, packDir), new URL('pack/core.sqlite', pub));
await copyFile(new URL('manifest.json', packDir), new URL('pack/manifest.json', pub));

await copyFile(new URL('../app/assets/icon.png', root), new URL('icon.png', pub));
console.log(`Prepared public/ with pack ${manifest.version} (${manifest.sizeBytes} bytes)`);
