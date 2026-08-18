const { expect } = require('@playwright/test');

class LoginPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.emailInput = page.locator('input[type="email"]');
    this.passwordInput = page.locator('input[type="password"]');
    this.loginButton = page.locator('button[type="submit"]');
    this.signWithUappButton = page.locator('button:has-text("Sign in with UAPP"), a:has-text("Sign in with UAPP"), button:has-text("Sign with UAPP"), a:has-text("Sign with UAPP")');
  }

  async navigate() {
    await this.page.goto('/');
  }

  async login(email, password) {
    // Navigate if we aren't already there
    if (this.page.url() === 'about:blank') {
      await this.navigate();
    }

    // Click "Sign in with UAPP" if present (some flows might redirect automatically, others might require a click)
    try {
      if (await this.signWithUappButton.isVisible({ timeout: 5000 })) {
        await this.signWithUappButton.click();
      }
    } catch (e) {
      // Ignore if not visible or times out
    }

    // Fill email and password on SSO
    await this.emailInput.waitFor({ state: 'visible', timeout: 15000 });
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    
    // Click login
    await this.loginButton.click();
    
    // Wait until logged in and redirected back to the main portal dashboard
    await this.page.waitForURL(url => url.hostname.includes('portal-test.uapp.uk'), { timeout: 30000 });
  }
}

module.exports = { LoginPage };
