/**
 * Salesforce Login Helper
 * 
 * Provides consistent login functionality across all Salesforce UI tests
 */
const fs = require('fs');
const path = require('path');

class SalesforceLoginHelper {
  constructor() {
    this.authStatePath = path.join(process.cwd(), 'auth/salesforce-storage-state.json');
    this.authDir = path.join(process.cwd(), 'auth');
    
    // Ensure auth directory exists
    if (!fs.existsSync(this.authDir)) {
      fs.mkdirSync(this.authDir, { recursive: true });
    }
  }

  /**
   * Perform login or use stored authentication
   * @param {Page} page - Playwright page object
   */
  async ensureAuthenticated(page) {
    if (fs.existsSync(this.authStatePath)) {
      // Use stored authentication
      await page.goto(process.env.SF_INSTANCE_URL || process.env.SF_LOGIN_URL);
      
      // Verify we're authenticated by checking if we're not on login page
      if (page.url().includes('login.salesforce.com')) {
        // Auth state expired, perform fresh login
        await this.performLogin(page);
      }
    } else {
      // Perform fresh login
      await this.performLogin(page);
    }
  }

  /**
   * Perform fresh login to Salesforce
   * @param {Page} page - Playwright page object
   */
  async performLogin(page) {
    await page.goto(process.env.SF_LOGIN_URL);
    await page.fill('#username', process.env.SF_USERNAME);
    await page.fill('#password', process.env.SF_PASSWORD);
    await page.click('#Login');
    await page.waitForTimeout(5000);
    
    // Verify login success
    if (page.url().includes('login.salesforce.com')) {
      throw new Error('Login failed - still on login page');
    }
    
    // Save auth state for future use
    await page.context().storageState({ path: this.authStatePath });
  }

  /**
   * Clear stored authentication
   */
  clearAuthState() {
    if (fs.existsSync(this.authStatePath)) {
      fs.unlinkSync(this.authStatePath);
    }
  }
}

module.exports = SalesforceLoginHelper;