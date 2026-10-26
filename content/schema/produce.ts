// Storage and preservation guide for one food (D-033).
// One JSON file per food in content/produce/guides/<storage item id>.json.

export type GuideSectionKey = 'about' | 'prefers' | 'avoid' | 'together' | 'coolStorage' | 'drying' | 'pickling' | 'canning';

export const SECTION_ORDER: GuideSectionKey[] = ['about', 'prefers', 'avoid', 'together', 'coolStorage', 'drying', 'pickling', 'canning'];

// Verdicts summarise what the sources say; 'noSource' / 'noTestedMethod' mean the sources have
// nothing on it, which the app states plainly instead of guessing.
// 'described': a source gives a drying method but no suitability rating.
export type DryingVerdict = 'excellent' | 'good' | 'fair' | 'poor' | 'described' | 'notRecommended' | 'noSource';
export type PicklingVerdict = 'tested' | 'noTestedMethod';
export type CanningVerdict = 'pressure' | 'waterBath' | 'asPickles' | 'notRecommended' | 'noTestedMethod';

export const VERDICTS: Record<'drying' | 'pickling' | 'canning', readonly string[]> = {
  drying: ['excellent', 'good', 'fair', 'poor', 'described', 'notRecommended', 'noSource'],
  pickling: ['tested', 'noTestedMethod'],
  canning: ['pressure', 'waterBath', 'asPickles', 'notRecommended', 'noTestedMethod'],
};

export interface GuideSourceRef {
  sourceId: string;   // registry id
  locator: string;    // where in the source: chapter, section, table, page
  quote: string;      // the original passage; parts of one passage joined with " … "; [brackets] are editorial
  visualOnly?: true;  // the passage is printed as an image (no text layer): transcribed by eye, not checked by the build
}

export interface GuideBlock {
  text: string;       // Danish (D-033: written from the sources, unchecked)
  sourceRef: GuideSourceRef;
}

export interface GuideSection {
  key: GuideSectionKey;
  verdict?: string;   // drying, pickling and canning only (see VERDICTS)
  blocks: GuideBlock[];
}

export interface ProduceGuide {
  id: string;         // storage item id, e.g. 'foodkeeper-297'
  translationChecked: boolean;
  sections: GuideSection[];
}
