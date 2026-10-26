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

  const map = page.getByTestId('map');
  await expect(map).toHaveAttribute('data-ready', 'true', { timeout: 30_000 });
  const features = Number(await map.getAttribute('data-features'));
  expect(features).toBeGreaterThan(20);
  await expect(page.getByText('© OpenStreetMap contributors')).toBeVisible();
  expect(foreign).toEqual([]);
});
