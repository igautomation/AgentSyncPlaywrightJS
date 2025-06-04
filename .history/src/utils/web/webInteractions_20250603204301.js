/**
 * Web Interactions Utility
 * 
 * Provides common web interaction methods with built-in waiting and error handling
 */
const { expect } = require('@playwright/test');

class WebInteractions {
  /**
   * Constructor
   * @param {import('@playwright/test').Page} page - Playwright page object
   * @param {Object} options - Options for web interactions
   * @param {number} options.defaultTimeout - Default timeout in milliseconds
   */
  constructor(page, options = {}) {
    this.page = page;
    this.defaultTimeout = options.defaultTimeout || 30000;
  }

  /**
   * Wait for element to be visible
   * @param {string} selector - Element selector
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<import('@playwright/test').Locator>} - Element locator
   */
  async waitForElement(selector, timeout = this.defaultTimeout) {
    try {
      await this.page.waitForSelector(selector, { 
        state: 'visible', 
        timeout 
      });
      return this.page.locator(selector);
    } catch (error) {
      throw new Error(`Element not found: ${selector}. ${error.message}`);
    }
  }

  /**
   * Click on element
   * @param {string} selector - Element selector
   * @param {Object} options - Click options
   * @returns {Promise<void>}
   */
  async click(selector, options = {}) {
    try {
      const element = await this.waitForElement(selector, options.timeout);
      await element.click(options);
    } catch (error) {
      throw new Error(`Failed to click element: ${selector}. ${error.message}`);
    }
  }

  /**
   * Fill input field
   * @param {string} selector - Element selector
   * @param {string} value - Value to fill
   * @param {Object} options - Fill options
   * @returns {Promise<void>}
   */
  async fill(selector, value, options = {}) {
    try {
      const element = await this.waitForElement(selector, options.timeout);
      await element.fill(value, options);
    } catch (error) {
      throw new Error(`Failed to fill element: ${selector}. ${error.message}`);
    }
  }

  /**
   * Fill multiple form fields
   * @param {Object} formData - Object with selectors as keys and values to fill
   * @param {Object} options - Fill options
   * @returns {Promise<void>}
   */
  async fillForm(formData, options = {}) {
    for (const [selector, value] of Object.entries(formData)) {
      await this.fill(selector, value, options);
    }
  }

  /**
   * Select option from dropdown
   * @param {string} selector - Element selector
   * @param {string|number} value - Value to select
   * @param {Object} options - Select options
   * @returns {Promise<void>}
   */
  async selectOption(selector, value, options = {}) {
    try {
      const element = await this.waitForElement(selector, options.timeout);
      await element.selectOption(value, options);
    } catch (error) {
      throw new Error(`Failed to select option: ${selector}. ${error.message}`);
    }
  }

  /**
   * Check if element is visible
   * @param {string} selector - Element selector
   * @param {Object} options - Visibility check options
   * @returns {Promise<boolean>} - Whether element is visible
   */
  async isVisible(selector, options = {}) {
    try {
      const element = this.page.locator(selector);
      return await element.isVisible(options);
    } catch (error) {
      return false;
    }
  }

  /**
   * Get text from element
   * @param {string} selector - Element selector
   * @param {Object} options - Text options
   * @returns {Promise<string>} - Element text
   */
  async getText(selector, options = {}) {
    try {
      const element = await this.waitForElement(selector, options.timeout);
      return await element.textContent();
    } catch (error) {
      throw new Error(`Failed to get text from element: ${selector}. ${error.message}`);
    }
  }

  /**
   * Hover over element
   * @param {string} selector - Element selector
   * @param {Object} options - Hover options
   * @returns {Promise<void>}
   */
  async hover(selector, options = {}) {
    try {
      const element = await this.waitForElement(selector, options.timeout);
      await element.hover(options);
    } catch (error) {
      throw new Error(`Failed to hover over element: ${selector}. ${error.message}`);
    }
  }

  /**
   * Wait for navigation to complete
   * @param {Object} options - Navigation options
   * @returns {Promise<void>}
   */
  async waitForNavigation(options = {}) {
    try {
      await this.page.waitForNavigation({
        waitUntil: options.waitUntil || 'networkidle',
        timeout: options.timeout || this.defaultTimeout
      });
    } catch (error) {
      throw new Error(`Navigation timeout: ${error.message}`);
    }
  }

  /**
   * Wait for URL to match pattern
   * @param {string|RegExp} urlPattern - URL pattern to match
   * @param {Object} options - URL options
   * @returns {Promise<void>}
   */
  async waitForUrl(urlPattern, options = {}) {
    try {
      await this.page.waitForURL(urlPattern, {
        timeout: options.timeout || this.defaultTimeout
      });
    } catch (error) {
      throw new Error(`URL wait timeout: ${error.message}`);
    }
  }

  /**
   * Login with username and password
   * @param {string} username - Username
   * @param {string} password - Password
   * @param {Object} options - Login options
   * @returns {Promise<void>}
   */
  async login(username, password, options = {}) {
    const usernameSelector = options.usernameSelector || 'input[name="username"]';
    const passwordSelector = options.passwordSelector || 'input[name="password"]';
    const loginButtonSelector = options.loginButtonSelector || 'button[type="submit"]';

    try {
      // Wait for page to be ready
      await this.page.waitForLoadState('domcontentloaded');
      
      // Fill username and password
      await this.fill(usernameSelector, username);
      await this.fill(passwordSelector, password);
      
      // Click login button
      await this.click(loginButtonSelector);
      
      // Wait for navigation to complete
      await this.page.waitForLoadState('networkidle');
    } catch (error) {
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  /**
   * Take screenshot
   * @param {string} name - Screenshot name
   * @param {Object} options - Screenshot options
   * @returns {Promise<Buffer>} - Screenshot buffer
   */
  async takeScreenshot(name, options = {}) {
    try {
      const path = options.path || `./screenshots/${name}-${Date.now()}.png`;
      return await this.page.screenshot({
        path,
        fullPage: options.fullPage !== undefined ? options.fullPage : true,
        ...options
      });
    } catch (error) {
      throw new Error(`Failed to take screenshot: ${error.message}`);
    }
  }
}

module.exports = WebInteractions;