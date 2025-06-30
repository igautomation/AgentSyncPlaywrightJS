/**
 * Salesforce API Tests
 * 
 * Tests for Salesforce Platform APIs
 */
const { test, expect } = require('@playwright/test');

// Load environment variables from .env.salesforce
require('dotenv').config({ path: '.env.salesforce' });

test.describe('Salesforce API Tests', () => {
  let accessToken;
  let instanceUrl;
  
  test.beforeAll(async ({ request }) => {
    // Try to get token from environment first
    if (process.env.SF_ACCESS_TOKEN) {
      accessToken = process.env.SF_ACCESS_TOKEN;
      instanceUrl = process.env.SF_INSTANCE_URL;
      console.log('✅ Using token from environment');
      return;
    }
    
    // Generate new token via OAuth
    try {
      const { generateSalesforceOAuthToken } = require('../../scripts/generate-sf-token');
      const tokenData = await generateSalesforceOAuthToken();
      accessToken = tokenData.accessToken;
      instanceUrl = tokenData.instanceUrl;
      console.log('✅ Generated new access token via OAuth');
    } catch (error) {
      console.log('❌ Token generation error:', error.message);
    }
  });
  
  test('should get API limits', async () => {
    // Skip if no access token
    test.skip(!apiUtils.accessToken, 'No access token available');
    
    try {
      // Get API limits
      const limits = await apiUtils.getLimits();
      
      // Verify response
      expect(limits).toBeDefined();
      expect(limits.DailyApiRequests).toBeDefined();
      
      console.log('API Limits:', JSON.stringify(limits, null, 2));
    } catch (error) {
      console.error('Error getting API limits:', error.message);
      // Skip test if authentication fails
      test.skip(error.message.includes('INVALID_SESSION_ID'), 'Invalid session ID');
      throw error;
    }
  });
  
  test('should describe global objects', async () => {
    // Skip if no access token
    test.skip(!apiUtils.accessToken, 'No access token available');
    
    try {
      // Get global objects
      const globalObjects = await apiUtils.describeGlobal();
      
      // Verify response
      expect(globalObjects).toBeDefined();
      expect(globalObjects.sobjects).toBeInstanceOf(Array);
      
      // Log some object names
      const objectNames = globalObjects.sobjects.slice(0, 5).map(obj => obj.name);
      console.log('Sample Objects:', objectNames);
    } catch (error) {
      console.error('Error describing global objects:', error.message);
      // Skip test if authentication fails
      test.skip(error.message.includes('INVALID_SESSION_ID'), 'Invalid session ID');
      throw error;
    }
  });
  
  test('should describe Contact object', async () => {
    // Skip if no access token
    test.skip(!apiUtils.accessToken, 'No access token available');
    
    try {
      // Describe Contact object
      const contactObject = await apiUtils.describeObject('Contact');
      
      // Verify response
      expect(contactObject).toBeDefined();
      expect(contactObject.name).toBe('Contact');
      expect(contactObject.fields).toBeInstanceOf(Array);
      
      // Log some field names
      const fieldNames = contactObject.fields.slice(0, 5).map(field => field.name);
      console.log('Sample Contact Fields:', fieldNames);
    } catch (error) {
      console.error('Error describing Contact object:', error.message);
      // Skip test if authentication fails
      test.skip(error.message.includes('INVALID_SESSION_ID'), 'Invalid session ID');
      throw error;
    }
  });
  
  test('should get record counts for Account, Contact, Lead', async ({ request }) => {
    test.skip(!accessToken, 'No access token available');
    
    const response = await request.get(
      `${instanceUrl}/services/data/v62.0/limits/recordCount?sObjects=Account,Contact,Lead`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.sObjects).toBeInstanceOf(Array);
    expect(data.sObjects).toHaveLength(3);
    
    const objects = data.sObjects;
    const accountCount = objects.find(obj => obj.name === 'Account')?.count;
    const contactCount = objects.find(obj => obj.name === 'Contact')?.count;
    const leadCount = objects.find(obj => obj.name === 'Lead')?.count;
    
    expect(accountCount).toBeGreaterThanOrEqual(0);
    expect(contactCount).toBeGreaterThanOrEqual(0);
    expect(leadCount).toBeGreaterThanOrEqual(0);
    
    console.log(`✅ Record counts - Accounts: ${accountCount}, Contacts: ${contactCount}, Leads: ${leadCount}`);
  });
});