/**
 * Salesforce Simple Contact Test
 */
const { test, expect } = require('@playwright/test');
require('dotenv').config({ path: '.env.salesforce' });

test.describe.skip('Salesforce Simple Contact Test', () => {
  test.use({ storageState: './auth/salesforce-storage-state.json' });
  
  test('should navigate to contacts list', async ({ page }) => {
    // Navigate to Salesforce instance
    await page.goto(process.env.SF_INSTANCE_URL);
    
    // Wait for page to load
    await page.waitForTimeout(5000);
    
    // Take a screenshot to verify we're logged in
    await page.screenshot({ path: './auth/salesforce-home.png' });
    
    // Navigate to contacts list
    await page.goto(`${process.env.SF_INSTANCE_URL}/lightning/o/Contact/list`);
    
    // Wait for page to load
    await page.waitForTimeout(5000);
    
    // Take a screenshot to verify we're on the contacts page
    await page.screenshot({ path: './auth/salesforce-contacts.png' });
    
    // Verify we're on the contacts page
    const pageTitle = await page.title();
    console.log(`Page title: ${pageTitle}`);
    
    // Add assertions
    expect(pageTitle).toContain('Contacts');
    expect(page.url()).toContain('Contact/list');
    
    // Success!
    console.log('✅ Successfully navigated to Salesforce contacts page');
  });
});