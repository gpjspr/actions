import { Page, FrameLocator } from '@playwright/test';

export class MyCanvasAppPage {
  private readonly frame: FrameLocator;

  constructor(private readonly page: Page) {
    this.frame = page.frameLocator('iframe[name="fullscreen-app-host"]');
  }

  get addButton() {
    return this.frame.locator('[data-control-name="btn_main_ms"]');
  }

  get gallery() {
    return this.frame.locator('[data-control-name="gal_hospitals_ms"]');
  }

  async waitForLoad(): Promise<void> {
    await this.gallery
      .locator('[data-control-part="gallery-item"]')
      .first()
      .waitFor({ state: 'visible', timeout: 60000 });
  }

  async clickAdd(): Promise<void> {
    await this.addButton.click();
  }

  async getItemCount(): Promise<number> {
    return this.gallery.locator('[data-control-part="gallery-item"]').count();
  }
}
