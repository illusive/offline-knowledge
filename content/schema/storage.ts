// Food storage reference data (docs/DECISIONS.md D-014, D-015; docs/ARCHITECTURE.md §3).

export type Lang = 'da' | 'en';

export type StorageLocation = 'pantry' | 'fridge' | 'freezer';

// What the period is counted from. 'unspecified' is used where the source gives
// a time without saying what it is counted from (see docs/OPEN_QUESTIONS.md).
export type StorageBasis =
  | 'fromPurchase'
  | 'afterOpening'
  | 'afterThawing'
  | 'unspecified';

export type TimeUnit = 'hours' | 'days' | 'weeks' | 'months' | 'years';

export type StorageDuration =
  | { kind: 'range'; min: number; max: number; unit: TimeUnit }
  | { kind: 'notRecommended' }
  | { kind: 'indefinitely' }
  | { kind: 'untilRipe' }
  | { kind: 'packageUseByDate' };

export interface StoragePeriod {
  location: StorageLocation;
  basis: StorageBasis;
  duration: StorageDuration;
  sourceField: string;                  // e.g. 'DOP_Refrigerate', for traceability
}

// Source notes belong to a location, not to a single period: a note may exist
// where the source gives no time at all (e.g. herbs: 'Freeze damage will appear.').
export interface StorageNote {
  location: StorageLocation;
  lang: Lang;                           // source language only (D-015)
  text: string;
  sourceField: string;                  // e.g. 'Freeze_Tips'
}

export interface LocalizedName {
  name: string;
  subtitle?: string;
}

export interface StorageItem {
  id: string;                           // stable, e.g. 'foodkeeper-248'
  category: 'fresh-fruits' | 'fresh-vegetables';
  names: {
    en: LocalizedName;                  // as in the source
    da?: LocalizedName & { checked: boolean };  // translation; must be checked before publishing
  };
  keywords: string[];                   // source keywords (English)
  periods: StoragePeriod[];
  notes: StorageNote[];
  sourceRef: { sourceId: string; recordId: string };
}

export interface StorageDataset {
  sourceId: string;
  sourceDataVersion: string;
  generatedFrom: { snapshot: string; sha256: string };
  items: StorageItem[];
}
