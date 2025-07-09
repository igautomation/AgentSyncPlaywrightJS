/**
 * Example Salesforce API test using the framework
 */
const { test, expect } = require('@playwright/test');
const { salesforceUtils } = require('@agentsync/playwright-framework');

test.describe('Salesforce API Example', () => {
  test('should authenticate and get API version info', async ({ request }) => {
    // Authenticate with Salesforce
    const auth = await salesforceUtils.authenticate();
    
    // Make API request
    const response = await request.get(`${auth.instanceUrl}/services/data/v59.0/`);
    
    // Verify response
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toBeInstanceOf(Array);
  });
});