/**
 * Complete TestRail Integration - Create Suite, Cases, Run Tests, Upload Results
 */
const { test, expect } = require('@playwright/test');
const { TestRailAPI } = require('../../utils/testrail');
require('dotenv').config({ path: '.env.unified' });

// TestRail status IDs
const TESTRAIL_STATUS = { PASSED: 1, FAILED: 5 };

// Global TestRail variables
let testRailClient;
let suiteId;
let testRunId;
let testCases = [];
const testResults = [];

// Test case definitions
const TEST_CASES = [
  { title: 'Framework Validation Test', description: 'Validates basic framework functionality' },
  { title: 'Salesforce Login Test', description: 'Tests Salesforce authentication' },
  { title: 'API Request Test', description: 'Tests API request capabilities' },
  { title: 'Cross Browser Test', description: 'Tests cross-browser compatibility' },
  { title: 'Navigation Test', description: 'Tests page navigation functionality' }
];

// Initialize TestRail client
try {
  testRailClient = new TestRailAPI();
  console.log('✅ TestRail client initialized');
} catch (error) {
  console.log('❌ TestRail client failed:', error.message);
  testRailClient = null;
}

test.describe('Complete TestRail Integration', () => {
  
  test.beforeAll(async () => {
    if (!testRailClient) return;
    
    try {
      // 1. Create test suite
      console.log('🔄 Creating test suite...');
      const suite = await testRailClient.addSuite(
        parseInt(process.env.TESTRAIL_PROJECT_ID),
        {
          name: `Automated Test Suite - ${new Date().toISOString()}`,
          description: 'Automated test suite created by Playwright framework'
        }
      );
      suiteId = suite.id;
      console.log(`✅ Created suite: ${suiteId}`);
      
      // 2. Create test cases
      console.log('🔄 Creating test cases...');
      for (const testCase of TEST_CASES) {
        const createdCase = await testRailClient.addCase(
          suiteId,
          {
            title: testCase.title,
            custom_steps_separated: [
              {
                content: testCase.description,
                expected: 'Test should pass successfully'
              }
            ]
          }
        );
        testCases.push(createdCase);
        console.log(`✅ Created case: ${createdCase.id} - ${createdCase.title}`);
      }
      
      // 3. Create test run
      console.log('🔄 Creating test run...');
      const testRun = await testRailClient.addRun(
        parseInt(process.env.TESTRAIL_PROJECT_ID),
        {
          name: `Test Run - ${new Date().toISOString()}`,
          suite_id: suiteId,
          case_ids: testCases.map(c => c.id)
        }
      );
      testRunId = testRun.id;
      console.log(`✅ Created test run: ${testRunId}`);
      
    } catch (error) {
      console.log('❌ TestRail setup failed:', error.message);
      console.log('Error details:', error.response?.data || error);
    }
  });

  test.afterAll(async () => {
    if (testRailClient && testRunId && testResults.length > 0) {
      try {
        console.log('🔄 Uploading results...');
        await testRailClient.addResultsForCases(testRunId, { results: testResults });
        console.log('✅ Results uploaded');
        
        await testRailClient.closeRun(testRunId);
        console.log(`✅ Closed test run: ${testRunId}`);
      } catch (error) {
        console.log('❌ Failed to upload results:', error.message);
      }
    }
  });

  test('Framework Validation Test', async ({ page }) => {
    const caseId = testCases.find(c => c.title === 'Framework Validation Test')?.id;
    let status = TESTRAIL_STATUS.PASSED;
    let comment = '';
    
    try {
      await page.goto('https://example.com');
      const title = await page.title();
      expect(title).toContain('Example');
      
      comment = 'Framework validation passed successfully';
      console.log(`✅ Case ${caseId}: ${comment}`);
      
    } catch (error) {
      status = TESTRAIL_STATUS.FAILED;
      comment = `Framework validation failed: ${error.message}`;
      console.log(`❌ Case ${caseId}: ${comment}`);
      throw error;
    } finally {
      if (caseId) {
        testResults.push({ case_id: caseId, status_id: status, comment });
      }
    }
  });

  test('Salesforce Login Test', async ({ page }) => {
    const caseId = testCases.find(c => c.title === 'Salesforce Login Test')?.id;
    let status = TESTRAIL_STATUS.PASSED;
    let comment = '';
    
    try {
      await page.goto('https://login.salesforce.com');
      await page.fill('#username', process.env.SF_USERNAME);
      await page.fill('#password', process.env.SF_PASSWORD);
      await page.click('#Login');
      await page.waitForTimeout(10000);
      
      expect(page.url()).not.toContain('login.salesforce.com');
      
      comment = 'Salesforce login passed successfully';
      console.log(`✅ Case ${caseId}: ${comment}`);
      
    } catch (error) {
      status = TESTRAIL_STATUS.FAILED;
      comment = `Salesforce login failed: ${error.message}`;
      console.log(`❌ Case ${caseId}: ${comment}`);
      throw error;
    } finally {
      if (caseId) {
        testResults.push({ case_id: caseId, status_id: status, comment });
      }
    }
  });

  test('API Request Test', async ({ request }) => {
    const caseId = testCases.find(c => c.title === 'API Request Test')?.id;
    let status = TESTRAIL_STATUS.PASSED;
    let comment = '';
    
    try {
      const response = await request.get('https://httpbin.org/get');
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.url).toBe('https://httpbin.org/get');
      
      comment = 'API request passed successfully';
      console.log(`✅ Case ${caseId}: ${comment}`);
      
    } catch (error) {
      status = TESTRAIL_STATUS.FAILED;
      comment = `API request failed: ${error.message}`;
      console.log(`❌ Case ${caseId}: ${comment}`);
      throw error;
    } finally {
      if (caseId) {
        testResults.push({ case_id: caseId, status_id: status, comment });
      }
    }
  });

  test('Cross Browser Test', async ({ page, browserName }) => {
    const caseId = testCases.find(c => c.title === 'Cross Browser Test')?.id;
    let status = TESTRAIL_STATUS.PASSED;
    let comment = '';
    
    try {
      await page.goto('https://playwright.dev');
      const title = await page.title();
      expect(title).toContain('Playwright');
      
      comment = `Cross browser test passed on ${browserName}`;
      console.log(`✅ Case ${caseId}: ${comment}`);
      
    } catch (error) {
      status = TESTRAIL_STATUS.FAILED;
      comment = `Cross browser test failed on ${browserName}: ${error.message}`;
      console.log(`❌ Case ${caseId}: ${comment}`);
      throw error;
    } finally {
      if (caseId) {
        testResults.push({ case_id: caseId, status_id: status, comment });
      }
    }
  });

  test('Navigation Test', async ({ page }) => {
    const caseId = testCases.find(c => c.title === 'Navigation Test')?.id;
    let status = TESTRAIL_STATUS.PASSED;
    let comment = '';
    
    try {
      await page.goto('https://example.com');
      await page.waitForTimeout(2000);
      
      const title = await page.title();
      expect(title).toContain('Example');
      
      comment = 'Navigation test passed successfully';
      console.log(`✅ Case ${caseId}: ${comment}`);
      
    } catch (error) {
      status = TESTRAIL_STATUS.FAILED;
      comment = `Navigation test failed: ${error.message}`;
      console.log(`❌ Case ${caseId}: ${comment}`);
      throw error;
    } finally {
      if (caseId) {
        testResults.push({ case_id: caseId, status_id: status, comment });
      }
    }
  });
});