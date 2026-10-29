import { expect, test } from './fixtures.ts';

test('Dyrkning: tile on Home, crop page with sections and a link to its food page; offline', async ({ app: { page, context } }) => {
  await page.goto('./');
  await expect(page.getByText('Klar uden net')).toBeVisible({ timeout: 60_000 });
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await context.setOffline(true);
  await page.reload();

  await page.getByRole('link', { name: /Dyrkning/ }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Dyrkning' })).toBeVisible();
  await expect(page.getByText(/^\d+ afgrøder$/)).toBeVisible();
  await page.getByRole('searchbox', { name: 'Søg i dyrkning' }).fill('kartof');
  await expect(page.getByText('2 afgrøder')).toBeVisible();
  await expect(page.getByRole('link', { name: /^Kartofler Læg sidst i marts/ })).toBeVisible();
  await page.getByRole('searchbox', { name: 'Søg i dyrkning' }).fill('');
  await page.getByRole('link', { name: /^Radiser Så april–august/ }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Radiser' })).toBeVisible();
  await expect(page.getByText('Så april–august · høst efter 2–6 uger')).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'Såning' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'Frø til næste år' })).toBeVisible();
  await expect(page.getByText('Lav en rille, der er 1-1,5 cm dyb.')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Ring 112, alarmcentralen' })).toHaveCount(0);

  await page.getByRole('link', { name: 'Holdbarhed og konservering' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Radiser' })).toBeVisible();
});
