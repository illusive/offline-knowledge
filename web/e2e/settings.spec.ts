// Settings (D-044): library card and sources from the pack, language and appearance choices kept on
// the device; works offline.

import { expect, test } from './fixtures.ts';

test('Settings: library, sources, language and appearance survive a reload; offline', async ({ app: { page, context } }) => {
  await page.goto('./');
  await expect(page.getByText('Klar uden internet')).toBeAttached({ timeout: 60_000 });
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await context.setOffline(true);
  await page.reload();

  await page.getByRole('link', { name: 'Indstillinger' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Indstillinger' })).toBeVisible();

  const library = page.getByRole('region', { name: 'På telefonen' });
  await expect(library.getByText(/^Indhold \d+\.\d+\.\d+ fra /)).toBeVisible();
  await expect(library.getByText('Guides', { exact: true })).toBeVisible();
  await expect(library.getByRole('link', { name: 'Ingen kort hentet' })).toBeVisible();

  // The sources have their own page (D-064); back returns to Settings.
  await page.getByRole('link', { name: /^Kilder/ }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Kilder' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Patienthåndbogen på sundhed.dk' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Kulilteforgiftning' })).toBeVisible();
  await page.getByRole('button', { name: 'Tilbage' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Indstillinger' })).toBeVisible();

  const html = page.locator('html');
  await page.getByRole('radio', { name: 'Mørk' }).check({ force: true });
  await expect(html).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('radio', { name: 'English' }).check({ force: true });
  await expect(page.getByRole('heading', { level: 1, name: 'Settings' })).toBeVisible();
  await expect(html).toHaveAttribute('lang', 'en');

  await page.reload();
  await expect(page.getByRole('heading', { level: 1, name: 'Settings' })).toBeVisible();
  await expect(html).toHaveAttribute('data-theme', 'dark');
  await expect(page.getByRole('radio', { name: 'Dark' })).toBeChecked();

  await page.getByRole('radio', { name: 'Follow phone' }).first().check({ force: true });
  await expect(page.getByRole('heading', { level: 1, name: 'Indstillinger' })).toBeVisible();
  await page.getByRole('group', { name: 'Udseende' }).getByRole('radio', { name: 'Følg telefonen' }).check({ force: true });
  await expect(html).toHaveAttribute('data-theme', 'light');
});
