import { test, expect } from '@playwright/test';
import { DevOpsTestCanvasApp } from './welcomeBotApp';

test.describe('DevOps Test Canvas App', () => {
  let app: DevOpsTestCanvasApp;

  test.beforeEach(async ({ page }) => {
    app = new DevOpsTestCanvasApp(page);
    await app.open();
  });

  test('Main Screen loads and shows gallery items', async () => {
    const itemCount = await app.getItemCount();

    expect(itemCount).toBeGreaterThan(0);
    await expect(app.galleryItems.first()).toBeVisible();
  });

  test('Add button is available for the main action', async () => {
    await expect(app.addButton).toBeVisible();
  });
});
