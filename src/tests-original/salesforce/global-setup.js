/**
 * Global setup for Salesforce tests
 */
const { chromium } = require('@playwright/test');
const fs = require('fs').promises;
const path = require('path');
const dotenv = require('dotenv');
const SalesforceApiUtils = require('../../utils/salesforce/salesforceApiUtils');

// Load environment variables from .env.salesforce
dotenv.config({ path: '.env.salesforce' });

/**
 * Setup function that runs before all tests
 */
async function globalSetup() {
  console.log('Starting Salesforce global setup...');
  
  // Ensure auth directory exists
  const authDir = path.join(process.cwd(), 'auth');
  await fs.mkdir(authDir, { recursive: true }).catch(() => {});
  
  // Try to get access token via API first
  try {
    const apiUtils = new SalesforceApiUtils();
    const accessToken = await apiUtils.getAccessToken();
    
    if (accessToken) {
      console.log('Successfully obtained Salesforce access token via API');
      
      // Create storage state with the token
      const storageState = {
        cookies: [
          {
            name: "sid",
            value: accessToken,
            domain: ".salesforce.com",
            path: "/",
            expires: Math.floor(Date.now() / 1000) + 86400,
            httpOnly: true,
            secure: true,
            sameSite: "None"
          }
        ],
        origins: [
          {
            origin: apiUtils.instanceUrl,
            localStorage: [
              {
                name: "authInfo",
                value: JSON.stringify({
                  accessToken: accessToken,
                  instanceUrl: apiUtils.instanceUrl
                })
              }
            ]
          }
        ]
      };
      
      // Save the storage state
      await fs.writeFile(
        path.join(authDir, 'salesforce-storage-state.json'),
        JSON.stringify(storageState, null, 2)
      );
      
      console.log('Salesforce authentication state saved');
      return;
    }
  } catch (error) {
    console.log('Failed to get access token via API:', error.message);
    console.log('Falling back to browser login...');
  }
  
  // Fall back to browser login if API login fails
  try {
    // Launch browser
    const browser = await chromium.launch({ headless: process.env.HEADLESS === 'true' });
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Navigate to login page
    await page.goto(process.env.SF_LOGIN_URL);
    
    // Fill login form
    await page.fill('#username', process.env.SF_USERNAME);
    await page.fill('#password', process.env.SF_PASSWORD);
    
    // Click login button
    await page.click('#Login');
    
    // Wait for login to complete
    await page.waitForTimeout(10000);
    
    // Check if login was successful
    if (page.url().includes('login.salesforce.com')) {
      const errorElement = await page.$('#error');
      if (errorElement) {
        const errorText = await errorElement.textContent();
        console.log(`Login error: ${errorText}`);
        
        // Create a minimal storage state file to prevent test failures
        const minimalState = { cookies: [], origins: [] };
        await fs.writeFile(
          path.join(authDir, 'salesforce-storage-state.json'),
          JSON.stringify(minimalState, null, 2)
        );
      }
    } else {
      // Save authentication state
      await context.storageState({ path: path.join(authDir, 'salesforce-storage-state.json') });
      console.log('Salesforce authentication state saved');
    }
    
    // Close browser
    await browser.close();
  } catch (error) {
    console.error('Error during Salesforce setup:', error);
    
    // Create a minimal storage state file to prevent test failures
    const minimalState = { cookies: [], origins: [] };
    await fs.writeFile(
      path.join(authDir, 'salesforce-storage-state.json'),
      JSON.stringify(minimalState, null, 2)
    );
  }
  
  console.log('Salesforce global setup completed');
}

module.exports = globalSetup;