// Guides (D-040, named so since D-070): situations and stock lists, read as plain lists; works offline.

import { expect, test } from './fixtures.ts';

test('Guides: tile, search, stock lists as plain lists with a link to Forråd, bookmark a situation; offline', async ({ app: { page, context } }) => {
  await page.goto('./');
  await expect(page.getByText('Klar uden internet')).toBeAttached({ timeout: 60_000 });
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await context.setOffline(true);
  await page.reload();

  await page.getByRole('link', { name: /emner Guides$/ }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Guides' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Hvis det sker' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Før det sker' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Hjemmeberedskab' })).toBeVisible();

  const search = page.getByRole('searchbox', { name: 'Søg i guides' });
  await search.fill('knækbrød');
  await expect(page.getByRole('link', { name: /^Mad til tre døgn/ })).toBeVisible();
  await search.fill('powerbank');
  await expect(page.getByRole('link', { name: /^Telefon og net er nede/ })).toBeVisible();
  await search.fill('jodtabletter');
  await expect(page.getByRole('link', { name: /^Medicin, førstehjælp og hygiejne/ })).toBeVisible();
  await search.fill('dykpumpe');
  await expect(page.getByRole('link', { name: /^Der er vand i kælderen/ })).toBeVisible();
  await search.fill('kuliltealarm');
  await expect(page.getByRole('link', { name: /^Kulilte/ })).toBeVisible();
  await search.fill('trampolin');
  await expect(page.getByRole('link', { name: /^Storm/ })).toBeVisible();
  await search.fill('');

  // Guides are for reading (D-070): a stock list's lines are bullets with nothing to tick, and the
  // Hjemmeberedskab guides end with a link to Forråd, where the household keeps track.
  await page.getByRole('link', { name: /^Vand til tre døgn/ }).click();
  await expect(page.getByRole('listitem').filter({ hasText: /^3 liter vand pr\. person pr\. døgn/ })).toBeVisible();
  await expect(page.getByRole('checkbox')).toHaveCount(0);
  await expect(page.getByText(/^Du har \d+ af \d+$/)).toHaveCount(0);
  await page.goBack();

  await page.getByRole('link', { name: /^Mad til tre døgn/ }).click();
  await expect(page.getByRole('heading', { level: 2, name: 'Kræver ingen tilberedning' })).toBeVisible();
  await expect(page.getByRole('listitem').filter({ hasText: /^Knækbrød/ })).toBeVisible();
  await expect(page.getByRole('checkbox')).toHaveCount(0);
  await page.getByRole('link', { name: 'Se dit forråd' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Forråd' })).toBeVisible();

  // A list of things to have outside Hjemmeberedskab is a plain list too: the car in snow.
  await page.goto('./#/guide/snestorm');
  await expect(page.getByRole('heading', { level: 2, name: 'Hav det i bilen' })).toBeVisible();
  await expect(page.getByRole('listitem').filter({ hasText: /^Sneskovl$/ })).toBeVisible();
  await expect(page.getByRole('checkbox')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Se dit forråd' })).toHaveCount(0);

  await page.goto('./#/guide/stroemmen-er-gaaet');
  await expect(page.getByRole('heading', { level: 1, name: 'Strømmen er gået' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Ring 112', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Gem til senere' }).click();
  await page.goto('./#/saved/prepare');
  await expect(page.getByRole('region', { name: /^Guides/ }).getByRole('link', { name: /^Strømmen er gået/ })).toBeVisible();
});

test('Ticks kept before Forråd drove the stock lists become Forråd entries once; offline', async ({ app: { page, context } }) => {
  await page.goto('./');
  await expect(page.getByText('Klar uden internet')).toBeAttached({ timeout: 60_000 });
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    localStorage.setItem('stead.supplies.v1', JSON.stringify(['noedder', 'vand-3-liter', 'powerbank']));
  });
  await context.setOffline(true);
  await page.reload();
  await page.getByRole('navigation', { name: 'Hovedmenu' }).getByRole('link', { name: 'Forråd' }).click();
  await expect(page.getByRole('region', { name: 'Mad' }).getByRole('button', { name: /^Nødder/ })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Lys, varme og andet' }).getByRole('button', { name: /^Powerbank/ })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('stead.supplies.v1'))).toBeNull();
});
