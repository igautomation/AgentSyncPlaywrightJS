/**
 * Salesforce Login Test
 * 
 * This test verifies that we can log into Salesforce with the provided credentials
 */
const { test, expect } = require('@playwright/test');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

test.describe('Salesforce Login Test', () => {
  test('should login to Salesforce successfully', async ({ page }) => {
    // Navigate to login page
    await page.goto(process.env.SF_LOGIN_URL);
    
    // Fill login form
    await page.fill('#username', process.env.SF_USERNAME);
    await page.fill('#password', process.env.SF_PASSWORD);
    
    // Click login button
    await page.click('#Login');
    
    // Wait for login to complete (don't use networkidle as it can be unreliable)
    await page.waitForTimeout(10000);
    
    // Take a screenshot for verification
    await page.screenshot({ path: './auth/salesforce-login-attempt.png' });
    
    // Save the authentication state for future tests
    await page.context().storageState({ path: './auth/salesforce-storage-state.json' });
    
    console.log('✅ Attempted to log in to Salesforce and saved authentication state');
  });
});