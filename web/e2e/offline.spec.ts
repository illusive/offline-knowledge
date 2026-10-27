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
  // Guide and notes are shown in Danish; the original wording is one tap away (D-031, D-033).
  await expect(page.getByText('Tiden i fryseren gælder kogte kartofler og kartoffelmos.')).toBeVisible();
  await expect(page.getByText('Teksten er skrevet på dansk ud fra kilderne.')).toBeVisible();
  await page.getByRole('button', { name: 'Vis original' }).click();
  await expect(page.getByText('Freezer timeline applies to cooked and mashed potatoes.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Vis på dansk' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByText('Brug dine sanser')).toBeVisible();
  // Sub-pages (D-034): Holdbarhed is the default; canning is under Konservering.
  const subNav = page.getByRole('navigation', { name: 'Om fødevaren' });
  await expect(subNav.getByRole('link', { name: 'Holdbarhed' })).toHaveAttribute('aria-current', 'page');
  await subNav.getByRole('link', { name: 'Konservering' }).click();
  await expect(page.getByRole('heading', { level: 2, name: 'Henkogning' })).toBeVisible();
  await expect(page.getByText('Kun i trykkoger')).toBeVisible();
  await expect(page.getByText('Brug dine sanser')).toBeVisible();
  await subNav.getByRole('link', { name: 'Kilder' }).click();
  await expect(page.getByText('USDA Handbook 66', { exact: true })).toBeVisible();
  await expect(page.getByText('Brug dine sanser')).toBeVisible();
});

test('opened directly on a food, back goes to the food list, then Home', async ({ app: { page } }) => {
  await page.goto('./#/food/foodkeeper-297');
  await expect(page.getByRole('heading', { level: 1, name: 'Kartofler' })).toBeVisible();
  // Switching sub-pages does not add history entries: back still leaves the food.
  await page.getByRole('navigation', { name: 'Om fødevaren' }).getByRole('link', { name: 'Om' }).click();
  await expect(page).toHaveURL(/#\/food\/foodkeeper-297\/about$/);
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
    await expect(page.getByRole('link', { name: /^Kale/ }).first()).toBeVisible();
  } finally {
    await close();
  }
});
