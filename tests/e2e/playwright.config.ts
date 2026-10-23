import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

// Load local .env when present (ignored in CI where env vars are injected directly).
dotenv.config();

/**
 * Playwright configuration for the WelcomeBOT (LaunchPad) canvas-app E2E suite.
 *
 * Authentication strategy:
 *  - The `setup` project logs into Microsoft/Entra ID once using a NON-MFA test user
 *    and persists the authenticated session to `.auth/user.json`.
 *  - All test projects reuse that storage state, so the wizard tests never touch the
 *    login screens directly.
 */
export default defineConfig({
  testDir: './tests',
  timeout: 90_000,
  expect: { timeout: 20_000 },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
  ],
  use: {
    baseURL: process.env.DEMO_APP_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 20_000,
    navigationTimeout: 60_000,
  },
  projects: [
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: '.auth/user.json',
      },
      dependencies: ['setup'],
    },
  ],
});
