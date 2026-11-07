import { expect, test } from './fixtures.ts';

test('first aid: list, a guide with steps and photos, related guide; then offline', async ({ app: { page, context } }) => {
  await page.goto('./');
  await page.getByRole('link', { name: /Førstehjælp/ }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Førstehjælp' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Ring 112', exact: true })).toHaveAttribute('href', 'tel:112');
  // The three main points as their own section, the rest underneath.
  const mainPoints = page.getByRole('region', { name: 'Førstehjælpens 3 trin' });
  await expect(mainPoints.getByText('Trin 1: Gør stedet sikkert')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Alle guides' })).toBeVisible();
  await expect(page.getByText('HLR: hjertelungeredning').first()).toBeVisible();

  // The three steps are spelled out on their own page (owner 2026-11-06, D-057).
  await page.goto('./#/guide/tre-hovedpunkter');
  for (const step of ['Trin 1: Gør stedet sikkert', 'Trin 2: Giv førstehjælp', 'Trin 3: Tilkald hjælp']) {
    await expect(page.getByRole('heading', { name: step })).toBeVisible();
  }
  await expect(page.getByText('Er personen bevidstløs, så ring 112 med det samme. Fortsæt derefter førstehjælpen.')).toBeVisible();
  await expect(page.getByText('Er I flere, så lad én ringe 112 med det samme, mens de andre giver førstehjælp.')).toBeVisible();
  await page.goBack();
  await expect(page.getByRole('heading', { level: 1, name: 'Førstehjælp' })).toBeVisible();

  // Search inside the guides' text.
  const search = page.getByRole('searchbox', { name: 'Søg i førstehjælp' });
  await search.fill('blodpøl');
  await expect(page.getByRole('link', { name: /^Livsfarlige blødninger/ })).toBeVisible();
  await search.fill('zzzz');
  await expect(page.getByText('Ingen guides matcher ”zzzz”')).toBeVisible();
  await search.fill('');

  await page.getByRole('link', { name: /^Stabilt sideleje/ }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Stabilt sideleje' })).toBeVisible();
  await expect(page.getByText('Bøj personens ben, der er længst væk fra dig.')).toBeVisible();
  const photo = page.getByRole('img', { name: 'Det fjerneste ben er bøjet i knæet.' });
  await expect(photo).toBeVisible();
  expect(await photo.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
  await expect(page.getByText(/Kilde: ABC Førstehjælpshåndbogen .*, s\. 22–23/)).toBeVisible();
  await expect(page.getByText(/Sammenholdt med: Dansk Råd for Genoplivning/)).toBeVisible();

  // Related guide, then back.
  await page.getByRole('link', { name: /^Trækker personen vejret\?/ }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Trækker personen vejret?' })).toBeVisible();
  await page.getByRole('button', { name: 'Tilbage' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Stabilt sideleje' })).toBeVisible();

  // Offline: the guide and its photos come from the pack on the device. Wait until every file is
  // cached ("Klar uden internet"), or going offline right after a fresh build can race the precache.
  await page.goto('./');
  await expect(page.getByText('Klar uden internet')).toBeAttached({ timeout: 60_000 });
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await context.setOffline(true);
  await page.goto('./#/guide/hlr-voksne');
  await expect(page.getByRole('heading', { level: 1, name: 'Hjertemassage og kunstigt åndedræt' })).toBeVisible();
  await expect(page.getByText('Tryk brystet 5 cm ned – men ikke mere end 6 cm.')).toBeVisible();
  const flowchart = page.getByRole('img', { name: /^Rutediagram med fotos/ });
  await expect(flowchart).toBeVisible();
  expect(await flowchart.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
});

test('a long guide gets "Til toppen" once scrolled down; it goes back up and to the title (D-069)', async ({ app: { page } }) => {
  await page.goto('./#/guide/fremmedlegeme-i-luftvejene');
  await expect(page.getByRole('heading', { level: 1, name: 'Noget galt i halsen' })).toBeVisible();
  const toTop = page.getByRole('button', { name: 'Til toppen' });
  await expect(toTop).toBeHidden(); // aria-hidden until scrolled down
  await page.mouse.wheel(0, 2500);
  await expect(toTop).toBeVisible();
  await toTop.click();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  await expect(page.getByRole('heading', { level: 1, name: 'Noget galt i halsen' })).toBeFocused();
  await expect(toTop).toBeHidden();
});
