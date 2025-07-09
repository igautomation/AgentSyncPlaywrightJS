/**
 * Salesforce Apex Test
 * 
 * Tests Apex code execution capabilities
 */
const { test, expect } = require('@playwright/test');
const SalesforceApexUtils = require('../../../utils/salesforce/core/salesforceApexUtils');
const authManager = require('../../../utils/salesforce/auth-manager');
require('dotenv').config({ path: '.env.unified' });

// Global variables
let accessToken, instanceUrl;
let apexUtils;

// Authenticate once before all tests
test.beforeAll(async () => {
  // Single authentication call
  const auth = await authManager.authenticate();
  accessToken = auth.accessToken;
  instanceUrl = auth.instanceUrl;
  
  // Initialize utilities
  apexUtils = new SalesforceApexUtils({ accessToken, instanceUrl });
});

test.describe('Salesforce Apex Operations', () => {
  
  test('should execute anonymous Apex code', async () => {
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
      console.log('Debug log excerpt:');
      console.log(result.debugLog.substring(0, 500) + '...');
    }
    
    console.log('✅ Executed anonymous Apex code successfully');
  });
});