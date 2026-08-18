# UAPP Consultant Creation E2E Test Suite

An end-to-end automation test suite built using **Playwright JavaScript** following the **Page Object Model (POM)** design pattern. The project automates the creation of a consultant account on the UAPP portal and verifies the registration credentials received via **Mailosaur**.

## Features

- **Admin Portal Automation**: Automates logging into the UAPP Admin Portal via Single Sign-On (SSO) and navigating to the Consultant list.
- **Robust POM Architecture**: Separates selectors and actions into page classes for clean maintenance.
- **Element-Level Workarounds**: Direct input selections for titles (bypassing broken label HTML connection) and strict dropdown option matching (regex matching to differentiate `Freelancer` from `International Freelancer`).
- **Mailosaur Integration**: Generates unique disposable test email addresses and queries Mailosaur APIs to retrieve the welcome email.
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
├── .env                    # Private environment credentials (ignored by git)
├── .gitignore              # Ignores .env, node_modules, and test report folders
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

### 3. Configure Credentials (`.env`)
Create a `.env` file in the root of the project with your Mailosaur server details:
```env
MAILOSAUR_API_KEY=your_mailosaur_api_key
MAILOSAUR_SERVER_ID=your_mailosaur_server_id
MAILOSAUR_DOMAIN=your_mailosaur_server_domain (e.g. hri1suwb.mailosaur.net)
```

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
