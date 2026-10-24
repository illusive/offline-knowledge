// Imports fresh fruits and vegetables from the FoodKeeper snapshot into
// content/storage/foodkeeper-produce.json. Danish names come from
// content/storage/names-da.json (translations, each marked checked or not).

import { readFile, writeFile } from 'node:fs/promises';
import type { StorageDataset } from '../schema/storage.ts';
import { dataVersion, FOODKEEPER_SOURCE_ID, mapProduce, type DanishName, type FoodKeeperExport } from '../lib/foodkeeper.ts';
import { loadSource, readClearedSnapshot } from '../lib/registry.ts';

const STORAGE_DIR = new URL('../storage/', import.meta.url);

const source = await loadSource(FOODKEEPER_SOURCE_ID);
const data = JSON.parse((await readClearedSnapshot(source)).toString('utf8')) as FoodKeeperExport;
const danish = JSON.parse(await readFile(new URL('names-da.json', STORAGE_DIR), 'utf8')) as { names: Record<string, DanishName> };

const items = mapProduce(data, danish.names);

const unknownDanish = Object.keys(danish.names).filter((id) => !items.some((i) => i.sourceRef.recordId === id));
if (unknownDanish.length > 0) throw new Error(`names-da.json has ids that are not produce items: ${unknownDanish.join(', ')}`);

const dataset: StorageDataset = {
  sourceId: FOODKEEPER_SOURCE_ID,
  sourceDataVersion: dataVersion(data),
  generatedFrom: { snapshot: source.snapshot!, sha256: source.snapshotSha256! },
  items,
};
await writeFile(new URL('foodkeeper-produce.json', STORAGE_DIR), JSON.stringify(dataset, null, 2) + '\n');

const withDa = items.filter((i) => i.names.da);
const checked = withDa.filter((i) => i.names.da?.checked);
console.log(`FoodKeeper ${dataset.sourceDataVersion}: ${items.length} produce items, ${items.reduce((n, i) => n + i.periods.length, 0)} storage periods.`);
console.log(`Danish names: ${withDa.length}/${items.length} drafted, ${checked.length} checked.`);
