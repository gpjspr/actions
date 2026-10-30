import { test as setup, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Global authentication setup.
 *
 * Logs into Microsoft / Entra ID using a NON-MFA test account and stores the
 * authenticated browser session in `.auth/user.json`. Every other project reuses
 * this state so the wizard tests start already signed in.
 *
 * Required environment variables:
 *  - DEMO_APP_URL        the canvas app "play" URL
 *  - DEMO_TEST_USER      UPN / email of the non-MFA test account
 *  - DEMO_TEST_PASSWORD  password for that account
 */
const authFile = path.join('.auth', 'user.json');

setup('authenticate', async ({ page }) => {
  const appUrl = requireEnv('DEMO_APP_URL');
  const user = requireEnv('DEMO_TEST_USER');
  const password = requireEnv('DEMO_TEST_PASSWORD');

  // Navigating to the app triggers the Microsoft login redirect.
  await page.goto(appUrl, { waitUntil: 'domcontentloaded' });

  // --- Username step ---
  const emailInput = page.locator('input[type="email"], input[name="loginfmt"]');
  await emailInput.waitFor({ state: 'visible', timeout: 60_000 });
  await emailInput.fill(user);
  await page.getByRole('button', { name: /next/i }).click();

  // --- Password step ---
  const passwordInput = page.locator('input[type="password"], input[name="passwd"]');
  await passwordInput.waitFor({ state: 'visible', timeout: 60_000 });
  await passwordInput.fill(password);
  await page.getByRole('button', { name: /sign in/i }).click();

  // --- "Stay signed in?" (KMSI) prompt: click No to keep the session bounded ---
  const staySignedIn = page.locator('#idBtn_Back, input#idSIButton9');
  try {
    await page.getByText(/stay signed in\?/i).waitFor({ timeout: 15_000 });
    // "No" button keeps things clean; either choice yields a valid session.
    await page.locator('#idBtn_Back').click();
  } catch {
    // Prompt did not appear (already suppressed for the tenant) — continue.
  }

  const targetUrl = new URL(appUrl);

  await expect
    .poll(async () => {
      try {
        const url = new URL(page.url());
        return (
          !url.hostname.includes('login.microsoftonline.com') &&
          (
            url.pathname === targetUrl.pathname ||
            url.pathname.includes('/play/') ||
            url.pathname.includes('/apps/')
          ) &&
          url.searchParams.get('tenantId') === targetUrl.searchParams.get('tenantId')
        );
      } catch {
        return false;
      }
    }, { timeout: 120_000 })
    .toBeTruthy();

  fs.mkdirSync(path.dirname(authFile), { recursive: true });
  await page.context().storageState({ path: authFile });
});

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable "${name}". ` +
        'Set it in a local .env file or via GitHub Secrets in CI.',
    );
  }
  return value;
}
