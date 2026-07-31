import { defineConfig, devices } from '@playwright/test';

/**
 * E2E de flujos de autenticación (RC-003, obligatorio según
 * `08-testing.md`). Corre contra el dev server de Vite y los emuladores de
 * Firebase Auth/Firestore con datos sembrados — nunca contra producción.
 *
 * `npm run emulators` (o `firebase emulators:start --only auth,firestore
 * --import ./e2e/fixtures`) debe estar corriendo antes de `npm run e2e`.
 */
export default defineConfig({
  testDir: './e2e',
  globalSetup: './e2e/global-setup.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
