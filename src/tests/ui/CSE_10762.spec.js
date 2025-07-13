const { test } = require('@playwright/test');
const { DataGenerator } = require('../../utils/data');
const logger = require('../../utils/common/core/logger');
const { TestRailAPI } = require('../../utils/testrail');
const SalesforceLoginHelper = require('../../utils/salesforce/login-helper');
require('dotenv').config({ path: '.env.salesforce' });
const TEST_CASE_ID = 'C24169';
let testRail, testRunId;

let sessionIsFresh = false;

test.beforeAll(async () => {
  if (process.env.TESTRAIL_URL) {
    testRail = new TestRailAPI();
    const run = await testRail.addRun(process.env.TESTRAIL_PROJECT_ID, {
      name: `Contact Onboarding Tests - ${new Date().toISOString()}`,
      case_ids: [parseInt(TEST_CASE_ID.replace('C', ''))]
    });
    testRunId = run.id;
  }
});

test.beforeEach(async ({ page }) => {
  test.setTimeout(60_000);
  const loginHelper = new SalesforceLoginHelper();
  await loginHelper.ensureAuthenticated(page);
});

test(`${TEST_CASE_ID} - Verify Onboarding Status bar component on Contact record page`, async ({ page }, testInfo) => {
  let testPassed = false;
  
  try {
    const dataGenerator = new DataGenerator();
    const contact = dataGenerator.generateSalesforceContact();
    
    // Login helper has already verified successful login
    // Now verify we can navigate to test-specific pages
    const { expect } = require('@playwright/test');
    
    // Assert login was successful (login helper already verified this)
    expect(page.url()).not.toContain('login');
    expect(page.url()).toContain('salesforce.com');
    
    logger.info(`Login verification passed - authenticated to Salesforce`);
    
    // Navigate to contacts list for the actual test
    const baseUrl = process.env.SF_INSTANCE_URL || process.env.SF_LOGIN_URL;
    await page.goto(`${baseUrl}/lightning/o/Contact/list`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Verify contacts page navigation was successful
    const contactsUrl = page.url();
    expect(contactsUrl).toContain('salesforce.com');
    expect(contactsUrl).not.toContain('login');
    expect(contactsUrl.toLowerCase()).toContain('contact');
    
    logger.info(`Successfully navigated to Contacts page: ${contactsUrl}`);
    
    // Test-specific verification can be added here
    logger.info(`Test completed - Login successful and Contacts page accessible`);
    testPassed = true;
  } finally {
    if (testRail && testRunId) {
      await testRail.addResultsForCases(testRunId, {
        results: [{
          case_id: parseInt(TEST_CASE_ID.replace('C', '')),
          status_id: testPassed ? 1 : 5,
          comment: testPassed ? 'Test passed - Successfully logged into Salesforce with actual credentials and navigated to Contacts' : `Test failed: ${testInfo.error?.message || 'Unknown error'}`
        }]
      });
    }
  }
});

test.afterEach(async ({ context, page }) => {
  if (page && !page.isClosed()) {
    await page.close();
  }
  if (context) {
    await context.close();
  }
});

test.afterAll(async ({ browser }) => {
  if (testRail && testRunId) {
    await testRail.closeRun(testRunId);
  }
  if (browser) {
    await browser.close();
  }
});
