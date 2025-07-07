/**
 * Extended Web Interactions
 * 
 * Additional helper functions for web interactions
 */
const WebInteractions = require('./webInteractions');

/**
 * Extended Web Interactions class with additional functionality
 */
class WebInteractionsExtended extends WebInteractions {
  /**
   * @param {import('@playwright/test').Page} page - Playwright page object
   * @param {Object} options - Options for web interactions
   */
  constructor(page, options = {}) {
    super(page, options);
  }
  
  /**
   * Get element count
   * @param {string} selector - Element selector
   * @returns {Promise<number>} Element count
   */
  async getElementCount(selector) {
    return await this.page.locator(selector).count();
  }
  
  /**
   * Verify element count equals expected value
   * @param {string} selector - Element selector
   * @param {number} expectedCount - Expected count
   * @returns {Promise<boolean>} True if counts match
   */
  async verifyElementCountEquals(selector, expectedCount) {
    const count = await this.getElementCount(selector);
    return count === expectedCount;
  }
  
  /**
   * Get element by role with exact/inexact name matching
   * @param {string} role - ARIA role
   * @param {string} name - Element name
   * @param {Object} options - Options including exact matching
   * @returns {import('@playwright/test').Locator} Element locator
   */
  getElementByRole(role, name, options = {}) {
    return this.page.getByRole(role, { 
      name, 
      exact: options.exact !== false
    });
  }
  
  /**
   * Click element by role
   * @param {string} role - ARIA role
   * @param {string} name - Element name
   * @param {Object} options - Options including exact matching
   */
  async clickElementByRole(role, name, options = {}) {
    const element = this.getElementByRole(role, name, options);
    await element.waitFor({ state: 'visible', timeout: options.timeout || this.defaultTimeout });
    await element.click(options);
  }
  
  /**
   * Scroll to element with retries
   * @param {string} selector - Element selector
   * @param {Object} options - Scroll options
   * @returns {Promise<boolean>} True if scrolled successfully
   */
  async scrollToElementWithRetries(selector, options = {}) {
    const maxRetries = options.maxRetries || 3;
    const retryInterval = options.retryInterval || 1000;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Try different scroll methods
        try {
          await this.page.locator(selector).scrollIntoViewIfNeeded();
          return true;
        } catch (e) {
          // Try alternative method
          await this.evaluate((sel) => {
            const element = document.querySelector(sel);
            if (element) {
              element.scrollIntoView({behavior: 'smooth', block: 'center', inline: 'nearest'});
              return true;
            }
            return false;
          }, selector);
          
          // Check if element is visible after scroll
          const isVisible = await this.isVisible(selector, 1000);
          if (isVisible) return true;
        }
      } catch (error) {
        if (attempt === maxRetries) throw error;
      }
      
      await this.page.waitForTimeout(retryInterval);
    }
    
    return false;
  }
  
  /**
   * Wait for element to contain specific text
   * @param {string} selector - Element selector
   * @param {string} text - Text to check for
   * @param {Object} options - Options
   * @returns {Promise<boolean>} True if element contains text
   */
  async waitForElementToContainText(selector, text, options = {}) {
    const timeout = options.timeout || this.defaultTimeout;
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const content = await this.getText(selector, { timeout: 1000 }).catch(() => '');
      if (content && content.includes(text)) {
        return true;
      }
      await this.page.waitForTimeout(100);
    }
    
    return false;
  }
}

module.exports = WebInteractionsExtended;