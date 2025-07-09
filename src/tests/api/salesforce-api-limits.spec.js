/**
 * Salesforce API Limits Test
 * 
 * Tests the Salesforce API limits endpoint to verify API access and quota information
 * with TestRail integration
 */
const { test, expect } = require('@playwright/test');
const { TestRailAPI } = require('../../../utils/testrail');
const authManager = require('../../../utils/salesforce/auth-manager');
require('dotenv').config({ path: '.env.unified' });

// Global variables
let accessToken, instanceUrl;
let testRailClient, testRunId;
const testResults = [];

// Authenticate once before all tests
test.beforeAll(async () => {
  // Single authentication call
  const auth = await authManager.authenticate();
  accessToken = auth.accessToken;
  instanceUrl = auth.instanceUrl;
  
  // Setup TestRail once
  try {
    testRailClient = new TestRailAPI();
    const testRun = await testRailClient.addRun(
      parseInt(process.env.TESTRAIL_PROJECT_ID),
      {
        name: `API Limits Tests - ${new Date().toISOString()}`,
        case_ids: [24151, 24152], // Update with your actual TestRail case IDs
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

test.describe('Salesforce API Limits', () => {
  
  test('C24151: API Limits Test', async ({ request }) => {
    const startTime = Date.now();
    let status = 1; // Passed
    let comment = '';
    
    try {
      const response = await request.get(
        `${instanceUrl}/services/data/v${process.env.SF_API_VERSION}/limits`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      expect(response.status()).toBe(200);
      const limits = await response.json();
      expect(limits.DailyApiRequests).toBeDefined();
      
      comment = `API limits retrieved - Daily API Requests: ${limits.DailyApiRequests.Max} max, ${limits.DailyApiRequests.Remaining} remaining`;
      console.log(`✅ ${comment}`);
      
    } catch (error) {
      status = 5; // Failed
      comment = `Test failed: ${error.message}`;
      console.log(`❌ ${comment}`);
      throw error;
    } finally {
      if (testRailClient) {
        testResults.push({
          case_id: 24151,
          status_id: status,
          comment: comment,
          elapsed: `${Math.round((Date.now() - startTime) / 1000)}s`
        });
      }
    }
  });

  test('C24152: Record Count Test', async ({ request }) => {
    const startTime = Date.now();
    let status = 1; // Passed
    let comment = '';
    
    try {
      const response = await request.get(
        `${instanceUrl}/services/data/v${process.env.SF_API_VERSION}/limits/recordCount?sObjects=Account,Contact,Lead`,
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
      
      // Build comment with record counts
      const counts = data.sObjects.map(obj => `${obj.name}: ${obj.count}`).join(', ');
      comment = `Record counts retrieved - ${counts}`;
      console.log(`✅ ${comment}`);
      
    } catch (error) {
      status = 5; // Failed
      comment = `Test failed: ${error.message}`;
      console.log(`❌ ${comment}`);
      throw error;
    } finally {
      if (testRailClient) {
        testResults.push({
          case_id: 24152,
          status_id: status,
          comment: comment,
          elapsed: `${Math.round((Date.now() - startTime) / 1000)}s`
        });
      }
    }
  });
});