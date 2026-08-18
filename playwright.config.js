// @ts-check
require('dotenv').config();
const { defineConfig, devices } = require('@playwright/test');
const isCI = !!process.env.CI || process.env.GITHUB_ACTIONS === 'true';

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // run tests sequentially to avoid state collision
  reporter: 'html',
  use: {
    baseURL: 'https://portal-test.uapp.uk',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    headless: isCI, // Run headless in CI (GitHub Actions) but headed locally
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
