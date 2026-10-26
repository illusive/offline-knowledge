// Offline map areas (D-036), against the small fixture archive the preview server answers at
// /stead-maps/ (scripts/map/make-fixture.ts): choose the whole "country", see its size, download,
// then with the network off the map draws detail from the downloaded tiles. Finally delete it.

import { expect, test } from './fixtures.ts';

test('download an area, then see its detail offline; delete it again', async ({ app: { page, context } }) => {
  test.setTimeout(180_000);
  const foreign: string[] = [];
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (!['localhost', '127.0.0.1'].includes(url.hostname) && !['data:', 'blob:'].includes(url.protocol)) foreign.push(request.url());
  });

  await page.goto('./');
  await expect(page.getByText('Klar offline')).toBeVisible({ timeout: 60_000 });
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await page.getByRole('navigation', { name: 'Hovedmenu' }).getByRole('link', { name: 'Kort' }).click();

  // Choose and download: the size is known before anything is downloaded.
  await page.getByRole('button', { name: 'Hent kort' }).click();
  await expect(page.getByText('Du har ikke hentet nogen områder endnu.', { exact: false })).toBeVisible();
  await page.getByRole('navigation', { name: 'Hent et område' }).getByRole('link', { name: 'Hele landet' }).click();
  const country = page.getByRole('radio', { name: /Danmark/ });
  await expect(country).toContainText(/\d+ MB/, { timeout: 30_000 });
  await country.click();
  const download = page.getByRole('button', { name: /^Hent \d+ MB$/ });
  await expect(download).toBeEnabled();
  await download.click();
  await expect(page.getByText(/Klar uden net/)).toBeVisible({ timeout: 60_000 });

  // Offline: the map still has the detail.
  await context.setOffline(true);
  await page.reload();
  await page.getByRole('button', { name: 'Hent kort' }).click();
  await page.getByRole('button', { name: 'Danmark', exact: true }).click(); // flies to the area
  const map = page.getByTestId('map');
  await expect.poll(async () => Number(await map.getAttribute('data-zoom')), { timeout: 30_000 }).toBeGreaterThan(10);
  await expect.poll(async () => Number(await map.getAttribute('data-detail-features')), { timeout: 30_000 }).toBeGreaterThan(50);

  // Offline the panel says downloading needs a connection, but areas can still be deleted.
  await page.getByRole('button', { name: 'Hent kort' }).click();
  await expect(page.getByText('Du skal være på nettet for at hente kort.', { exact: false })).toBeVisible({ timeout: 30_000 });
  await page.getByRole('button', { name: 'Slet: Danmark' }).click();
  await page.getByRole('button', { name: 'Tryk igen for at slette' }).click();
  await expect(page.getByText('Du har ikke hentet nogen områder endnu.', { exact: false })).toBeVisible();

  expect(foreign).toEqual([]);
});

test('an interrupted download pauses, keeps what it has, and resumes', async ({ app: { page } }) => {
  test.setTimeout(180_000);
  // The connection "drops" before the second part of the archive: the directories (all in the first
  // part of this small archive) and the first tiles arrive, the rest fails (switch in vite.config.ts).
  await page.request.get('/stead-maps/__fail?file=dk-test.001');

  await page.goto('./#/map');
  await page.getByRole('button', { name: 'Hent kort' }).click();
  await page.getByRole('navigation', { name: 'Hent et område' }).getByRole('link', { name: 'Hele landet' }).click();
  const country = page.getByRole('radio', { name: /Danmark/ });
  await expect(country).toContainText(/\d+ MB/, { timeout: 30_000 });
  await country.click();
  await page.getByRole('button', { name: /^Hent \d+ MB$/ }).click();

  // Paused with a reason, part of it stored.
  await expect(page.getByText(/Sat på pause · \d+ %/)).toBeVisible({ timeout: 60_000 });
  const paused = await page.getByText(/Sat på pause · \d+ %/).textContent();
  expect(Number(/(\d+) %/.exec(paused ?? '')?.[1])).toBeGreaterThan(0);

  // Back online: resume finishes the same area (no second copy).
  await page.request.get('/stead-maps/__fail');
  await page.getByRole('button', { name: 'Fortsæt: Danmark' }).click();
  await expect(page.getByText(/Klar uden net/)).toBeVisible({ timeout: 60_000 });
  await expect(page.getByRole('button', { name: 'Danmark', exact: true })).toHaveCount(1);
});
