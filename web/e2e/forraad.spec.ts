// Forråd (D-046): household and water against the stock list, water as one figure with the month
// it was checked, quick adding (guessed category, linked stock-list line, month dates, "Gem og
// tilføj en til"), editing and deleting, kept after a reload, and a copy saved and restored as a
// file; offline. Settings opens from the gear.

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

// A month from now, as the app names it ("maj 2027") and as the pickers take it.
const monthIn = (months: number) => {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() + months);
  return { name: new Intl.DateTimeFormat('da-DK', { month: 'long', year: 'numeric' }).format(d), month: String(d.getMonth() + 1), year: String(d.getFullYear()) };
};

async function pickMonth(page: Page, months: number) {
  const m = monthIn(months);
  await page.getByRole('combobox', { name: 'Måned' }).selectOption(m.month);
  await page.getByRole('combobox', { name: 'År' }).selectOption(m.year);
}

test('Forråd: water as one figure; quick adding with guessed categories and month dates; kept after reload; offline', async ({ app: { page, context } }) => {
  await openOffline(page, context);
  const water = page.getByRole('region', { name: 'Drikkevand' });
  await expect(water.getByText(/^0\sL af 9\sL$/)).toBeVisible();

  await page.getByRole('button', { name: 'Ret husstand' }).click();
  await page.getByRole('button', { name: 'Personer +1' }).click();
  await page.getByRole('radio', { name: '7 døgn' }).check({ force: true });
  await page.getByRole('button', { name: 'Færdig' }).click();
  await expect(page.getByText('2 personer · 7 døgn')).toBeVisible();
  await expect(water.getByText(/^0\sL af 42\sL$/)).toBeVisible();

  // Water: how much, and when it was last checked (this month unless changed). Nothing else.
  await expect(water.getByText('Ikke tjekket endnu')).toBeVisible();
  await water.getByRole('button', { name: 'Ret' }).click();
  await water.getByLabel('Liter på lager').fill('12');
  await water.getByRole('button', { name: 'Gem', exact: true }).click();
  await expect(water.getByText(/^12\sL af 42\sL$/)).toBeVisible();
  await expect(water.getByText(`Sidst tjekket ${monthIn(0).name}`)).toBeVisible();
  await expect(water.getByText(`Tjek igen i ${monthIn(6).name}`)).toBeVisible();

  // Adding: a name and a month. The category is guessed; the stock-list line is linked.
  await page.getByRole('link', { name: 'Tilføj til forrådet' }).click();
  const name = page.getByLabel('Hvad er det?');
  await name.fill('makr');
  await expect(page.getByRole('list', { name: 'Forslag' }).getByRole('button', { name: /Dåser med fisk eller kød/ })).toBeVisible();
  await name.fill('Makrel i tomat');
  await expect(page.getByText('Mad · Tæller som: Dåser med fisk eller kød')).toBeVisible();
  await page.getByRole('button', { name: 'Antal +1' }).click();
  await pickMonth(page, 1);
  await page.getByRole('button', { name: 'Gem og tilføj en til' }).click();

  // The next one starts empty, with the same month.
  await expect(page.getByText('Makrel i tomat er gemt.')).toBeVisible();
  await expect(name).toHaveValue('');
  await expect(page.getByRole('combobox', { name: 'Måned' })).toHaveValue(monthIn(1).month);
  await name.fill('Plaster');
  await expect(page.getByText('Medicin og hygiejne · Tæller som: Førstehjælpskasse')).toBeVisible();
  await page.getByRole('button', { name: 'Gem og tilføj en til' }).click();

  // An unknown name goes to Mad; the category can be changed. A size is optional, under Mere.
  await name.fill('Paraply');
  await expect(page.getByText('Mad', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Skift kategori (nu mad)' }).click();
  await page.locator('label', { hasText: 'Lys, varme og andet' }).click();
  await page.getByRole('combobox', { name: 'Måned' }).selectOption('');
  await page.getByRole('button', { name: 'Mere' }).click();
  await page.getByLabel('Størrelse').fill('Stor');
  await page.getByRole('button', { name: 'Gem og tilføj en til' }).click();

  // Something already past its month.
  await name.fill('Kiks');
  await pickMonth(page, -1);
  await page.getByRole('button', { name: 'Gem', exact: true }).click();

  await expect(page.getByRole('heading', { level: 1, name: 'Forråd' })).toBeVisible();
  const food = page.getByRole('region', { name: 'Mad' });
  await expect(food.getByRole('link', { name: 'Ret Makrel i tomat' })).toContainText(`2 stk. · Bedst før ${monthIn(1).name}`);
  await expect(food.getByRole('link', { name: /^Dåser med fisk eller kød/ })).toBeHidden();
  await expect(food.getByRole('link', { name: 'Ret Kiks' })).toContainText(`Udløbet ${monthIn(-1).name}`);
  await expect(page.getByRole('region', { name: 'Medicin og hygiejne' }).getByRole('link', { name: 'Ret Plaster' })).toContainText(`Bedst før ${monthIn(1).name}`);
  await expect(page.getByRole('region', { name: 'Lys, varme og andet' }).getByRole('link', { name: 'Ret Paraply' })).toContainText('1 stk. · Stor');
  const dates = page.getByRole('region', { name: 'Holdbarhed' });
  await expect(dates.getByText('Kiks')).toBeVisible();
  await expect(dates.getByText('Makrel i tomat')).toBeVisible();

  await page.reload();
  await expect(water.getByText(/^12\sL af 42\sL$/)).toBeVisible();
  await expect(food.getByRole('link', { name: 'Ret Makrel i tomat' })).toBeVisible();

  await food.getByRole('link', { name: 'Ret Kiks' }).click();
  page.once('dialog', (dialog) => void dialog.accept());
  await page.getByRole('button', { name: 'Slet' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Forråd' })).toBeVisible();
  await expect(food.getByRole('link', { name: 'Ret Kiks' })).toBeHidden();

  // Settings is the gear at the top right; the water can be shown in US gallons.
  await page.getByRole('link', { name: 'Indstillinger' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Indstillinger' })).toBeVisible();
  await page.getByText('Gallon (US)').click(); // not forced: the floating tab bar may cover it until scrolled
  await page.getByRole('button', { name: 'Tilbage' }).click();
  await expect(water.getByText(/^3,2\sgal af 11\sgal$/)).toBeVisible();
});

test('Forråd: a copy saved as a file brings the supplies back; offline', async ({ app: { page, context } }) => {
  // Use the download, not the share sheet, so the file can be read back.
  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'canShare', { value: undefined });
  });
  await openOffline(page, context);

  await page.getByRole('region', { name: 'Mad' }).getByRole('link', { name: 'Tilføj til mad' }).click();
  await page.getByLabel('Hvad er det?').fill('Knækbrød');
  await page.getByRole('button', { name: 'Gem', exact: true }).click();

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
