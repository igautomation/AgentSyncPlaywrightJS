/**
 * TestRail Debug Test - Single Test for Debugging
 */
const { test, expect } = require('@playwright/test');
const { TestRailClient } = require('../../utils/testrail');
require('dotenv').config({ path: '.env.unified' });

// TestRail status IDs
const TESTRAIL_STATUS = { PASSED: 1, FAILED: 5 };

// Global TestRail variables
let testRailClient;
let testRunId;
const testResults = [];

// Initialize TestRail client
try {
  testRailClient = new TestRailClient();
  console.log('✅ TestRail client initialized successfully');
} catch (error) {
  console.log('❌ TestRail client initialization failed:', error.message);
  testRailClient = null;
}

test.describe('TestRail Debug Test', () => {
  
  test.beforeAll(async () => {
    if (testRailClient) {
      try {
        console.log('🔄 Creating TestRail run...');
        const testRun = await testRailClient.addRun(
          parseInt(process.env.TESTRAIL_PROJECT_ID || '18'),
          {
            name: `Debug Test Run - ${new Date().toISOString()}`,
            case_ids: [24148],
            suite_id: parseInt(process.env.TESTRAIL_SUITE_ID || '412')
          }
        );
        testRunId = testRun.id;
        console.log(`✅ Created TestRail run: ${testRunId}`);
      } catch (error) {
        console.log('❌ Failed to create TestRail run:', error.message);
        console.log('Error details:', error.response?.data || error);
      }
    } else {
      console.log('⚠️ TestRail client not available');
    }
  });

  test.afterAll(async () => {
    if (testRailClient && testRunId && testResults.length > 0) {
      try {
        console.log('🔄 Uploading results to TestRail...');
        console.log('Results to upload:', JSON.stringify(testResults, null, 2));
        
        await testRailClient.addResults(testRunId, testResults);
        console.log('✅ Results uploaded successfully');
        
        await testRailClient.closeRun(testRunId);
        console.log(`✅ Closed TestRail run: ${testRunId}`);
      } catch (error) {
        console.log('❌ Failed to upload results:', error.message);
        console.log('Error details:', error.response?.data || error);
      }
    } else {
      console.log('⚠️ No results to upload or TestRail unavailable');
    }
  });

  test('C24148: Debug Framework Test', async ({ page }) => {
    const testCaseId = 24148;
    let testStatus = TESTRAIL_STATUS.PASSED;
    let testComment = '';
    
    try {
      console.log(`🔄 Running test case ${testCaseId}...`);
      
      await page.goto('https://example.com');
      const title = await page.title();
      expect(title).toContain('Example');
      
      testComment = 'Debug framework test passed successfully';
      console.log(`✅ Test case ${testCaseId}: ${testComment}`);
      
    } catch (error) {
      testStatus = TESTRAIL_STATUS.FAILED;
      testComment = `Debug framework test failed: ${error.message}`;
      console.log(`❌ Test case ${testCaseId}: ${testComment}`);
      throw error;
    } finally {
      const result = {
        case_id: testCaseId,
        status_id: testStatus,
        comment: testComment
      };
      testResults.push(result);
      console.log(`📊 Added result for case ${testCaseId}:`, JSON.stringify(result, null, 2));
    }
  });
});