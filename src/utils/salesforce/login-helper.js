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
    // Load Salesforce environment variables
    require('dotenv').config({ path: '.env.salesforce' });
    
    console.log('🔐 Forcing fresh login to verify actual credentials entry');
    // Always perform fresh login to ensure we're actually testing login functionality
    await this.performLogin(page);
  }

  /**
   * Perform fresh login to Salesforce
   * @param {Page} page - Playwright page object
   */
  async performLogin(page) {
    // Load Salesforce environment variables
    require('dotenv').config({ path: '.env.salesforce' });
    
    console.log(`🔐 Starting fresh login to: ${process.env.SF_LOGIN_URL}`);
    console.log(`👤 Username: ${process.env.SF_USERNAME}`);
    
    // Navigate to login page
    await page.goto(process.env.SF_LOGIN_URL);
    await page.waitForLoadState('networkidle');
    
    // Verify we're on login page
    await page.waitForSelector('#username', { timeout: 10000 });
    await page.waitForSelector('#password', { timeout: 10000 });
    await page.waitForSelector('#Login', { timeout: 10000 });
    
    console.log('📝 Filling login credentials');
    // Clear and fill username
    await page.fill('#username', '');
    await page.fill('#username', process.env.SF_USERNAME);
    
    // Clear and fill password
    await page.fill('#password', '');
    await page.fill('#password', process.env.SF_PASSWORD);
    
    // Verify the values were actually filled
    const filledUsername = await page.inputValue('#username');
    const filledPassword = await page.inputValue('#password');
    console.log(`🔍 Filled username: ${filledUsername}`);
    console.log(`🔍 Filled password: ${filledPassword ? '[HIDDEN]' : 'EMPTY!'}`);
    
    // Take screenshot before login
    await page.screenshot({ path: './auth/before-login.png' });
    
    console.log('🔑 Clicking login button');
    await page.click('#Login');
    
    console.log('⏳ Waiting for login response...');
    await page.waitForTimeout(3000);
    
    // Take screenshot to see what happened
    await page.screenshot({ path: './auth/after-login-click.png' });
    
    console.log(`🔍 Current URL after login click: ${page.url()}`);
    console.log(`🔍 Page title: ${await page.title()}`);
    
    // Check for various error selectors
    const errorSelectors = [
      '#error',
      '.loginError', 
      '[id*="error"]',
      '.errorMsg',
      '.message.errorM3',
      '.slds-form-element__help'
    ];
    
    for (const selector of errorSelectors) {
      const errorElement = await page.locator(selector).first();
      if (await errorElement.isVisible().catch(() => false)) {
        const errorText = await errorElement.textContent();
        console.log(`⚠️ Found error with selector ${selector}: ${errorText}`);
        await page.screenshot({ path: './auth/login-error.png' });
        throw new Error(`Login failed with error: ${errorText}`);
      }
    }
    
    // Wait a bit more for any redirects
    await page.waitForTimeout(5000);
    
    // Check if still on login page (login failed)
    if (page.url().includes('login.salesforce.com')) {
      await page.screenshot({ path: './auth/login-failed.png' });
      throw new Error('Login failed - credentials rejected, still on login page');
    }
    
    // Verify we reached Salesforce home/setup page
    const currentUrl = page.url();
    console.log(`🌐 After login URL: ${currentUrl}`);
    
    // Verify login success by checking for Salesforce App Launcher
    console.log('🔍 Verifying login success by checking for App Launcher...');
    
    try {
      // Wait for App Launcher to be visible (indicates successful login)
      await page.waitForSelector('button[title="App Launcher"], .slds-icon-waffle, [data-aura-class="forceAppLauncher"]', { timeout: 10000 });
      console.log('✅ App Launcher found - login successful');
    } catch (error) {
      await page.screenshot({ path: './auth/login-verification-failed.png' });
      throw new Error(`Login verification failed - App Launcher not found: ${error.message}`);
    }
    
    // Take screenshot after successful login
    await page.screenshot({ path: './auth/login-success.png' });
    
    console.log('✅ Login successful - credentials accepted');
    
    // Only save auth state after confirming login success
    console.log('💾 Saving authentication state');
    await page.context().storageState({ path: this.authStatePath });
    console.log('💾 Authentication state saved for future use');
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