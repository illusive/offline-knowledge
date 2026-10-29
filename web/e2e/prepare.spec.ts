// "Når det sker" (D-040): situations and stock lists; ticks stay on the device; works offline.

import { expect, test } from './fixtures.ts';

test('Når det sker: tile, search, tick items in a stock list, bookmark a situation; offline', async ({ app: { page, context } }) => {
  await page.goto('./');
  await expect(page.getByText('Klar uden net')).toBeAttached({ timeout: 60_000 });
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await context.setOffline(true);
  await page.reload();

  await page.getByRole('link', { name: /Når det sker/ }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Når det sker' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Hvis det sker' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Hav det derhjemme' })).toBeVisible();

  const search = page.getByRole('searchbox', { name: 'Søg i Når det sker' });
  await search.fill('knækbrød');
  await expect(page.getByRole('link', { name: /^Mad til tre døgn/ })).toBeVisible();
  await search.fill('');

  await page.getByRole('link', { name: /^Mad til tre døgn/ }).click();
  await expect(page.getByRole('heading', { level: 2, name: 'Kræver ingen tilberedning' })).toBeVisible();
  await expect(page.getByText(/^Du har 0 af \d+$/)).toBeVisible();
  await page.getByRole('checkbox', { name: /^Knækbrød/ }).check({ force: true });
  await page.getByRole('checkbox', { name: /^Olie til madlavning/ }).check({ force: true });
  await expect(page.getByText(/^Du har 2 af \d+$/)).toBeVisible();
  await page.reload();
  await expect(page.getByText(/^Du har 2 af \d+$/)).toBeVisible();
  await expect(page.getByRole('checkbox', { name: /^Knækbrød/ })).toBeChecked();

  await page.goto('./#/guide/stroemmen-er-gaaet');
  await expect(page.getByRole('heading', { level: 1, name: 'Strømmen er gået' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Ring 112, alarmcentralen' })).toBeVisible();
  await page.getByRole('button', { name: 'Gem til senere' }).click();
  await page.goto('./#/saved/prepare');
  await expect(page.getByRole('region', { name: /^Når det sker/ }).getByRole('link', { name: /^Strømmen er gået/ })).toBeVisible();
});
