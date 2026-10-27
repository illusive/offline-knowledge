// Messages between the app and the database worker.

import type { GuideDetail, GuideRow, ItemDetail, ItemRow } from './queries';

export interface PackInfo {
  version: string;
  sha256: string;
  file: string;
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
  | { type: 'guide'; id: string };

export interface Responses {
  init: InitResult;
  list: ItemRow[];
  search: ItemRow[];
  detail: ItemDetail | null;
  guides: GuideRow[];
  guide: GuideDetail | null;
}

export type Reply =
  | { id: number; ok: true; result: Responses[keyof Responses] }
  | { id: number; ok: false; error: string };
