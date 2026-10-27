import { expect, test } from './fixtures.ts';

test('Dyrkning: tile on Home, crop page with sections and a link to its food page; offline', async ({ app: { page, context } }) => {
  await page.goto('./');
  await expect(page.getByText('Klar offline')).toBeVisible({ timeout: 60_000 });
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await context.setOffline(true);
  await page.reload();

  await page.getByRole('link', { name: /Dyrkning/ }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Dyrkning' })).toBeVisible();
  await page.getByRole('link', { name: /^Sådan dyrker du radiser/ }).click();
  await expect(page.getByRole('heading', { level: 2, name: 'Såning' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'Frø til næste år' })).toBeVisible();
  await expect(page.getByText('Lav en sårille på 1-1,5 centimeters dybde.')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Ring 112, alarmcentralen' })).toHaveCount(0);

  await page.getByRole('link', { name: 'Holdbarhed og konservering' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Radiser' })).toBeVisible();
});
