// Forråd barcode scan (D-047): the camera is replaced by a canvas showing a real EAN-13 barcode, so
// the bundled reader decodes it. Online, the name comes from Open Food Facts (stubbed here); offline,
// the user types it and the app remembers the barcode. Nothing is fetched from a CDN.

import { expect, test } from './fixtures.ts';

const CODE = '5701234567899'; // valid EAN-13 check digit

// Draws CODE as an EAN-13 barcode on a canvas and hands its stream out as the camera.
const FAKE_CAMERA = `
(() => {
  const L = ['0001101','0011001','0010011','0111101','0100011','0110001','0101111','0111011','0110111','0001011'];
  const G = ['0100111','0110011','0011011','0100001','0011101','0111001','0000101','0010001','0001001','0010111'];
  const R = ['1110010','1100110','1101100','1000010','1011100','1001110','1010000','1000100','1001000','1110100'];
  const PARITY = ['LLLLLL','LLGLGG','LLGGLG','LLGGGL','LGLLGG','LGGLLG','LGGGLL','LGLGLG','LGLGGL','LGGLGL'];
  const code = '${CODE}'.split('').map(Number);
  let bits = '101';
  for (let i = 1; i <= 6; i++) bits += (PARITY[code[0]][i - 1] === 'L' ? L : G)[code[i]];
  bits += '01010';
  for (let i = 7; i <= 12; i++) bits += R[code[i]];
  bits += '101';
  const canvas = document.createElement('canvas');
  canvas.width = 640; canvas.height = 480;
  const draw = () => {
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, 640, 480);
    ctx.fillStyle = '#000';
    const w = 4, x0 = (640 - bits.length * w) / 2;
    for (let i = 0; i < bits.length; i++) if (bits[i] === '1') ctx.fillRect(x0 + i * w, 140, w, 200);
  };
  draw();
  setInterval(draw, 100); // keep frames coming
  Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: { getUserMedia: async () => canvas.captureStream(10) } });
})();
`;

test('Forråd: scan a barcode; online the name is looked up, offline it is typed and remembered', async ({ app: { page, context } }) => {
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
  await context.addInitScript(FAKE_CAMERA);

  await page.goto('./');
  await expect(page.getByText('Klar uden internet')).toBeAttached({ timeout: 60_000 });
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();

  // Online: the scan fills in the name from the lookup; it counts as its stock-list line.
  const addFood = async () => {
    await page.goto('./#/forraad');
    await page.getByRole('link', { name: 'Tilføj til forrådet' }).click();
  };
  await addFood();
  await page.getByRole('button', { name: 'Scan stregkode' }).click();
  await expect(page.getByLabel('Hvad er det?')).toHaveValue('Makrel i tomat', { timeout: 15_000 });
  await expect(page.getByText('Varens navn er fra Open Food Facts.')).toBeVisible();
  await expect(page.getByText('Mad · Tæller som: Dåser med fisk eller kød')).toBeVisible();
  await expect(page.getByLabel('Mængde')).toHaveValue('125');
  await expect(page.getByLabel('Enhed')).toHaveValue('g');
  expect(await lookups()).toHaveLength(1);
  expect((await lookups())[0]).toContain(`/product/${CODE}.json`);
  await page.getByRole('button', { name: 'Gem', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Mad' }).getByRole('button', { name: /^Makrel i tomat/ })).toBeVisible();

  // Offline, a known barcode is filled in from the device, without a lookup.
  await context.setOffline(true);
  await page.reload();
  await addFood();
  await page.getByRole('button', { name: 'Scan stregkode' }).click();
  await expect(page.getByLabel('Hvad er det?')).toHaveValue('Makrel i tomat', { timeout: 15_000 });
  expect(await lookups()).toHaveLength(1);

  // Offline and unknown: the user is asked to type the name, which is remembered with the barcode.
  await page.evaluate(() => {
    const data = JSON.parse(localStorage.getItem('stead.forraad.v1')!);
    data.products = {};
    localStorage.setItem('stead.forraad.v1', JSON.stringify(data));
  });
  await page.reload();
  await addFood();
  await page.getByRole('button', { name: 'Scan stregkode' }).click();
  await expect(page.getByText(/^Varen kan ikke slås op uden internet/)).toBeVisible({ timeout: 15_000 });
  await page.getByLabel('Hvad er det?').fill('Makrel, egen');
  await page.getByRole('button', { name: 'Gem', exact: true }).click();
  const products = await page.evaluate(() => JSON.parse(localStorage.getItem('stead.forraad.v1')!).products);
  expect(products).toEqual({ [CODE]: { name: 'Makrel, egen' } });
  await expect(page.getByRole('region', { name: 'Mad' }).getByRole('button', { name: /^Makrel, egen/ })).toBeVisible();

  expect(foreign).toEqual([]);
});

test('Forråd: a refused camera says so and the name can still be typed', async ({ app: { page, context } }) => {
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
  await page.goto('./#/forraad/new/food');
  await page.getByRole('button', { name: 'Scan stregkode' }).click();
  await expect(page.getByText(/^Appen fik ikke lov til at bruge kameraet/)).toBeVisible();
  await page.getByRole('dialog').getByRole('button', { name: 'Annuller' }).click();
  await expect(page.getByRole('dialog')).toBeHidden();
  await page.getByLabel('Hvad er det?').fill('Knækbrød');
});
