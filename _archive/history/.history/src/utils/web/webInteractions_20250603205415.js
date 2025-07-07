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
  
  /**
   * Wait for a condition to be true
   * @param {Function} conditionFn - Function that returns a boolean or Promise<boolean>
   * @param {Object} options - Options
   * @returns {Promise<boolean>} True if condition was met
   */
  async waitForCondition(conditionFn, options = {}) {
    const timeout = options.timeout || this.defaultTimeout;
    const pollInterval = options.pollInterval || 100;
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      try {
        const result = await conditionFn();
        if (result) return true;
      } catch (error) {
        // Ignore errors in condition function
      }
      
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }
    
    throw new Error(`Timed out waiting for condition after ${timeout}ms`);
  }
  
  /**
   * Upload a file
   * @param {string} selector - File input selector
   * @param {string|Array<string>} filePaths - Path(s) to file(s) to upload
   * @param {Object} options - Upload options
   */
  async uploadFile(selector, filePaths, options = {}) {
    await this.waitForElement(selector, options.timeout);
    await this.page.setInputFiles(selector, filePaths, options);
  }
  
  /**
   * Handle an alert dialog
   * @param {string} action - Action to take: 'accept', 'dismiss', or 'fill'
   * @param {string} promptText - Text to enter for prompt dialogs
   * @param {Object} options - Dialog options
   */
  async handleAlert(action = 'accept', promptText = '', options = {}) {
    // Set up dialog handler
    await this.page.once('dialog', async dialog => {
      if (action === 'accept') {
        await dialog.accept(promptText);
      } else if (action === 'dismiss') {
        await dialog.dismiss();
      } else if (action === 'fill' && promptText) {
        await dialog.accept(promptText);
      }
    });
  }
  
  /**
   * Switch to an iframe
   * @param {string} selector - Iframe selector
   * @param {Object} options - Options
   * @returns {Promise<import('@playwright/test').Frame>} Frame object
   */
  async switchToFrame(selector, options = {}) {
    await this.waitForElement(selector, options.timeout);
    const frameElement = await this.page.$(selector);
    const frame = await frameElement.contentFrame();
    return frame;
  }
  
  /**
   * Verify text exists on the page
   * @param {string} text - Text to verify
   * @param {Object} options - Options
   * @returns {Promise<boolean>} True if text exists
   */
  async verifyText(text, options = {}) {
    const locator = this.page.getByText(text, options);
    return await locator.isVisible({ timeout: options.timeout || this.defaultTimeout });
  }
  
  /**
   * Handle autocomplete by typing and selecting an option
   * @param {string} inputSelector - Input field selector
   * @param {string} text - Text to type
   * @param {string} optionSelector - Option selector to click after typing
   * @param {Object} options - Options
   */
  async handleAutocomplete(inputSelector, text, optionSelector, options = {}) {
    await this.fill(inputSelector, text, options);
    
    // Wait for autocomplete options to appear
    const delay = options.delay || 500;
    await this.page.waitForTimeout(delay);
    
    // Click the option
    await this.click(optionSelector, options);
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
          await this.page.evaluate((sel) => {
            const element = document.querySelector(sel);
            if (element) {
              element.scrollIntoView({behavior: 'smooth', block: 'center', inline: 'nearest'});
              return true;
            }
            return false;
          }, selector);
          
          // Check if element is visible after scroll
          const isVisible = await this.isVisible(selector, { timeout: 1000 });
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

module.exports = WebInteractions;