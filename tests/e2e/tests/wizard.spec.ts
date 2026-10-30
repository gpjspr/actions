import { test, expect } from '@playwright/test';
import { DevOpsTestCanvasApp } from './welcomeBotApp';

test.describe('DevOps Test Canvas App', () => {
  let app: DevOpsTestCanvasApp;

  test.beforeEach(async ({ page }) => {
    app = new DevOpsTestCanvasApp(page);
    await app.open();
  });

  test('Main Screen loads and shows gallery items', async () => {
    await expect(app.gallery).toBeVisible();
    await expect(app.galleryItems.first()).toBeVisible();
  });

  test('button is available for the main action', async () => {
    await app.galleryItems.first().locator('[data-control-name="NextArrow1"]').click();
    await expect(app.messageBar).toHaveText('Clicked');
  });
});
