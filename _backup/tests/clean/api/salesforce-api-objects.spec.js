/**
 * Salesforce API Objects Test
 * 
 * Tests the Salesforce API object endpoints to verify object metadata access
 */
const { test, expect } = require('@playwright/test');
const authManager = require('../../../utils/salesforce/auth-manager');
require('dotenv').config({ path: '.env.unified' });

// Global variables
let accessToken, instanceUrl;

// Authenticate once before all tests
test.beforeAll(async () => {
  // Single authentication call
  const auth = await authManager.authenticate();
  accessToken = auth.accessToken;
  instanceUrl = auth.instanceUrl;
});

test.describe('Salesforce API Objects', () => {
  
  test('should retrieve global object list', async ({ request }) => {
    const response = await request.get(
      `${instanceUrl}/services/data/v${process.env.SF_API_VERSION}/sobjects`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.sobjects).toBeInstanceOf(Array);
    
    // Log a few object names
    const objectNames = data.sobjects.slice(0, 5).map(obj => obj.name);
    console.log(`✅ Global objects retrieved: ${objectNames.join(', ')}`);
  });

  test('should describe Contact object metadata', async ({ request }) => {
    const response = await request.get(
      `${instanceUrl}/services/data/v${process.env.SF_API_VERSION}/sobjects/Contact/describe`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.name).toBe('Contact');
    expect(data.fields).toBeInstanceOf(Array);
    
    // Log some field information
    const requiredFields = data.fields.filter(field => field.nillable === false);
    console.log(`✅ Contact object described - ${data.fields.length} total fields, ${requiredFields.length} required fields`);
    
    // Verify some standard fields exist
    const standardFields = ['Id', 'FirstName', 'LastName', 'Email', 'Phone'];
    standardFields.forEach(fieldName => {
      const field = data.fields.find(f => f.name === fieldName);
      expect(field).toBeDefined();
    });
  });
});