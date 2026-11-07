// Forråd barcode scanning (D-047, D-053): the camera is replaced by a canvas showing a real EAN-13
// barcode, so the bundled reader decodes it. Scanning goes on until "Færdig": each code opens a
// sheet, "Tilføj" goes back to the camera, the same code is read again only after a pause and then
// adds to the thing already there. Online, the name comes from Open Food Facts (stubbed here);
// offline, the user types it and the app remembers the barcode. Nothing is fetched from a CDN.

import { expect, test } from './fixtures.ts';

const CODE = '5701234567899'; // valid EAN-13 check digit

// Draws an EAN-13 barcode on a canvas and hands its stream out as the camera: CODE, or the digits in
// window.__code (a wrong check digit gives a code that is seen but cannot be read). Setting
// window.__showBarcode to false shows an empty picture (the pack taken away).
const FAKE_CAMERA = `
(() => {
  const L = ['0001101','0011001','0010011','0111101','0100011','0110001','0101111','0111011','0110111','0001011'];
  const G = ['0100111','0110011','0011011','0100001','0011101','0111001','0000101','0010001','0001001','0010111'];
  const R = ['1110010','1100110','1101100','1000010','1011100','1001110','1010000','1000100','1001000','1110100'];
  const PARITY = ['LLLLLL','LLGLGG','LLGGLG','LLGGGL','LGLLGG','LGGLLG','LGGGLL','LGLGLG','LGLGGL','LGGLGL'];
  const barsOf = (digits) => {
    const code = digits.split('').map(Number);
    let bits = '101';
    for (let i = 1; i <= 6; i++) bits += (PARITY[code[0]][i - 1] === 'L' ? L : G)[code[i]];
    bits += '01010';
    for (let i = 7; i <= 12; i++) bits += R[code[i]];
    return bits + '101';
  };
  window.__showBarcode = true;
  window.__code = '${CODE}';
  const canvas = document.createElement('canvas');
  canvas.width = 640; canvas.height = 480;
  const draw = () => {
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, 640, 480);
    if (!window.__showBarcode) return;
    const bits = barsOf(window.__code);
    ctx.fillStyle = '#000';
    const w = 2, x0 = (640 - bits.length * w) / 2;
    for (let i = 0; i < bits.length; i++) if (bits[i] === '1') ctx.fillRect(x0 + i * w, 140, w, 200);
  };
  draw();
  setInterval(draw, 100); // keep frames coming
  Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: { getUserMedia: async () => canvas.captureStream(10) } });
})();
`;

