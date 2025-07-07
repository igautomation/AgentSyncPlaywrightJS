/**
 * TestRail Demo - Complete Integration Test
 * Creates test run, executes tests, uploads results
 */
const { test, expect } = require('@playwright/test');
const { TestRailAPI } = require('../../utils/testrail');
const authManager = require('../../utils/salesforce/auth-manager');
require('dotenv').config({ path: '.env.unified' });

// Global variables
let accessToken, instanceUrl;
let testRailClient, testRunId;
const testResults = [];

// Test case definitions with real TestRail case IDs
const TEST_CASES = [
  { id: 24148, title: 'Salesforce API Authentication Test' },
  { id: 24149, title: 'Salesforce API Limits Test' },
  { id: 24150, title: 'Salesforce API Query Test' }
];

test.describe.configure({ mode: 'serial' });

// Authenticate once before all tests
test.beforeAll(async () => {
  console.log('🚀 Starting TestRail Integration Demo');
  
  // Single authentication call
  const auth = await authManager.authenticate();
  accessToken = auth.accessToken;
  instanceUrl = auth.instanceUrl;
  
  // Setup TestRail with real credentials
  try {
    testRailClient = new TestRailAPI();
    console.log('✅ TestRail client initialized');
    
    // Create test run with actual case IDs
    const testRun = await testRailClient.addRun(
      parseInt(process.env.TESTRAIL_PROJECT_ID),
      {
        name: `Salesforce API Demo - ${new Date().toISOString()}`,
        description: 'Automated test run with Salesforce API tests',
        case_ids: TEST_CASES.map(tc => tc.id),
        suite_id: parseInt(process.env.TESTRAIL_SUITE_ID)
      }
    );
    testRunId = testRun.id;
    console.log(`📋 Created TestRail run: ${testRunId}`);
    console.log(`🔗 View run: ${process.env.TESTRAIL_URL}/index.php?/runs/view/${testRunId}`);
    
  } catch (error) {
    console.log('❌ TestRail setup failed:', error.message);
    console.log('Error details:', error.response?.data || error);
    testRailClient = null;
  }
});

// Upload results after all tests
test.afterAll(async () => {
  if (testRailClient && testRunId && testResults.length > 0) {
    try {
      console.log(`📤 Uploading ${testResults.length} results to TestRail...`);
      
      // Upload results
      await testRailClient.addResultsForCases(testRunId, { results: testResults });
      console.log('✅ Results uploaded successfully');
      
      // Close test run
      await testRailClient.closeRun(testRunId);
      console.log(`🔒 Test run ${testRunId} closed`);
      console.log(`🔗 View results: ${process.env.TESTRAIL_URL}/index.php?/runs/view/${testRunId}`);
      
    } catch (error) {
      console.log('❌ Failed to upload results:', error.message);
      console.log('Error details:', error.response?.data || error);
    }
  }
});

test.describe('TestRail Integration Demo', () => {

  test('C24148: Salesforce API Authentication Test', async ({ request }) => {
    const startTime = Date.now();
    let status = 1; // Passed
    let comment = '';
    
    try {
      console.log('🧪 Running API Authentication Test...');
      
      const response = await request.get(`${instanceUrl}/services/data/v62.0/`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('sobjects');
      
      status = 1; // Passed
      comment = `API authentication successful. Found ${data.sobjects.length} sobjects.`;
      console.log(`✅ ${comment}`);
      
    } catch (error) {
      status = 5; // Failed
      comment = `Authentication test failed: ${error.message}`;
      console.log(`❌ ${comment}`);
      throw error;
    } finally {
      testResults.push({
        case_id: 24148,
        status_id: status,
        comment: comment
      });
    }
  });

  test('C24149: Salesforce API Limits Test', async ({ request }) => {
    const startTime = Date.now();
    let status = 1; // Passed
    let comment = '';
    
    try {
      console.log('🧪 Running API Limits Test...');
      
      const response = await request.get(`${instanceUrl}/services/data/v62.0/limits`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      expect(response.status()).toBe(200);
      const limits = await response.json();
      expect(limits.DailyApiRequests).toBeDefined();
      
      const remaining = limits.DailyApiRequests.Remaining;
      const max = limits.DailyApiRequests.Max;
      
      status = 1; // Passed
      comment = `API limits retrieved successfully. Daily API requests: ${remaining}/${max} remaining.`;
      console.log(`✅ ${comment}`);
      
    } catch (error) {
      status = 5; // Failed
      comment = `Limits test failed: ${error.message}`;
      console.log(`❌ ${comment}`);
      throw error;
    } finally {
      testResults.push({
        case_id: 24149,
        status_id: status,
        comment: comment
      });
    }
  });

  test('C24150: Salesforce API Query Test', async ({ request }) => {
    const startTime = Date.now();
    let status = 1; // Passed
    let comment = '';
    
    try {
      console.log('🧪 Running API Query Test...');
      
      const response = await request.get(
        `${instanceUrl}/services/data/v62.0/query?q=SELECT Id, Name FROM Account LIMIT 5`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('records');
      expect(data.records.length).toBeGreaterThan(0);
      
      status = 1; // Passed
      comment = `Query executed successfully. Retrieved ${data.records.length} account records.`;
      console.log(`✅ ${comment}`);
      
    } catch (error) {
      status = 5; // Failed
      comment = `Query test failed: ${error.message}`;
      console.log(`❌ ${comment}`);
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