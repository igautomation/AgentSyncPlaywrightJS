/**
 * Salesforce API Tests with TestRail Integration, OAuth & Token Fallback
 */
const { test, expect } = require('@playwright/test');
const { TestRailAPI } = require('../../utils/testrail');
const SalesforceOAuthClient = require('../../utils/salesforce/oauth-client');
require('dotenv').config({ path: '.env.unified' });

// Global authentication - authenticate once, use everywhere
let accessToken, instanceUrl;
let testRailClient, testRunId;
const testResults = [];

// Authenticate once before all tests
test.beforeAll(async () => {
  // Try OAuth first, fallback to token
  const oauthClient = new SalesforceOAuthClient();
  const oauthResult = await oauthClient.getAccessToken();
  
  if (oauthResult.success) {
    accessToken = oauthResult.access_token;
    instanceUrl = oauthResult.instance_url;
    console.log('✅ OAuth authentication successful - token will be reused');
  } else {
    console.log('⚠️ OAuth failed, using fallback token');
    accessToken = process.env.SF_ACCESS_TOKEN;
    instanceUrl = process.env.SF_INSTANCE_URL;
  }
  
  if (!accessToken || !instanceUrl) {
    throw new Error('No valid authentication method available');
  }
  
  // Setup TestRail once
  try {
    testRailClient = new TestRailAPI();
    const testRun = await testRailClient.addRun(
      parseInt(process.env.TESTRAIL_PROJECT_ID),
      {
        name: `Salesforce API Tests - ${new Date().toISOString()}`,
        case_ids: [24148, 24149, 24150],
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

test.describe('Salesforce API Tests with OAuth & TestRail', () => {

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

  test('C1: Salesforce API Authentication Test', async ({ request }) => {
    const startTime = Date.now();
    let status = 1; // Passed
    let comment = '';
    
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
      
      comment = 'API authentication successful';
      console.log('✅ API authentication test passed');
      
    } catch (error) {
      status = 5; // Failed
      comment = `Test failed: ${error.message}`;
      console.log('❌ API authentication test failed');
      throw error;
    } finally {
      if (testRailClient) {
        testResults.push({
          case_id: 24148,
          status_id: status,
          comment: comment,
          elapsed: `${Math.round((Date.now() - startTime) / 1000)}s`
        });
      }
    }
  });

  test('C2: Salesforce API Record Count Test', async ({ request }) => {
    const startTime = Date.now();
    let status = 1; // Passed
    let comment = '';
    
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
      
      comment = `Record counts - Accounts: ${accountCount}, Contacts: ${contactCount}, Leads: ${leadCount}`;
      console.log(`✅ ${comment}`);
      
    } catch (error) {
      status = 5; // Failed
      comment = `Test failed: ${error.message}`;
      console.log('❌ Record count test failed');
      throw error;
    } finally {
      if (testRailClient) {
        testResults.push({
          case_id: 24149,
          status_id: status,
          comment: comment,
          elapsed: `${Math.round((Date.now() - startTime) / 1000)}s`
        });
      }
    }
  });

  test('C3: Salesforce API Query Test', async ({ request }) => {
    const startTime = Date.now();
    let status = 1; // Passed
    let comment = '';
    
    try {
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
      
      comment = `Query successful - Retrieved ${data.records.length} accounts`;
      console.log(`✅ ${comment}`);
      
    } catch (error) {
      status = 5; // Failed
      comment = `Test failed: ${error.message}`;
      console.log('❌ Query test failed');
      throw error;
    } finally {
      if (testRailClient) {
        testResults.push({
          case_id: 24150,
          status_id: status,
          comment: comment,
          elapsed: `${Math.round((Date.now() - startTime) / 1000)}s`
        });
      }
    }
  });
});