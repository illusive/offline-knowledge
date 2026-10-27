// Bookmarks (D-026): save from a guide, a crop and a food; the saved list is grouped by category and
// opens at the category it was opened from; bookmarks survive a reload and work offline.

import { expect, test } from './fixtures.ts';

test('save, list by category, open at the current category, remove; offline', async ({ app: { page, context } }) => {
  await page.goto('./');
  await expect(page.getByRole('link', { name: 'Gemte' })).toBeVisible();

  await page.goto('./#/guide/stabilt-sideleje');
  await page.getByRole('button', { name: 'Gem til senere' }).click();
  await expect(page.getByRole('button', { name: 'Gem til senere' })).toHaveAttribute('aria-pressed', 'true');
  await page.goto('./#/guide/radiser');
  await page.getByRole('button', { name: 'Gem til senere' }).click();
  await page.goto('./#/food/foodkeeper-297');
  await page.getByRole('button', { name: 'Gem til senere' }).click();

  // From Home: everything, grouped.
  await page.goto('./');
  await page.getByRole('link', { name: 'Gemte (3)' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Gemte' })).toBeVisible();
  for (const [section, item] of [['Førstehjælp', 'Stabilt sideleje'], ['Dyrkning', 'Radiser'], ['Opbevaring af mad', 'Kartofler']]) {
    await expect(page.getByRole('region', { name: new RegExp(`^${section}`) }).getByRole('link', { name: new RegExp(`^${item}`) })).toBeVisible();
  }

  // From a category: the list opens at that category.
  await page.goto('./#/growing');
  await page.getByRole('link', { name: 'Gemte (3)' }).click();
  await expect(page).toHaveURL(/#\/saved\/growing$/);
  await expect(page.getByRole('heading', { level: 2, name: /^Dyrkning/ })).toBeFocused();

  // Survives a reload and works offline; unsave from the item page.
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await context.setOffline(true);
  await page.reload();
  await page.getByRole('region', { name: /^Dyrkning/ }).getByRole('link', { name: /^Radiser/ }).click();
  await page.getByRole('button', { name: 'Gem til senere' }).click();
  await page.goto('./#/saved');
  await expect(page.getByRole('region', { name: /^Dyrkning/ }).getByText('Intet gemt her endnu.')).toBeVisible();
});
