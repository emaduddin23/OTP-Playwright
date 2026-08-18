class DashboardPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.consultantMenu = page.locator('p:text-is("Consultant")');
    this.consultantsSubmenu = page.locator('a.sidemenu[href="/consultantList"]');
  }

  async navigateToConsultants() {
    // Click "Consultant" menu in sidebar to expand it if the submenu is not visible
    await this.consultantMenu.waitFor({ state: 'visible', timeout: 15000 });
    
    // Check if submenu is already visible, if not expand
    if (!(await this.consultantsSubmenu.isVisible())) {
      await this.consultantMenu.click();
    }
    
    // Click "Consultants" submenu link
    await this.consultantsSubmenu.waitFor({ state: 'visible', timeout: 5000 });
    await this.consultantsSubmenu.click();
    
    // Wait for the URL to change to the consultant list page
    await this.page.waitForURL('**/consultantList', { timeout: 15000 });
  }
}

module.exports = { DashboardPage };
