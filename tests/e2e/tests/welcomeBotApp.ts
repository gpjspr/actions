import { type Page, type FrameLocator, type Locator, expect } from '@playwright/test';

/**
 * Page Object for the WelcomeBOT / LaunchPad canvas app.
 *
 * Power Apps renders published canvas apps inside a nested "fullscreen" iframe.
 * Modern controls (ModernButton, Label, TextInput, Rating) render real DOM with
 * accessible text, so we drive the wizard by visible button / label text rather
 * than by internal control names (which are not stable in the published player).
 *
 * The screen-flow encoded here mirrors the Power Fx `Navigate(...)` calls in
 * `src/appsource/WelcomeBOT/Src/*.pa.yaml`:
 *
 *   Screen1 Welcome         "Click Here To Begin" -> Screen2
 *   Screen2 IT issue        Yes -> Screen3 | No -> Screen4
 *   Screen3 MyIT            "Raise MyIT Ticket" / Back -> Screen2
 *   Screen4 NITS Overview   Next -> Screen5 | Back -> Screen2
 *   Screen5 Request Cat.    Training -> Screen6 | IT Solution -> Screen7 | Back -> Screen4
 *   Screen6 Training        M365 / MyLearning / Back -> Screen5
 *   Screen7 Problem/Opp.    Title + Description, Next -> Screen8 | Back -> Screen5
 *   Screen8 Funding         Next -> Screen9 | Back -> Screen7
 *   Screen9 Risks           Next -> Screen10 | Back -> Screen8
 *   Screen10 Value          Next -> Screen11 | Back -> Screen8/9
 *   Screen11 Readiness      Next -> Screen12 | Back -> Screen10
 *   Screen12 Pre Work       Next -> Screen13 | Back -> Screen11
 *   Screen13 Strategic      Next -> Screen14 | Back -> Screen12
 *   Screen14 Submit         Submit -> Screen15 | Back -> Screen13
 *   Screen15 Close          "Close" | "Raise Another Item" -> Screen7
 */
export class WelcomeBotApp {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /** The iframe that hosts the rendered canvas app. Falls back to the main frame. */
  app(): FrameLocator {
    // Power Apps player renders the app inside an iframe (commonly #fullscreen-app-host
    // or a publish iframe). Use a resilient selector and fall back if not present.
    return this.page.frameLocator(
      'iframe[name="fullscreen-app-host"], iframe#fullscreen-app-host, iframe[src*="apps.powerapps.com"], iframe',
    );
  }

  /** Open the app and wait for the first screen to finish loading. */
  async open(): Promise<void> {
    await this.page.goto('/', { waitUntil: 'domcontentloaded' });
    await this.dismissAppConsentIfPresent();
    await this.expectScreenText('Hello, I am LaunchPad');
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
    // ModernButton renders as a role=button; icon buttons expose their label too.
    return this.app().getByRole('button', { name }).first();
  }

  /** Assert that a given screen is showing by checking for its signature text. */
  async expectScreenText(value: string | RegExp): Promise<void> {
    await expect(this.text(value).first()).toBeVisible({ timeout: 30_000 });
  }

  /** Click a button by label and optionally assert the resulting screen text. */
  async click(name: string | RegExp, expectText?: string | RegExp): Promise<void> {
    await this.button(name).click();
    if (expectText) {
      await this.expectScreenText(expectText);
    }
  }

  /** Fill a text input identified by its adjacent placeholder or accessible name. */
  async fillInput(nameOrPlaceholder: string | RegExp, value: string): Promise<void> {
    const byRole = this.app().getByRole('textbox', { name: nameOrPlaceholder });
    if (await byRole.count()) {
      await byRole.first().fill(value);
      return;
    }
    await this.app().getByPlaceholder(nameOrPlaceholder).first().fill(value);
  }
}
