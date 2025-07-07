/**
 * Salesforce Session Manager
 * Handles session validation and authentication for Salesforce tests
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

class SalesforceSessionManager {
  constructor(config = {}) {
    this.storageStatePath = config.storageStatePath || './auth/salesforce-storage-state.json';
    this.loginUrl = config.loginUrl || process.env.SF_LOGIN_URL || 'https://login.salesforce.com';
    this.username = config.username || process.env.SF_USERNAME;
    this.password = config.password || process.env.SF_PASSWORD;
    this.sessionValidityMinutes = config.sessionValidityMinutes || 60; // Default 1 hour
  }

  /**
   * Check if storage state file exists and is recent
   * @returns {boolean} True if valid session exists
   */
  hasValidSession() {
    try {
      // Check if file exists
      if (!fs.existsSync(this.storageStatePath)) {
        console.log('No session file found');
        return false;
      }

      // Check file age
      const stats = fs.statSync(this.storageStatePath);
      const fileAgeMinutes = (Date.now() - stats.mtime) / (1000 * 60);
      
      if (fileAgeMinutes > this.sessionValidityMinutes) {
        console.log(`Session file expired (${Math.round(fileAgeMinutes)} minutes old)`);
        return false;
      }

      // Verify file content is valid JSON
      const content = fs.readFileSync(this.storageStatePath, 'utf8');
      const sessionData = JSON.parse(content);
      
      // Basic validation of session data structure
      if (!sessionData.cookies || sessionData.cookies.length === 0) {
        console.log('Session file has no cookies');
        return false;
      }

      // Check for Salesforce session cookie
      const hasSFDCSession = sessionData.cookies.some(cookie => 
        cookie.name.includes('sid') || cookie.name.includes('session')
      );
      
      if (!hasSFDCSession) {
        console.log('No Salesforce session cookie found');
        return false;
      }

      console.log('Valid Salesforce session found');
      return true;
    } catch (error) {
      console.error(`Error checking session: ${error.message}`);
      return false;
    }
  }

  /**
   * Verify session by making a request to Salesforce
   * @returns {Promise<boolean>} True if session is valid
   */
  async verifySession() {
    if (!this.hasValidSession()) {
      return false;
    }

    let browser;
    try {
      browser = await chromium.launch({ headless: true });
      const context = await browser.newContext({
        storageState: this.storageStatePath
      });
      
      const page = await context.newPage();
      
      // Try to access a Salesforce page that requires authentication
      const response = await page.goto(`${this.loginUrl}/lightning/setup/SetupOneHome/home`);
      
      // Check if we're still on a page that requires login
      const currentUrl = page.url();
      const isLoggedIn = !currentUrl.includes('login') && response.status() === 200;
      
      console.log(`Session verification: ${isLoggedIn ? 'Valid' : 'Invalid'}`);
      return isLoggedIn;
    } catch (error) {
      console.error(`Error verifying session: ${error.message}`);
      return false;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  /**
   * Create a new session by logging in
   * @returns {Promise<boolean>} True if login successful
   */
  async createSession() {
    // Ensure auth directory exists
    const authDir = path.dirname(this.storageStatePath);
    if (!fs.existsSync(authDir)) {
      fs.mkdirSync(authDir, { recursive: true });
    }

    let browser;
    try {
      browser = await chromium.launch({ headless: false });
      const context = await browser.newContext();
      const page = await context.newPage();

      // Log into Salesforce
      await page.goto(this.loginUrl);
      console.log('Navigating to login page');
      
      // Fill login form
      await page.getByRole('textbox', { name: 'Username' }).fill(this.username);
      await page.getByRole('textbox', { name: 'Password' }).fill(this.password);
      await page.getByRole('button', { name: 'Log In' }).click();
      console.log('Submitted login form');

      // Wait for successful login
      await page.waitForTimeout(10000); // Simple wait to ensure login completes
      
      // Save browser state for reuse in tests
      await context.storageState({ path: this.storageStatePath });
      console.log('✅ Salesforce authentication state saved successfully');
      
      return true;
    } catch (error) {
      console.error(`❌ Error during Salesforce authentication: ${error.message}`);
      return false;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  /**
   * Ensure valid session exists, creating one if needed
   * @returns {Promise<boolean>} True if valid session exists or was created
   */
  async ensureValidSession() {
    // First check file existence and age
    if (this.hasValidSession()) {
      // Then verify by making a request
      const isValid = await this.verifySession();
      if (isValid) {
        return true;
      }
    }
    
    // Create new session if needed
    return await this.createSession();
  }
}

module.exports = SalesforceSessionManager;