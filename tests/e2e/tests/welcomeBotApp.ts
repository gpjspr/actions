import { Page, FrameLocator, Locator } from '@playwright/test';

export class DevOpsTestCanvasApp {
  private readonly frame: FrameLocator;

  constructor(private readonly page: Page) {
    this.frame = page.frameLocator('iframe[name="fullscreen-app-host"]');
  }

  
  get addButton(): Locator {
    return this.frame.locator('[data-control-name="btn_main_ms"]');
  }

  get gallery(): Locator {
    return this.frame.locator('[data-control-name="gal_hospitals_ms"]');
  }

  get galleryItems(): Locator {
    return this.gallery.locator('[data-control-part="gallery-item"]');
  }

  get messageBar(): Locator {
    return this.page.locator('.ms-MessageBar-innerText').first();
    }

  async open(): Promise<void> {
    await this.page.goto('/', { waitUntil: 'domcontentloaded' });
    await this.waitForLoad();
  }

  async waitForLoad(): Promise<void> {
    await this.galleryItems.first().waitFor({ state: 'visible', timeout: 60000 });
  }

  async clickAdd(): Promise<void> {
    await this.addButton.waitFor({ state: 'visible', timeout: 10000 });
    await this.addButton.click();
  }

  async getItemCount(): Promise<number> {
    return this.galleryItems.count();
  }
}

