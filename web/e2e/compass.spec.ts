// Compass (D-045) with a simulated iPhone sensor: permission after a tap, direction, hold a course,
// uncertain readings, the course kept after a reload, refusal and no sensor; offline.

import type { Page } from '@playwright/test';
import { expect, test } from './fixtures.ts';

// Stands in for iOS: requestPermission answers what the test sets in window.__permission.
const FAKE_IOS_SENSOR = `
  window.__permission = 'granted';
  DeviceOrientationEvent.requestPermission = () => Promise.resolve(window.__permission);
`;

async function point(page: Page, heading: number, accuracy = 10, times = 1) {
  await page.evaluate(
    ({ heading, accuracy, times }) => {
      for (let i = 0; i < times; i++) {
        const event = new Event('deviceorientation');
        Object.assign(event, { webkitCompassHeading: heading, webkitCompassAccuracy: accuracy });
        window.dispatchEvent(event);
      }
    },
    { heading, accuracy, times },
  );
}

async function openOffline(page: Page, context: import('@playwright/test').BrowserContext) {
  await context.addInitScript(FAKE_IOS_SENSOR);
  await page.goto('./');
  await expect(page.getByText('Klar uden internet')).toBeAttached({ timeout: 60_000 });
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await context.setOffline(true);
  await page.reload();
  await page.getByRole('link', { name: 'Værktøjer' }).click();
  await page.getByRole('link', { name: /^Kompas/ }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Kompas' })).toBeVisible();
}

test('Kompas: start after a tap, hold a course, uncertain, course kept after reload; offline', async ({ app: { page, context } }) => {
  await openOffline(page, context);

  await page.getByRole('button', { name: 'Start kompas' }).click();
  await point(page, 42);
  await expect(page.getByText('NØ 42°')).toBeVisible();
  await expect(page.getByText('Retning fra magnetisk nord')).toBeVisible();

  // While a course is held, the line under the direction says how to turn; the same button stops it.
  await page.getByRole('button', { name: 'Hold denne kurs' }).click();
  await expect(page.getByText('Kurs 42° · Du holder kursen')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Hold denne kurs' })).toBeHidden();

  await point(page, 72, 10, 40); // smoothed: settles on 72
  await expect(page.getByText('Drej 30° til venstre')).toBeVisible();
  await point(page, 20, 10, 40);
  await expect(page.getByText('Drej 22° til højre')).toBeVisible();

  await point(page, 20, -1);
  await expect(page.getByText(/^Kompasset er usikkert/)).toBeVisible();
  await point(page, 20, 5);
  await expect(page.getByText(/^Kompasset er usikkert/)).toBeHidden();

  // Permission was given before: the compass starts without the button, and the course is kept.
  await page.reload();
  await expect(page.getByRole('button', { name: 'Start kompas' })).toBeHidden();
  await expect(async () => {
    await point(page, 42); // until the compass, starting by itself, listens
    await expect(page.getByText('Kurs 42°')).toBeVisible({ timeout: 500 });
  }).toPass();
  await page.getByRole('button', { name: 'Stop med at holde kurs' }).click();
  await expect(page.getByText('Retning fra magnetisk nord')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Hold denne kurs' })).toBeVisible();
});

test('Kompas: refused permission offers to try again; no sensor says so', async ({ app: { page, context } }) => {
  await openOffline(page, context);

  await page.evaluate(() => {
    (window as unknown as { __permission: string }).__permission = 'denied';
  });
  await page.getByRole('button', { name: 'Start kompas' }).click();
  await expect(page.getByRole('alert')).toHaveText(/fik ikke lov til at bruge kompasset/);

  await page.evaluate(() => {
    (window as unknown as { __permission: string }).__permission = 'granted';
  });
  await page.getByRole('button', { name: 'Prøv igen' }).click();
  // Granted, but no reading arrives: after a few seconds the device is taken to have no compass.
  await expect(page.getByText('Denne enhed har ikke et kompas, som appen kan bruge.')).toBeVisible({ timeout: 6000 });
});
