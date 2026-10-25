// Playwright's default WebKit contexts are in-memory and refuse OPFS ("UnknownError"), unlike
// Safari. Each test therefore gets a fresh persistent WebKit profile in a temporary folder.

import { test as base, devices, webkit, type BrowserContext, type Page } from '@playwright/test';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export const BASE_URL = 'http://localhost:4173/';

export async function launchApp(locale: string): Promise<{ context: BrowserContext; page: Page; close: () => Promise<void> }> {
  const dir = mkdtempSync(join(tmpdir(), 'ok-webkit-'));
  const { defaultBrowserType: _ignored, ...iphone } = devices['iPhone 15'];
  const context = await webkit.launchPersistentContext(dir, { ...iphone, locale, baseURL: BASE_URL });
  const page = context.pages()[0] ?? (await context.newPage());
  return {
    context,
    page,
    close: async () => {
      await context.close();
      rmSync(dir, { recursive: true, force: true });
    },
  };
}

export const test = base.extend<{ app: { context: BrowserContext; page: Page } }>({
  app: async ({}, use, testInfo) => {
    const locale = (testInfo.project.use.locale as string | undefined) ?? 'da-DK';
    const app = await launchApp(locale);
    await use(app);
    await app.close();
  },
});

export { expect } from '@playwright/test';
