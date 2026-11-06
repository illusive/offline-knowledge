// Guides (D-037): verbatim text from one primary source, laid out for reading. Every text a block
// shows must be found word for word in the source (checked by lib/guides.ts); layout and order may
// differ from the source (D-027 as changed 2026-10-27).
// One JSON file per guide in content/guides/<category>/<id>.json; images in content/guides/images/.

export type GuideCategory = 'first-aid' | 'growing' | 'preparedness';

// Fixed section headings, shown in the app's own words: growing (D-038), and the owner's three
// food levels for stock lists (D-040).
export const GROWING_SECTIONS = ['sowing', 'conditions', 'care', 'harvest', 'seeds', 'neighbours'] as const;
export const SUPPLY_SECTIONS = ['noPrep', 'somePrep', 'needsPrep'] as const;
export type GrowingSection = (typeof GROWING_SECTIONS)[number] | (typeof SUPPLY_SECTIONS)[number];

// "Når det sker" (D-040, D-043): one card per kind of weather ("Storm"), situations ("Strømmen er
// gået") and stock lists ("Mad til tre døgn").
export type PreparednessGroup = 'weather' | 'situation' | 'supplies';
// Growing (D-057): the kind of crop, for the headed sections in Dyrkning. Shared names with the
// storage groups in the app (Frugt, Grøntsager, Krydderurter).
export type CropGroup = 'vegetables' | 'fruit' | 'herbs';

// A line in a stock list that can be ticked off; `id` is stable across pack versions (ticks are
// stored on the device by id). For Forråd (D-046, pack schema 13): `name` is a short label,
// `amount` the quantity the line gives for one person (the build checks that the number is in the
// line's own text), and `keywords` the everyday words that should find it (e.g. "makrel").
// `products` (D-052): common goods that count as the line ("Makrel i tomat"), offered as names
// while typing in Forråd. Our own labels, not source text; each product belongs to one line. An
// optional field the app reads from the checklist JSON, so the pack schema is unchanged.
export interface ChecklistItem {
  id: string;
  text: string;
  name?: string;
  amount?: ChecklistAmount;
  keywords?: string[];
  products?: string[];
}

export interface ChecklistAmount {
  value: number;
  unit: 'g' | 'L';
  per: 'personDay' | 'person3Days';
}

// `page`: the PDF page; 1 for HTML sources. `sourceId`: only in low-risk guides, a block may come
// from another registered source than the guide's (e.g. a general seed-saving page).
// `original`: the shown text is ours and `original` holds the source's words for each shown field
// (same items, same order); the build checks the original verbatim and the app can show it.
// lang 'en': a Danish translation of an English source (D-041, "Når det sker" only).
// lang 'da': a plain-language rewrite of a Danish source (D-042, language pass).
export type GuideBlock = { sourceId?: string; original?: BlockOriginal } & (
  | { kind: 'heading'; text: string; page: number }
  | { kind: 'section'; key: GrowingSection; page: number }   // a fixed heading; no source text
  | { kind: 'text'; text: string; page: number }
  | { kind: 'steps'; title?: string; items: string[]; images?: StepImage[]; page: number }   // numbered
  | { kind: 'list'; title?: string; items: string[]; page: number }    // bullets
  | { kind: 'checklist'; title?: string; items: ChecklistItem[]; page: number }
  | { kind: 'warning'; title?: string; text?: string; items?: string[]; page: number }
  | { kind: 'image'; file: string; alt: string; caption?: string; page: number } // alt is ours (accessibility)
);

export interface BlockOriginal {
  lang: 'en' | 'da';
  title?: string;
  text?: string;
  items?: string[];
}

// A photo of one step, shown after item `after` (1-based); `page` is where the photo is printed.
export interface StepImage {
  after: number;
  file: string;
  alt: string;
  page: number;
}

// An obvious typo in the source, corrected: `from` is the source's text, `to` what is shown.
export interface Correction {
  from: string;
  to: string;
}

// Where a second, independent authority agrees (D-027); `note` says what agrees (our words, not shown).
export interface SecondCheck {
  sourceId: string;
  locator: string;
  quote: string; // parts joined with " … "; [brackets] are editorial
  note: string;
}

export interface Guide {
  id: string;
  category: GuideCategory;
  order: number;            // position in the category (emergency order)
  title: string;            // verbatim from the source
  summary?: string;         // verbatim, or ours when `originalSummary` is given (D-042); shown in lists
  originalSummary?: string; // the source's words behind a rewritten summary (checked verbatim)
  sourceId: string;
  risk: 'high' | 'low';    // first aid is 'high' (second authority required); growing is 'low'
  corrections?: Correction[];
  // Abbreviations the guide uses, explained at the top (owner: no unexplained abbreviations).
  // `long` must be found in the source; parts separated by ", " are checked one by one.
  abbreviations?: { short: string; long: string }[];
  blocks: GuideBlock[];
  checks: SecondCheck[];
  ownerChecked: boolean;    // the project owner has compared the guide with the source (D-027)
  related?: string[];       // other guide ids
  foodId?: string;          // the storage item this crop becomes (links to its food page)
  group?: PreparednessGroup | CropGroup; // required for 'preparedness' and 'growing'
  // Growing (D-038, owner 2026-10-27): a plain name for lists and the page title (our words, e.g.
  // "Radiser"), and the growing period as a subtitle, written by us from quoted passages that
  // the build finds in the source (parts joined with " … ").
  name?: string;
  season?: { text: string; quote: string };
}
