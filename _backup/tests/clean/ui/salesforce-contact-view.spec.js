/**
 * Salesforce Contact View Test
 * 
 * Tests viewing contacts in Salesforce UI using stored authentication
 */
const { test, expect } = require('@playwright/test');
const path = require('path');
require('dotenv').config({ path: '.env.unified' });

// Use stored auth state
test.use({
  storageState: path.join(process.cwd(), 'auth/salesforce-storage-state.json')
});

test.describe('Salesforce Contact View', () => {
  test('should navigate to Contacts tab and view contacts list', async ({ page }) => {
    // Navigate directly to Contacts tab
    await page.goto(`${process.env.SF_INSTANCE_URL}/lightning/o/Contact/list`);
    
    // Wait for the list view to load
    await page.waitForSelector('table', { timeout: 30000 });
    
    // Verify we're on the contacts page
    const pageTitle = await page.title();
    expect(pageTitle).toContain('Contacts');
    
    // Take a screenshot
    await page.screenshot({ path: './auth/salesforce-contacts-list.png' });
    
    // Verify the contacts table is present
    const tableExists = await page.isVisible('table');
    expect(tableExists).toBeTruthy();
    
    console.log('✅ Successfully navigated to Contacts list view');
  });

  test('should search for a contact', async ({ page }) => {
    // Navigate to Contacts tab
    await page.goto(`${process.env.SF_INSTANCE_URL}/lightning/o/Contact/list`);
    
    // Wait for the list view to load
    await page.waitForSelector('table', { timeout: 30000 });
    
    // Click on the search box
    await page.click('input[name="Contact-search-input"]');
    
    // Type a search term
    await page.fill('input[name="Contact-search-input"]', 'Test');
    
    // Press Enter to search
    await page.keyboard.press('Enter');
    
    // Wait for search results
    await page.waitForTimeout(5000);
    
    // Take a screenshot of search results
    await page.screenshot({ path: './auth/salesforce-contacts-search.png' });
    
    console.log('✅ Successfully performed contact search');
  });
});