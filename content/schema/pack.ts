// Knowledge pack format (docs/ARCHITECTURE.md §2–3, D-007).
// The app depends on this format only, not on how the pack was produced.

import type { Lang } from './storage.ts';

// Bump when the SQLite schema changes in a way the app must know about.
// 2: storage_notes gained text_da and text_da_checked (D-031).
// 3: produce_sections, produce_blocks, produce_ethylene, produce_relations (D-033).
export const PACK_SCHEMA_VERSION = 9;

export interface PackManifest {
  packId: string;                 // e.g. 'core'
  version: string;
  schemaVersion: number;
  createdAt: string;              // ISO 8601
  file: string;                   // database file name next to the manifest
  sizeBytes: number;
  sha256: string;
  dependencies: { packId: string; minVersion: string }[];
  languages: Lang[];
  counts: { guides: number; produceGuides: number; storageItems: number; sources: number };
  // licenseStatus: registry status (e.g. 'cleared', 'request-needed'); not enforced while private (D-028).
  sources: { id: string; license: string; licenseStatus: string; dataVersion?: string }[];
}
