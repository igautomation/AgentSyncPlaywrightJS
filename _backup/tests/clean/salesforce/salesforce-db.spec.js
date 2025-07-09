/**
 * Salesforce Database Operations Test
 * 
 * Tests database operations like create, query, update, and delete
 */
const { test, expect } = require('@playwright/test');
const SalesforceDbUtils = require('../../../utils/salesforce/core/salesforceDbUtils');
const authManager = require('../../../utils/salesforce/auth-manager');
require('dotenv').config({ path: '.env.unified' });

// Global variables
let accessToken, instanceUrl;
let dbUtils;

// Authenticate once before all tests
test.beforeAll(async () => {
  // Single authentication call
  const auth = await authManager.authenticate();
  accessToken = auth.accessToken;
  instanceUrl = auth.instanceUrl;
  
  // Initialize utilities
  dbUtils = new SalesforceDbUtils({ accessToken, instanceUrl });
});

test.describe('Salesforce Database Operations', () => {
  
  test('should perform full CRUD lifecycle on test accounts', async () => {
    // Create test accounts
    const testAccounts = [
      { Name: 'Test Account 1', Phone: '555-1111', Description: 'Created by test automation' },
      { Name: 'Test Account 2', Phone: '555-2222', Description: 'Created by test automation' }
    ];
    
    try {
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
      
      console.log('✅ Deleted test accounts successfully');
    } catch (error) {
      console.error(`Test failed: ${error.message}`);
      throw error;
    }
  });
});