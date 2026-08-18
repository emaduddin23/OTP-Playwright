const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');
const { DashboardPage } = require('../pages/DashboardPage');
const { ConsultantPage } = require('../pages/ConsultantPage');
const MailosaurClient = require('mailosaur');

test.describe('UAPP Consultant Creation with Mailosaur Verification', () => {
  const apiKey = process.env.MAILOSAUR_API_KEY;
  const serverId = process.env.MAILOSAUR_SERVER_ID;
  test.skip(!apiKey || !serverId, 'Mailosaur API Key and Server ID must be configured to run this test.');

  test('should log in, create a consultant, retrieve login credentials from email, and log in as the new consultant', async ({ page, browser }) => {
    test.setTimeout(90000); // Allow up to 90 seconds for UAPP email delivery and retrieval

    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    const consultantPage = new ConsultantPage(page);

    // Setup Mailosaur configuration
    const domain = process.env.MAILOSAUR_DOMAIN;

    const mailosaur = new MailosaurClient(apiKey);
    const emailDomain = domain ? (domain.includes('@') ? domain.substring(domain.indexOf('@') + 1) : domain) : `${serverId}.mailosaur.net`;
    const consultantEmail = `consultant-${Date.now()}@${emailDomain}`;
    console.log(`Generated consultant email: ${consultantEmail}`);

    // Step 1: Go to portal and log in as admin
    console.log('Navigating to portal and logging in as Admin...');
    await loginPage.navigate();
    await loginPage.login('sysadmin@uapp.uk', 'Admin1212@');

    // Step 2: Navigate to the consultant module
    console.log('Navigating to Consultant List page...');
    await dashboardPage.navigateToConsultants();

    // Step 3: Click Add Consultant button
    console.log('Opening Add Consultant form...');
    await consultantPage.clickAddConsultant();

    // Step 4: Fill the Consultant details
    await consultantPage.fillConsultantDetails({
      title: 'Mr.',
      firstName: 'Test',
      lastName: 'Consultant',
      email: consultantEmail,
      linkedIn: 'https://linkedin.com/in/testconsultant',
      consultantType: 'Freelancer',
    });

    // Step 5: Submit the form to create the consultant
    console.log('Submitting form...');
    await consultantPage.submitForm();

    // Step 6: Verify success dialog is visible
    console.log('Verifying success modal is displayed...');
    await expect(page.getByText('Consultant added successfully')).toBeVisible({ timeout: 15000 });
    console.log('Consultant created successfully inside UAPP admin portal.');

    // Step 7: Fetch the registration email from Mailosaur
    console.log(`Searching for email received at ${consultantEmail}...`);
    const criteria = {
      sentTo: consultantEmail
    };
    const email = await mailosaur.messages.get(serverId, criteria, {
      timeout: 45000
    });
    
    console.log('Email received by Mailosaur successfully!');
    console.log(`Email Subject: ${email.subject}`);

    // Extract UAPP ID and Password from email body
    const bodyText = email.html.body.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const uappId = bodyText.match(/UAPP ID\s*:\s*([^\s]+)/i)?.[1];
    const password = bodyText.match(/Password\s*:\s*([^\s]+)/i)?.[1];

    console.log(`Extracted UAPP ID: ${uappId}`);
    console.log(`Extracted Password: ${password}`);

    if (!password) {
      throw new Error('Failed to extract password from the registration email!');
    }

    // Step 8: Verify the credentials by logging in as the new consultant in a new browser context
    console.log('Opening a new browser context to test consultant login...');
    const consultantContext = await browser.newContext();
    const consultantPageInstance = await consultantContext.newPage();
    const consultantLoginPage = new LoginPage(consultantPageInstance);

    console.log(`Logging in as new consultant: ${consultantEmail}...`);
    await consultantLoginPage.navigate();
    await consultantLoginPage.login(consultantEmail, password);

    // Verify consultant dashboard loads successfully (e.g. check for welcome text)
    console.log('Verifying consultant dashboard loads...');
    await expect(consultantPageInstance.locator('text=Hello, Test Consultant!')).toBeVisible({ timeout: 15000 });

    console.log('Consultant successfully logged in and verified!');

    // Clean up context
    await consultantContext.close();
  });
});
