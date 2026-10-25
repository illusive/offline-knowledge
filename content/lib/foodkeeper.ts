// Maps the USDA FoodKeeper JSON export to StorageItem records.
// Pure functions only; file access lives in scripts/import-foodkeeper.ts.

import type {
  StorageBasis,
  StorageDuration,
  StorageItem,
  StorageLocation,
  StorageNote,
  StoragePeriod,
  TimeUnit,
} from '../schema/storage.ts';

export const FOODKEEPER_SOURCE_ID = 'us-fsis-foodkeeper';

type Cell = Record<string, unknown>;
type Row = Record<string, unknown>;

export interface FoodKeeperExport {
  sheets: { name: string; data: Cell[][] }[];
}

// Each sheet row is an array of single-key objects; flatten it into one record.
export function sheetRows(data: FoodKeeperExport, sheetName: string): Row[] {
  const sheet = data.sheets.find((s) => s.name === sheetName);
  if (!sheet) throw new Error(`FoodKeeper sheet missing: ${sheetName}`);
  return sheet.data.map((cells) => Object.assign({}, ...cells) as Row);
}

// Source column prefix -> where and from when the period is counted.
const PERIOD_FIELDS: { prefix: string; location: StorageLocation; basis: StorageBasis }[] = [
  { prefix: 'DOP_Pantry', location: 'pantry', basis: 'fromPurchase' },
  { prefix: 'Pantry', location: 'pantry', basis: 'unspecified' },
  { prefix: 'Pantry_After_Opening', location: 'pantry', basis: 'afterOpening' },
  { prefix: 'DOP_Refrigerate', location: 'fridge', basis: 'fromPurchase' },
  { prefix: 'Refrigerate', location: 'fridge', basis: 'unspecified' },
  { prefix: 'Refrigerate_After_Opening', location: 'fridge', basis: 'afterOpening' },
  { prefix: 'Refrigerate_After_Thawing', location: 'fridge', basis: 'afterThawing' },
  { prefix: 'DOP_Freeze', location: 'freezer', basis: 'fromPurchase' },
  { prefix: 'Freeze', location: 'freezer', basis: 'unspecified' },
];

// The tip columns describe a location in general; in the data they often sit
// next to the DOP_ times of the same location, or have no time at all.
const NOTE_FIELDS: { field: string; location: StorageLocation }[] = [
  { field: 'Pantry_tips', location: 'pantry' },
  { field: 'DOP_Pantry_tips', location: 'pantry' },
  { field: 'Refrigerate_tips', location: 'fridge' },
  { field: 'DOP_Refrigerate_tips', location: 'fridge' },
  { field: 'Freeze_Tips', location: 'freezer' },
  { field: 'DOP_Freeze_Tips', location: 'freezer' },
];

const UNITS: Record<string, TimeUnit> = {
  Hours: 'hours',
  Days: 'days',
  Weeks: 'weeks',
  Months: 'months',
  Year: 'years',
  Years: 'years',
};

const SPECIAL: Record<string, StorageDuration> = {
  'Not Recommended': { kind: 'notRecommended' },
  Indefinitely: { kind: 'indefinitely' },
  'When Ripe': { kind: 'untilRipe' },
  'Package use-by date': { kind: 'packageUseByDate' },
};

