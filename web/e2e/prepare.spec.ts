// "Når det sker" (D-040): situations and stock lists; ticks stay on the device; works offline.

import { expect, test } from './fixtures.ts';

test('Når det sker: tile, search, tick items in a stock list, bookmark a situation; offline', async ({ app: { page, context } }) => {
  await page.goto('./');
  await expect(page.getByText('Klar uden internet')).toBeAttached({ timeout: 60_000 });
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await context.setOffline(true);
  await page.reload();

  await page.getByRole('link', { name: /Når det sker/ }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Når det sker' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Hvis det sker' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Før det sker' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Hjemmeberedskab' })).toBeVisible();

  const search = page.getByRole('searchbox', { name: 'Søg i Når det sker' });
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

  // The water lines follow the water in Forråd (D-048); they link there instead of ticking.
  await page.getByRole('link', { name: /^Vand til tre døgn/ }).click();
  await expect(page.getByText('Du har 0 af 2')).toBeVisible();
  await expect(page.getByRole('link', { name: /^3 liter vand pr\. person pr\. døgn\. Mangler/ })).toBeVisible();
  await page.goBack();

  // Ticking a line puts it in Forråd; a thing entered in Forråd ticks its line (D-048).
  await page.getByRole('link', { name: /^Mad til tre døgn/ }).click();
  await expect(page.getByRole('heading', { level: 2, name: 'Kræver ingen tilberedning' })).toBeVisible();
  await expect(page.getByText(/^Du har 0 af \d+$/)).toBeVisible();
  await page.getByRole('checkbox', { name: /^Knækbrød/ }).check({ force: true });
  await page.getByRole('checkbox', { name: /^Olie til madlavning/ }).check({ force: true });
  await expect(page.getByText(/^Du har 2 af \d+$/)).toBeVisible();
  await page.reload();
  await expect(page.getByText(/^Du har 2 af \d+$/)).toBeVisible();
  await expect(page.getByRole('checkbox', { name: /^Knækbrød/ })).toBeChecked();

  await page.getByRole('navigation', { name: 'Hovedmenu' }).getByRole('link', { name: 'Forråd' }).click();
  const food = page.getByRole('region', { name: 'Mad' });
  await expect(food.getByRole('button', { name: /^Knækbrød/ })).toBeVisible();
  await expect(food.getByRole('button', { name: /^Olie til madlavning/ })).toBeVisible();
  await page.getByRole('link', { name: 'Tilføj til forrådet' }).click();
  await page.getByLabel('Hvad er det?').fill('Makrel i tomat');
  await page.getByRole('button', { name: 'Gem', exact: true }).click();
  await page.goto('./#/guide/mad-til-tre-doegn');
  await expect(page.getByRole('checkbox', { name: /^Dåser med fisk eller kød/ })).toBeChecked();
  await expect(page.getByRole('checkbox', { name: /^Dåser med fisk eller kød/ })).toBeDisabled();
  await expect(page.getByText('I forrådet: Makrel i tomat')).toBeVisible();
  await expect(page.getByText(/^Du har 3 af \d+$/)).toBeVisible();

  // Unticking removes what the tick added.
  await page.getByRole('checkbox', { name: /^Knækbrød/ }).uncheck({ force: true });
  await expect(page.getByText(/^Du har 2 af \d+$/)).toBeVisible();

  await page.goto('./#/guide/stroemmen-er-gaaet');
  await expect(page.getByRole('heading', { level: 1, name: 'Strømmen er gået' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Ring 112', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Gem til senere' }).click();
  await page.goto('./#/saved/prepare');
  await expect(page.getByRole('region', { name: /^Når det sker/ }).getByRole('link', { name: /^Strømmen er gået/ })).toBeVisible();
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
