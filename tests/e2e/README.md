# WelcomeBOT (LaunchPad) — Playwright E2E tests

End-to-end UI tests for the **WelcomeBOT / LaunchPad** Power Apps **canvas app**. The tests drive the
published app in a real browser, walking the wizard screens and verifying the branching/navigation
logic defined in `src/appsource/WelcomeBOT/Src/*.pa.yaml`.

## What is covered

The suite mirrors the `Navigate(...)` flow in the Power Fx source:

| Screen | Signature text | Tested behaviour |
| ------ | -------------- | ---------------- |
| 1 Welcome | `Hello, I am LaunchPad` | Loads; **Click Here To Begin** → Screen 2 |
| 2 IT issue | `Firstly...` | **Yes** → Screen 3, **No** → Screen 4 |
| 3 MyIT | `Thank you` | Shows **Raise MyIT Ticket**; **Back** → Screen 2 |
| 4 NITS Overview | `Good to hear` | **Next** → Screen 5; **Back** → Screen 2 |
| 5 Request Category | `Let's Begin` | Training/IT Solution/ServiceNow/Resource Only present; branch buttons |
| 6 Training | `Training!` | M365 / MyLearning present; **Back** → Screen 5 |
| 7 Problem/Opportunity | `What would you like us to do?` | Fill Title + Description; **Next** → Screen 8 |
| 8–13 | Funding / Risks / Benefit / Are You Ready? / Pre Work / Strategic Goals | Full happy-path walk |
| 14 Submit | `Thank you!` | Reaches the **Submit** button + rating |

The happy-path test stops **before** pressing `Submit` so it does not create SharePoint records.
Remove that guard only against a disposable test environment.

## Project layout

```
tests/e2e/
├─ package.json            # deps + scripts
├─ playwright.config.ts    # projects: setup (login) + chromium (tests)
├─ tsconfig.json
├─ env.example             # copy to .env for local runs
└─ tests/
   ├─ auth.setup.ts        # logs in once, saves .auth/user.json
   ├─ welcomeBotApp.ts     # page object for the canvas-app iframe
   └─ wizard.spec.ts       # the screen/logic tests
```

## Authentication (non-MFA test users)

Automated login **cannot** satisfy an interactive MFA prompt, so a dedicated test account with
**MFA disabled / excluded via a Conditional Access exclusion** is required. `auth.setup.ts`:

1. Opens the app URL (redirects to Microsoft login).
2. Enters username → password.
3. Handles the *"Stay signed in?"* prompt.
4. Persists the session to `.auth/user.json`, reused by all tests.

Required configuration:

| Variable | Type | Description |
| -------- | ---- | ----------- |
| `WELCOMEBOT_APP_URL` | value | Published canvas-app *play* URL for the environment |
| `WELCOMEBOT_TEST_USER` | secret | UPN/email of the non-MFA test account |
| `WELCOMEBOT_TEST_PASSWORD` | secret | Password for that account |

## Running locally

```powershell
cd tests/e2e
Copy-Item env.example .env   # then edit .env with real values
npm install
npx playwright install --with-deps chromium
npm test
```

Useful scripts: `npm run test:headed`, `npm run test:ui`, `npm run report`.

## Running in CI

The workflow **`.github/workflows/e2e-playwright.yml`** is **manual only** (`workflow_dispatch`) and
takes an `environment` input (`DEV` / `TEST` / `UAT`). Configure per-environment values under
**Settings → Environments** in GitHub:

- Environment **variable** `WELCOMEBOT_APP_URL`
- Environment **secrets** `WELCOMEBOT_TEST_USER`, `WELCOMEBOT_TEST_PASSWORD`

Run it from **Actions → E2E - Playwright (WelcomeBOT) → Run workflow**. The HTML report is uploaded
as a build artifact.

## Notes & limitations

- Canvas apps render inside a nested iframe; the page object targets that frame and drives the UI by
  **visible button/label text** because internal control names are not stable in the published player.
- If your tenant shows a first-run **connection consent** dialog, `open()` clicks through it; on a
  clean test account you may need to consent once manually.
- Selectors rely on the current screen wording. If labels in `*.pa.yaml` change, update
  `wizard.spec.ts` / `welcomeBotApp.ts` accordingly.
