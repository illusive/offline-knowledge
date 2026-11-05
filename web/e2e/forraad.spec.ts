// Forråd (D-046): household and water against the stock list, water as one figure with the month
// it was checked, adding by typing one thing after another (D-053: suggestions that float over the
// form, guessed category, linked stock-list line, month dates, "Færdig"), the sheet on each thing
// (D-049: take out, add more, edit, delete), the category changed on the editor, kept after a
// reload, and a copy saved and restored as a file; offline. Settings opens from the gear.

import type { BrowserContext, Locator, Page } from '@playwright/test';
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

// The month is one month field (the phone's roller, D-051) where the browser has one, otherwise a
// month and a year select. These helpers drive whichever the browser shows.
const monthValue = (months: number) => {
  const m = monthIn(months);
  return `${m.year}-${m.month.padStart(2, '0')}`;
};

async function pickMonth(scope: Page | Locator, months: number) {
  const field = scope.locator('input[type="month"]');
  if (await field.count()) return field.fill(monthValue(months));
  const m = monthIn(months);
  await scope.getByRole('combobox', { name: 'Måned' }).selectOption(m.month);
  await scope.getByRole('combobox', { name: 'År' }).selectOption(m.year);
}

async function clearMonth(scope: Page | Locator) {
  if (await scope.locator('input[type="month"]').count()) return scope.getByRole('button', { name: 'Fjern dato' }).click();
  await scope.getByRole('combobox', { name: 'Måned' }).selectOption('');
}

async function expectMonth(scope: Page | Locator, months: number) {
  const field = scope.locator('input[type="month"]');
  if (await field.count()) return expect(field).toHaveValue(monthValue(months));
  await expect(scope.getByRole('combobox', { name: 'Måned' })).toHaveValue(monthIn(months).month);
}

// A thing's row in a category: a button that opens its sheet (D-049), named by the thing first.
const row = (scope: Page | Locator, name: string) => scope.getByRole('button', { name: new RegExp(`^${name}`) });

