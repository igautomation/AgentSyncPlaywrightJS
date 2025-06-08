/**
 * TestPage - Salesforce Lightning Record Page Object
 */
const { BaseSalesforcePage } = require('./BaseSalesforcePage');

class TestPage extends BaseSalesforcePage {
  /**
   * @param {import('@playwright/test').Page} page 
   */
  constructor(page) {
    super(page);
    
    // Selectors
    this.headerTitle = '.slds-page-header__title';
    this.editButton = 'button[name="Edit"]';
    this.saveButton = 'button[name="SaveEdit"]';
    this.cancelButton = 'button[name="CancelEdit"]';
    this.deleteButton = 'button[name="Delete"]';
    this.confirmDeleteButton = 'button[title="Delete"]';
    this.tabsList = '.slds-tabs_default__nav';
    this.relatedTab = 'a.slds-tabs_default__link[title="Related"]';
    this.detailsTab = 'a.slds-tabs_default__link[title="Details"]';
  }

  /**
   * Navigate to a specific record
   * @param {string} recordId - The Salesforce record ID
   */
  async navigateToRecord(recordId) {
    await this.navigateTo(`/lightning/r/${this.objectName}/${recordId}/view`);
    await this.page.waitForSelector(this.headerTitle);
  }

  /**
   * Click the Edit button
   */
  async clickEdit() {
    await this.page.click(this.editButton);
    await this.page.waitForSelector(this.saveButton);
  }

  /**
   * Save the record
   */
  async save() {
    await this.page.click(this.saveButton);
    await this.page.waitForSelector(this.editButton);
  }

  /**
   * Cancel editing
   */
  async cancel() {
    await this.page.click(this.cancelButton);
    await this.page.waitForSelector(this.editButton);
  }

  /**
   * Delete the record
   */
  async deleteRecord() {
    await this.page.click(this.deleteButton);
    await this.page.waitForSelector(this.confirmDeleteButton);
    await this.page.click(this.confirmDeleteButton);
  }

  /**
   * Switch to the Related tab
   */
  async switchToRelatedTab() {
    await this.page.click(this.relatedTab);
  }

  /**
   * Switch to the Details tab
   */
  async switchToDetailsTab() {
    await this.page.click(this.detailsTab);
  }
}

module.exports = { TestPage };