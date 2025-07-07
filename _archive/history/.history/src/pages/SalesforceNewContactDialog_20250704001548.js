/**
 * SalesforceNewContactDialog Page Object
 * Generated from https://wise-koala-a44c19-dev-ed.trailblaze.lightning.force.com/lightning/o/Contact/new?count=3&nooverride=1&useRecordTypeCheck=1&navigationLocation=LIST_VIEW&uid=174811342884842430&backgroundContext=%2Flightning%2Fo%2FContact%2Flist%3FfilterName%3D__Recent
 * @generated
 */
const { BasePage } = require('../pages-archived/BasePage');

class SalesforceNewContactDialog extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);
    
    // Page URL
    this.url = 'https://wise-koala-a44c19-dev-ed.trailblaze.lightning.force.com/lightning/o/Contact/new?count=3&nooverride=1&useRecordTypeCheck=1&navigationLocation=LIST_VIEW&uid=174811342884842430&backgroundContext=%2Flightning%2Fo%2FContact%2Flist%3FfilterName%3D__Recent';
    
    // Selectors
    // Buttons
    this.global_actions = '[data-aura-rendered-by="19:818;a"]';
    this.setup = '[data-aura-rendered-by="161:210;a"]';
    this.search = '[data-aura-rendered-by="275:0"]';
    this.this_item_doesn_t_support_favorites = '[data-aura-rendered-by="19:210;a"]';
    this.salesforce_help = '[data-aura-rendered-by="125:210;a"]';
    this.cancel_and_close = '[data-aura-rendered-by="423:0"]';
    this.favorites_list = '[data-aura-rendered-by="43:210;a"]';
    this.guidance_center = '[data-aura-rendered-by="231:0;p"]';
    this.0notifications = '[data-aura-rendered-by="74:210;a"]';
    this.view_profile = '[data-aura-rendered-by="97:210;a"]';
    this.button = '[data-aura-rendered-by="5:818;a"]';

    // Inputs
    this.input = '#global-search-01';

    // Lists
    this.list = '[data-aura-rendered-by="141:818;a"]';
    this.list = '[data-aura-rendered-by="177:210;a"]';
    this.list = '[data-aura-rendered-by="163:0;p"]';
    // Modal/Dialog selectors
    this.modalContainer = '.slds-modal';
    this.modalHeader = '.slds-modal__header';
    this.modalContent = '.slds-modal__content';
    this.modalFooter = '.slds-modal__footer';
    this.modalCloseButton = '.slds-modal__close';
    this.modalTitle = '.slds-modal__header h2';
    this.modalBackdrop = '.slds-backdrop';
  }

  /**
   * Navigate to the page
   */
  async goto() {
    await this.page.goto(this.url);
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForSelector('force-record-layout-section', { timeout: 30000 }).catch(() => {});
  }

  /**
   * Click Global Actions button
   */
  async clickGlobal_actions() {
    await this.click(this.global_actions);
  }

  /**
   * Click Setup button
   */
  async clickSetup() {
    await this.click(this.setup);
  }

  /**
   * Click Search button
   */
  async clickSearch() {
    await this.click(this.search);
  }

  /**
   * Click This item doesn't support favorites button
   */
  async clickThis_item_doesn_t_support_favorites() {
    await this.click(this.this_item_doesn_t_support_favorites);
  }

  /**
   * Click Salesforce Help button
   */
  async clickSalesforce_help() {
    await this.click(this.salesforce_help);
  }

  /**
   * Click Cancel and close button
   */
  async clickCancel_and_close() {
    await this.click(this.cancel_and_close);
  }

  /**
   * Click Favorites list button
   */
  async clickFavorites_list() {
    await this.click(this.favorites_list);
  }

  /**
   * Click Guidance Center button
   */
  async clickGuidance_center() {
    await this.click(this.guidance_center);
  }

  /**
   * Click 0Notifications button
   */
  async click0notifications() {
    await this.click(this.0notifications);
  }

  /**
   * Click View profile button
   */
  async clickView_profile() {
    await this.click(this.view_profile);
  }

  /**
   * Click button button
   */
  async clickButton() {
    await this.click(this.button);
  }

  /**
   * Fill input
   * @param {string} value
   */
  async fillInput(value) {
    await this.fill(this.input, value);
  }
  /**
   * Wait for a modal dialog to appear
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<boolean>} - Whether the modal appeared
   */
  async waitForModal(timeout = 10000) {
    return await this.page.locator(this.modalContainer).waitFor({ 
      state: 'visible', 
      timeout 
    }).then(() => true).catch(() => false);
  }

  /**
   * Get the title of the current modal
   * @returns {Promise<string>} - Modal title text
   */
  async getModalTitle() {
    return await this.page.locator(this.modalTitle).textContent();
  }

  /**
   * Close the current modal by clicking the close button
   */
  async closeModal() {
    await this.click(this.modalCloseButton);
    await this.page.locator(this.modalContainer).waitFor({ state: 'hidden' })
      .catch(() => {});
  }

  /**
   * Click a button in the modal footer by text
   * @param {string} buttonText - Text of the button to click
   */
  async clickModalButton(buttonText) {
    await this.page.locator(`${this.modalFooter} button`)
      .filter({ hasText: buttonText })
      .click();
  }
  
  /**
   * Fill an input field in a modal by label
   * @param {string} label - Label text of the field
   * @param {string} value - Value to fill
   */
  async fillModalInput(label, value) {
    await this.page.locator(`${this.modalContent} label`)
      .filter({ hasText: label })
      .locator('xpath=..//input, ../textarea')
      .fill(value);
  }
  
  /**
   * Check if a modal is visible
   * @returns {Promise<boolean>} - Whether the modal is visible
   */
  async isModalVisible() {
    return await this.page.locator(this.modalContainer).isVisible();
  }
  
  /**
   * Get text content from the modal
   * @returns {Promise<string>} - Text content of the modal
   */
  async getModalContent() {
    return await this.page.locator(this.modalContent).textContent();
  }


  /**
   * Get all items from list list
   * @returns {Promise<Array<string>>} - Array of list item text values
   */
  async getListItems() {
    const items = await this.page.locator('ul li, [role="listitem"], [role="option"]').all();
    const result = [];
    
    for (const item of items) {
      result.push(await item.textContent());
    }
    
    return result;
  }

  /**
   * Click on a specific item in list list
   * @param {string|RegExp} textOrPattern - Text or pattern to match against list item
   */
  async clickInList(textOrPattern) {
    await this.page.locator('ul li, [role="listitem"], [role="option"]')
      .filter({ hasText: textOrPattern })
      .first()
      .click();
  }
  /**
   * Get all items from list list
   * @returns {Promise<Array<string>>} - Array of list item text values
   */
  async getListItems() {
    const items = await this.page.locator('ul li, [role="listitem"], [role="option"]').all();
    const result = [];
    
    for (const item of items) {
      result.push(await item.textContent());
    }
    
    return result;
  }

  /**
   * Click on a specific item in list list
   * @param {string|RegExp} textOrPattern - Text or pattern to match against list item
   */
  async clickInList(textOrPattern) {
    await this.page.locator('ul li, [role="listitem"], [role="option"]')
      .filter({ hasText: textOrPattern })
      .first()
      .click();
  }
  /**
   * Get all items from list list
   * @returns {Promise<Array<string>>} - Array of list item text values
   */
  async getListItems() {
    const items = await this.page.locator('ul li, [role="listitem"], [role="option"]').all();
    const result = [];
    
    for (const item of items) {
      result.push(await item.textContent());
    }
    
    return result;
  }

  /**
   * Click on a specific item in list list
   * @param {string|RegExp} textOrPattern - Text or pattern to match against list item
   */
  async clickInList(textOrPattern) {
    await this.page.locator('ul li, [role="listitem"], [role="option"]')
      .filter({ hasText: textOrPattern })
      .first()
      .click();
  }
  /**
   * Get all items from list list
   * @returns {Promise<Array<string>>} - Array of list item text values
   */
  async getListItems() {
    const items = await this.page.locator('ul li, [role="listitem"], [role="option"]').all();
    const result = [];
    
    for (const item of items) {
      result.push(await item.textContent());
    }
    
    return result;
  }

  /**
   * Click on a specific item in list list
   * @param {string|RegExp} textOrPattern - Text or pattern to match against list item
   */
  async clickInList(textOrPattern) {
    await this.page.locator('ul li, [role="listitem"], [role="option"]')
      .filter({ hasText: textOrPattern })
      .first()
      .click();
  }
  /**
   * Get all items from list list
   * @returns {Promise<Array<string>>} - Array of list item text values
   */
  async getListItems() {
    const items = await this.page.locator('ul li, [role="listitem"], [role="option"]').all();
    const result = [];
    
    for (const item of items) {
      result.push(await item.textContent());
    }
    
    return result;
  }

  /**
   * Click on a specific item in list list
   * @param {string|RegExp} textOrPattern - Text or pattern to match against list item
   */
  async clickInList(textOrPattern) {
    await this.page.locator('ul li, [role="listitem"], [role="option"]')
      .filter({ hasText: textOrPattern })
      .first()
      .click();
  }
}

module.exports = SalesforceNewContactDialog;