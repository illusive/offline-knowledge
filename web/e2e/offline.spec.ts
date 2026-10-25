import { expect, launchApp, test } from './fixtures.ts';

test('home, storing food, detail and back; then the same offline', async ({ app: { page, context } }) => {
  await page.goto('./');
  await expect(page.getByRole('heading', { level: 1, name: 'Hvad har du brug for?' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Ring 112, alarmcentralen' })).toHaveAttribute('href', 'tel:112');

  // Search from Home.
  await page.getByRole('searchbox', { name: 'Søg i indholdet' }).fill('kal');
  await expect(page.getByText('6 fødevarer')).toBeVisible();
  await page.getByRole('searchbox', { name: 'Søg i indholdet' }).fill('');

  // The "Storing food" category.
  await page.getByRole('link', { name: /Opbevaring af mad/ }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Opbevaring af mad' })).toBeVisible();
  await expect(page.getByText('101 fødevarer')).toBeVisible();
  const search = page.getByRole('searchbox', { name: 'Søg efter fødevare' });
  await search.fill('kal');
  await expect(page.getByText('6 fødevarer')).toBeVisible();
  await expect(page.getByRole('listitem').first()).toContainText('Kål');

  await page.getByRole('link', { name: 'Kål Cabbage', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Kål' })).toBeVisible();
  await expect(page.getByText('1–2 uger')).toBeVisible();

  // Back returns to the list with the query kept.
  await page.getByRole('button', { name: 'Tilbage' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Opbevaring af mad' })).toBeVisible();
  await expect(search).toHaveValue('kal');

  // Tab bar.
  const nav = page.getByRole('navigation', { name: 'Hovedmenu' });
  await nav.getByRole('link', { name: 'Værktøjer' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Værktøjer' })).toBeVisible();
  await expect(nav.getByRole('link', { name: 'Værktøjer' })).toHaveAttribute('aria-current', 'page');
  await nav.getByRole('link', { name: 'Hjem' }).click();
  await expect(page.getByText('Klar offline')).toBeVisible();

  // Offline: reload and use the app with the network switched off.
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  expect(await page.evaluate(() => navigator.serviceWorker.controller !== null)).toBe(true);

  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1, name: 'Hvad har du brug for?' })).toBeVisible();
  await page.getByRole('searchbox', { name: 'Søg i indholdet' }).fill('kartof');
  await page.getByRole('link', { name: 'Kartofler Potatoes', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Kartofler' })).toBeVisible();
  // Notes are shown in Danish translation; the original is one tap away (D-031).
  await expect(page.getByText('Tiden i fryseren gælder kogte kartofler og kartoffelmos.')).toBeVisible();
  await expect(page.getByText('Oversat fra engelsk').first()).toBeVisible();
  await page.getByRole('button', { name: 'Vis original' }).click();
  await expect(page.getByText('Freezer timeline applies to cooked and mashed potatoes.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Vis på dansk' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByText('Brug dine sanser')).toBeVisible();
});

test('opened directly on a food, back goes to the food list, then Home', async ({ app: { page } }) => {
  await page.goto('./#/food/foodkeeper-297');
  await expect(page.getByRole('heading', { level: 1, name: 'Kartofler' })).toBeVisible();
  await page.getByRole('button', { name: 'Tilbage' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Opbevaring af mad' })).toBeVisible();
  await page.getByRole('button', { name: 'Tilbage' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Hvad har du brug for?' })).toBeVisible();
});

test('English interface for an English-language browser', async () => {
  const { page, close } = await launchApp('en-GB');
  try {
    await page.goto('./');
    await expect(page.getByRole('heading', { level: 1, name: 'What do you need?' })).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Main menu' }).getByRole('link', { name: 'Settings' })).toBeVisible();
    await page.getByRole('searchbox', { name: 'Search the content' }).fill('kal');
    await expect(page.getByRole('listitem').first()).toContainText('Kale');
  } finally {
    await close();
  }
});
