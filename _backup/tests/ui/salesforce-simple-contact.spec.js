/**
 * Salesforce Simple Contact Test
 */
const { test, expect } = require('@playwright/test');
require('dotenv').config({ path: '.env.salesforce' });

test.describe('Salesforce Simple Contact Test', () => {
  
  test('should navigate to contacts list', async ({ page }) => {
    // Login first
    await page.goto('https://login.salesforce.com');
    await page.fill('#username', process.env.SF_USERNAME);
    await page.fill('#password', process.env.SF_PASSWORD);
    await page.click('#Login');
    await page.waitForTimeout(5000);
    
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