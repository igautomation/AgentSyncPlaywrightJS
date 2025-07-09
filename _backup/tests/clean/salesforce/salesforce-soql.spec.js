/**
 * Salesforce SOQL Query Test
 * 
 * Tests SOQL query capabilities using the SoqlBuilder utility
 */
const { test, expect } = require('@playwright/test');
const SalesforceDbUtils = require('../../../utils/salesforce/core/salesforceDbUtils');
const SoqlBuilder = require('../../../utils/salesforce/core/soqlBuilder');
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

test.describe('Salesforce SOQL Operations', () => {
  
  test('should build and execute SOQL queries using SoqlBuilder', async () => {
    // Build a simple SOQL query using the builder
    const query1 = new SoqlBuilder()
      .select('Id', 'Name', 'Phone')
      .from('Account')
      .where('CreatedDate = LAST_N_DAYS:30')
      .orderBy('Name')
      .limit(5)
      .build();
    
    console.log(`Generated SOQL: ${query1}`);
    
    // Execute the query
    const result1 = await dbUtils.query(query1);
    
    expect(result1).toBeDefined();
    expect(Array.isArray(result1.records)).toBe(true);
    console.log(`✅ Found ${result1.records.length} accounts with simple query`);
    
    // Build a more complex SOQL query with relationship fields
    const query2 = new SoqlBuilder()
      .select('Id', 'Name', 'Phone', 'Owner.Name', 'Owner.Email')
      .from('Account')
      .where('CreatedDate = LAST_N_DAYS:30')
      .andWhere('Name != null')
      .orderBy('CreatedDate', 'DESC')
      .limit(5)
      .build();
    
    console.log(`Generated complex SOQL: ${query2}`);
    
    // Execute the complex query
    const result2 = await dbUtils.query(query2);
    
    expect(result2).toBeDefined();
    expect(Array.isArray(result2.records)).toBe(true);
    console.log(`✅ Found ${result2.records.length} accounts with complex query`);
    
    // Build a query with subquery
    const query3 = new SoqlBuilder()
      .select('Id', 'Name', '(SELECT Id, FirstName, LastName FROM Contacts)')
      .from('Account')
      .limit(3)
      .build();
    
    console.log(`Generated SOQL with subquery: ${query3}`);
    
    // Execute the query with subquery
    const result3 = await dbUtils.query(query3);
    
    expect(result3).toBeDefined();
    expect(Array.isArray(result3.records)).toBe(true);
    console.log(`✅ Found ${result3.records.length} accounts with related contacts`);
    
    // Log some results
    if (result3.records.length > 0) {
      const firstAccount = result3.records[0];
      const contactCount = firstAccount.Contacts ? firstAccount.Contacts.records.length : 0;
      console.log(`Account "${firstAccount.Name}" has ${contactCount} contacts`);
    }
  });
});