// The backup file (D-046): every localStorage value whose key starts with "stead.", as stored.
// Pure, so it can be tested; reading checks the shape and the Forråd data before anything is replaced.

import { KEY, parse } from './store';

export interface BackupFile {
  app: 'stead';
  kind: 'backup';
  version: 1;
  created: string;
  data: Record<string, string>;
}

export function makeBackup(storage: Pick<Storage, 'length' | 'key' | 'getItem'>, now = new Date()): BackupFile {
  const data: Record<string, string> = {};
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (!key?.startsWith('stead.')) continue;
    const value = storage.getItem(key);
    if (value !== null) data[key] = value;
  }
  return { app: 'stead', kind: 'backup', version: 1, created: now.toISOString(), data };
}

// The backup's data and how many things it has in Forråd, or null if it is not a stead backup.
export function readBackup(text: string): { data: Record<string, string>; itemCount: number } | null {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return null;
  }
  if (typeof raw !== 'object' || raw === null) return null;
  const file = raw as Partial<BackupFile>;
  if (file.app !== 'stead' || file.kind !== 'backup' || file.version !== 1 || typeof file.data !== 'object' || file.data === null) return null;
  const data: Record<string, string> = {};
  for (const [key, value] of Object.entries(file.data)) {
    if (key.startsWith('stead.') && typeof value === 'string' && value.length < 2_000_000) data[key] = value;
  }
  let itemCount = 0;
  if (data[KEY] !== undefined) {
    try {
      const forraad = parse(JSON.parse(data[KEY]));
      itemCount = forraad.items.length;
      data[KEY] = JSON.stringify(forraad); // only valid Forråd data is restored
    } catch {
      delete data[KEY];
    }
  }
  return { data, itemCount };
}
