/**
 * Salesforce Database Operations Test
 * 
 * Tests database operations like create, query, update, and delete
 * with TestRail integration
 */
const { test, expect } = require('@playwright/test');
const { TestRailAPI } = require('../../../utils/testrail');
const SalesforceDbUtils = require('../../../utils/salesforce/core/salesforceDbUtils');
const authManager = require('../../../utils/salesforce/auth-manager');
require('dotenv').config({ path: '.env.unified' });

// Global variables
let accessToken, instanceUrl;
let dbUtils;
let testRailClient, testRunId;
const testResults = [];

// Authenticate once before all tests
test.beforeAll(async () => {
  // Single authentication call
  const auth = await authManager.authenticate();
  accessToken = auth.accessToken;
  instanceUrl = auth.instanceUrl;
  
  // Initialize utilities
  dbUtils = new SalesforceDbUtils({ accessToken, instanceUrl });
  
  // Setup TestRail once
  try {
    testRailClient = new TestRailAPI();
    const testRun = await testRailClient.addRun(
      parseInt(process.env.TESTRAIL_PROJECT_ID),
      {
        name: `DB Operations Tests - ${new Date().toISOString()}`,
        case_ids: [24159], // Update with your actual TestRail case ID
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

test.describe('Salesforce Database Operations', () => {
  
  test('C24159: CRUD Operations Test', async () => {
    const startTime = Date.now();
    let status = 1; // Passed
    let comment = '';
    
    try {
      // Create test accounts
      const testAccounts = [
        { Name: 'Test Account 1', Phone: '555-1111', Description: 'Created by test automation' },
        { Name: 'Test Account 2', Phone: '555-2222', Description: 'Created by test automation' }
      ];
      
      // 1. CREATE - Bulk create accounts
      const createResults = await dbUtils.bulkCreate('Account', testAccounts);
      expect(createResults.length).toBe(2);
      expect(createResults[0].success).toBe(true);
      expect(createResults[1].success).toBe(true);
      
      const accountIds = createResults.map(r => r.id);
      console.log(`✅ Created ${accountIds.length} test accounts: ${accountIds.join(', ')}`);
      
      // 2. READ - Query the created accounts
      const queryResult = await dbUtils.query(
        `SELECT Id, Name, Phone, Description FROM Account WHERE Id IN ('${accountIds.join("','")}')`
      );
      
      expect(queryResult.records.length).toBe(2);
      console.log(`✅ Retrieved ${queryResult.records.length} accounts`);
      
      // 3. UPDATE - Update the accounts
      const updates = queryResult.records.map(record => ({
        Id: record.Id,
        Description: record.Description + ' - Updated'
      }));
      
      const updateResults = await dbUtils.bulkUpdate('Account', updates);
      expect(updateResults.length).toBe(2);
      expect(updateResults[0].success).toBe(true);
      expect(updateResults[1].success).toBe(true);
      console.log('✅ Updated test accounts successfully');
      
      // 4. DELETE - Clean up - delete the test accounts
      const deleteResults = await dbUtils.bulkDelete('Account', accountIds);
      expect(deleteResults.length).toBe(2);
      expect(deleteResults[0].success).toBe(true);
      expect(deleteResults[1].success).toBe(true);
      
      comment = `Successfully performed full CRUD lifecycle on test accounts: ${accountIds.join(', ')}`;
      console.log(`✅ ${comment}`);
      
    } catch (error) {
      status = 5; // Failed
      comment = `Test failed: ${error.message}`;
      console.log(`❌ ${comment}`);
      throw error;
    } finally {
      if (testRailClient) {
        testResults.push({
          case_id: 24159,
          status_id: status,
          comment: comment,
          elapsed: `${Math.round((Date.now() - startTime) / 1000)}s`
        });
      }
    }
  });
});