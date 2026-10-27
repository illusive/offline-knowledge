// Guides (D-037): verbatim text from one primary source, laid out for reading. Every text a block
// shows must be found word for word in the source (checked by lib/guides.ts); layout and order may
// differ from the source (D-027 as changed 2026-10-27).
// One JSON file per guide in content/guides/<category>/<id>.json; images in content/guides/images/.

export type GuideCategory = 'first-aid';

export type GuideBlock =
  | { kind: 'heading'; text: string; page: number }
  | { kind: 'text'; text: string; page: number }
  | { kind: 'steps'; title?: string; items: string[]; images?: StepImage[]; page: number }   // numbered
  | { kind: 'list'; title?: string; items: string[]; page: number }    // bullets
  | { kind: 'warning'; title?: string; text?: string; items?: string[]; page: number }
  | { kind: 'image'; file: string; alt: string; caption?: string; page: number }; // alt is ours (accessibility)

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
  risk: 'high';
  corrections?: Correction[];
  blocks: GuideBlock[];
  checks: SecondCheck[];
  ownerChecked: boolean;    // the project owner has compared the guide with the source (D-027)
  related?: string[];       // other guide ids
}
