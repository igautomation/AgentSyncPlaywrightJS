/**
 * Extended Salesforce API Tests with TestRail Integration
 * Comprehensive API Test Coverage
 */
const { test, expect } = require('@playwright/test');
const TestRailUploader = require('../utils/testrail/testrail-uploader');
const TestCaseFetcher = require('../utils/testrail/test-case-fetcher');
require('dotenv').config({ path: '.env.unified' });

let accessToken, instanceUrl;
let testRailUploader, testRunId, testCaseIds;
const testResults = [];
let createdRecordId = null;

test.describe('Extended Salesforce API Tests', () => {
  test.use({ ignoreHTTPSErrors: true });
  
  test.beforeAll(async () => {
    accessToken = process.env.SF_ACCESS_TOKEN;
    instanceUrl = process.env.SF_INSTANCE_URL;
    
    if (!accessToken || !instanceUrl) {
      throw new Error('SF_ACCESS_TOKEN and SF_INSTANCE_URL must be set');
    }
    
    try {
      const fetcher = new TestCaseFetcher();
      const allCases = await fetcher.getTestCases();
      testCaseIds = allCases.length >= 2 ? allCases.slice(0, 2).map(c => c.id) : [24160, 24161];
      
      testRailUploader = new TestRailUploader();
      testRunId = await testRailUploader.createTestRun(
        `Salesforce Extended API Tests - ${new Date().toISOString()}`,
        testCaseIds
      );
      console.log(`📋 Created TestRail run: ${testRunId}`);
    } catch (error) {
      console.log('⚠️ TestRail integration disabled:', error.message);
      testCaseIds = [24160, 24161, 24162, 24163, 24164, 24165];
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

  test('API Test 1: SOQL Query - Account Records', async ({ request }) => {
    let status = 1, comment = '';
    
    try {
      const query = "SELECT Id, Name, Type, Industry FROM Account LIMIT 5";
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
      expect(data.records).toBeInstanceOf(Array);
      
      comment = `✅ PASSED - SOQL Query executed successfully. Retrieved ${data.records.length} Account records. Total size: ${data.totalSize}`;
      console.log('✅ SOQL Query test passed');
      
    } catch (error) {
      status = 5;
      comment = `❌ FAILED - SOQL Query failed: ${error.message}`;
      console.log('❌ SOQL Query test failed');
      throw error;
    } finally {
      testResults.push({
        case_id: testCaseIds[0],
        status_id: status,
        comment: comment
      });
    }
  });

  test('API Test 2: Metadata API - Describe Account Object', async ({ request }) => {
    let status = 1, comment = '';
    
    try {
      const response = await request.get(
        `${instanceUrl}/services/data/v62.0/sobjects/Account/describe`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('fields');
      expect(data).toHaveProperty('name');
      expect(data.name).toBe('Account');
      
      comment = `✅ PASSED - Metadata retrieved successfully. Account object has ${data.fields.length} fields. Createable: ${data.createable}, Updateable: ${data.updateable}`;
      console.log('✅ Metadata API test passed');
      
    } catch (error) {
      status = 5;
      comment = `❌ FAILED - Metadata API test failed: ${error.message}`;
      console.log('❌ Metadata API test failed');
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