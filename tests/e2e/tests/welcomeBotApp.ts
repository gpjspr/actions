import { type Page, type FrameLocator, type Locator, expect } from '@playwright/test';

/**
 * Page object for the DevOps Test Canvas App.
 *
 * The app renders inside a Power Apps iframe and the Main Screen is backed by the
 * `DevOpsTestSharePointList` gallery (`gal_hospitals_ms`). The basic smoke test
 * verifies that the gallery is loaded and that the per-item actions are visible.
 */
export class DevOpsTestCanvasApp {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /** The iframe that hosts the rendered canvas app.
   *
   * Only target the actual Power Apps host; excluding the generic `iframe`
   * selector avoids matching unrelated O365/preload frames that appear in the page.
   */
  app(): FrameLocator {
    return this.page
      .locator(
        'iframe#fullscreen-app-host, iframe[name="fullscreen-app-host"], iframe[src*="apps.powerapps.com"], iframe[src*="make.powerapps.com"]',
      )
      .first()
      .contentFrame();
  }

  /** Open the app and wait for the Main Screen gallery to finish loading. */
  async open(): Promise<void> {
    await this.page.goto('/', { waitUntil: 'domcontentloaded' });
    await this.dismissAppConsentIfPresent();
    await this.expectMainScreenLoaded();
  }

  /**
   * Some environments show a one-time "Allow"/connection consent dialog when the
   * app first runs. Click through it if it appears; otherwise continue.
   */
  private async dismissAppConsentIfPresent(): Promise<void> {
    const allow = this.page.getByRole('button', { name: /allow|continue/i });
    try {
      await allow.first().click({ timeout: 8_000 });
    } catch {
      // No consent dialog — expected on subsequent runs.
    }
  }

  /** Locate a control by its visible text inside the app frame. */
  text(value: string | RegExp): Locator {
    return this.app().getByText(value, { exact: false });
  }

  /** Locate a button/clickable by its visible label inside the app frame. */
  button(name: string | RegExp): Locator {
    return this.app().getByRole('button', { name }).first();
  }

  /** The gallery actions for each item in the Main Screen list. */
  galleryItemButton(): Locator {
    return this.app().getByRole('button', { name: /view item details/i });
  }

  /** Wait until the gallery is visible on the Main Screen. */
  async expectMainScreenLoaded(): Promise<void> {
    await expect(this.galleryItemButton().first()).toBeVisible({ timeout: 30_000 });
  }

  /** Assert that a specific visible text is shown on the current screen. */
  async expectScreenText(value: string | RegExp): Promise<void> {
    await expect(this.text(value).first()).toBeVisible({ timeout: 30_000 });
  }
}
