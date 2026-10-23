import { test, expect } from '@playwright/test';
import { WelcomeBotApp } from './welcomeBotApp';

/**
 * End-to-end coverage of the WelcomeBOT / LaunchPad canvas-app wizard.
 *
 * These tests exercise the screen navigation and branching logic defined in the
 * Power Fx source. They intentionally avoid pressing final "Submit"/"Launch"
 * actions that write to SharePoint or open external systems, except in the
 * dedicated happy-path test which walks the full IT-Solution branch.
 */
test.describe('WelcomeBOT wizard', () => {
  let app: WelcomeBotApp;

  test.beforeEach(async ({ page }) => {
    app = new WelcomeBotApp(page);
    await app.open();
  });

  test('Screen 1 - welcome screen loads', async () => {
    await app.expectScreenText('Hello, I am LaunchPad');
    await expect(app.button(/Click Here To Begin/i)).toBeVisible();
  });

  test('Screen 1 -> 2 - begin navigates to the first question', async () => {
    await app.click(/Click Here To Begin/i, 'Firstly...');
    await app.expectScreenText(/immediate IT challenge/i);
  });

  test('Screen 2 "Yes" branch -> MyIT (Screen 3)', async () => {
    await app.click(/Click Here To Begin/i, 'Firstly...');
    await app.click(/^Yes$/i, 'Thank you');
    await expect(app.button(/Raise MyIT Ticket/i)).toBeVisible();

    // Back returns to the IT-issue question.
    await app.click(/^Back$/i, 'Firstly...');
  });

  test('Screen 2 "No" branch -> NITS Overview (Screen 4)', async () => {
    await app.click(/Click Here To Begin/i, 'Firstly...');
    await app.click(/^No$/i, 'Good to hear');
    await expect(app.button(/Find Out More/i)).toBeVisible();

    // Back returns to the IT-issue question.
    await app.click(/^Back$/i, 'Firstly...');
  });

  test('Screen 4 -> 5 - request category screen', async () => {
    await app.click(/Click Here To Begin/i, 'Firstly...');
    await app.click(/^No$/i, 'Good to hear');
    await app.click(/^Next$/i, "Let's Begin");
    await app.expectScreenText(/What category would best describe your item/i);

    // Category buttons are present.
    await expect(app.button(/Training/i)).toBeVisible();
    await expect(app.button(/IT Solution/i)).toBeVisible();
    await expect(app.button(/ServiceNow/i)).toBeVisible();
    await expect(app.button(/Resource Only/i)).toBeVisible();
  });

  test('Screen 5 "Training" branch -> Training category (Screen 6)', async () => {
    await gotoRequestCategory(app);
    await app.click(/^Training$/i, 'Training!');
    await app.expectScreenText(/What type of training are you looking for/i);
    await expect(app.button(/M365/i)).toBeVisible();
    await expect(app.button(/MyLearning/i)).toBeVisible();

    await app.click(/^Back$/i, "Let's Begin");
  });

  test('Screen 5 "IT Solution" branch -> Problem/Opportunity (Screen 7)', async () => {
    await gotoRequestCategory(app);
    await app.click(/IT Solution/i, /What would you like us to do/i);
    await app.expectScreenText(/make a change to existing IT/i);
  });

  test('Full IT-Solution happy path Screen 7 -> 14', async () => {
    await gotoRequestCategory(app);
    await app.click(/IT Solution/i, /What would you like us to do/i);

    // Screen 7 - fill Title & Description then Next -> Funding (Screen 8)
    await app.fillInput(/Title/i, 'E2E automated test item');
    await app.fillInput(/Description/i, 'Created by Playwright – please ignore.');
    await app.click(/^Next$/i, 'Funding?');

    // Screen 8 -> 9 Risks
    await app.click(/^Next$/i, 'Risks');

    // Screen 9 -> 10 Value/Benefit
    await app.click(/^Next$/i, 'Benefit');

    // Screen 10 -> 11 Readiness
    await app.click(/^Next$/i, 'Are You Ready?');

    // Screen 11 -> 12 Pre Work
    await app.click(/^Next$/i, 'Pre Work');

    // Screen 12 -> 13 Strategic Goals
    await app.click(/^Next$/i, 'Strategic Goals');

    // Screen 13 -> 14 Submit
    await app.click(/^Next$/i, 'Thank you!');
    await expect(app.button(/^Submit$/i)).toBeVisible();
    await app.expectScreenText(/How easy would you rate LaunchPad/i);
  });
});

/** Helper: walk from the welcome screen to the request-category screen (Screen 5). */
async function gotoRequestCategory(app: WelcomeBotApp): Promise<void> {
  await app.click(/Click Here To Begin/i, 'Firstly...');
  await app.click(/^No$/i, 'Good to hear');
  await app.click(/^Next$/i, "Let's Begin");
}
