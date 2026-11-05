// Forråd (D-046): household and water against the stock list, checking the water, adding a thing
// by typing (linked to its stock-list line), dates, editing and deleting, kept after a reload, and a
// copy saved and restored as a file; offline. Settings opens from the gear.

import type { BrowserContext, Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { expect, test } from './fixtures.ts';

async function openOffline(page: Page, context: BrowserContext) {
  await page.goto('./');
  await expect(page.getByText('Klar uden internet')).toBeAttached({ timeout: 60_000 });
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await context.setOffline(true);
  await page.reload();
  await page.getByRole('navigation', { name: 'Hovedmenu' }).getByRole('link', { name: 'Forråd' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Forråd' })).toBeVisible();
}

const isoIn = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

test('Forråd: water for the household, checked; a thing linked to the stock list; dates; kept after reload; offline', async ({ app: { page, context } }) => {
  await openOffline(page, context);
  const water = page.getByRole('region', { name: 'Drikkevand' });
  await expect(water.getByText(/^0\sL af 9\sL$/)).toBeVisible();

  await page.getByRole('button', { name: 'Ret husstand' }).click();
  await page.getByRole('button', { name: 'Personer +1' }).click();
  await page.getByRole('radio', { name: '7 døgn' }).check({ force: true });
  await page.getByRole('button', { name: 'Færdig' }).click();
  await expect(page.getByText('2 personer · 7 døgn')).toBeVisible();
  await expect(water.getByText(/^0\sL af 42\sL$/)).toBeVisible();

  await water.getByRole('link', { name: 'Tilføj vand' }).click();
  await page.getByLabel('Hvad er det?').fill('Flaskevand');
  await expect(page.getByText('Tæller som: Drikkevand')).toBeVisible();
  for (let i = 0; i < 5; i++) await page.getByRole('button', { name: 'Antal +1' }).click();
  await page.getByLabel('Hver rummer (L)').fill('1,5');
  await page.getByRole('button', { name: 'Gem' }).click();
  await expect(water.getByText(/^9\sL af 42\sL$/)).toBeVisible();

  await expect(water.getByText('Ikke tjekket endnu')).toBeVisible();
  await water.getByRole('button', { name: 'Tjekket i dag' }).click();
  await expect(water.getByText(/^Sidst tjekket /)).toBeVisible();
  await expect(water.getByText(/^Tjek igen omkring /)).toBeVisible();

  const food = page.getByRole('region', { name: 'Mad' });
  await expect(food.getByRole('link', { name: /^Dåser med fisk eller kød/ })).toBeVisible();
  await food.getByRole('link', { name: 'Tilføj til mad' }).click();
  const name = page.getByLabel('Hvad er det?');
  await name.fill('makr');
  await expect(page.getByRole('list', { name: 'Forslag' }).getByRole('button', { name: /Dåser med fisk eller kød/ })).toBeVisible();
  await name.fill('Makrel i tomat');
  await expect(page.getByText('Tæller som: Dåser med fisk eller kød')).toBeVisible();
  await page.getByLabel('Holdbar til').fill(isoIn(10));
  await page.getByRole('button', { name: 'Gem' }).click();

  await expect(food.getByRole('link', { name: 'Ret Makrel i tomat' })).toBeVisible();
  await expect(food.getByRole('link', { name: /^Dåser med fisk eller kød/ })).toBeHidden();
  await expect(page.getByRole('region', { name: 'Holdbarhed' }).getByText('Makrel i tomat')).toBeVisible();

  // A name of one's own, unlinked from the list: the line stays recommended.
  await food.getByRole('link', { name: 'Tilføj til mad' }).click();
  await page.getByLabel('Hvad er det?').fill('Jasminris');
  await expect(page.getByText('Tæller som: Ris')).toBeVisible();
  await page.getByRole('button', { name: 'Tæller ikke med på listen' }).click();
  await page.getByRole('button', { name: 'Gem' }).click();
  await expect(food.getByRole('link', { name: 'Ret Jasminris' })).toBeVisible();
  await food.getByRole('button', { name: /^Vis alle/ }).click();
  await expect(food.getByRole('link', { name: /^Ris$/ })).toBeVisible();

  await page.reload();
  await expect(water.getByText(/^9\sL af 42\sL$/)).toBeVisible();
  await expect(food.getByRole('link', { name: 'Ret Makrel i tomat' })).toBeVisible();

  await food.getByRole('link', { name: 'Ret Makrel i tomat' }).click();
  page.once('dialog', (dialog) => void dialog.accept());
  await page.getByRole('button', { name: 'Slet' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Forråd' })).toBeVisible();
  await expect(food.getByRole('link', { name: 'Ret Makrel i tomat' })).toBeHidden();
  await expect(page.getByRole('region', { name: 'Holdbarhed' })).toBeHidden();

  // Settings is the gear at the top right; the water can be shown in US gallons.
  await page.getByRole('link', { name: 'Indstillinger' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Indstillinger' })).toBeVisible();
  await page.getByText('Gallon (US)').click(); // not forced: the floating tab bar may cover it until scrolled
  await page.getByRole('button', { name: 'Tilbage' }).click();
  await expect(water.getByText(/^2,4\sgal af 11\sgal$/)).toBeVisible();
});

test('Forråd: a copy saved as a file brings the supplies back; offline', async ({ app: { page, context } }) => {
  // Use the download, not the share sheet, so the file can be read back.
  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'canShare', { value: undefined });
  });
  await openOffline(page, context);

  await page.getByRole('region', { name: 'Mad' }).getByRole('link', { name: 'Tilføj til mad' }).click();
  await page.getByLabel('Hvad er det?').fill('Knækbrød');
  await page.getByRole('button', { name: 'Gem' }).click();

  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Gem en kopi' }).click();
  const file = await (await download).path();
  expect(JSON.parse(await readFile(file, 'utf8'))).toMatchObject({ app: 'stead', kind: 'backup' });

  await page.getByRole('link', { name: 'Ret Knækbrød' }).click();
  page.once('dialog', (dialog) => void dialog.accept());
  await page.getByRole('button', { name: 'Slet' }).click();
  await expect(page.getByRole('link', { name: 'Ret Knækbrød' })).toBeHidden();

  page.once('dialog', (dialog) => {
    expect(dialog.message()).toContain('1 ting');
    void dialog.accept();
  });
  await page.locator('input[type="file"]').setInputFiles(file);
  await expect(page.getByText('Forrådet er hentet fra kopien.')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Ret Knækbrød' })).toBeVisible();

  await page.locator('input[type="file"]').setInputFiles({ name: 'x.json', mimeType: 'application/json', buffer: Buffer.from('{"nope":1}') });
  await expect(page.getByText('Filen kunne ikke læses. Vælg en kopi, der er gemt fra stead.')).toBeVisible();
});
