/**
 * SalesforceNewContactDialog Page Object
 * Renamed to follow naming conventions
 */
const BasePage = require('./BasePage');

class SalesforceNewContactDialogPage extends BasePage {
  /**
   * Constructor for the SalesforceNewContactDialogPage class
   * @param {import('@playwright/test').Page} page - Playwright page object
   */
  constructor(page) {
    super(page);
    
    // Define page URL
    this.url = 'https://wise-koala-a44c19-dev-ed.trailblaze.lightning.force.com/lightning/o/Contact/new';
    
    // Define page locators
    this.locators = {
      // Form fields
      firstNameInput: '[data-field="FirstName"]',
      lastNameInput: '[data-field="LastName"]',
      emailInput: '[data-field="Email"]',
      phoneInput: '[data-field="Phone"]',
      
      // Buttons
      saveButton: 'button[name="SaveEdit"]',
      cancelButton: 'button[name="CancelEdit"]',
      
      // Other elements
      formTitle: '.slds-modal__header h2',
      errorMessages: '.errorsList',
      requiredFieldError: '.slds-form-element__help'
    };
  }
  
  /**
   * Navigate to the new contact dialog
   * @returns {Promise<SalesforceNewContactDialogPage>} This page object for chaining
   */
  async navigate() {
    await this.page.goto(this.url);
    await this.page.waitForSelector(this.locators.formTitle);
    return this;
  }
  
  /**
   * Fill the contact form
   * @param {Object} contactData - Contact data
   * @param {string} contactData.firstName - First name
   * @param {string} contactData.lastName - Last name
   * @param {string} contactData.email - Email address
   * @param {string} contactData.phone - Phone number
   * @returns {Promise<SalesforceNewContactDialogPage>} This page object for chaining
   */
  async fillContactForm(contactData) {
    if (contactData.firstName) {
      await this.fill(this.locators.firstNameInput, contactData.firstName);
    }
    
    if (contactData.lastName) {
      await this.fill(this.locators.lastNameInput, contactData.lastName);
    }
    
    if (contactData.email) {
      await this.fill(this.locators.emailInput, contactData.email);
    }
    
    if (contactData.phone) {
      await this.fill(this.locators.phoneInput, contactData.phone);
    }
    
    return this;
  }
  
  /**
   * Click save button
   * @returns {Promise<SalesforceNewContactDialogPage>} This page object for chaining
   */
  async clickSave() {
    await this.click(this.locators.saveButton);
    return this;
  }
  
  /**
   * Click cancel button
   * @returns {Promise<SalesforceNewContactDialogPage>} This page object for chaining
   */
  async clickCancel() {
    await this.click(this.locators.cancelButton);
    return this;
  }
  
  /**
   * Create a new contact
   * @param {Object} contactData - Contact data
   * @returns {Promise<SalesforceNewContactDialogPage>} This page object for chaining
   */
  async createContact(contactData) {
    await this.fillContactForm(contactData);
    await this.clickSave();
    return this;
  }
  
  /**
   * Get error messages
   * @returns {Promise<string[]>} Array of error messages
   */
  async getErrorMessages() {
    const errorElements = await this.page.locator(this.locators.errorMessages).all();
    const errors = [];
    
    for (const element of errorElements) {
      errors.push(await element.textContent());
    }
    
    return errors;
  }
  
  /**
   * Check if required field errors are displayed
   * @returns {Promise<boolean>} True if required field errors are displayed
   */
  async hasRequiredFieldErrors() {
    const errorElements = await this.page.locator(this.locators.requiredFieldError).all();
    return errorElements.length > 0;
  }
}

module.exports = SalesforceNewContactDialogPage;