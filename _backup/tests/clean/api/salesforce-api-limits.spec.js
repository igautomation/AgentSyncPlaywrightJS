/**
 * Salesforce API Limits Test
 * 
 * Tests the Salesforce API limits endpoint to verify API access and quota information
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

test.describe('Salesforce API Limits', () => {
  
  test('should retrieve API limits information', async ({ request }) => {
    const response = await request.get(
      `${instanceUrl}/services/data/v${process.env.SF_API_VERSION}/limits`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    expect(response.status()).toBe(200);
    const limits = await response.json();
    expect(limits.DailyApiRequests).toBeDefined();
    
    console.log(`✅ API limits retrieved - Daily API Requests: ${limits.DailyApiRequests.Max} max, ${limits.DailyApiRequests.Remaining} remaining`);
  });

  test('should get record counts for standard objects', async ({ request }) => {
    const response = await request.get(
      `${instanceUrl}/services/data/v${process.env.SF_API_VERSION}/limits/recordCount?sObjects=Account,Contact,Lead`,
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
    
    // Log the record counts for each object
    data.sObjects.forEach(obj => {
      console.log(`✅ ${obj.name}: ${obj.count} records`);
    });
  });
});