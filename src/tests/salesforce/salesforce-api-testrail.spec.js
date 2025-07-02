/**
 * Salesforce API Tests with TestRail Integration
 */
const { test, expect } = require('@playwright/test');
const TestRailUploader = require('../../utils/testrail/testrail-uploader');
require('dotenv').config({ path: '.env.salesforce' });

let accessToken, instanceUrl;
let testRailUploader, testRunId;
const testResults = [];

test.describe('Salesforce API Tests with TestRail', () => {
  
  test.beforeAll(async () => {
    // Setup API credentials
    accessToken = process.env.SF_ACCESS_TOKEN;
    instanceUrl = process.env.SF_INSTANCE_URL;
    
    if (!accessToken || !instanceUrl) {
      throw new Error('SF_ACCESS_TOKEN and SF_INSTANCE_URL must be set');
    }
    
    // Setup TestRail
    testRailUploader = new TestRailUploader();
    testRunId = await testRailUploader.createTestRun(
      `Salesforce API Tests - ${new Date().toISOString()}`,
      [1, 2, 3] // Test case IDs
    );
    console.log(`📋 Created TestRail run: ${testRunId}`);
  });

  test.afterAll(async () => {
    if (testRailUploader && testRunId && testResults.length > 0) {
      await testRailUploader.addResults(testRunId, testResults);
      await testRailUploader.closeRun(testRunId);
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
      testResults.push({
        case_id: 1,
        status_id: status,
        comment: comment,
        elapsed: `${Math.round((Date.now() - startTime) / 1000)}s`
      });
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
      testResults.push({
        case_id: 2,
        status_id: status,
        comment: comment,
        elapsed: `${Math.round((Date.now() - startTime) / 1000)}s`
      });
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
      testResults.push({
        case_id: 3,
        status_id: status,
        comment: comment,
        elapsed: `${Math.round((Date.now() - startTime) / 1000)}s`
      });
    }
  });
});