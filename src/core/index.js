/**
 * Core functionality for the Playwright framework
 */

const { config } = require('../config');

/**
 * Base class for all page objects
 */
class BasePage {
  /**
   * @param {import('@playwright/test').Page} page 
   */
  constructor(page) {
    this.page = page;
    this.config = config;
  }

  /**
   * Navigate to a URL
   * @param {string} url - URL to navigate to
   */
  async goto(url) {
    await this.page.goto(url);
  }

  /**
   * Wait for page to be ready
   */
  async waitForPageReady() {
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {
      // Ignore timeout errors for networkidle
    });
  }

  /**
   * Get page title
   * @returns {Promise<string>} - Page title
   */
  async getTitle() {
    return await this.page.title();
  }

  /**
   * Get current URL
   * @returns {Promise<string>} - Current URL
   */
  async getUrl() {
    return this.page.url();
  }

  /**
   * Check if element exists
   * @param {string} selector - Element selector
   * @returns {Promise<boolean>} - True if element exists
   */
  async hasElement(selector) {
    const element = await this.page.$(selector);
    return element !== null;
  }

  /**
   * Wait for element to be visible
   * @param {string} selector - Element selector
   * @param {Object} options - Options
   * @param {number} options.timeout - Timeout in milliseconds
   */
  async waitForElement(selector, { timeout = 30000 } = {}) {
    await this.page.waitForSelector(selector, { state: 'visible', timeout });
  }

  /**
   * Click on element
   * @param {string} selector - Element selector
   */
  async click(selector) {
    await this.page.click(selector);
  }

  /**
   * Fill input field
   * @param {string} selector - Element selector
   * @param {string} value - Value to fill
   */
  async fill(selector, value) {
    await this.page.fill(selector, value);
  }

  /**
   * Get text from element
   * @param {string} selector - Element selector
   * @returns {Promise<string>} - Element text
   */
  async getText(selector) {
    return await this.page.textContent(selector);
  }

  /**
   * Take screenshot
   * @param {string} name - Screenshot name
   */
  async takeScreenshot(name) {
    await this.page.screenshot({ path: `./screenshots/${name}.png` });
  }
}

module.exports = {
  BasePage
};