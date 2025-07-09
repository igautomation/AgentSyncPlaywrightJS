/**
 * Salesforce Authentication Demo Test
 */
const { test, expect } = require('@playwright/test');
const { SalesforceAuthUtils, SalesforceUtils } = require('../../utils/salesforce');
require('dotenv').config({ path: '.env.unified' });

test.describe('Salesforce Authentication Demo', () => {
  let authUtils;
  let salesforceUtils;

  test.beforeEach(() => {
    authUtils = new SalesforceAuthUtils();
    salesforceUtils = new SalesforceUtils({});
  });

  test('Demo: Generate OAuth2 access token', async () => {
    const tokenData = await authUtils.generateAccessToken();
    
    expect(tokenData).toHaveProperty('access_token');
    expect(tokenData).toHaveProperty('instance_url');
    expect(tokenData.access_token).toBeTruthy();
    expect(tokenData.instance_url).toContain('salesforce.com');
    
    console.log('✅ Access token generated successfully');
    console.log(`Instance URL: ${tokenData.instance_url}`);
    console.log(`Token starts with: ${tokenData.access_token.substring(0, 20)}...`);
  });

  test('Demo: Validate access token', async () => {
    await authUtils.generateAccessToken();
    const isValid = await authUtils.validateToken();
    
    expect(isValid).toBeTruthy();
    console.log('✅ Access token validation successful');
  });

  test('Demo: Get token info', async () => {
    await authUtils.generateAccessToken();
    const tokenInfo = authUtils.getTokenInfo();
    
    expect(tokenInfo.hasToken).toBeTruthy();
    expect(tokenInfo.instanceUrl).toBeTruthy();
    expect(tokenInfo.isExpired).toBeFalsy();
    expect(tokenInfo.expiresAt).toBeTruthy();
    
    console.log('✅ Token info retrieved:', tokenInfo);
  });

  test('Demo: Use token for API call', async ({ request }) => {
    const headers = await authUtils.getAuthHeaders();
    const instanceUrl = await authUtils.getInstanceUrl();
    
    const response = await request.get(`${instanceUrl}/services/data/v62.0/`, {
      headers
    });
    
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('sobjects');
    
    console.log('✅ API call successful using generated token');
    console.log(`Available sobjects: ${data.sobjects.length}`);
  });

  test('Demo: SalesforceUtils with token generation', async () => {
    // Generate token using integrated auth utils
    const tokenData = await salesforceUtils.generateAccessToken();
    expect(tokenData.access_token).toBeTruthy();
    
    // Get current token
    const currentToken = await salesforceUtils.getAccessToken();
    expect(currentToken).toBeTruthy();
    
    // Validate token
    const isValid = await salesforceUtils.validateToken();
    expect(isValid).toBeTruthy();
    
    // Get token info
    const tokenInfo = salesforceUtils.getTokenInfo();
    expect(tokenInfo.hasToken).toBeTruthy();
    
    console.log('✅ SalesforceUtils token integration working');
    console.log('Token info:', tokenInfo);
  });

  test('Demo: Token refresh', async () => {
    // Generate initial token
    await authUtils.generateAccessToken();
    const initialToken = authUtils.accessToken;
    
    // Refresh token
    const refreshedData = await authUtils.refreshToken();
    const newToken = authUtils.accessToken;
    
    expect(refreshedData.access_token).toBeTruthy();
    expect(newToken).not.toBe(initialToken);
    
    console.log('✅ Token refresh successful');
    console.log('New token generated');
  });

  test('Demo: Environment token fallback', async () => {
    // Force use of environment token
    const tokenData = await authUtils.useEnvironmentToken();
    
    expect(tokenData.access_token).toBeTruthy();
    expect(tokenData.instance_url).toBeTruthy();
    
    // Check token source
    const tokenInfo = authUtils.getTokenInfo();
    expect(tokenInfo.source).toBe('environment');
    
    console.log('✅ Environment token fallback working');
    console.log(`Token source: ${tokenInfo.source}`);
  });

  test('Demo: Token source detection', async () => {
    // Generate token (will use environment if available)
    await authUtils.generateAccessToken();
    
    const tokenInfo = authUtils.getTokenInfo();
    expect(['environment', 'oauth2']).toContain(tokenInfo.source);
    
    console.log('✅ Token source detection working');
    console.log(`Current token source: ${tokenInfo.source}`);
    console.log('Token info:', tokenInfo);
  });
});