test('Forråd: scan one thing after another; online the name is looked up, offline it is typed and remembered', async ({ app: { page, context } }) => {
  const foreign: string[] = [];
  page.on('request', (r) => {
    const host = new URL(r.url()).hostname;
    if (host !== 'localhost') foreign.push(r.url()); // the lookup is answered in the page
  });
  // Playwright cannot route requests from a page the service worker controls, so the lookup is
  // answered inside the page; the URL it was asked for is recorded.
  await context.addInitScript(() => {
    const w = window as unknown as { __lookups: string[] };
    w.__lookups = JSON.parse(sessionStorage.getItem('lookups') ?? '[]');
    const real = window.fetch.bind(window);
    window.fetch = async (input, init) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
      if (!url.includes('openfoodfacts.org')) return real(input, init);
      if (!navigator.onLine) throw new TypeError('offline');
      w.__lookups.push(url);
      sessionStorage.setItem('lookups', JSON.stringify(w.__lookups));
      const product = { product_name: 'Mackerel in tomato', product_name_da: 'Makrel i tomat', brands: 'Testmærke', quantity: '125 g' };
      return new Response(JSON.stringify({ status: 1, product }), { headers: { 'content-type': 'application/json' } });
    };
  });
  const lookups = () => page.evaluate(() => (window as unknown as { __lookups: string[] }).__lookups);
  const showBarcode = (show: boolean) => page.evaluate((v) => ((window as unknown as { __showBarcode: boolean }).__showBarcode = v), show);
  const showCode = (code: string) => page.evaluate((c) => ((window as unknown as { __code: string }).__code = c), code);
  await context.addInitScript(FAKE_CAMERA);

  await page.goto('./');
  await expect(page.getByText('Klar uden internet')).toBeAttached({ timeout: 60_000 });
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();

  const openScanner = async () => {
    await page.goto('./#/forraad');
    await page.getByRole('link', { name: 'Scan varer' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Scan varer' })).toBeVisible();
  };
  const food = page.getByRole('region', { name: 'Mad' });
  const sheet = page.getByRole('dialog', { name: 'Tilføj til forrådet' });

  // A code with a wrong check digit is seen but not read (D-055): the screen says so, the line
  // keeps moving and no sheet opens. The right code is then read.
  await showCode('5701234567898');
  await openScanner();
  await expect(page.locator('.scan-line')).toBeVisible();
  await expect(page.getByText('Stregkoden ses, men kan ikke læses. Hold telefonen stille, lidt længere væk, og sørg for lys.')).toBeVisible({ timeout: 15_000 });
  await expect(sheet).toBeHidden();
  await showCode(CODE);

  // Online: the scan opens a sheet with the name and size from the lookup; the category is guessed.
  // The line stops while the sheet is open.
  await expect(sheet.getByLabel('Navn')).toHaveValue('Makrel i tomat', { timeout: 15_000 });
  await expect(page.locator('.scan-line')).toHaveCount(0);
  await expect(page.getByText('Hold stregkoden inden for rammen.')).toBeVisible();
  await expect(sheet.getByText('Varens navn er fra Open Food Facts.')).toBeVisible();
  await expect(sheet.getByRole('radio', { name: 'Mad' })).toBeChecked();
  await expect(sheet.getByLabel('Mængde')).toHaveValue('125');
  await expect(sheet.getByLabel('Enhed')).toHaveValue('g');
  expect(await lookups()).toHaveLength(1);
  expect((await lookups())[0]).toContain(`/product/${CODE}.json`);
  await sheet.getByRole('button', { name: 'Tilføj', exact: true }).click();
  await expect(sheet).toBeHidden();
  await expect(page.getByText('Makrel i tomat er tilføjet under Mad')).toBeVisible();
  await expect(page.getByText('1 tilføjet', { exact: true })).toBeVisible();

  // The camera goes on. The same pack, still in front of it, is read again after a pause, and then
  // adds to the thing already there.
  const more = page.getByRole('dialog', { name: 'Makrel i tomat' });
  await expect(more.getByText('Den er allerede i forrådet. De nye lægges til.')).toBeVisible({ timeout: 15_000 });
  await showBarcode(false);
  await more.getByRole('button', { name: 'Tilføj', exact: true }).click();
  await expect(page.getByText('Makrel i tomat: 1 stk. lagt til, nu 2 stk.')).toBeVisible();
  await expect(page.getByText('2 tilføjet', { exact: true })).toBeVisible();
  expect(await lookups()).toHaveLength(1);
  await page.getByRole('button', { name: 'Færdig' }).click();
  await expect(food.getByRole('button', { name: /^Makrel i tomat/ })).toContainText('2 stk. · 125 g');

  // Offline, a known barcode is filled in from the device, without a lookup.
  await context.setOffline(true);
  await page.evaluate(() => {
    const data = JSON.parse(localStorage.getItem('stead.forraad.v1')!);
    data.items = [];
    localStorage.setItem('stead.forraad.v1', JSON.stringify(data));
  });
  await page.reload();
  await openScanner();
  await expect(sheet.getByLabel('Navn')).toHaveValue('Makrel i tomat', { timeout: 15_000 });
  expect(await lookups()).toHaveLength(1);
  await showBarcode(false);
  await sheet.getByRole('button', { name: 'Luk' }).click(); // the X (D-070)
  await expect(sheet).toBeHidden();

  // Offline and unknown: the user is asked to type the name, which is remembered with the barcode.
  await page.evaluate(() => {
    const data = JSON.parse(localStorage.getItem('stead.forraad.v1')!);
    data.products = {};
    localStorage.setItem('stead.forraad.v1', JSON.stringify(data));
  });
  await page.reload();
  await expect(page.getByRole('heading', { level: 1, name: 'Scan varer' })).toBeVisible();
  await expect(sheet.getByText(/^Varen kan ikke slås op uden internet/)).toBeVisible({ timeout: 15_000 });
  await showBarcode(false);
  await sheet.getByLabel('Navn').fill('Makrel, egen');
  await sheet.getByRole('button', { name: 'Tilføj', exact: true }).click();
  await expect(page.getByText('Makrel, egen er tilføjet under Mad')).toBeVisible();
  const products = await page.evaluate(() => JSON.parse(localStorage.getItem('stead.forraad.v1')!).products);
  expect(products).toEqual({ [CODE]: { name: 'Makrel, egen' } });

  // A thing without a barcode is typed in the same sheet, without leaving the scanner.
  await page.getByRole('button', { name: 'Uden stregkode' }).click();
  const typed = page.getByRole('dialog', { name: 'Uden stregkode' });
  await expect(typed.getByLabel('Navn')).toBeFocused();
  // A suggestion can be picked inside the sheet (owner 2026-11-06: tapping one closed the list instead).
  await typed.getByLabel('Navn').pressSequentially('knækb');
  await typed.getByRole('listbox', { name: 'Forslag' }).getByRole('option', { name: 'Knækbrød Fra listen', exact: true }).click();
  await expect(typed.getByRole('listbox', { name: 'Forslag' })).toBeHidden();
  await expect(typed.getByLabel('Navn')).toHaveValue('Knækbrød');
  await typed.getByRole('button', { name: 'Tilføj', exact: true }).click();
  await expect(page.getByText('Knækbrød er tilføjet under Mad')).toBeVisible();
  await expect(page.getByText('2 tilføjet', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Færdig' }).click();
  await expect(food.getByRole('button', { name: /^Makrel, egen/ })).toBeVisible();
  await expect(food.getByRole('button', { name: /^Knækbrød/ })).toBeVisible();

  expect(foreign).toEqual([]);
});

test('Forråd: a refused camera says so and leads to typing the name', async ({ app: { page, context } }) => {
  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: {
        getUserMedia: async () => {
          throw new DOMException('denied', 'NotAllowedError');
        },
      },
    });
  });
  await page.goto('./#/forraad');
  await page.getByRole('link', { name: 'Scan varer' }).click();
  await expect(page.getByText(/^Appen fik ikke lov til at bruge kameraet/)).toBeVisible();
  await page.getByRole('button', { name: 'Skriv i stedet' }).click();
  const add = page.getByRole('dialog', { name: 'Tilføj til forrådet' });
  await add.getByLabel('Navn').fill('Knækbrød');
  await add.getByRole('button', { name: 'Luk' }).click(); // every sheet closes with the X (D-070)
  await expect(page.getByRole('region', { name: 'Mad' }).getByRole('button', { name: /^Knækbrød/ })).toBeVisible();
});
