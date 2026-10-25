import { expect, launchApp, test } from './fixtures.ts';

test('search, detail, then the same after going offline', async ({ app: { page, context } }) => {
  await page.goto('./');
  await expect(page.getByRole('heading', { name: 'Holdbarhed' })).toBeVisible();
  await expect(page.getByText('101 fødevarer')).toBeVisible();

  const search = page.getByRole('searchbox', { name: 'Søg efter fødevare' });
  await search.fill('kal');
  await expect(page.getByText('6 fødevarer')).toBeVisible();
  await expect(page.getByRole('listitem').first()).toContainText('Kål');

  await page.getByRole('link', { name: 'Kål Cabbage', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Kål' })).toBeVisible();
  await expect(page.getByText('1–2 uger')).toBeVisible();

  // The service worker must control the page before offline use is possible.
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  expect(await page.evaluate(() => navigator.serviceWorker.controller !== null)).toBe(true);

  await context.setOffline(true);
  await page.goto('./#/');
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Holdbarhed' })).toBeVisible();
  await page.getByRole('searchbox', { name: 'Søg efter fødevare' }).fill('kartof');
  await page.getByRole('link', { name: 'Kartofler Potatoes', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Kartofler' })).toBeVisible();
  await expect(page.getByText('Kildetekst på engelsk').first()).toBeVisible();
});

test('English interface for an English-language browser', async () => {
  const { page, close } = await launchApp('en-GB');
  try {
    await page.goto('./');
    await expect(page.getByRole('heading', { name: 'Food storage' })).toBeVisible();
    await page.getByRole('searchbox', { name: 'Search for a food' }).fill('kal');
    await expect(page.getByRole('listitem').first()).toContainText('Kale');
  } finally {
    await close();
  }
});
