import { test, expect } from '@playwright/test';
import { DevOpsTestCanvasApp } from './welcomeBotApp';

/**
 * Smoke test for the DevOps Test Canvas App Main Screen.
 *
 * The app binds its gallery directly to `DevOpsTestSharePointList`, so the basic
 * verification is that the Main Screen renders and exposes at least one gallery item.
 */
test.describe('DevOps Test Canvas App', () => {
  let app: DevOpsTestCanvasApp;

  test.beforeEach(async ({ page }) => {
    app = new DevOpsTestCanvasApp(page);
    await app.open();
  });

  test('Main Screen loads and shows gallery items', async () => {
    const viewButtons = app.galleryItemButton();
    const itemCount = await viewButtons.count();

    expect(itemCount).toBeGreaterThan(0);
    await expect(viewButtons.first()).toBeVisible();
    await app.expectScreenText(/view item details/i);
  });
});
