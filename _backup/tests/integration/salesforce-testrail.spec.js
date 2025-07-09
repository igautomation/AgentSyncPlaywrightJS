/**
 * Salesforce Tests with TestRail Integration
 */
const { test, expect } = require('@playwright/test');
const { TestRailClient } = require('../../utils/testrail');
require('dotenv').config({ path: '.env.unified' });

// TestRail status IDs
const TESTRAIL_STATUS = {
  PASSED: 1,
  BLOCKED: 2,
  UNTESTED: 3,
  RETEST: 4,
  FAILED: 5
};

// Initialize TestRail client
let testRailClient;
try {
  testRailClient = new TestRailClient({
    baseUrl: process.env.TESTRAIL_URL || 'https://demo.testrail.io',
    username: process.env.TESTRAIL_USERNAME || 'demo@example.com',
    password: process.env.TESTRAIL_PASSWORD || 'demo123',
    projectId: process.env.TESTRAIL_PROJECT_ID || '1'
  });
} catch (error) {
  console.log('⚠️ TestRail client initialization failed:', error.message);
  testRailClient = null;
}

test.describe('Salesforce Tests with TestRail Integration', () => {
  let testRunId;
  
  test.beforeAll(async () => {
    // Create test run in TestRail
    if (testRailClient) {
      try {
        const testRun = await testRailClient.addRun(
          `Salesforce Automated Tests - ${new Date().toISOString()}`,
          [1, 2, 3], // Test case IDs - replace with actual case IDs
          parseInt(process.env.TESTRAIL_SUITE_ID || '1')
        );
        testRunId = testRun.id;
        console.log(`✅ Created TestRail run: ${testRunId}`);
      } catch (error) {
        console.log('⚠️ TestRail integration disabled:', error.message);
      }
    } else {
      console.log('⚠️ TestRail client not available, running tests without integration');
    }
  });

  test('C1: Salesforce Login Test', async ({ page }) => {
    const testCaseId = 1; // Replace with actual TestRail case ID
    let testStatus = TESTRAIL_STATUS.PASSED;
    let testComment = '';
    
    try {
      // Test execution
      await page.goto(process.env.SF_LOGIN_URL);
      await page.fill('#username', process.env.SF_USERNAME);
      await page.fill('#password', process.env.SF_PASSWORD);
      await page.click('#Login');
      await page.waitForTimeout(15000);
      
      // Assertions
      expect(page.url()).not.toContain('login.salesforce.com');
      
      testComment = 'Login test passed successfully';
      console.log('✅ Salesforce login test passed');
      
    } catch (error) {
      testStatus = TESTRAIL_STATUS.FAILED;
      testComment = `Test failed: ${error.message}`;
      console.log('❌ Salesforce login test failed:', error.message);
      throw error;
    } finally {
      // Update TestRail with result
      if (testRunId) {
        try {
          await testRailClient.addResultForCase(
            testRunId,
            testCaseId,
            testStatus,
            testComment
          );
          console.log(`📊 Updated TestRail case ${testCaseId} with status ${testStatus}`);
        } catch (error) {
          console.log('⚠️ Failed to update TestRail:', error.message);
        }
      }
    }
  });

  test('C2: Salesforce API Record Count Test', async ({ request }) => {
    const testCaseId = 2; // Replace with actual TestRail case ID
    let testStatus = TESTRAIL_STATUS.PASSED;
    let testComment = '';
    
    try {
      // Test execution
      const accessToken = process.env.SF_ACCESS_TOKEN;
      const instanceUrl = process.env.SF_INSTANCE_URL;
      
      test.skip(!accessToken, 'No access token available');
      
      const response = await request.get(
        `${instanceUrl}/services/data/v62.0/limits/recordCount?sObjects=Account,Contact,Lead`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.sObjects).toBeInstanceOf(Array);
      expect(data.sObjects).toHaveLength(3);
      
      const objects = data.sObjects;
      const accountCount = objects.find(obj => obj.name === 'Account')?.count;
      const contactCount = objects.find(obj => obj.name === 'Contact')?.count;
      const leadCount = objects.find(obj => obj.name === 'Lead')?.count;
      
      testComment = `API test passed - Accounts: ${accountCount}, Contacts: ${contactCount}, Leads: ${leadCount}`;
      console.log('✅ Salesforce API test passed');
      
    } catch (error) {
      testStatus = TESTRAIL_STATUS.FAILED;
      testComment = `API test failed: ${error.message}`;
      console.log('❌ Salesforce API test failed:', error.message);
      throw error;
    } finally {
      // Update TestRail with result
      if (testRunId) {
        try {
          await testRailClient.addResultForCase(
            testRunId,
            testCaseId,
            testStatus,
            testComment
          );
          console.log(`📊 Updated TestRail case ${testCaseId} with status ${testStatus}`);
        } catch (error) {
          console.log('⚠️ Failed to update TestRail:', error.message);
        }
      }
    }
  });

  test('C3: Salesforce Contact Navigation Test', async ({ page }) => {
    const testCaseId = 3; // Replace with actual TestRail case ID
    let testStatus = TESTRAIL_STATUS.PASSED;
    let testComment = '';
    
    try {
      // Test execution
      await page.goto(process.env.SF_INSTANCE_URL);
      await page.waitForTimeout(5000);
      
      await page.goto(`${process.env.SF_INSTANCE_URL}/lightning/o/Contact/list`);
      await page.waitForTimeout(5000);
      
      const title = await page.title();
      expect(title).toContain('Contacts');
      
      testComment = 'Contact navigation test passed successfully';
      console.log('✅ Salesforce contact navigation test passed');
      
    } catch (error) {
      testStatus = TESTRAIL_STATUS.FAILED;
      testComment = `Navigation test failed: ${error.message}`;
      console.log('❌ Salesforce contact navigation test failed:', error.message);
      throw error;
    } finally {
      // Update TestRail with result
      if (testRunId) {
        try {
          await testRailClient.addResultForCase(
            testRunId,
            testCaseId,
            testStatus,
            testComment
          );
          console.log(`📊 Updated TestRail case ${testCaseId} with status ${testStatus}`);
        } catch (error) {
          console.log('⚠️ Failed to update TestRail:', error.message);
        }
      }
    }
  });
});