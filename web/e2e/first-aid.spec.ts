import { expect, test } from './fixtures.ts';

test('first aid: list, a guide with steps and photos, related guide; then offline', async ({ app: { page, context } }) => {
  await page.goto('./');
  await page.getByRole('link', { name: /Førstehjælp/ }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Førstehjælp' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Ring 112, alarmcentralen' })).toHaveAttribute('href', 'tel:112');
  // The three main points as their own section, the rest underneath.
  const mainPoints = page.getByRole('region', { name: 'Førstehjælpens 3 hovedpunkter' });
  await expect(mainPoints.getByText('Punkt 1: Skab sikkerhed')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Alle vejledninger' })).toBeVisible();
  await expect(page.getByText('HLR: hjertelungeredning').first()).toBeVisible();

  // Search inside the guides' text.
  const search = page.getByRole('searchbox', { name: 'Søg i førstehjælp' });
  await search.fill('blodpøl');
  await expect(page.getByRole('link', { name: /^Massive blødninger/ })).toBeVisible();
  await search.fill('zzzz');
  await expect(page.getByText('Ingen vejledninger matcher "zzzz".')).toBeVisible();
  await search.fill('');

  await page.getByRole('link', { name: /^Stabilt sideleje/ }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Stabilt sideleje' })).toBeVisible();
  await expect(page.getByText('Bøj fjerneste ben i knæleddet')).toBeVisible();
  const photo = page.getByRole('img', { name: 'Det fjerneste ben er bøjet i knæet.' });
  await expect(photo).toBeVisible();
  expect(await photo.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
  await expect(page.getByText(/Kilde: ABC Førstehjælpshåndbogen .*, s\. 22–23/)).toBeVisible();
  await expect(page.getByText(/Sammenholdt med: Dansk Råd for Genoplivning/)).toBeVisible();

  // Related guide, then back.
  await page.getByRole('link', { name: /^Er der vejrtrækning\?/ }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Er der vejrtrækning?' })).toBeVisible();
  await page.getByRole('button', { name: 'Tilbage' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Stabilt sideleje' })).toBeVisible();

  // Offline: the guide and its photos come from the pack on the device.
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await context.setOffline(true);
  await page.goto('./#/guide/hlr-voksne');
  await expect(page.getByRole('heading', { level: 1, name: 'Basal hjertelungeredning (HLR)' })).toBeVisible();
  await expect(page.getByText('Trykdybden skal være 5 cm, men ikke over 6 cm')).toBeVisible();
  const flowchart = page.getByRole('img', { name: /^Rutediagram med fotos/ });
  await expect(flowchart).toBeVisible();
  expect(await flowchart.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
});
