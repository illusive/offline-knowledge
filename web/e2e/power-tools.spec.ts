// Power-cut tools (D-058), offline: the fridge and freezer clock keeps its start through a reload;
// the boiling timer shows "Færdig" after its minute; the sun tool shows the sun right now and the
// moon; the sirens row opens the guide. Nothing is fetched beyond the app itself.

import type { BrowserContext, Page } from '@playwright/test';
import { expect, test } from './fixtures.ts';

async function offline(page: Page, context: BrowserContext) {
  await page.goto('./');
  await expect(page.getByText('Klar uden internet')).toBeAttached({ timeout: 60_000 });
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await context.setOffline(true);
  await page.reload();
  await page.getByRole('link', { name: 'Værktøjer' }).click();
}

test('Køl og frys: the clock starts, survives a reload, and ends; offline', async ({ app: { page, context } }) => {
  const foreign: string[] = [];
  page.on('request', (r) => {
    if (new URL(r.url()).hostname !== 'localhost') foreign.push(r.url());
  });
  await offline(page, context);
  await page.getByRole('link', { name: /^Køl og frys/ }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Køl og frys' })).toBeVisible();
  await page.getByRole('button', { name: 'Strømmen gik nu' }).click();
  await expect(page.getByText('Strømmen har været væk i')).toBeVisible();
  await expect(page.getByText(/^Kold nok i 3 t 59 min endnu$|^Kold nok i 4 t endnu$/)).toBeVisible();
  await expect(page.getByText('Kold nok i 47 t 59 min endnu').or(page.getByText('Kold nok i 48 t endnu'))).toBeVisible();

  // Five hours ago: the fridge is past its time, and the advice to throw out shows.
  await page.evaluate(() => localStorage.setItem('stead.powerclock.v1', JSON.stringify(Date.now() - 5 * 3_600_000)));
  await page.reload();
  await expect(page.getByText(/^5 t( 1 min)?$/)).toBeVisible();
  await expect(page.getByText('Over tiden')).toBeVisible();
  await expect(page.getByText(/^Har strømmen været væk i mere end 4 timer, så smid/)).toBeVisible();

  await page.getByRole('button', { name: 'Strømmen er tilbage' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Tjek, at køleskabet er højst 5 °C.' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Strømmen gik nu' })).toBeVisible();
  expect(foreign).toEqual([]);
});

test('Kog vand: one minute, then "Færdig"; the sun right now and the moon; the sirens guide; offline', async ({ app: { page, context } }) => {
  await offline(page, context);
  await page.getByRole('link', { name: /^Kog vand/ }).click();
  await expect(page.getByText('Kog det klare vand kraftigt i 1 minut.')).toBeVisible();
  await page.getByRole('button', { name: 'Vandet koger nu' }).click();
  await expect(page.getByRole('button', { name: 'Stop' })).toBeVisible();
  // The time runs from the stored start, so a minute that passed while the phone slept counts.
  await page.evaluate(() => localStorage.setItem('stead.boil.v1', JSON.stringify(Date.now() - 61_000)));
  await page.reload();
  await expect(page.getByRole('status').filter({ hasText: 'Færdig. Lad vandet køle af.' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Start igen' })).toBeVisible();

  // The sun right now and the moon, for København.
  await page.evaluate(() => localStorage.setItem('stead.sun.place.v1', JSON.stringify({ kind: 'town', id: 'koebenhavn' })));
  await page.goto('./#/tools/sun');
  const now = page.getByRole('region', { name: 'Solen lige nu' });
  await expect(now.getByText(/^Står i .+ over horisonten\.$|^Solen er under horisonten lige nu\.$/)).toBeVisible();
  const moon = page.getByRole('region', { name: 'Månen' });
  await expect(moon.getByText(/% af månen er lyst op$/)).toBeVisible();
  await expect(moon.getByText(/^Månen (står op|går ned)$|^Månen (står ikke op|går ikke ned) denne dag\.$/).first()).toBeVisible();

  // The sirens row is a guide, checked against Beredskabsstyrelsen's fact sheet.
  await page.goto('./#/tools');
  await page.getByRole('link', { name: /^Radio og sirener/ }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Når sirenen lyder' })).toBeVisible();
  await expect(page.getByText('Gå indenfor, og lyt til DR eller TV 2.')).toBeVisible();
  await expect(page.getByText('Fare: én tone, der stiger hurtigt og falder langsomt. Den kommer 4 gange, i alt 45 sekunder.')).toBeVisible();
});
