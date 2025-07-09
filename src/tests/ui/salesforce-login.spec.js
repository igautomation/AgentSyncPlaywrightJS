/**
 * Salesforce Login Test
 * 
 * Verifies that we can log into Salesforce with the provided credentials
 * and saves the authentication state for other tests
 * with TestRail integration
 */
const { test, expect } = require('@playwright/test');
const { TestRailAPI } = require('../../utils/testrail');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.unified' });

// Global variables
let testRailClient, testRunId;
const testResults = [];

// Ensure auth directory exists
const authDir = path.join(process.cwd(), 'auth');
if (!fs.existsSync(authDir)) {
  fs.mkdirSync(authDir, { recursive: true });
}

// Setup TestRail before all tests
test.beforeAll(async () => {
  try {
    testRailClient = new TestRailAPI();
    const testRun = await testRailClient.addRun(
      parseInt(process.env.TESTRAIL_PROJECT_ID),
      {
        name: `UI Login Tests - ${new Date().toISOString()}`,
        case_ids: [27698], // UI Login Test
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

test.describe('Salesforce Login', () => {
  test('C27698: Salesforce Login Test', async ({ page }) => {
    const startTime = Date.now();
    let status = 1; // Passed
    let comment = '';
    
    try {
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
      
      // We've successfully logged in
      expect(page.url()).not.toContain('login.salesforce.com');
      comment = `Successfully logged in to Salesforce. Page title: ${pageTitle}`;
      console.log(`✅ ${comment}`);
      
    } catch (error) {
      status = 5; // Failed
      comment = `Test failed: ${error.message}`;
      console.log(`❌ ${comment}`);
      throw error;
    } finally {
      if (testRailClient) {
        testResults.push({
          case_id: 27698,
          status_id: status,
          comment: comment,
          elapsed: `${Math.round((Date.now() - startTime) / 1000)}s`
        });
      }
    }
  });
});