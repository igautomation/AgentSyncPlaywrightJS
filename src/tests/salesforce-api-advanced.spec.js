/**
 * Advanced Salesforce API Tests with TestRail Integration
 * Error Handling, Bulk Operations, and Metadata API
 */
const { test, expect } = require('@playwright/test');
const TestRailUploader = require('../utils/testrail/testrail-uploader');
require('dotenv').config({ path: '.env.unified' });

let accessToken, instanceUrl;
let testRailUploader, testRunId, testCaseIds;
const testResults = [];

test.describe('Advanced Salesforce API Tests', () => {
  test.use({ ignoreHTTPSErrors: true });
  
  test.beforeAll(async () => {
    accessToken = process.env.SF_ACCESS_TOKEN;
    instanceUrl = process.env.SF_INSTANCE_URL;
    
    if (!accessToken || !instanceUrl) {
      throw new Error('SF_ACCESS_TOKEN and SF_INSTANCE_URL must be set');
    }
    
    try {
      testCaseIds = [24170, 24171];
      testRailUploader = new TestRailUploader();
      testRunId = await testRailUploader.createTestRun(
        `Salesforce Advanced API Tests - ${new Date().toISOString()}`,
        testCaseIds
      );
      console.log(`📋 Created TestRail run: ${testRunId}`);
    } catch (error) {
      console.log('⚠️ TestRail integration disabled:', error.message);
    }
  });

  test.afterAll(async () => {
    if (testRailUploader && testRunId && testResults.length > 0) {
      try {
        await testRailUploader.addResults(testRunId, testResults);
        await testRailUploader.closeRun(testRunId);
        console.log('✅ Results uploaded to TestRail');
      } catch (error) {
        console.log('⚠️ Failed to upload results:', error.message);
      }
    }
  });

  test('Advanced API Test 1: Bulk Query - Large Dataset', async ({ request }) => {
    let status = 1, comment = '';
    
    try {
      const query = "SELECT Id, Name, CreatedDate FROM Account ORDER BY CreatedDate DESC LIMIT 50";
      const response = await request.get(
        `${instanceUrl}/services/data/v62.0/query?q=${encodeURIComponent(query)}`,
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
      
      comment = `✅ PASSED - Bulk query executed successfully. Retrieved ${data.records.length} records out of ${data.totalSize} total. Done: ${data.done}`;
      console.log('✅ Bulk query test passed');
      
    } catch (error) {
      status = 5;
      comment = `❌ FAILED - Bulk query test failed: ${error.message}`;
      console.log('❌ Bulk query test failed');
      throw error;
    } finally {
      testResults.push({
        case_id: testCaseIds[0],
        status_id: status,
        comment: comment
      });
    }
  });

  test('Advanced API Test 2: Describe Multiple Objects', async ({ request }) => {
    let status = 1, comment = '';
    
    try {
      const objects = ['Account', 'Contact', 'Lead'];
      const results = [];
      
      for (const obj of objects) {
        const response = await request.get(
          `${instanceUrl}/services/data/v62.0/sobjects/${obj}/describe`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        expect(response.status()).toBe(200);
        const data = await response.json();
        results.push({ name: data.name, fields: data.fields.length });
      }
      
      comment = `✅ PASSED - Multiple objects described successfully. ${results.map(r => `${r.name}: ${r.fields} fields`).join(', ')}`;
      console.log('✅ Multiple objects describe test passed');
      
    } catch (error) {
      status = 5;
      comment = `❌ FAILED - Multiple objects describe test failed: ${error.message}`;
      console.log('❌ Multiple objects describe test failed');
      throw error;
    } finally {
      testResults.push({
        case_id: testCaseIds[1],
        status_id: status,
        comment: comment
      });
    }
  });
});