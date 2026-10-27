// Guides (D-037): verbatim text from one primary source, laid out for reading. Every text a block
// shows must be found word for word in the source (checked by lib/guides.ts); layout and order may
// differ from the source (D-027 as changed 2026-10-27).
// One JSON file per guide in content/guides/<category>/<id>.json; images in content/guides/images/.

export type GuideCategory = 'first-aid' | 'growing';

// Fixed section headings for growing guides (the app shows them in its own words, D-038).
export const GROWING_SECTIONS = ['sowing', 'conditions', 'care', 'harvest', 'seeds', 'neighbours'] as const;
export type GrowingSection = (typeof GROWING_SECTIONS)[number];

// `page`: the PDF page; 1 for HTML sources. `sourceId`: only in low-risk guides, a block may come
// from another registered source than the guide's (e.g. a general seed-saving page).
export type GuideBlock = { sourceId?: string } & (
  | { kind: 'heading'; text: string; page: number }
  | { kind: 'section'; key: GrowingSection; page: number }   // a fixed heading; no source text
  | { kind: 'text'; text: string; page: number }
  | { kind: 'steps'; title?: string; items: string[]; images?: StepImage[]; page: number }   // numbered
  | { kind: 'list'; title?: string; items: string[]; page: number }    // bullets
  | { kind: 'warning'; title?: string; text?: string; items?: string[]; page: number }
  | { kind: 'image'; file: string; alt: string; caption?: string; page: number } // alt is ours (accessibility)
);

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
  summary?: string;         // verbatim; shown in lists
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
  // Growing (D-038, owner 2026-10-27): a plain name for lists and the page title (our words, e.g.
  // "Radiser"), and the growing period as a subtitle, written by us from quoted passages that
  // the build finds in the source (parts joined with " … ").
  name?: string;
  season?: { text: string; quote: string };
}
