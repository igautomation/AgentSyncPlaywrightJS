/**
 * Salesforce Login Test
 * 
 * Verifies that we can log into Salesforce with the provided credentials
 * and saves the authentication state for other tests
 */
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.unified' });

// Ensure auth directory exists
const authDir = path.join(process.cwd(), 'auth');
if (!fs.existsSync(authDir)) {
  fs.mkdirSync(authDir, { recursive: true });
}

test.describe('Salesforce Login', () => {
  test('should login to Salesforce successfully', async ({ page }) => {
    // Navigate to login page
    await page.goto(process.env.SF_LOGIN_URL);

    // Fill login form
    await page.fill('#username', process.env.SF_USERNAME);
    await page.fill('#password', process.env.SF_PASSWORD);

    // Click login button
    await page.click('#Login');

    // Wait for login to complete and page to load
    await page.waitForTimeout(10000);

    // Take a screenshot for verification
    await page.screenshot({ path: './auth/salesforce-login-success.png' });

    // Check if we're still on the login page
    if (page.url().includes('login.salesforce.com')) {
      const errorElement = await page.$('#error');
      if (errorElement) {
        const errorText = await errorElement.textContent();
        throw new Error(`Login error: ${errorText}`);
      } else {
        throw new Error('Failed to login to Salesforce');
      }
    }

    // Save the authentication state for future tests
    await page.context().storageState({ path: './auth/salesforce-storage-state.json' });

    // Add assertions
    const pageTitle = await page.title();
    console.log(`Current page title: ${pageTitle}`);
    console.log(`Current URL: ${page.url()}`);
    
    // We've successfully logged in
    expect(page.url()).not.toContain('login.salesforce.com');
    console.log('✅ Successfully logged in to Salesforce and saved authentication state');
  });
});