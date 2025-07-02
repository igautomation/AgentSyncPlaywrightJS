/**
 * Salesforce API Demo Tests with TestRail Integration
 * Client Demo: 2 API Test Cases
 */
const { test, expect } = require('@playwright/test');
const TestRailUploader = require('../utils/testrail/testrail-uploader');
const TestCaseFetcher = require('../utils/testrail/test-case-fetcher');
require('dotenv').config({ path: '.env.unified' });

let accessToken, instanceUrl;
let testRailUploader, testRunId, testCaseIds;
const testResults = [];

test.describe('Salesforce API Demo Tests', () => {
  test.use({ ignoreHTTPSErrors: true });
  
  test.beforeAll(async () => {
    accessToken = process.env.SF_ACCESS_TOKEN;
    instanceUrl = process.env.SF_INSTANCE_URL;
    
    if (!accessToken || !instanceUrl) {
      throw new Error('SF_ACCESS_TOKEN and SF_INSTANCE_URL must be set');
    }
    
    console.log('✅ Using token from environment');
    
    try {
      const fetcher = new TestCaseFetcher();
      
      // Get all test cases and find API-related ones
      const allCases = await fetcher.getTestCases();
      const apiCases = allCases.filter(c => 
        c.title && (c.title.toLowerCase().includes('api') || c.title.toLowerCase().includes('authentication'))
      );
      
      // Use first 2 API cases or fallback to any 2 cases
      testCaseIds = apiCases.length >= 2 
        ? [apiCases[0].id, apiCases[1].id] 
        : allCases.length >= 2 
          ? [allCases[0].id, allCases[1].id]
          : [24148, 24150];
      
      testRailUploader = new TestRailUploader();
      testRunId = await testRailUploader.createTestRun(
        `Salesforce API Demo - ${new Date().toISOString()}`,
        testCaseIds
      );
      console.log(`📋 Created TestRail run: ${testRunId} with cases: ${testCaseIds}`);
    } catch (error) {
      console.log('⚠️ TestRail integration disabled:', error.message);
      testCaseIds = [24148, 24150];
    }
  });

  test.afterAll(async () => {
    if (testResults.length > 0) {
      try {
        const AutomatedTestRunner = require('../utils/testrail/automated-test-runner');
        const runner = new AutomatedTestRunner();
        
        const runId = await runner.executeTestRun(
          testResults,
          `Salesforce API Tests - ${new Date().toISOString()}`
        );
        
        console.log(`✅ Test execution completed in TestRail run: ${runId}`);
      } catch (error) {
        console.log('⚠️ Failed to execute TestRail run:', error.message);
      }
    }
  });

  test('Demo API Test 1: Salesforce Authentication Verification', async ({ request }) => {
    const startTime = Date.now();
    let status = 1, comment = '';
    
    try {
      const response = await request.get(`${instanceUrl}/services/data/v62.0/`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('sobjects');
      
      const testDetails = {
        test_case: 'Salesforce API Authentication Verification',
        steps: [
          '1. Send GET request to Salesforce API endpoint',
          '2. Include Bearer token in Authorization header',
          '3. Verify response status is 200',
          '4. Validate response contains sobjects property'
        ],
        expected_result: 'API returns 200 status with valid sobjects data',
        actual_result: `API returned ${data.sobjects.length} sobjects successfully`
      };
      
      comment = `✅ PASSED\n\nTest Case: ${testDetails.test_case}\n\nSteps Executed:\n${testDetails.steps.join('\n')}\n\nExpected: ${testDetails.expected_result}\nActual: ${testDetails.actual_result}\n\nAPI Objects Available: ${data.sobjects.length}`;
      console.log('✅ Demo API Test 1: Authentication verification passed');
      
    } catch (error) {
      status = 5;
      comment = `❌ FAILED\n\nTest Case: Salesforce API Authentication Verification\n\nError Details: ${error.message}\n\nSteps Attempted:\n1. Send GET request to Salesforce API endpoint\n2. Include Bearer token in Authorization header\n\nFailure Point: ${error.response?.status ? `HTTP ${error.response.status}` : 'Network/Connection Error'}`;
      console.log('❌ Demo API Test 1: Authentication verification failed');
      throw error;
    } finally {
      testResults.push({
        case_id: 24148,
        status_id: status,
        comment: comment
      });
    }
  });

  test('Demo API Test 2: Salesforce Record Count Verification', async ({ request }) => {
    const startTime = Date.now();
    let status = 1, comment = '';
    
    try {
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
      
      const testDetails = {
        test_case: 'Salesforce Record Count Verification',
        steps: [
          '1. Send GET request to recordCount API endpoint',
          '2. Request counts for Account, Contact, and Lead objects',
          '3. Verify response status is 200',
          '4. Validate response contains sObjects array with 3 items',
          '5. Extract count values for each object type'
        ],
        expected_result: 'API returns record counts for all 3 requested object types',
        actual_result: `Accounts: ${accountCount}, Contacts: ${contactCount}, Leads: ${leadCount}`
      };
      
      comment = `✅ PASSED\n\nTest Case: ${testDetails.test_case}\n\nSteps Executed:\n${testDetails.steps.join('\n')}\n\nExpected: ${testDetails.expected_result}\nActual: ${testDetails.actual_result}\n\nTotal Records: ${accountCount + contactCount + leadCount}`;
      console.log(`✅ Demo API Test 2: Record counts verified`);
      
    } catch (error) {
      status = 5;
      comment = `❌ FAILED\n\nTest Case: Salesforce Record Count Verification\n\nError Details: ${error.message}\n\nSteps Attempted:\n1. Send GET request to recordCount API endpoint\n2. Request counts for Account, Contact, and Lead objects\n\nFailure Point: ${error.response?.status ? `HTTP ${error.response.status}` : 'Network/Connection Error'}`;
      console.log('❌ Demo API Test 2: Record count verification failed');
      throw error;
    } finally {
      testResults.push({
        case_id: 24150,
        status_id: status,
        comment: comment
      });
    }
  });
});