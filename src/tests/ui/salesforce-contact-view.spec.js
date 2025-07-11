/**
 * Salesforce Contact View Test
 * 
 * Tests viewing contacts in Salesforce UI using stored authentication
 * with TestRail integration
 */
const { test, expect } = require('@playwright/test');
const { TestRailAPI } = require('../../utils/testrail');
const SalesforceLoginHelper = require('../../utils/salesforce/login-helper');
require('dotenv').config({ path: '.env.salesforce' });

// Global variables
let testRailClient, testRunId;
const testResults = [];

// Setup TestRail before all tests
test.beforeAll(async () => {
  try {
    testRailClient = new TestRailAPI();
    const testRun = await testRailClient.addRun(
      parseInt(process.env.TESTRAIL_PROJECT_ID),
      {
        name: `UI Contact Tests - ${new Date().toISOString()}`,
        case_ids: [27699], // UI Contact View Test
        suite_id: parseInt(process.env.TESTRAIL_SUITE_ID)
      }
    );
    testRunId = testRun.id;
    console.log(`📋 Created TestRail run: ${testRunId}`);
  } catch (error) {
    console.log('⚠️ TestRail integration disabled:', error.message);
    testRailClient = null;
  }
});

// Upload results once after all tests
test.afterAll(async () => {
  if (testRailClient && testRunId && testResults.length > 0) {
    try {
      await testRailClient.addResultsForCases(testRunId, { results: testResults });
      await testRailClient.closeRun(testRunId);
      console.log(`✅ Uploaded ${testResults.length} results to TestRail`);
    } catch (error) {
      console.log('⚠️ Failed to upload results:', error.message);
    }
  }
});

test.describe('Salesforce Contact View', () => {
  test('C27699: Contact List View Test', async ({ page }) => {
    const startTime = Date.now();
    let status = 1; // Passed
    let comment = '';
    
    try {
      // Ensure authenticated to Salesforce
      const loginHelper = new SalesforceLoginHelper();
      await loginHelper.ensureAuthenticated(page);
      
      // Navigate to Contacts tab
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
      
      comment = `Successfully navigated to Contacts list view. Page title: ${pageTitle}`;
      console.log(`✅ ${comment}`);
      
    } catch (error) {
      status = 5; // Failed
      comment = `Test failed: ${error.message}`;
      console.log(`❌ ${comment}`);
      throw error;
    } finally {
      if (testRailClient) {
        testResults.push({
          case_id: 27699,
          status_id: status,
          comment: comment,
          elapsed: `${Math.round((Date.now() - startTime) / 1000)}s`
        });
      }
    }
  });

  test('C27699: Contact Search Test', async ({ page }) => {
    const startTime = Date.now();
    let status = 1; // Passed
    let comment = '';
    
    try {
      // Ensure authenticated to Salesforce
      const loginHelper = new SalesforceLoginHelper();
      await loginHelper.ensureAuthenticated(page);
      
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
      
      comment = 'Successfully performed contact search with term "Test"';
      console.log(`✅ ${comment}`);
      
    } catch (error) {
      status = 5; // Failed
      comment = `Test failed: ${error.message}`;
      console.log(`❌ ${comment}`);
      throw error;
    } finally {
      if (testRailClient) {
        testResults.push({
          case_id: 27699,
          status_id: status,
          comment: comment,
          elapsed: `${Math.round((Date.now() - startTime) / 1000)}s`
        });
      }
    }
  });
});