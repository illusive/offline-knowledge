// Offline map (D-036): after one online visit, the Kort tab renders the bundled overview with the
// network switched off, and no request ever leaves the app's own host.

import { expect, test } from './fixtures.ts';

test('Kort renders the bundled overview offline, using only local files', async ({ app: { page, context } }) => {
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

  await context.setOffline(true);
  await page.reload();
  await page.getByRole('navigation', { name: 'Hovedmenu' }).getByRole('link', { name: 'Kort' }).click();
  await expect(page).toHaveURL(/#\/map$/);

  // First visit without a downloaded area: the explanation comes first; skip it to see the map.
  await expect(page.getByRole('heading', { name: 'Hent kortet til telefonen' })).toBeVisible({ timeout: 30_000 });
  await page.getByRole('button', { name: 'Ikke nu – vis kortet' }).click();

  const map = page.getByTestId('map');
  await expect(map).toHaveAttribute('data-ready', 'true', { timeout: 30_000 });
  const features = Number(await map.getAttribute('data-features'));
  expect(features).toBeGreaterThan(20);
  await expect(page.getByText('© OpenStreetMap contributors')).toBeVisible();
  expect(foreign).toEqual([]);
});

test('Kort works again after leaving it for another tab', async ({ app: { page } }) => {
  // Reported: Kort → "Ikke nu – vis kortet" → Hjem → Kort gave an empty page.
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('./');
  const nav = page.getByRole('navigation', { name: 'Hovedmenu' });
  await nav.getByRole('link', { name: 'Kort' }).click();
  await page.getByRole('button', { name: 'Ikke nu – vis kortet' }).click();
  await expect(page.getByTestId('map')).toHaveAttribute('data-ready', 'true', { timeout: 30_000 });
  await nav.getByRole('link', { name: 'Hjem' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Hvad har du brug for?' })).toBeVisible();
  await nav.getByRole('link', { name: 'Kort' }).click();
  await expect(page.getByTestId('map')).toHaveAttribute('data-ready', 'true', { timeout: 30_000 });
  await expect(page.getByRole('button', { name: 'Hent kort' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('Vis min position: switched on, the map moves to the position; switched off again', async ({ app: { page, context } }) => {
  await context.grantPermissions(['geolocation']);
  await context.setGeolocation({ latitude: 55.6761, longitude: 12.5683, accuracy: 25 }); // Copenhagen
  await page.goto('./#/map');
  await page.getByRole('button', { name: 'Ikke nu – vis kortet' }).click();
  const map = page.getByTestId('map');
  await expect(map).toHaveAttribute('data-ready', 'true', { timeout: 30_000 });

  const toggle = page.getByRole('button', { name: 'Vis min position' });
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(async () => Number(await map.getAttribute('data-zoom')), { timeout: 15_000 }).toBeGreaterThanOrEqual(14.9);

  await page.getByRole('button', { name: 'Skjul position' }).click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
});

test('Vis min position refused: the switch turns itself off and says why', async ({ app: { page } }) => {
  // No permission granted: WebKit refuses the request.
  await page.goto('./#/map');
  await page.getByRole('button', { name: 'Ikke nu – vis kortet' }).click();
  await expect(page.getByTestId('map')).toHaveAttribute('data-ready', 'true', { timeout: 30_000 });
  const toggle = page.getByRole('button', { name: 'Vis min position' });
  await toggle.click();
  await expect(page.getByText('Appen må ikke bruge din position.', { exact: false })).toBeVisible({ timeout: 15_000 });
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
});
