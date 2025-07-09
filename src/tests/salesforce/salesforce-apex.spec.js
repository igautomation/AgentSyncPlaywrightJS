/**
 * Salesforce Apex Test
 * 
 * Tests Apex code execution capabilities
 * with TestRail integration
 */
const { test, expect } = require('@playwright/test');
const { TestRailAPI } = require('../../utils/testrail');
const SalesforceApexUtils = require('../../utils/salesforce/core/salesforceApexUtils');
const authManager = require('../../utils/salesforce/auth-manager');
require('dotenv').config({ path: '.env.unified' });

// Global variables
let accessToken, instanceUrl;
let apexUtils;
let testRailClient, testRunId;
const testResults = [];

// Authenticate once before all tests
test.beforeAll(async () => {
  // Single authentication call
  const auth = await authManager.authenticate();
  accessToken = auth.accessToken;
  instanceUrl = auth.instanceUrl;
  
  // Initialize utilities
  apexUtils = new SalesforceApexUtils({ accessToken, instanceUrl });
  
  // Setup TestRail once
  try {
    testRailClient = new TestRailAPI();
    const testRun = await testRailClient.addRun(
      parseInt(process.env.TESTRAIL_PROJECT_ID),
      {
        name: `Apex Tests - ${new Date().toISOString()}`,
        case_ids: [27702], // APEX Test
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

test.describe('Salesforce Apex Operations', () => {
  
  test('C27702: Execute Anonymous Apex Test', async () => {
    const startTime = Date.now();
    let status = 1; // Passed
    let comment = '';
    
    try {
      // Simple Apex code to execute
      const apexCode = `
        System.debug('Hello from Apex!');
        Integer x = 10;
        Integer y = 20;
        System.debug('Sum: ' + (x + y));
        
        // Query some data
        List<Account> accounts = [SELECT Id, Name FROM Account LIMIT 5];
        System.debug('Found ' + accounts.size() + ' accounts');
        for(Account acc : accounts) {
          System.debug('Account: ' + acc.Name);
        }
      `;
      
      const result = await apexUtils.executeAnonymous(apexCode);
      
      expect(result.compiled).toBe(true);
      expect(result.success).toBe(true);
      
      // Log debug output if available
      if (result.debugLog) {
        const logExcerpt = result.debugLog.substring(0, 200) + '...';
        comment = `Executed anonymous Apex code successfully. Debug log: ${logExcerpt}`;
      } else {
        comment = 'Executed anonymous Apex code successfully';
      }
      
      console.log(`✅ ${comment}`);
      
    } catch (error) {
      status = 5; // Failed
      comment = `Test failed: ${error.message}`;
      console.log(`❌ ${comment}`);
      throw error;
    } finally {
      if (testRailClient) {
        testResults.push({
          case_id: 27702,
          status_id: status,
          comment: comment,
          elapsed: `${Math.round((Date.now() - startTime) / 1000)}s`
        });
      }
    }
  });
});