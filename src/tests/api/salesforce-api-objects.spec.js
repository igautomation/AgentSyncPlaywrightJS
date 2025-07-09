/**
 * Salesforce API Objects Test
 * 
 * Tests the Salesforce API object endpoints to verify object metadata access
 * with TestRail integration
 */
const { test, expect } = require('@playwright/test');
const { TestRailAPI } = require('../../utils/testrail');
const authManager = require('../../utils/salesforce/auth-manager');
require('dotenv').config({ path: '.env.unified' });

// Global variables
let accessToken, instanceUrl;
let testRailClient, testRunId;
const testResults = [];

// Authenticate once before all tests
test.beforeAll(async () => {
  // Single authentication call
  const auth = await authManager.authenticate();
  accessToken = auth.accessToken;
  instanceUrl = auth.instanceUrl;
  
  // Setup TestRail once
  try {
    testRailClient = new TestRailAPI();
    const testRun = await testRailClient.addRun(
      parseInt(process.env.TESTRAIL_PROJECT_ID),
      {
        name: `API Objects Tests - ${new Date().toISOString()}`,
        case_ids: [27701], // API Objects Test
        suite_id: parseInt(process.env.TESTRAIL_SUITE_ID)
      }
    );
    testRunId = testRun.id;
    console.log(`📋 Created TestRail run: ${testRunId}`);
  } catch (error) {
    console.log('⚠️ TestRail integration disabled:', error.message);
    testRailClient = null;
  }
});

// Upload results once after all tests
test.afterAll(async () => {
  if (testRailClient && testRunId && testResults.length > 0) {
    try {
      await testRailClient.addResultsForCases(testRunId, { results: testResults });
      await testRailClient.closeRun(testRunId);
      console.log(`✅ Uploaded ${testResults.length} results to TestRail`);
    } catch (error) {
      console.log('⚠️ Failed to upload results:', error.message);
    }
  }
});

test.describe('Salesforce API Objects', () => {
  
  test('C27701: Global Objects List Test', async ({ request }) => {
    const startTime = Date.now();
    let status = 1; // Passed
    let comment = '';
    
    try {
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
      comment = `Global objects retrieved: ${objectNames.join(', ')}`;
      console.log(`✅ ${comment}`);
      
    } catch (error) {
      status = 5; // Failed
      comment = `Test failed: ${error.message}`;
      console.log(`❌ ${comment}`);
      throw error;
    } finally {
      if (testRailClient) {
        testResults.push({
          case_id: 27701,
          status_id: status,
          comment: comment,
          elapsed: `${Math.round((Date.now() - startTime) / 1000)}s`
        });
      }
    }
  });

  test('C27701: Contact Object Metadata Test', async ({ request }) => {
    const startTime = Date.now();
    let status = 1; // Passed
    let comment = '';
    
    try {
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
      comment = `Contact object described - ${data.fields.length} total fields, ${requiredFields.length} required fields`;
      console.log(`✅ ${comment}`);
      
      // Verify some standard fields exist
      const standardFields = ['Id', 'FirstName', 'LastName', 'Email', 'Phone'];
      standardFields.forEach(fieldName => {
        const field = data.fields.find(f => f.name === fieldName);
        expect(field).toBeDefined();
      });
      
    } catch (error) {
      status = 5; // Failed
      comment = `Test failed: ${error.message}`;
      console.log(`❌ ${comment}`);
      throw error;
    } finally {
      if (testRailClient) {
        testResults.push({
          case_id: 27701,
          status_id: status,
          comment: comment,
          elapsed: `${Math.round((Date.now() - startTime) / 1000)}s`
        });
      }
    }
  });
});