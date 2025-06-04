/**
 * Salesforce Contact Page Object
 */
const BasePage = require('../BasePage');

class SalesforceContactPage extends BasePage {
  /**
   * Constructor
   * @param {import('@playwright/test').Page} page - Playwright page
   */
  constructor(page) {
    super(page);
    
    this.selectors = {
      username: '#username',
      password: '#password',
      loginButton: '#Login',
      contactsTab: 'a[title="Contacts"]',
      newButton: 'div[title="New"]',
      saveButton: 'button[name="SaveEdit"]',
      firstNameInput: 'input[name="firstName"]',
      lastNameInput: 'input[name="lastName"]',
      emailInput: 'input[type="email"]',
      phoneInput: 'input[type="tel"]'
    };
  }

  /**
   * Navigate to Salesforce and login
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.username - Salesforce username
   * @param {string} credentials.password - Salesforce password
   */
  async goto({ username, password }) {
    await this.page.goto('https://login.salesforce.com');
    await this.page.fill(this.selectors.username, username);
    await this.page.fill(this.selectors.password, password);
    await this.page.click(this.selectors.loginButton);
    await this.page.waitForLoadState('networkidle');
    
    // Navigate to Contacts tab
    await this.page.click(this.selectors.contactsTab);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Create a new contact
   * @param {Object} contactData - Contact data
   * @param {string} contactData.firstName - First name
   * @param {string} contactData.lastName - Last name
   * @param {string} contactData.email - Email address
   * @param {string} contactData.phone - Phone number
   */
  async createContact({ firstName, lastName, email, phone }) {
    await this.page.click(this.selectors.newButton);
    await this.page.waitForLoadState('networkidle');
    
    await this.page.fill(this.selectors.firstNameInput, firstName);
    await this.page.fill(this.selectors.lastNameInput, lastName);
    
    if (email) {
      await this.page.fill(this.selectors.emailInput, email);
    }
    
    if (phone) {
      await this.page.fill(this.selectors.phoneInput, phone);
    }
    
    await this.page.click(this.selectors.saveButton);
    await this.page.waitForLoadState('networkidle');
  }
}

module.exports = SalesforceContactPage;