test('Forråd: water as one figure; quick adding with guessed categories and month dates; kept after reload; offline', async ({ app: { page, context } }) => {
  await openOffline(page, context);
  const water = page.getByRole('region', { name: 'Drikkevand' });
  await expect(water.getByText(/^0\sL af 9\sL$/)).toBeVisible();

  // Nothing yet: a short note, the two add buttons and a link to the recommendations.
  await expect(page.getByText('Der er intet i forrådet endnu.')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Se, hvad myndighederne anbefaler' })).toBeVisible();

  // The household is set once, in Settings.
  await page.getByRole('link', { name: 'Indstillinger' }).click();
  const settings = page.getByRole('region', { name: 'Forråd' });
  await settings.getByRole('button', { name: 'Personer +1' }).click();
  await settings.locator('label', { hasText: '7 døgn' }).click();
  await page.getByRole('button', { name: 'Tilbage' }).click();
  await expect(water.getByText(/^0\sL af 42\sL$/)).toBeVisible();

  // Water: how much, and when it was last checked (this month unless changed). Nothing else.
  await expect(water.getByText('Ikke tjekket endnu')).toBeVisible();
  await water.getByRole('button', { name: 'Ret vand' }).click();
  await water.getByLabel('Liter på lager').fill('12');
  await water.getByRole('button', { name: 'Gem', exact: true }).click();
  await expect(water.getByText(/^12\sL af 42\sL$/)).toBeVisible();
  await expect(water.getByText(`Sidst tjekket ${monthIn(0).name} · Tjek igen i ${monthIn(6).name}`)).toBeVisible();
  await expect(water.getByRole('button', { name: 'Tjekket i dag' })).toBeHidden(); // only when a check is due

  // Adding by typing (D-053): a name and a month. The category is guessed and shown; the
  // stock-list line is linked without asking.
  await page.getByRole('link', { name: 'Skriv selv' }).click();
  const name = page.getByLabel('Navn');
  // The suggestions float over the fields below instead of pushing them down. Products come first,
  // with their line under them, and the line itself last (D-052); a picked product keeps its name.
  const count = page.getByRole('group', { name: 'Antal', exact: true });
  const countTop = async () => (await count.boundingBox())!.y;
  const before = await countTop();
  await name.fill('makr');
  const suggestions = page.getByRole('listbox', { name: 'Forslag' });
  await expect(suggestions.getByRole('option').first()).toHaveAccessibleName(/^Makrel i tomat/);
  await expect(suggestions.getByRole('option', { name: /^Dåser med fisk eller kød/ })).toBeVisible();
  expect(await countTop()).toBe(before);
  await suggestions.getByRole('option', { name: /^Makrel i tomat/ }).click();
  await expect(suggestions).toBeHidden();
  await expect(name).toHaveValue('Makrel i tomat');
  await expect(page.getByText('Mad', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Antal +1' }).click();
  await pickMonth(page, 1);
  await page.getByRole('button', { name: 'Tilføj', exact: true }).click();

  // The next one starts empty, with the same month; a toast says where it went.
  await expect(page.getByText('Makrel i tomat er tilføjet under Mad')).toBeVisible();
  await expect(name).toHaveValue('');
  await expectMonth(page, 1);
  await name.fill('Plaster');
  await expect(page.getByText('Medicin og hygiejne', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Tilføj', exact: true }).click();

  // An unknown name goes to Mad. The size is there without a "Mere": a number and a unit, or a
  // text under "Andet" (D-050).
  await name.fill('Paraply');
  await expect(page.getByText('Mad', { exact: true })).toBeVisible();
  await clearMonth(page);
  await page.getByLabel('Enhed').selectOption('other');
  await page.getByLabel('Beskriv størrelsen').fill('Stor');
  await page.getByRole('button', { name: 'Tilføj', exact: true }).click();

  // Something already past its month. "Færdig" keeps a thing whose name is written.
  await name.fill('Kiks');
  await pickMonth(page, -1);
  await page.getByLabel('Mængde').fill('0,5');
  await page.getByLabel('Enhed').selectOption('kg');
  await page.getByRole('button', { name: 'Færdig' }).click();

  await expect(page.getByRole('heading', { level: 1, name: 'Forråd' })).toBeVisible();
  const food = page.getByRole('region', { name: 'Mad' });
  await expect(row(food, 'Makrel i tomat')).toContainText(`2 stk. · Bedst før ${monthIn(1).name}`);
  await expect(food.getByRole('link', { name: /^Dåser med fisk eller kød/ })).toBeHidden();
  await expect(row(food, 'Kiks')).toContainText(`1 stk. · 0,5 kg · Udløbet ${monthIn(-1).name}`);
  await expect(row(page.getByRole('region', { name: 'Medicin og hygiejne' }), 'Plaster')).toContainText(`Bedst før ${monthIn(1).name}`);
  const other = page.getByRole('region', { name: 'Lys, varme og andet' });
  await expect(row(food, 'Paraply')).toContainText('1 stk. · Stor');
  await expect(food.getByRole('link', { name: 'Se anbefalingerne: Mad til tre døgn' })).toBeVisible();
  const dates = page.getByRole('region', { name: 'Holdbarhed' });
  await expect(dates.getByText('Kiks')).toBeVisible();
  await expect(dates.getByText('Makrel i tomat')).toBeVisible();

  await page.reload();
  await expect(water.getByText(/^12\sL af 42\sL$/)).toBeVisible();
  await expect(row(food, 'Makrel i tomat')).toBeVisible();

  // The sheet: take one out and say when the next one expires.
  const sheet = page.getByRole('dialog', { name: 'Makrel i tomat' });
  await row(food, 'Makrel i tomat').click();
  await expect(sheet.getByText(`2 stk. · Bedst før ${monthIn(1).name}`)).toBeVisible();
  await sheet.getByRole('button', { name: 'Tag ud' }).click();
  await pickMonth(sheet, 4);
  await sheet.getByRole('button', { name: 'Tag 1 ud' }).click();
  await expect(sheet).toBeHidden();
  await expect(page.getByText('Makrel i tomat: 1 stk. taget ud, 1 stk. tilbage.')).toBeVisible();
  await expect(row(food, 'Makrel i tomat')).toContainText(`1 stk. · Bedst før ${monthIn(4).name}`);

  // Add more: the earlier month is the one kept.
  await row(food, 'Makrel i tomat').click();
  await sheet.getByRole('button', { name: 'Læg flere til' }).click();
  await sheet.getByRole('button', { name: 'Antal +1' }).click();
  await pickMonth(sheet, 2);
  await sheet.getByRole('button', { name: 'Læg 2 til' }).click();
  await expect(row(food, 'Makrel i tomat')).toContainText(`3 stk. · Bedst før ${monthIn(2).name}`);

  // Escape closes the sheet; nothing changes.
  await row(food, 'Makrel i tomat').click();
  await expect(sheet).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(sheet).toBeHidden();
  await expect(row(food, 'Makrel i tomat')).toContainText('3 stk.');

  // Taking out the last ones asks, then deletes.
  await row(food, 'Makrel i tomat').click();
  await sheet.getByRole('button', { name: 'Tag ud' }).click();
  for (let i = 0; i < 2; i++) await sheet.getByRole('button', { name: 'Antal +1' }).click();
  page.once('dialog', (dialog) => void dialog.accept());
  await sheet.getByRole('button', { name: 'Tag alle ud' }).click();
  await expect(row(food, 'Makrel i tomat')).toBeHidden();
  await expect(page.getByText('Makrel i tomat er taget ud af forrådet.')).toBeVisible();

  // The editor is one tap away, and changes the category with three choices.
  await row(food, 'Paraply').click();
  await page.getByRole('dialog', { name: 'Paraply' }).getByRole('link', { name: 'Ret navn, kategori og størrelse' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Ret' })).toBeVisible();
  await page.locator('label', { hasText: 'Lys, varme og andet' }).click();
  await page.getByRole('button', { name: 'Gem', exact: true }).click();
  await expect(row(other, 'Paraply')).toContainText('1 stk. · Stor');
  await expect(row(food, 'Paraply')).toBeHidden();

  // "Slet alt" asks, then deletes.
  await row(food, 'Kiks').click();
  page.once('dialog', (dialog) => void dialog.accept());
  await page.getByRole('dialog', { name: 'Kiks' }).getByRole('button', { name: 'Slet alt' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Forråd' })).toBeVisible();
  await expect(row(food, 'Kiks')).toBeHidden();

  // Settings is the gear at the top right; the water can be shown in US gallons.
  await page.getByRole('link', { name: 'Indstillinger' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Indstillinger' })).toBeVisible();
  await page.locator('label', { hasText: 'Gallon (US)' }).click(); // not forced: the floating tab bar may cover it until scrolled
  await page.getByRole('button', { name: 'Tilbage' }).click();
  await expect(water.getByText(/^3,2\sgal af 11\sgal$/)).toBeVisible();
});

test('Forråd: a copy saved as a file brings the supplies back; offline', async ({ app: { page, context } }) => {
  // Use the download, not the share sheet, so the file can be read back.
  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'canShare', { value: undefined });
  });
  await openOffline(page, context);

  await page.getByRole('link', { name: 'Skriv selv' }).click();
  await page.getByLabel('Navn').fill('Knækbrød');
  await page.getByRole('button', { name: 'Færdig' }).click();

  // The copy is in Settings.
  await page.getByRole('link', { name: 'Indstillinger' }).click();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Gem en kopi' }).click();
  const file = await (await download).path();
  expect(JSON.parse(await readFile(file, 'utf8'))).toMatchObject({ app: 'stead', kind: 'backup' });

  await page.getByRole('button', { name: 'Tilbage' }).click();
  await row(page.getByRole('region', { name: 'Mad' }), 'Knækbrød').click();
  page.once('dialog', (dialog) => void dialog.accept());
  await page.getByRole('button', { name: 'Slet alt' }).click();
  await expect(page.getByText('Der er intet i forrådet endnu.')).toBeVisible();
  await page.getByRole('link', { name: 'Indstillinger' }).click();

  page.once('dialog', (dialog) => {
    expect(dialog.message()).toContain('1 ting');
    void dialog.accept();
  });
  await page.locator('input[type="file"]').setInputFiles(file);
  await expect(page.getByText('Forrådet er hentet fra kopien.')).toBeVisible();
  await page.getByRole('navigation', { name: 'Hovedmenu' }).getByRole('link', { name: 'Forråd' }).click();
  await expect(row(page.getByRole('region', { name: 'Mad' }), 'Knækbrød')).toBeVisible();
  await page.getByRole('link', { name: 'Indstillinger' }).click();

  await page.locator('input[type="file"]').setInputFiles({ name: 'x.json', mimeType: 'application/json', buffer: Buffer.from('{"nope":1}') });
  await expect(page.getByText('Filen kunne ikke læses. Vælg en kopi, der er gemt fra stead.')).toBeVisible();
});
