/**
 * Salesforce New Contact Dialog Page Object
 */
class SalesforceNewContactDialog {
  /**
   * @param {import('@playwright/test').Page} page - Playwright page object
   */
  constructor(page) {
    this.page = page;
    
    // Locators - using more reliable selectors
    this.lastNameInput = page.locator('[name="lastName"]');
    this.firstNameInput = page.locator('[name="firstName"]');
    this.emailInput = page.locator('[name="Email"]');
    this.phoneInput = page.locator('[name="Phone"]');
    this.npnInput = page.locator('[name="agentsync__NPN__c"]');
    this.accountLookup = page.locator('input[placeholder="Search Accounts..."]');
    this.saveButton = page.locator('button[name="SaveEdit"]');
    this.cancelButton = page.locator('button[name="Cancel"]');
  }

  /**
   * Navigate to the new contact page
   */
  async goto() {
    try {
      // Navigate to new contact page - using direct URL
      await this.page.goto('/lightning/o/Contact/new');
      
      // Wait for page to load
      await this.page.waitForLoadState('networkidle');
      
      // Wait for form to be visible
      await this.page.waitForSelector('div.slds-form', { timeout: 30000 });
      
      // Wait for any loading spinners to disappear
      await this.page.waitForSelector('lightning-spinner', { 
        state: 'detached', 
        timeout: 10000 
      }).catch(() => {});
    } catch (error) {
      console.error(`Error navigating to Contact page: ${error.message}`);
      // Try alternative approach - go to contacts list first
      await this.page.goto('/lightning/o/Contact/list');
      await this.page.waitForLoadState('networkidle');
      
      // Click New button
      await this.page.click('a[title="New"], button:has-text("New")');
      
      // Wait for form to be visible
      await this.page.waitForSelector('div.slds-form', { timeout: 30000 });
    }
  }

  /**
   * Fill contact form
   * @param {Object} contactData - Contact data
   * @param {string} contactData.lastName - Last name (required)
   * @param {string} [contactData.firstName] - First name
   * @param {string} [contactData.email] - Email
   * @param {string} [contactData.phone] - Phone
   * @param {string} [contactData.npn] - NPN
   * @param {string} [contactData.account] - Related account name
   */
  async fillContactForm(contactData) {
    // Wait for form to be fully loaded
    await this.lastNameInput.waitFor({ state: 'visible', timeout: 10000 });
    
    // Fill required fields
    await this.lastNameInput.fill(contactData.lastName);
    
    // Fill optional fields if provided
    if (contactData.firstName) {
      await this.firstNameInput.fill(contactData.firstName);
    }
    
    if (contactData.email) {
      await this.emailInput.fill(contactData.email);
    }
    
    if (contactData.phone) {
      await this.phoneInput.fill(contactData.phone);
    }
    
    if (contactData.npn) {
      try {
        await this.npnInput.waitFor({ state: 'visible', timeout: 5000 });
        await this.npnInput.fill(contactData.npn);
      } catch (error) {
        // Field might not exist in all orgs
      }
    }
    
    if (contactData.account) {
      try {
        await this.accountLookup.waitFor({ state: 'visible', timeout: 5000 });
        await this.accountLookup.fill(contactData.account);
        // Wait for dropdown and select first option
        await this.page.waitForTimeout(500);
        await this.page.keyboard.press('ArrowDown');
        await this.page.keyboard.press('Enter');
      } catch (error) {
        // Field might not exist in all orgs
      }
    }
  }

  /**
   * Save the contact
   */
  async save() {
    await this.saveButton.click();
    
    // Wait for save to complete (spinner disappears)
    await this.page.waitForSelector('lightning-spinner', { 
      state: 'detached', 
      timeout: 30000 
    }).catch(() => {});
    
    // Wait for navigation to complete
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Cancel the contact creation
   */
  async cancel() {
    await this.cancelButton.click();
  }

  /**
   * Wait for modal to appear
   * @returns {Promise<boolean>} True if modal is visible
   */
  async waitForModal() {
    try {
      await this.page.waitForSelector('.slds-modal', { 
        state: 'visible', 
        timeout: 5000 
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get modal title
   * @returns {Promise<string>} Modal title
   */
  async getModalTitle() {
    const titleElement = this.page.locator('.slds-modal .slds-modal__title');
    return await titleElement.textContent().catch(() => '');
  }

  /**
   * Close modal
   */
  async closeModal() {
    await this.page.click('.slds-modal .slds-modal__close');
  }

  /**
   * Check if modal is visible
   * @returns {Promise<boolean>} True if modal is visible
   */
  async isModalVisible() {
    const modalElements = await this.page.locator('.slds-modal').count();
    return modalElements > 0;
  }
}

module.exports = SalesforceNewContactDialog;