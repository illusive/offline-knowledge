import { defineConfig } from '@playwright/test';

// End-to-end tests against the production build, in WebKit (the engine behind Safari).
export default defineConfig({
  testDir: 'e2e',
  timeout: 30_000,
  // Browser setup lives in e2e/fixtures.ts (persistent WebKit profiles, iPhone 15 viewport).
  use: { locale: 'da-DK' },
  workers: 1,
  webServer: {
    command: 'npm run build && npx vite preview --port 4173 --strictPort',
    url: 'http://localhost:4173/',
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
