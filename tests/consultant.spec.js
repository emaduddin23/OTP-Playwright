const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');
const { DashboardPage } = require('../pages/DashboardPage');
const { ConsultantPage } = require('../pages/ConsultantPage');
const { getLatestEmail, getEmailBody } = require('../utils/gmail');

test.describe('UAPP Consultant Creation with Gmail Verification', () => {
  test('should log in, create a consultant, retrieve login credentials from Gmail, and log in as the new consultant', async ({ page, browser }) => {
    test.setTimeout(90000);
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    const consultantPage = new ConsultantPage(page);

    // Gmail test account
    // Example:
    // qa.test@gmail.com
    const gmailAddress = process.env.GMAIL_TEST_ADDRESS;

    if (!gmailAddress) {
      throw new Error(
        'GMAIL_TEST_ADDRESS must be configured in .env'
      );
    }

    // Generate unique Gmail plus-address
    const [gmailUser, gmailDomain] = gmailAddress.split('@');

    const consultantEmail =
      `${gmailUser}+consultant-${Date.now()}@${gmailDomain}`;
    console.log(`Generated consultant email: ${consultantEmail}`);

    // Step 1: Login as Admin
    console.log('Navigating to portal and logging in as Admin...');

    await loginPage.navigate();

    await loginPage.login(
      'sysadmin@uapp.uk',
      'Admin1212@'
    );

    // Step 2: Navigate to Consultant module
    console.log('Navigating to Consultant List page...');

    await dashboardPage.navigateToConsultants();

    // Step 3: Click Add Consultant
    console.log('Opening Add Consultant form...');

    await consultantPage.clickAddConsultant();

    // Step 4: Fill Consultant details
    await consultantPage.fillConsultantDetails({
      title: 'Mr.',
      firstName: 'Test',
      lastName: 'Consultant',
      email: consultantEmail,
      linkedIn: 'https://linkedin.com/in/testconsultant',
      consultantType: 'Freelancer',
    });

    // Step 5: Submit form
    console.log('Submitting form...');

    await consultantPage.submitForm();

    // Step 6: Verify success message
    console.log('Verifying success modal is displayed...');

    await expect(page.getByText('Consultant added successfully')).toBeVisible({ timeout: 15000 });

    console.log(
      'Consultant created successfully inside UAPP admin portal.'
    );

    // Step 7: Get registration email from Gmail
    console.log(
      `Searching Gmail for email received at ${consultantEmail}...`
    );

    const email = await getLatestEmail(consultantEmail);

    const body = getEmailBody(email);

    console.log(
      'Registration email received from Gmail successfully!'
    );

    // Convert HTML email to plain text
    const bodyText = body
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Extract UAPP ID
    const uappId =
      bodyText.match(/UAPP ID\s*:\s*([^\s]+)/i)?.[1];

    // Extract Password
    const password =
      bodyText.match(/Password\s*:\s*([^\s]+)/i)?.[1];

    console.log(`Extracted UAPP ID: ${uappId}`);

    console.log(
      `Extracted Password: ${password ? '********' : 'Not found'}`
    );

    if (!password) {
      throw new Error(
        'Failed to extract password from the registration email!'
      );
    }

    // Step 8: Open new browser context
    console.log(
      'Opening a new browser context to test consultant login...'
    );

    const consultantContext =
      await browser.newContext();

    const consultantPageInstance =
      await consultantContext.newPage();

    const consultantLoginPage =
      new LoginPage(consultantPageInstance);

    // Step 9: Login as new Consultant
    console.log(
      `Logging in as new consultant: ${consultantEmail}...`
    );

    await consultantLoginPage.navigate();

    await consultantLoginPage.login(
      consultantEmail,
      password
    );

    // Step 10: Verify Consultant dashboard
    console.log(
      'Verifying consultant dashboard loads...'
    );

    await expect(
      consultantPageInstance.locator(
        'text=Hello, Test Consultant!'
      )
    ).toBeVisible({
      timeout: 15000
    });

    console.log(
      'Consultant successfully logged in and verified!'
    );

    // Cleanup
    await consultantContext.close();
  });
});