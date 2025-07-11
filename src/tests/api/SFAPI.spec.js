const { test, expect } = require('@playwright/test');
const authManager = require('../../utils/salesforce/auth-manager');
const SalesforceApiUtils = require('../../utils/salesforce/core/salesforceApiUtils');
const SoqlBuilder = require('../../utils/salesforce/core/soqlBuilder');
const TestRailAPI = require('../../utils/testrail/core/testrail-api-simple');
const { DataGenerator } = require('../../utils/data');
const logger = require('../../utils/common/core/logger');

const API_VERSION = '62.0';
const TEST_CASE_ID = 'C24001';

let sfApi;
let createdRecords = [];
let testRail;
let testRunId;

test.beforeAll(async () => {
  const auth = await authManager.authenticate();
  sfApi = new SalesforceApiUtils({
    instanceUrl: auth.instanceUrl,
    accessToken: auth.accessToken,
    apiVersion: `v${API_VERSION}`
  });
  
  if (process.env.TESTRAIL_URL) {
    testRail = new TestRailAPI();
    const run = await testRail.addRun(process.env.TESTRAIL_PROJECT_ID, {
      name: `Salesforce API Tests - ${new Date().toISOString()}`,
      case_ids: [parseInt(TEST_CASE_ID.replace('C', ''))]
    });
    testRunId = run.id;
  }
});

test.afterEach(async ({ context }) => {
  if (context) {
    await context.close();
  }
});

test.afterAll(async ({ browser }) => {
  // Cleanup created records
  for (const record of createdRecords.reverse()) {
    try {
      await sfApi.deleteRecord(record.type, record.id);
    } catch (error) {
      console.warn(`Failed to cleanup ${record.type} ${record.id}:`, error.message);
    }
  }
  
  if (testRail && testRunId) {
    await testRail.closeRun(testRunId);
  }
  
  if (browser) {
    await browser.close();
  }
});

test(`${TEST_CASE_ID}: Salesforce Create Account and Create Contact`, async ({ }, testInfo) => {
  let testPassed = false;
  let accountId, contactId;
  
  try {
    // Step 1: Create Account using framework data generator
    const dataGenerator = new DataGenerator();
    const accountData = dataGenerator.generateSalesforceAccount();
    
    const accountResult = await sfApi.createRecord('Account', accountData);
    expect(accountResult).toHaveProperty('id');
    expect(accountResult.success).toBe(true);
    
    accountId = accountResult.id;
    createdRecords.push({ type: 'Account', id: accountId });
    
    // Step 2: Create Contact using framework data generator
    const contactData = dataGenerator.generateSalesforceContact(accountId);
    
    const contactResult = await sfApi.createRecord('Contact', contactData);
    expect(contactResult).toHaveProperty('id');
    expect(contactResult.success).toBe(true);
    
    contactId = contactResult.id;
    createdRecords.push({ type: 'Contact', id: contactId });
    
    // Verify the relationship using SOQL builder
    const query = new SoqlBuilder()
      .select('Id', 'AccountId')
      .from('Contact')
      .where(`Id = '${contactId}'`)
      .build();
    
    const contact = await sfApi.query(query);
    expect(contact.records[0].AccountId).toBe(accountId);
    
    logger.info(`Test completed successfully - Account: ${accountId}, Contact: ${contactId}`);
    
    testPassed = true;
  } finally {
    if (testRail && testRunId) {
      await testRail.addResultsForCases(testRunId, {
        results: [{
          case_id: parseInt(TEST_CASE_ID.replace('C', '')),
          status_id: testPassed ? 1 : 5,
          comment: testPassed 
            ? `Test passed. Created Account: ${accountId}, Contact: ${contactId}` 
            : `Test failed: ${testInfo.error?.message || 'Unknown error'}`
        }]
      });
    }
  }
});
