// Database worker: keeps the knowledge pack in the Origin Private File System (OPFS)
// with SQLite's "opfs-sahpool" VFS (D-021) and answers queries from the app.

import sqlite3InitModule from '@sqlite.org/sqlite-wasm';
import type { InitResult, PackInfo, Reply, Request } from './protocol';
import { getGuide, getItemDetail, listGuides, listItems, searchGuides, searchItems, verifyPack, type SqlDb } from './queries';

let db: SqlDb | undefined;

async function sha256Hex(bytes: Uint8Array): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', bytes as Uint8Array<ArrayBuffer>);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function init(packUrl: string, pack: PackInfo): Promise<InitResult> {
  const sqlite3 = await sqlite3InitModule();
  const pool = await sqlite3.installOpfsSAHPoolVfs({ name: 'offline-knowledge' });
  // Version and checksum in the name: a new pack is imported as a new file (as in D-019).
  const dbName = `/core-${pack.version}-${pack.sha256.slice(0, 12)}.db`;

  let importedNow = false;
  if (!pool.getFileNames().includes(dbName)) {
    const bytes = new Uint8Array(await (await fetch(packUrl)).arrayBuffer());
    // Never import a pack that does not match its manifest (AGENTS.md §7).
    const actual = await sha256Hex(bytes);
    if (actual !== pack.sha256) throw new Error(`Pack checksum mismatch: expected ${pack.sha256}, got ${actual}`);
    await pool.importDb(dbName, bytes);
    importedNow = true;
  }

  const opened = new pool.OpfsSAHPoolDb(dbName);
  verifyPack(opened);
  db = opened;

  // Only after the new pack opened and verified: remove older pack copies.
  const removedOldPacks = pool.getFileNames().filter((name) => name.startsWith('/core-') && name !== dbName);
  for (const name of removedOldPacks) pool.unlink(name);

  return { sqliteVersion: sqlite3.version.libVersion, dbName, importedNow, removedOldPacks };
}

function requireDb(): SqlDb {
  if (!db) throw new Error('Database not initialised');
  return db;
}

async function handle(request: Request) {
  switch (request.type) {
    case 'init':
      return init(request.packUrl, request.pack);
    case 'list':
      return listItems(requireDb());
    case 'search':
      return searchItems(requireDb(), request.query);
    case 'detail':
      return getItemDetail(requireDb(), request.id);
    case 'guides':
      return listGuides(requireDb(), request.category);
    case 'guide':
      return getGuide(requireDb(), request.id);
    case 'searchGuides':
      return searchGuides(requireDb(), request.query);
  }
}

self.onmessage = async (event: MessageEvent<{ id: number; request: Request }>) => {
  const { id, request } = event.data;
  let reply: Reply;
  try {
    reply = { id, ok: true, result: await handle(request) };
  } catch (error) {
    reply = { id, ok: false, error: error instanceof Error ? error.message : String(error) };
  }
  self.postMessage(reply);
};
