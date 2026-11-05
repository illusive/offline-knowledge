// Messages between the app and the database worker.

import type { GuideDetail, GuideRow, ItemDetail, ItemRow, SourceRow } from './queries';

// The pack's manifest.json (content/lib/pack.ts); the extra fields are shown in Settings (D-044).
export interface PackInfo {
  version: string;
  sha256: string;
  file: string;
  createdAt?: string;
  sizeBytes?: number;
  counts?: { guides: number; produceGuides: number; storageItems: number; sources: number };
}

export interface InitResult {
  sqliteVersion: string;
  dbName: string;
  importedNow: boolean;
  removedOldPacks: string[];
}

export type Request =
  | { type: 'init'; packUrl: string; pack: PackInfo }
  | { type: 'list' }
  | { type: 'search'; query: string }
  | { type: 'detail'; id: string }
  | { type: 'guides'; category: GuideRow['category'] }
  | { type: 'guide'; id: string }
  | { type: 'searchGuides'; query: string }
  | { type: 'sources' };

export interface Responses {
  init: InitResult;
  list: ItemRow[];
  search: ItemRow[];
  detail: ItemDetail | null;
  guides: GuideRow[];
  guide: GuideDetail | null;
  searchGuides: GuideRow[];
  sources: (SourceRow & { short_name: string })[];
}

export type Reply =
  | { id: number; ok: true; result: Responses[keyof Responses] }
  | { id: number; ok: false; error: string };
