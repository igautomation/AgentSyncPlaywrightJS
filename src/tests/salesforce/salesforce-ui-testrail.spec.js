/**
 * Salesforce UI Tests with TestRail Integration
 */
const { test, expect } = require('@playwright/test');
const TestRailUploader = require('../../utils/testrail/testrail-uploader');
require('dotenv').config({ path: '.env.salesforce' });

let testRailUploader, testRunId;
const testResults = [];

test.describe('Salesforce UI Tests with TestRail', () => {
  test.use({ storageState: './auth/salesforce-storage-state.json' });
  
  test.beforeAll(async () => {
    try {
      testRailUploader = new TestRailUploader();
      testRunId = await testRailUploader.createTestRun(
        `Salesforce UI Tests - ${new Date().toISOString()}`,
        [24148, 24149] // Actual TestRail case IDs
      );
      console.log(`📋 Created TestRail run: ${testRunId}`);
    } catch (error) {
      console.log('⚠️ TestRail integration disabled:', error.message);
    }
  });

  test.afterAll(async () => {
    if (testRailUploader && testRunId && testResults.length > 0) {
      try {
        await testRailUploader.addResults(testRunId, testResults);
        await testRailUploader.closeRun(testRunId);
      } catch (error) {
        console.log('⚠️ Failed to upload results:', error.message);
      }
    }
  });

  test('C4: Salesforce Login UI Test', async ({ page }) => {
    const startTime = Date.now();
    let status = 1; // Passed
    let comment = '';
    
    try {
      await page.goto(process.env.SF_INSTANCE_URL);
      await page.waitForTimeout(5000);
      
      const pageTitle = await page.title();
      expect(pageTitle).toContain('Salesforce');
      expect(page.url()).toContain('force.com');
      
      comment = `Login successful - Title: ${pageTitle}`;
      console.log('✅ Salesforce login UI test passed');
      
    } catch (error) {
      status = 5; // Failed
      comment = `UI login test failed: ${error.message}`;
      console.log('❌ Salesforce login UI test failed');
      throw error;
    } finally {
      testResults.push({
        case_id: 24148,
        status_id: status,
        comment: comment,
        elapsed: `${Math.round((Date.now() - startTime) / 1000)}s`
      });
    }
  });

  test('C5: Salesforce Contact Navigation UI Test', async ({ page }) => {
    const startTime = Date.now();
    let status = 1; // Passed
    let comment = '';
    
    try {
      // First navigate to home to ensure session is active
      await page.goto(process.env.SF_INSTANCE_URL);
      await page.waitForTimeout(3000);
      
      // Then navigate to contacts
      await page.goto(`${process.env.SF_INSTANCE_URL}/lightning/o/Contact/list`);
      await page.waitForTimeout(8000);
      
      const pageTitle = await page.title();
      const currentUrl = page.url();
      
      // More flexible assertion
      if (pageTitle.includes('Contact') || currentUrl.includes('Contact/list')) {
        comment = `Contact navigation successful - Title: ${pageTitle}`;
        console.log('✅ Salesforce contact navigation UI test passed');
      } else {
        throw new Error(`Navigation failed - Title: ${pageTitle}, URL: ${currentUrl}`);
      }
      
    } catch (error) {
      status = 5; // Failed
      comment = `UI navigation test failed: ${error.message}`;
      console.log('❌ Salesforce contact navigation UI test failed');
      throw error;
    } finally {
      testResults.push({
        case_id: 24149,
        status_id: status,
        comment: comment,
        elapsed: `${Math.round((Date.now() - startTime) / 1000)}s`
      });
    }
  });
});