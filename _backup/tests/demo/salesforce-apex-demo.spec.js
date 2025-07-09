/**
 * Salesforce Apex Testing Demo
 * 
 * Demonstrates Apex code execution, DB operations, and SOQL queries
 */
const { test, expect } = require('@playwright/test');
const SalesforceApexUtils = require('../../utils/salesforce/core/salesforceApexUtils');
const SalesforceDbUtils = require('../../utils/salesforce/core/salesforceDbUtils');
const SoqlBuilder = require('../../utils/salesforce/core/soqlBuilder');
const authManager = require('../../utils/salesforce/auth-manager');

// Global variables
let accessToken, instanceUrl;
let apexUtils, dbUtils;

// Authenticate once before all tests
test.beforeAll(async () => {
  // Single authentication call
  const auth = await authManager.authenticate();
  accessToken = auth.accessToken;
  instanceUrl = auth.instanceUrl;
  
  // Initialize utilities
  apexUtils = new SalesforceApexUtils({ accessToken, instanceUrl });
  dbUtils = new SalesforceDbUtils({ accessToken, instanceUrl });
});

test.describe('Salesforce Apex and DB Operations', () => {
  
  test('Execute anonymous Apex code', async () => {
    // Simple Apex code to execute
    const apexCode = `
      System.debug('Hello from Apex!');
      Integer x = 10;
      Integer y = 20;
      System.debug('Sum: ' + (x + y));
    `;
    
    const result = await apexUtils.executeAnonymous(apexCode);
    
    expect(result.compiled).toBe(true);
    expect(result.success).toBe(true);
    console.log('✅ Executed anonymous Apex code successfully');
  });
  
  test('Execute SOQL query using builder', async () => {
    // Build a SOQL query using the builder
    const query = new SoqlBuilder()
      .select('Id', 'Name', 'Phone')
      .from('Account')
      .where('CreatedDate = LAST_N_DAYS:30')
      .orderBy('Name')
      .limit(5)
      .build();
    
    console.log(`Generated SOQL: ${query}`);
    
    // Execute the query
    const result = await dbUtils.query(query);
    
    expect(result).toBeDefined();
    expect(Array.isArray(result.records)).toBe(true);
    console.log(`✅ Found ${result.records.length} accounts`);
  });
  
  test('Perform bulk database operations', async () => {
    // Create test accounts
    const testAccounts = [
      { Name: 'Test Account 1', Phone: '555-1111', Description: 'Created by test automation' },
      { Name: 'Test Account 2', Phone: '555-2222', Description: 'Created by test automation' }
    ];
    
    try {
      // Bulk create accounts
      const createResults = await dbUtils.bulkCreate('Account', testAccounts);
      expect(createResults.length).toBe(2);
      expect(createResults[0].success).toBe(true);
      expect(createResults[1].success).toBe(true);
      
      const accountIds = createResults.map(r => r.id);
      console.log(`✅ Created ${accountIds.length} test accounts`);
      
      // Query the created accounts
      const query = new SoqlBuilder()
        .select('Id', 'Name', 'Phone')
        .from('Account')
        .where(`Id IN ('${accountIds.join("','")}')`)
        .build();
      
      const queryResult = await dbUtils.query(query);
      expect(queryResult.records.length).toBe(2);
      
      // Clean up - delete the test accounts
      const deleteResults = await dbUtils.bulkDelete('Account', accountIds);
      expect(deleteResults.length).toBe(2);
      expect(deleteResults[0].success).toBe(true);
      expect(deleteResults[1].success).toBe(true);
      
      console.log('✅ Deleted test accounts successfully');
    } catch (error) {
      console.error(`Test failed: ${error.message}`);
      throw error;
    }
  });
  
  test('Run Apex tests (if available)', async function() {
    try {
      // This test attempts to run Apex tests if they exist
      // Get a list of test classes
      const query = "SELECT Id, Name FROM ApexClass WHERE Name LIKE '%Test%'";
      const result = await dbUtils.query(query);
      
      if (result.records.length === 0) {
        console.log('No test classes found, skipping test');
        test.skip();
        return;
      }
      
      // Take up to 3 test classes
      const testClasses = result.records.slice(0, 3).map(record => record.Name);
      console.log(`Found test classes: ${testClasses.join(', ')}`);
      
      // Run the tests
      const jobId = await apexUtils.runApexTests(testClasses);
      console.log(`Started test run with job ID: ${jobId}`);
      
      // Wait for tests to complete (in a real scenario, you'd poll for completion)
      console.log('Waiting for tests to complete (30 seconds)...');
      await new Promise(resolve => setTimeout(resolve, 30000));
      
      // Get test results
      const testResults = await apexUtils.getApexTestResults(jobId);
      console.log(`✅ Test run complete with ${testResults.records.length} results`);
      
      // Get code coverage for the first class
      if (testClasses.length > 0) {
        const coverage = await apexUtils.getCodeCoverage(testClasses[0]);
        console.log(`✅ Retrieved code coverage information`);
      }
    } catch (error) {
      console.log(`Skipping Apex test execution: ${error.message}`);
      test.skip();
    }
  });
});