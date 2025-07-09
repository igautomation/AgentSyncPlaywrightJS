/**
 * Clean Salesforce API Tests with OAuth & TestRail
 */
const { test, expect } = require('@playwright/test');
const { TestRailAPI } = require('../../utils/testrail');
const authManager = require('../../utils/salesforce/auth-manager');
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
        name: `Clean Salesforce API Tests - ${new Date().toISOString()}`,
        case_ids: [24151, 24152, 24153, 24154],
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

test.describe.configure({ mode: 'serial' });

test.describe('Clean Salesforce API Tests with OAuth', () => {

  
  test('C24151: API Limits Test', async ({ request }) => {
    const startTime = Date.now();
    let status = 1;
    let comment = '';
    
    try {
      const response = await request.get(
        `${instanceUrl}/services/data/v62.0/limits`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.status() === 401) {
        comment = 'Token expired, test skipped';
        console.log('⚠️ Token expired, skipping test');
        test.skip();
      }
      
      expect(response.status()).toBe(200);
      const limits = await response.json();
      expect(limits.DailyApiRequests).toBeDefined();
      
      comment = 'API limits retrieved successfully';
      console.log('✅ API limits retrieved successfully');
      
    } catch (error) {
      status = 5;
      comment = `Test failed: ${error.message}`;
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

  test('should get record counts', async ({ request }) => {
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
      console.log('⚠️ Token expired, skipping test');
      test.skip();
    }
    
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.sObjects).toBeInstanceOf(Array);
    
    const accountCount = data.sObjects.find(obj => obj.name === 'Account')?.count;
    console.log(`✅ Record counts retrieved - Accounts: ${accountCount}`);
  });

  test('should describe global objects', async ({ request }) => {
    const response = await request.get(
      `${process.env.SF_INSTANCE_URL}/services/data/v62.0/sobjects`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.SF_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (response.status() === 401) {
      console.log('⚠️ Token expired, skipping test');
      test.skip();
    }
    
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.sobjects).toBeInstanceOf(Array);
    
    const objectNames = data.sobjects.slice(0, 3).map(obj => obj.name);
    console.log(`✅ Global objects retrieved: ${objectNames.join(', ')}`);
  });

  test('should describe Contact object', async ({ request }) => {
    const response = await request.get(
      `${process.env.SF_INSTANCE_URL}/services/data/v62.0/sobjects/Contact/describe`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.SF_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (response.status() === 401) {
      console.log('⚠️ Token expired, skipping test');
      test.skip();
    }
    
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.name).toBe('Contact');
    expect(data.fields).toBeInstanceOf(Array);
    
    console.log(`✅ Contact object described - ${data.fields.length} fields`);
  });
});