class ConsultantPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.addConsultantButton = page.locator('a[href="/addConsultant"]');
    
    // Inputs
    this.firstNameInput = page.locator('input[placeholder="Enter First Name"]');
    this.lastNameInput = page.locator('input[placeholder="Enter Last Name"]');
    this.emailInput = page.locator('input[placeholder="Enter Email"]');
    this.linkedInInput = page.locator('input[placeholder="https://linkedin.com/in/johndoe"]');
    this.createConsultantButton = page.locator('button:has-text("Create Consultant")');
  }

  async clickAddConsultant() {
    await this.addConsultantButton.waitFor({ state: 'visible', timeout: 15000 });
    await this.addConsultantButton.click();
    await this.page.waitForURL('**/addConsultant', { timeout: 15000 });
  }

  async selectTitle(title) {
    // Because the HTML label is a sibling of the radio input and lacks a 'for' attribute,
    // clicking the label doesn't select the radio input. We click the input directly using its value.
    const valueMap = {
      'Mr.': '1',
      'Miss.': '2',
      'Ms.': '3',
      'Mrs.': '4',
      'Mx': '5'
    };
    const value = valueMap[title];
    if (value) {
      const input = this.page.locator(`input[type="radio"][value="${value}"]`).first();
      await input.waitFor({ state: 'visible', timeout: 5000 });
      await input.click();
    } else {
      // Fallback to label click
      const titleRadio = this.page.locator(`label:has-text("${title}")`).first();
      await titleRadio.waitFor({ state: 'visible', timeout: 5000 });
      await titleRadio.click();
    }
  }

  async selectConsultantType(type) {
    // Scope search inside the specific Consultant Type container to avoid strict mode violations or matching wrong dropdowns
    const container = this.page.locator('#consultantTypeId');
    const trigger = container.locator('[role="combobox"], input[type="text"]').first();
    await trigger.waitFor({ state: 'visible', timeout: 5000 });
    await trigger.click();
    
    // Locate the option inside the container's listbox/menu. Use regex to ensure exact match (e.g. "Freelancer" vs "International Freelancer")
    const option = container.locator('[role="option"]').filter({ hasText: new RegExp(`^${type}$`) }).first();
    await option.waitFor({ state: 'visible', timeout: 5000 });
    await option.click();
  }

  async fillConsultantDetails({ title, firstName, lastName, email, linkedIn, consultantType }) {
    if (title) {
      await this.selectTitle(title);
    }
    if (firstName) {
      await this.firstNameInput.waitFor({ state: 'visible', timeout: 5000 });
      await this.firstNameInput.fill(firstName);
    }
    if (lastName) {
      await this.lastNameInput.waitFor({ state: 'visible', timeout: 5000 });
      await this.lastNameInput.fill(lastName);
    }
    if (email) {
      await this.emailInput.waitFor({ state: 'visible', timeout: 5000 });
      await this.emailInput.fill(email);
    }
    if (linkedIn) {
      await this.linkedInInput.waitFor({ state: 'visible', timeout: 5000 });
      await this.linkedInInput.fill(linkedIn);
    }
    if (consultantType) {
      await this.selectConsultantType(consultantType);
    }
  }

  async submitForm() {
    await this.createConsultantButton.waitFor({ state: 'visible', timeout: 5000 });
    await this.createConsultantButton.click();
  }
}

module.exports = { ConsultantPage };
