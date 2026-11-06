// Sunrise and sunset (D-056), offline: the place from the phone's position (asked for on a tap),
// the times and directions for a chosen day (NOAA and USNO values, as in src/sun/sun.test.ts),
// back to today, the place kept after a reload; a refused position leads to the town list.
// Nothing is fetched beyond the app itself.

import type { BrowserContext, Page } from '@playwright/test';
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
  await page.getByRole('link', { name: 'Værktøjer' }).click();
  await page.getByRole('link', { name: /^Sol op og ned/ }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Sol op og ned' })).toBeVisible();
}

const row = (page: Page, label: string) => page.locator('dl > div').filter({ has: page.getByRole('term').filter({ hasText: label }) });

test('Sol op og ned: the position on a tap, the times for a day, back to today; kept after a reload; offline', async ({ app: { page, context } }) => {
  const foreign: string[] = [];
  page.on('request', (r) => {
    if (new URL(r.url()).hostname !== 'localhost') foreign.push(r.url());
  });
  await context.grantPermissions(['geolocation']);
  await context.setGeolocation({ latitude: 55.6761, longitude: 12.5683, accuracy: 25 }); // København
  await openOffline(page, context);

  // No place yet and no home point on the map: the chooser is on the page.
  await expect(page.getByRole('heading', { name: 'Vælg sted' })).toBeVisible();
  await page.getByRole('button', { name: 'Brug min position' }).click();
  await expect(page.getByText('Din position', { exact: true })).toBeVisible();

  // The winter solstice in København (NOAA: 08:37 SE 133°, 15:38 SW 227°; USNO: 07:50–16:25).
  await page.getByLabel('Dato').fill('2026-12-21');
  await expect(row(page, 'Solopgang')).toContainText('08.37');
  await expect(row(page, 'Solopgang')).toContainText('Står op i SØ (133°)');
  await expect(row(page, 'Solnedgang')).toContainText('15.38');
  await expect(row(page, 'Solnedgang')).toContainText('Går ned i SV (227°)');
  await expect(row(page, 'Lyst udenfor')).toContainText('07.50–16.25');
  await expect(row(page, 'Lyst udenfor')).toContainText('Lyst nok til at være ude uden lygte.');
  await expect(row(page, 'Dagens længde')).toContainText('7 t 1 min');
  await expect(row(page, 'Dagens længde')).toContainText('Næsten som i går');

  // Two months later the days grow by minutes.
  await page.getByLabel('Dato').fill('2027-02-21');
  await expect(row(page, 'Dagens længde')).toContainText(/\d min længere end i går/);

  await page.getByRole('button', { name: 'I dag' }).click();
  const today = await page.evaluate(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  await expect(page.getByLabel('Dato')).toHaveValue(today);
  await expect(page.getByRole('button', { name: 'I dag' })).toHaveCount(0);

  await page.reload();
  await expect(page.getByText('Din position', { exact: true })).toBeVisible();
  await expect(row(page, 'Solopgang')).toContainText(/\d\d\.\d\d/);
  expect(foreign).toEqual([]);
});

test('Sol op og ned: a refused position says so, and a town can be picked instead', async ({ app: { page, context } }) => {
  // Stands in for a refused permission prompt (the error Safari gives).
  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: {
        getCurrentPosition: (_ok: unknown, fail: (e: unknown) => void) => fail({ code: 1, PERMISSION_DENIED: 1, message: 'denied' }),
        watchPosition: () => 0,
        clearWatch: () => undefined,
      },
    });
  });
  await openOffline(page, context);
  await page.getByRole('button', { name: 'Brug min position' }).click();
  await expect(page.getByRole('status').filter({ hasText: /^Appen har ikke tilladelse til at bruge din position/ })).toBeVisible();

  await page.getByLabel('By').selectOption({ label: 'Skagen' });
  await expect(page.getByText('Skagen', { exact: true })).toBeVisible();
  // Skagen at midsummer, at the town's centre (57.73° N, 10.58° E); src/sun/sun.test.ts checks
  // the same day against NOAA and USNO a little further south-east.
  await page.getByLabel('Dato').fill('2026-06-21');
  await expect(row(page, 'Solopgang')).toContainText('04.16');
  await expect(row(page, 'Solnedgang')).toContainText('22.23');
  await expect(row(page, 'Lyst udenfor')).toContainText('03.03–23.36');

  // Changing the place opens a sheet with the same choices.
  await page.getByRole('button', { name: 'Skift sted' }).click();
  const sheet = page.getByRole('dialog', { name: 'Vælg sted' });
  await sheet.getByLabel('By').selectOption({ label: 'Rønne' });
  await expect(sheet).toBeHidden();
  await expect(page.getByText('Rønne', { exact: true })).toBeVisible();
});
