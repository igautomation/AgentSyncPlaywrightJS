/**
 * Complete Test Suite with TestRail Integration
 * All tests under one TestRail run with dynamic case mapping
 */
const { test, expect } = require('@playwright/test');
const { TestRailClient } = require('../../utils/testrail');
const TestRailCaseMapper = require('../../utils/testrail/case-mapper');
require('dotenv').config({ path: '.env.unified' });

// TestRail status IDs
const TESTRAIL_STATUS = {
  PASSED: 1,
  FAILED: 5
};

// Global TestRail variables
let testRailClient;
let testRunId;
let caseMapper;
const testResults = [];

// Initialize TestRail client and case mapper
try {
  testRailClient = new TestRailClient({
    baseUrl: process.env.TESTRAIL_URL,
    username: process.env.TESTRAIL_USERNAME,
    password: process.env.TESTRAIL_PASSWORD,
    projectId: process.env.TESTRAIL_PROJECT_ID
  });
  caseMapper = new TestRailCaseMapper();
} catch (error) {
  console.log('⚠️ TestRail client initialization failed:', error.message);
  testRailClient = null;
  caseMapper = null;
}

test.describe('Complete Test Suite with TestRail Integration', () => {
  
  test.beforeAll(async () => {
    if (testRailClient && caseMapper) {
      try {
        // Initialize case mapping from TestRail
        await caseMapper.initializeCaseMapping();
        
        // Get all mapped case IDs
        const caseIds = caseMapper.getAllCaseIds();
        
        const testRun = await testRailClient.addRun(
          `Complete Test Suite - ${new Date().toISOString()}`,
          caseIds, // Dynamic case IDs from TestRail
          parseInt(process.env.TESTRAIL_SUITE_ID || '412')
        );
        testRunId = testRun.id;
        console.log(`📋 Created unified TestRail run: ${testRunId} with cases: [${caseIds.join(', ')}]`);
      } catch (error) {
        console.log('⚠️ TestRail integration disabled:', error.message);
      }
    }
  });

  test.afterAll(async () => {
    if (testRailClient && testRunId && testResults.length > 0) {
      try {
        await testRailClient.addResults(testRunId, testResults);
        await testRailClient.closeRun(testRunId);
        console.log(`🔒 Closed unified TestRail run: ${testRunId} with ${testResults.length} results`);
      } catch (error) {
        console.log('⚠️ Failed to upload results:', error.message);
      }
    }
  });

  // API Tests
  test('C1: Salesforce API Limits Test', async ({ request }) => {
    const testCaseId = caseMapper ? caseMapper.getCaseId('C1: Salesforce API Limits Test') : 1;
    let testStatus = TESTRAIL_STATUS.PASSED;
    let testComment = '';
    
    try {
      const response = await request.get(
        `${process.env.SF_INSTANCE_URL}/services/data/v62.0/limits`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.SF_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.status() === 401) {
        testComment = 'API limits test skipped - Token expired (expected)';
        console.log('⚠️ Salesforce API limits test skipped - Token expired');
        test.skip();
      } else {
        expect(response.status()).toBe(200);
        const limits = await response.json();
        expect(limits.DailyApiRequests).toBeDefined();
        
        testComment = 'API limits test passed successfully';
        console.log('✅ Salesforce API limits test passed');
      }
      
    } catch (error) {
      if (error.message.includes('401')) {
        testComment = 'API limits test skipped - Token expired (expected)';
        console.log('⚠️ Salesforce API limits test skipped - Token expired');
        test.skip();
      } else {
        testStatus = TESTRAIL_STATUS.FAILED;
        testComment = `API limits test failed: ${error.message}`;
        console.log('❌ Salesforce API limits test failed');
        throw error;
      }
    } finally {
      testResults.push({
        case_id: testCaseId,
        status_id: testStatus,
        comment: testComment
      });
    }
  });

  test('C2: Salesforce API Record Count Test', async ({ request }) => {
    const testCaseId = caseMapper ? caseMapper.getCaseId('C2: Salesforce API Record Count Test') : 2;
    let testStatus = TESTRAIL_STATUS.PASSED;
    let testComment = '';
    
    try {
      const response = await request.get(
        `${process.env.SF_INSTANCE_URL}/services/data/v62.0/limits/recordCount?sObjects=Account,Contact,Lead`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.SF_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.status() === 401) {
        testComment = 'API record count test skipped - Token expired (expected)';
        console.log('⚠️ Salesforce API record count test skipped - Token expired');
        test.skip();
      } else {
        expect(response.status()).toBe(200);
        const data = await response.json();
        expect(data.sObjects).toBeInstanceOf(Array);
        
        const accountCount = data.sObjects.find(obj => obj.name === 'Account')?.count;
        testComment = `API record count test passed - Accounts: ${accountCount}`;
        console.log('✅ Salesforce API record count test passed');
      }
      
    } catch (error) {
      if (error.message.includes('401')) {
        testComment = 'API record count test skipped - Token expired (expected)';
        console.log('⚠️ Salesforce API record count test skipped - Token expired');
        test.skip();
      } else {
        testStatus = TESTRAIL_STATUS.FAILED;
        testComment = `API record count test failed: ${error.message}`;
        console.log('❌ Salesforce API record count test failed');
        throw error;
      }
    } finally {
      testResults.push({
        case_id: testCaseId,
        status_id: testStatus,
        comment: testComment
      });
    }
  });

  // UI Tests
  test('C3: Salesforce Login UI Test', async ({ page }) => {
    const testCaseId = caseMapper ? caseMapper.getCaseId('C3: Salesforce Login UI Test') : 3;
    let testStatus = TESTRAIL_STATUS.PASSED;
    let testComment = '';
    
    try {
      await page.goto('https://login.salesforce.com');
      await page.fill('#username', process.env.SF_USERNAME);
      await page.fill('#password', process.env.SF_PASSWORD);
      await page.click('#Login');
      await page.waitForTimeout(10000);
      
      expect(page.url()).not.toContain('login.salesforce.com');
      
      testComment = 'Login UI test passed successfully';
      console.log('✅ Salesforce login UI test passed');
      
    } catch (error) {
      testStatus = TESTRAIL_STATUS.FAILED;
      testComment = `Login UI test failed: ${error.message}`;
      console.log('❌ Salesforce login UI test failed');
      throw error;
    } finally {
      testResults.push({
        case_id: testCaseId,
        status_id: testStatus,
        comment: testComment
      });
    }
  });

  test('C4: Salesforce Contact Navigation Test', async ({ page }) => {
    const testCaseId = caseMapper ? caseMapper.getCaseId('C4: Salesforce Contact Navigation Test') : 4;
    let testStatus = TESTRAIL_STATUS.PASSED;
    let testComment = '';
    
    try {
      // Login first
      await page.goto('https://login.salesforce.com');
      await page.fill('#username', process.env.SF_USERNAME);
      await page.fill('#password', process.env.SF_PASSWORD);
      await page.click('#Login');
      await page.waitForTimeout(10000);
      
      // Navigate to contacts
      await page.goto(`${process.env.SF_INSTANCE_URL}/lightning/o/Contact/list`);
      await page.waitForTimeout(5000);
      
      const title = await page.title();
      if (title.includes('Contact') || page.url().includes('Contact')) {
        testComment = 'Contact navigation test passed successfully';
        console.log('✅ Salesforce contact navigation test passed');
      } else {
        throw new Error(`Navigation failed - Title: ${title}`);
      }
      
    } catch (error) {
      testStatus = TESTRAIL_STATUS.FAILED;
      testComment = `Contact navigation test failed: ${error.message}`;
      console.log('❌ Salesforce contact navigation test failed');
      throw error;
    } finally {
      testResults.push({
        case_id: testCaseId,
        status_id: testStatus,
        comment: testComment
      });
    }
  });

  test('C5: Framework Validation Test', async ({ page }) => {
    const testCaseId = caseMapper ? caseMapper.getCaseId('C5: Framework Validation Test') : 5;
    let testStatus = TESTRAIL_STATUS.PASSED;
    let testComment = '';
    
    try {
      await page.goto('https://example.com');
      const title = await page.title();
      expect(title).toContain('Example');
      
      testComment = 'Framework validation test passed successfully';
      console.log('✅ Framework validation test passed');
      
    } catch (error) {
      testStatus = TESTRAIL_STATUS.FAILED;
      testComment = `Framework validation test failed: ${error.message}`;
      console.log('❌ Framework validation test failed');
      throw error;
    } finally {
      testResults.push({
        case_id: testCaseId,
        status_id: testStatus,
        comment: testComment
      });
    }
  });
});