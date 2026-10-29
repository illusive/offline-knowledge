// Offline map areas (D-036), against the small fixture archive the preview server answers at
// /stead-maps/ (scripts/map/make-fixture.ts). The download flow: why → what → confirm → progress →
// done; then with the network off the map draws detail from the downloaded tiles.

import type { Page } from '@playwright/test';
import { expect, test } from './fixtures.ts';

async function openKort(page: Page) {
  await page.getByRole('navigation', { name: 'Hovedmenu' }).getByRole('link', { name: 'Kort' }).click();
  await expect(page).toHaveURL(/#\/map$/);
}

async function downloadCountry(page: Page) {
  await expect(page.getByRole('heading', { name: 'Hent kortet til telefonen' })).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText('Hvis internet og mobildata pludselig forsvinder', { exact: false })).toBeVisible();
  await expect(page.getByText('Hele Danmark fylder omkring 600 MB', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'Vælg område' }).click();
  await expect(page.getByRole('heading', { name: 'Hvilket område vil du hente?' })).toBeVisible();
  await expect(page.getByText('25 km: ca. 25–45 MB', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: /^Hele landet/ }).click();
  await expect(page.getByRole('heading', { name: 'Klar til at hente' })).toBeVisible();
  await expect(page.getByText(/Det fylder \d+ MB på telefonen/)).toBeVisible({ timeout: 30_000 });
  await page.getByRole('button', { name: /^Hent nu \(\d+ MB\)$/ }).click();
}

test('the flow explains, downloads, and the area works offline; delete it again', async ({ app: { page, context } }) => {
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
  await openKort(page);
  await downloadCountry(page);
  await expect(page.getByRole('heading', { name: 'Færdig' })).toBeVisible({ timeout: 60_000 });
  await expect(page.getByText('Nu kan du bruge kortet over Danmark – også uden internet.')).toBeVisible();

  // Offline: no first-time step any more; the area's detail is drawn from the downloaded tiles.
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Hent kortet til telefonen' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Hent kort' }).click();
  await expect(page.getByRole('heading', { name: 'Dine områder' })).toBeVisible();
  await page.getByRole('button', { name: /^Danmark Klar uden net/ }).click(); // flies to the area
  const map = page.getByTestId('map');
  await expect.poll(async () => Number(await map.getAttribute('data-zoom')), { timeout: 30_000 }).toBeGreaterThan(10);
  await expect.poll(async () => Number(await map.getAttribute('data-detail-features')), { timeout: 30_000 }).toBeGreaterThan(50);

  // Offline, getting more needs a connection, but areas can still be deleted.
  await page.getByRole('button', { name: 'Hent kort' }).click();
  await expect(page.getByText('Du skal have internet for at hente kort.', { exact: false })).toBeVisible({ timeout: 30_000 });
  await page.getByRole('button', { name: 'Slet: Danmark' }).click();
  await page.getByRole('button', { name: 'Tryk igen for at slette' }).click();
  await expect(page.getByRole('button', { name: /^Danmark/ })).toHaveCount(0);

  expect(foreign).toEqual([]);
});

test('an interrupted download pauses, keeps what it has, and resumes', async ({ app: { page } }) => {
  test.setTimeout(180_000);
  // The connection "drops" before the second part of the archive: the directories (all in the first
  // part of this small archive) and the first tiles arrive, the rest fails (switch in vite.config.ts).
  await page.request.get('/stead-maps/__fail?file=dk-test.001');

  await page.goto('./#/map');
  await downloadCountry(page);

  // Paused with a reason, part of it stored.
  const status = page.getByText(/Sat på pause · \d+ %/);
  await expect(status).toBeVisible({ timeout: 60_000 });
  expect(Number(/(\d+) %/.exec((await status.textContent()) ?? '')?.[1])).toBeGreaterThan(0);

  // Back online: trying again finishes the same area (no second copy).
  await page.request.get('/stead-maps/__fail');
  await page.getByRole('button', { name: 'Prøv igen' }).click();
  await expect(page.getByRole('heading', { name: 'Færdig' })).toBeVisible({ timeout: 60_000 });
  await page.getByRole('button', { name: 'Luk' }).first().click();
  await page.getByRole('button', { name: 'Hent kort' }).click();
  await expect(page.getByRole('button', { name: /^Danmark/ })).toHaveCount(1);
});

test('zoomed in outside the downloaded areas, the map says so', async ({ app: { page } }) => {
  await page.goto('./#/map');
  await page.getByRole('button', { name: 'Ikke nu – vis kortet' }).click();
  const map = page.getByTestId('map');
  await expect(map).toHaveAttribute('data-ready', 'true', { timeout: 30_000 });
  // Zoom in past the overview (zoom 9), one animated step at a time as a person would.
  for (let i = 0; i < 5; i++) {
    await page.getByRole('button', { name: 'Zoom in' }).click();
    await page.waitForTimeout(500);
  }
  await expect.poll(async () => Number(await map.getAttribute('data-zoom')), { timeout: 15_000 }).toBeGreaterThan(9);
  await expect(page.getByText('Kun med net her')).toBeVisible({ timeout: 15_000 });
  await page.getByRole('button', { name: 'Hent', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Hent kortet til telefonen' })).toBeVisible();
});

test('with a home set, Kort opens zoomed in on it (no permission needed)', async ({ app: { page } }) => {
  await page.goto('./#/map');
  await page.getByRole('button', { name: 'Vælg område' }).click();
  await page.getByRole('button', { name: /^Omkring mit hjem/ }).click();
  await page.getByRole('button', { name: 'Tryk på kortet' }).click();
  const map = page.getByTestId('map');
  await expect(map).toHaveAttribute('data-ready', 'true', { timeout: 30_000 });
  await map.click();
  await expect(page.getByText('Dit hjem er valgt.')).toBeVisible();

  await page.reload();
  await expect(map).toHaveAttribute('data-ready', 'true', { timeout: 30_000 });
  await expect.poll(async () => Number(await map.getAttribute('data-zoom')), { timeout: 15_000 }).toBe(12);
});

test('a newer map: the area shows its date, offers the new edition, and the old copy goes only when the new one is ready', async ({ app: { page } }) => {
  test.setTimeout(120_000);
  await page.goto('./');
  await openKort(page);
  await downloadCountry(page);
  await expect(page.getByRole('heading', { name: 'Færdig' })).toBeVisible({ timeout: 60_000 });

  await page.request.get('./stead-maps/__version?v=20991231');
  try {
    await page.reload();
    await page.getByRole('button', { name: 'Hent kort' }).click();
    const area = page.getByRole('listitem').filter({ hasText: 'Danmark' });
    await expect(area.getByText(/^Kort fra 24\. oktober 2026$/)).toBeVisible();
    await expect(area.getByText('Der er kommet en nyere udgave af kortet.', { exact: false })).toBeVisible({ timeout: 30_000 });
    await area.getByRole('button', { name: 'Hent den nye udgave' }).click();
    // When the new edition is complete, only one area is left, from the new date.
    await expect(page.getByRole('listitem').filter({ hasText: 'Danmark' })).toHaveCount(1, { timeout: 60_000 });
    await expect(page.getByText(/^Kort fra 31\. december 2099$/)).toBeVisible({ timeout: 60_000 });
    await expect(page.getByText('Der er kommet en nyere udgave af kortet.', { exact: false })).toHaveCount(0);
  } finally {
    await page.request.get('./stead-maps/__version');
  }
});
