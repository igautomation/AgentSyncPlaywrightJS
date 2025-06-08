/**
 * Salesforce API Tests
 * 
 * Tests for Salesforce Platform APIs
 */
const { test, expect } = require('@playwright/test');
const SalesforceApiUtils = require('../../utils/salesforce/salesforceApiUtils');
const path = require('path');
const fs = require('fs').promises;

// Load environment variables from .env.salesforce
require('dotenv').config({ path: '.env.salesforce' });

test.describe('Salesforce API Tests', () => {
  let apiUtils;
  
  test.beforeAll(async () => {
    // Create API utils instance with credentials from .env.salesforce
    apiUtils = new SalesforceApiUtils({
      instanceUrl: process.env.SF_INSTANCE_URL,
      accessToken: process.env.SF_ACCESS_TOKEN,
      apiVersion: process.env.SF_API_VERSION || 'v62.0'
    });
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
  
  test('should extract Contact metadata to file', async () => {
    // Skip if no access token
    test.skip(!apiUtils.accessToken, 'No access token available');
    
    try {
      // Extract Contact metadata
      const outputPath = path.join(process.cwd(), 'temp', 'contact-metadata.json');
      const filePath = await apiUtils.extractObjectMetadata('Contact', outputPath);
      
      // Verify file was created
      const fileExists = await fs.stat(filePath).then(() => true).catch(() => false);
      expect(fileExists).toBe(true);
      
      // Read file content
      const fileContent = JSON.parse(await fs.readFile(filePath, 'utf8'));
      expect(fileContent.name).toBe('Contact');
      
      console.log(`Contact metadata extracted to ${filePath}`);
    } catch (error) {
      console.error('Error extracting Contact metadata:', error.message);
      // Skip test if authentication fails
      test.skip(error.message.includes('INVALID_SESSION_ID'), 'Invalid session ID');
      throw error;
    }
  });
});