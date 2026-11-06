// "Gode at kunne" (D-059), offline: the fourth group in Når det sker lists the seven guides; the
// knot guide shows its public-domain drawings from the pack; the fire guide opens with its steps.

import { expect, test } from './fixtures.ts';

test('Gode at kunne: seven guides, knot drawings and the fire guide; offline', async ({ app: { page, context } }) => {
  const foreign: string[] = [];
  page.on('request', (r) => {
    const url = new URL(r.url());
    if (url.protocol.startsWith('http') && url.hostname !== 'localhost') foreign.push(r.url()); // images from the pack are blob: URLs
  });
  await page.goto('./');
  await expect(page.getByText('Klar uden internet')).toBeAttached({ timeout: 60_000 });
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await context.setOffline(true);
  await page.reload();

  await page.getByRole('link', { name: /Når det sker$/ }).click();
  const skills = page.getByRole('region', { name: 'Gode at kunne' });
  await expect(skills.getByRole('link')).toHaveText([/^Tænd et bål/, /^Knob/, /^Vask tøj uden strøm og vand/, /^Saml vand/, /^Lav mad uden strøm/, /^Hold telefonen opladet/, /^Hygiejne med lidt vand/]);

  await skills.getByRole('link', { name: /^Knob/ }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Knob' })).toBeVisible();
  const drawings = page.getByRole('main').getByRole('img', { name: /^Tegning i/ });
  await expect(drawings).toHaveCount(7);
  for (const img of await drawings.all()) {
    await img.scrollIntoViewIfNeeded();
    await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0);
  }

  await page.goBack();
  await skills.getByRole('link', { name: /^Tænd et bål/ }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Tænd et bål' })).toBeVisible();
  await expect(page.getByText('Tænd altid bålet fra den side, vinden kommer fra.')).toBeVisible();
  await expect(page.getByText('Brug aldrig en grill eller et bål indenfor.')).toBeVisible();
  expect(foreign).toEqual([]);
});
