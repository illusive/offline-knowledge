// Power-cut tools (D-058), offline: the fridge and freezer clock keeps its start through a reload;
// the boiling timer shows "Færdig" after its minute; the sun tool shows the sun right now and the
// moon; Tools has no sirens row (D-061). Nothing is fetched beyond the app itself.

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

test('Køleskab og fryser: the timer starts, survives a reload, and ends; offline', async ({ app: { page, context } }) => {
  const foreign: string[] = [];
  page.on('request', (r) => {
    if (new URL(r.url()).hostname !== 'localhost') foreign.push(r.url());
  });
  await offline(page, context);
  // Tools in sections (D-066): the timers have their own heading.
  await expect(page.getByRole('region', { name: 'Timere' }).getByRole('link', { name: /^Kog vand/ })).toBeVisible();
  await page.getByRole('link', { name: /^Køleskab og fryser/ }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Køleskab og fryser' })).toBeVisible();
  await page.getByRole('button', { name: 'Strømmen gik nu' }).click();
  await expect(page.getByText('Strømmen har været væk i')).toBeVisible();
  // An estimate with its assumptions, not a promise that the food is safe (D-071).
  await expect(page.getByText(/^Omkring (3 t 59 min|4 t) tilbage$/)).toBeVisible();
  await expect(page.getByText(/^Omkring (47 t 59 min|48 t) tilbage$/)).toBeVisible();
  await expect(page.getByText(/^Tiderne er et skøn, ikke en måling/)).toBeVisible();
  await expect(page.getByText(/Kold nok/)).toHaveCount(0);

  // Five hours ago: the fridge is past its time, and the advice to throw out shows.
  await page.evaluate(() => localStorage.setItem('stead.powerclock.v1', JSON.stringify(Date.now() - 5 * 3_600_000)));
  await page.reload();
  await expect(page.getByText(/^5 t( 1 min)?$/)).toBeVisible();
  await expect(page.getByText('Over den vejledende tid')).toBeVisible();
  await expect(page.getByText(/^Har strømmen været væk i mere end 4 timer, så smid/)).toBeVisible();

  await page.getByRole('button', { name: 'Strømmen er tilbage' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Tjek, at køleskabet er højst 5 °C.' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Strømmen gik nu' })).toBeVisible();
  expect(foreign).toEqual([]);
});

test('Kog vand: when to start, one minute, the chemical limit in view; the sun right now and the moon; no sirens row in Tools; offline', async ({ app: { page, context } }) => {
  await offline(page, context);
  await page.getByRole('link', { name: /^Kog vand/ }).click();
  await expect(page.getByText('Kog det klare vand kraftigt i 1 minut.')).toBeVisible();
  // When to start, and what boiling cannot do, are in the tool itself (D-071).
  await expect(page.getByText('Tryk først, når vandet koger kraftigt og bobler hele tiden.')).toBeVisible();
  const chemicals = page.getByRole('note').filter({ hasText: /^Vand med brændstof, gift eller andre kemikalier kan ikke gøres drikkeligt/ });
  await expect(chemicals).toBeVisible();
  await page.getByRole('button', { name: 'Vandet koger nu' }).click();
  await expect(page.getByRole('button', { name: 'Stop' })).toBeVisible();
  // The time runs from the stored start, so a minute that passed while the phone slept counts.
  await page.evaluate(() => localStorage.setItem('stead.boil.v1', JSON.stringify(Date.now() - 61_000)));
  await page.reload();
  await expect(page.getByRole('status').filter({ hasText: /^1 minut er gået\. Lad vandet køle af/ })).toBeVisible();
  await expect(chemicals).toBeVisible();
  await expect(page.getByRole('button', { name: 'Start igen' })).toBeVisible();

  // The sun right now and the moon, for København.
  await page.evaluate(() => localStorage.setItem('stead.sun.place.v1', JSON.stringify({ kind: 'town', id: 'koebenhavn' })));
  await page.goto('./#/tools/sun');
  const now = page.getByRole('region', { name: 'Solen lige nu' });
  await expect(now.getByText(/^Står i .+ over horisonten\.$|^Solen er under horisonten lige nu\.$/)).toBeVisible();
  const moon = page.getByRole('region', { name: 'Månen' });
  await expect(moon.getByText(/% af månen er lyst op$/)).toBeVisible();
  await expect(moon.getByText(/^Månen (står op|går ned)$|^Månen (står ikke op|går ikke ned) denne dag\.$/).first()).toBeVisible();

  // The sirens guide is not a tool (D-061): it is only in "Når det sker".
  await page.goto('./#/tools');
  await expect(page.getByRole('link', { name: /^Kog vand/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /sirene/i })).toHaveCount(0);
});

test('HLR-metronom: counts to 30 in time, asks for 2 breaths, goes on and stops; linked from the CPR guide; offline (D-067)', async ({ app: { page, context } }) => {
  await page.clock.install();
  await offline(page, context);
  await page.getByRole('region', { name: 'Førstehjælp' }).getByRole('link', { name: /^HLR-metronom/ }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'HLR-metronom' })).toBeVisible();
  await page.getByRole('button', { name: 'Start' }).click();
  await expect(page.getByText('Tryk i takt. Tæller til 30.')).toBeVisible();

  // 110 a minute: after 30 beats (about 16.4 s) the round asks for the breaths.
  await page.clock.runFor(17_000);
  await expect(page.getByRole('status')).toHaveText('Giv 2 indblæsninger');
  await page.getByRole('button', { name: 'Fortsæt' }).click();
  await expect(page.getByText('Tryk i takt. Tæller til 30.')).toBeVisible();
  await page.getByRole('button', { name: 'Stop' }).click();
  await expect(page.getByRole('button', { name: 'Start' })).toBeVisible();

  await page.goto('./#/guide/hlr-voksne');
  await expect(page.getByRole('link', { name: 'Brug HLR-metronomen' })).toHaveAttribute('href', '#/tools/cpr');
});

test('Omregn mål: cups, °F and pounds to metric, with Danish decimals; offline (D-068)', async ({ app: { page, context } }) => {
  await offline(page, context);
  await page.getByRole('region', { name: 'Mad' }).getByRole('link', { name: /^Omregn mål/ }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Omregn mål' })).toBeVisible();
  const amount = page.getByRole('textbox', { name: 'Mængde' });
  const from = page.getByRole('combobox', { name: 'Fra' });
  await expect(page.getByRole('status')).toHaveText('2,4 dl (237 ml)');
  await amount.fill('350');
  await from.selectOption('fahrenheit');
  await expect(page.getByRole('status')).toHaveText('177 °C');
  await amount.fill('1,5');
  await from.selectOption('lb');
  await expect(page.getByRole('status')).toHaveText('680 g');
  await amount.fill('x');
  await expect(page.getByRole('status')).toHaveText('Skriv et tal.');
});
