import { test, expect } from '@playwright/test';
import { DevOpsTestCanvasApp } from './welcomeBotApp';

test.describe('DevOps Test Canvas App', () => {
  let app: DevOpsTestCanvasApp;

  test.beforeEach(async ({ page }) => {
    app = new DevOpsTestCanvasApp(page);
    await app.open();
  });

  test('Main Screen loads and shows gallery items', async () => {
    await expect(appHost.gallery).toBeVisible();
    await expect(appHost.galleryItems.first()).toBeVisible();
  });

  test('button is available for the main action', async () => {
    await appHost.galleryItems.first().locator('[data-control-name="NextArrow1"]').click();
    await expect(appHost.messageBar).toHaveText('Clicked');
  });
});
