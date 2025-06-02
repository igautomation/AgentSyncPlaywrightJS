/**
 * Salesforce test fixtures
 */
const base = require('@playwright/test');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config();

/**
 * Extend base test fixtures with Salesforce-specific fixtures
 */
const test = base.test.extend({
  /**
   * Fixture to ensure valid Salesforce session before test
   */
  salesforceSession: [async ({ browser }, use) => {
    // Storage state path
    const storageStatePath = './auth/salesforce-storage-state.json';
    
    // Check if we need to create a session
    const hasSession = fs.existsSync(storageStatePath);
    
    if (!hasSession) {
      console.log('No Salesforce session found. Creating one...');
      
      // Create a simple login flow
      const context = await browser.newContext();
      const page = await context.newPage();
      
      // Ensure auth directory exists
      const authDir = path.resolve(process.cwd(), 'auth');
      if (!fs.existsSync(authDir)) {
        fs.mkdirSync(authDir, { recursive: true });
      }
      
      try {
        // Log into Salesforce directly
        const loginUrl = process.env.SF_LOGIN_URL || 'https://login.salesforce.com';
        await page.goto(loginUrl);
        console.log('Navigated to login page');
        
        // Fill login form - using more reliable selectors
        await page.waitForSelector('#username', { state: 'visible', timeout: 10000 });
        await page.fill('#username', process.env.SF_USERNAME);
        await page.fill('#password', process.env.SF_PASSWORD);
        await page.click('#Login');
        console.log('Submitted login form');

        // Wait for successful login
        await page.waitForTimeout(10000); // Simple wait to ensure login completes
        
        // Save browser state for reuse in tests
        await context.storageState({ path: storageStatePath });
        console.log('✅ Salesforce authentication state saved successfully');
      } catch (error) {
        console.error(`❌ Error during Salesforce authentication: ${error.message}`);
        throw error;
      } finally {
        await context.close();
      }
    } else {
      console.log('Using existing Salesforce session');
    }
    
    // Provide session info to test
    await use({ isValid: true });
  }, { scope: 'worker', auto: true }],
  
  /**
   * Fixture to create a page with Salesforce authentication
   */
  salesforcePage: async ({ browser, salesforceSession }, use) => {
    // Create context with stored authentication
    const context = await browser.newContext({
      storageState: './auth/salesforce-storage-state.json',
      viewport: { width: 1280, height: 720 }
    });
    
    // Create page
    const page = await context.newPage();
    
    // Use the page in the test
    await use(page);
    
    // Clean up
    await page.close();
    await context.close();
  }
});

// Export the extended test object
module.exports = { test, expect: base.expect };