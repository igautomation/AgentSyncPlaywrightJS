/**
 * SalesforceNewContactDialog Tests
 */
const { test, expect } = require('@playwright/test');
require('dotenv').config({ path: '.env.salesforce' });

test.describe('SalesforceNewContactDialog Tests', () => {
  test.use({ storageState: './auth/salesforce-storage-state.json' });
  
  test('should verify Salesforce environment is configured', async ({ page }) => {
    // Simple test to verify the Salesforce configuration is working
    expect(process.env.SF_INSTANCE_URL).toBeTruthy();
    expect(process.env.SF_USERNAME).toBeTruthy();
    
    // Navigate to login page instead of instance URL
    await page.goto(process.env.SF_LOGIN_URL);
    const title = await page.title();
    console.log(`Page title: ${title}`);
    
    // Accept any title that contains Salesforce or Login
    expect(title).toMatch(/Salesforce|Login/);
  });
});