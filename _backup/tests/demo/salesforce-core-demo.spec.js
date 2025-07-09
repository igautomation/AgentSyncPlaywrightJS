/**
 * Salesforce Core Utilities Demo Test
 */
const { test, expect } = require('@playwright/test');
const { SalesforceCore } = require('../../utils/salesforce');
require('dotenv').config({ path: '.env.unified' });

test.describe('Salesforce Core Demo', () => {
  let sf;

  test.beforeEach(() => {
    sf = new SalesforceCore();
  });

  test('Demo: Core authentication', async () => {
    const token = await sf.getAccessToken();
    expect(token).toBeTruthy();
    
    const instanceUrl = await sf.getInstanceUrl();
    expect(instanceUrl).toContain('salesforce.com');
    
    console.log('✅ Core authentication working');
    console.log(`Instance URL: ${instanceUrl}`);
  });

  test('Demo: Query operations', async () => {
    // Query with records
    const accounts = await sf.queryRecords('SELECT Id, Name FROM Account LIMIT 5');
    expect(Array.isArray(accounts)).toBeTruthy();
    
    // Query count
    const count = await sf.queryCount('SELECT COUNT() FROM Account');
    expect(typeof count).toBe('number');
    
    console.log('✅ Query operations working');
    console.log(`Found ${accounts.length} accounts, total: ${count}`);
  });

  test('Demo: API call using core', async ({ request }) => {
    const headers = await sf.getAuthHeaders();
    const instanceUrl = await sf.getInstanceUrl();
    
    const response = await request.get(`${instanceUrl}/services/data/v62.0/`, {
      headers
    });
    
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('sobjects');
    
    console.log('✅ API call using core utilities successful');
    console.log(`Available sobjects: ${data.sobjects.length}`);
  });

  test('Demo: CRUD operations', async () => {
    // Create test account
    const accountData = {
      Name: `Test Account ${Date.now()}`,
      Type: 'Customer'
    };
    
    const createResult = await sf.createRecord('Account', accountData);
    expect(createResult.success).toBeTruthy();
    expect(createResult.id).toBeTruthy();
    
    const accountId = createResult.id;
    console.log('✅ Account created:', accountId);
    
    // Update account
    const updateData = { Description: 'Updated via Core utilities' };
    const updateResult = await sf.updateRecord('Account', accountId, updateData);
    expect(updateResult.success).toBeTruthy();
    
    console.log('✅ Account updated');
    
    // Clean up
    const deleteResult = await sf.deleteRecord('Account', accountId);
    expect(deleteResult.success).toBeTruthy();
    
    console.log('✅ Account deleted');
  });

  test('Demo: Cleanup test data', async () => {
    // Create test record
    const testAccount = await sf.createRecord('Account', {
      Name: 'CLEANUP_TEST_ACCOUNT',
      Type: 'Customer'
    });
    
    expect(testAccount.success).toBeTruthy();
    console.log('✅ Test account created for cleanup demo');
    
    // Cleanup using utility method
    const cleanupResult = await sf.cleanupTestData('Account', 'Name', 'CLEANUP_TEST_ACCOUNT');
    expect(cleanupResult.success).toBeTruthy();
    
    console.log('✅ Test data cleanup successful');
  });
});