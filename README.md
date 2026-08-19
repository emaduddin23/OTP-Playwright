# UAPP Consultant Creation E2E Test Suite

An end-to-end automation test suite built using **Playwright JavaScript** following the **Page Object Model (POM)** design pattern. The project automates the creation of a consultant account on the UAPP portal and verifies the registration credentials received via **Gmail API**.

## Features

- **Admin Portal Automation**: Automates logging into the UAPP Admin Portal via Single Sign-On (SSO) and navigating to the Consultant list.
- **Robust POM Architecture**: Separates selectors and actions into page classes for clean maintenance.
- **Element-Level Workarounds**: Direct input selections for titles (bypassing broken label HTML connection) and strict dropdown option matching (regex matching to differentiate `Freelancer` from `International Freelancer`).
- **Gmail API Integration**: Uses the Google API to search the inbox for the automated welcome email. Uses unique Gmail aliases (e.g., `youremail+consultant-12345@gmail.com`) to register isolated users without setting up multiple inboxes.
- **Verification Loop**: Extracts the consultant credentials (`UAPP ID` and `Password`) from the email, launches a new browser context, and logs in as the new consultant to verify that their dashboard loads successfully.

---

## Project Structure

```
├── pages/
│   ├── LoginPage.js        # Handles landing, SSO login, and redirection
│   ├── DashboardPage.js    # Handles sidebar navigation to Consultant list
│   └── ConsultantPage.js   # Handles Add Consultant form interactions & validations
├── tests/
│   └── consultant.spec.js  # Main E2E test script (Admin login -> Consultant creation -> Email verification -> Consultant login)
├── utils/
│   └── gmail.js            # Gmail API connection and HTML email parsing logic
├── .env                    # Private environment credentials (ignored by git)
├── .gitignore              # Ignores .env, node_modules, and .json credential files
├── package.json            # Node.js project configuration and dependencies
└── playwright.config.js    # Playwright runner options
```

---

## Setup Instructions

### 1. Install Dependencies
Clone the repository and run:
```bash
npm install
```

### 2. Install Playwright Browsers
```bash
npx playwright install
```

### 3. Configure Google API Credentials
Instead of using dummy mail services, this project integrates directly with a real Gmail account.
1. Create an OAuth 2.0 Client ID in the Google Cloud Console.
2. Download the JSON file and save it in the root of the project as `credentials.json`.
3. Create a `.env` file in the root of the project and specify the target Gmail address:
```env
GMAIL_TEST_ADDRESS=your.email@gmail.com
```

> **Note on First Run**: The very first time you run the tests, a browser window will automatically open asking you to log into Google and authorize the application. Once approved, the script will generate a `token.json` file to store your active session, meaning you will not have to log in manually again for future test runs!

---

## Running the Tests

To run the test suite:
```bash
npx playwright test
```

### UI Mode / Headed Mode
By default, the config runs headed so you can see the test. To run Playwright's interactive UI runner:
```bash
npx playwright test --ui
```