function num(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function text(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : undefined;
}

// Returns undefined when the source has no value for this period.
// Throws on values the mapping does not understand, so that data changes are noticed.
export function parseDuration(min: unknown, max: unknown, metric: unknown, context: string): StorageDuration | undefined {
  const m = text(metric);
  const lo = num(min);
  const hi = num(max);
  if (m === undefined) {
    if (lo !== undefined || hi !== undefined) throw new Error(`${context}: number without metric`);
    return undefined;
  }
  const special = SPECIAL[m];
  if (special) return special;
  const unit = UNITS[m];
  if (!unit) throw new Error(`${context}: unknown metric "${m}"`);
  if (lo === undefined && hi === undefined) throw new Error(`${context}: metric "${m}" without numbers`);
  const a = lo ?? hi!;
  const b = hi ?? lo!;
  if (a > b) throw new Error(`${context}: min ${a} > max ${b}`);
  return { kind: 'range', min: a, max: b, unit };
}

export function mapPeriods(product: Row, context: string): StoragePeriod[] {
  const periods: StoragePeriod[] = [];
  for (const f of PERIOD_FIELDS) {
    const duration = parseDuration(product[`${f.prefix}_Min`], product[`${f.prefix}_Max`], product[`${f.prefix}_Metric`], `${context} ${f.prefix}`);
    if (duration) periods.push({ location: f.location, basis: f.basis, duration, sourceField: f.prefix });
  }
  return periods;
}

export function mapNotes(product: Row): StorageNote[] {
  const notes: StorageNote[] = [];
  for (const f of NOTE_FIELDS) {
    const t = text(product[f.field]);
    if (t) notes.push({ location: f.location, lang: 'en', text: t, sourceField: f.field });
  }
  return notes;
}

export interface DanishName {
  en: string;           // English reference, 'Name (subtitle)'; must match the source
  name: string;
  subtitle?: string;
  checked: boolean;
}

export function mapProduce(data: FoodKeeperExport, danish: Record<string, DanishName>): StorageItem[] {
  const categories = new Map<number, StorageItem['category']>();
  for (const c of sheetRows(data, 'Category')) {
    if (c['Category_Name'] !== 'Produce') continue;
    const id = num(c['ID']);
    if (id === undefined) continue;
    if (c['Subcategory_Name'] === 'Fresh Fruits') categories.set(id, 'fresh-fruits');
    else if (c['Subcategory_Name'] === 'Fresh Vegetables') categories.set(id, 'fresh-vegetables');
  }

  const items: StorageItem[] = [];
  for (const p of sheetRows(data, 'Product')) {
    const category = categories.get(num(p['Category_ID']) ?? -1);
    if (!category) continue;
    const recordId = String(num(p['ID']));
    const name = text(p['Name']);
    if (!name) throw new Error(`FoodKeeper ${recordId}: missing name`);
    const subtitle = text(p['Name_subtitle']);
    const context = `FoodKeeper ${recordId} (${name})`;

    const item: StorageItem = {
      id: `foodkeeper-${recordId}`,
      category,
      names: { en: subtitle ? { name, subtitle } : { name } },
      keywords: (text(p['Keywords']) ?? '').split(',').map((k) => k.trim()).filter(Boolean),
      periods: mapPeriods(p, context),
      notes: mapNotes(p),
      sourceRef: { sourceId: FOODKEEPER_SOURCE_ID, recordId },
    };
    const da = danish[recordId];
    const enReference = subtitle ? `${name} (${subtitle})` : name;
    if (da && da.en !== enReference) throw new Error(`${context}: names-da.json says "${da.en}", source says "${enReference}"`);
    if (da) item.names.da = da.subtitle ? { name: da.name, subtitle: da.subtitle, checked: da.checked } : { name: da.name, checked: da.checked };
    items.push(item);
  }
  return items;
}

export function dataVersion(data: FoodKeeperExport): string {
  const current = sheetRows(data, 'Version').find((v) => v['Current_Version'] === 'Yes');
  if (!current) throw new Error('FoodKeeper: no row marked Current_Version = Yes');
  return `${num(current['Data_Version_Number'])} (${isoDate(text(current['Modified_Date'])) ?? 'no date'})`;
}

// FoodKeeper dates are US-style MM-DD-YYYY; '09-06-2018' is 6 September 2018.
export function isoDate(usDate: string | undefined): string | undefined {
  if (!usDate) return undefined;
  const m = /^(\d{2})-(\d{2})-(\d{4})$/.exec(usDate);
  if (!m) throw new Error(`Unexpected FoodKeeper date format: ${usDate}`);
  return `${m[3]}-${m[1]}-${m[2]}`;
}
