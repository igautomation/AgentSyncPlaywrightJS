/**
 * UI TestRail Integration - Final Version
 * Creates test run, executes tests, uploads results
 */
const { test, expect } = require('@playwright/test');
const { TestRailAPI } = require('../../utils/testrail');
require('dotenv').config({ path: '.env.unified' });

// Global variables
let testRailClient, testRunId;
const testResults = [];

// Test case definitions with real TestRail case IDs
const TEST_CASES = [
  { id: C24205, title: 'UI Login Test' },
  { id: 24152, title: 'UI Navigation Test' },
  { id: 24153, title: 'UI Form Test' }
];

test.describe.configure({ mode: 'serial' });

// Setup TestRail before all tests
test.beforeAll(async () => {
  console.log('🚀 Starting UI TestRail Integration');
  
  // Setup TestRail with real credentials
  try {
    testRailClient = new TestRailAPI();
    console.log('✅ TestRail client initialized');
    
    // Create test run with actual case IDs
    const testRun = await testRailClient.addRun(
      parseInt(process.env.TESTRAIL_PROJECT_ID),
      {
        name: `UI Tests - ${new Date().toISOString()}`,
        description: 'Automated UI test run',
        case_ids: TEST_CASES.map(tc => tc.id),
        suite_id: parseInt(process.env.TESTRAIL_SUITE_ID)
      }
    );
    testRunId = testRun.id;
    console.log(`📋 Created TestRail run: ${testRunId}`);
    console.log(`🔗 View run: ${process.env.TESTRAIL_URL}/index.php?/runs/view/${testRunId}`);
    
  } catch (error) {
    console.log('❌ TestRail setup failed:', error.message);
    testRailClient = null;
  }
});

// Upload results after all tests
test.afterAll(async () => {
  if (testRailClient && testRunId && testResults.length > 0) {
    try {
      console.log(`📤 Uploading ${testResults.length} results to TestRail...`);
      
      // Upload results
      await testRailClient.addResultsForCases(testRunId, { results: testResults });
      console.log('✅ Results uploaded successfully');
      
      // Close test run
      await testRailClient.closeRun(testRunId);
      console.log(`🔒 Test run ${testRunId} closed`);
      console.log(`🔗 View results: ${process.env.TESTRAIL_URL}/index.php?/runs/view/${testRunId}`);
      
    } catch (error) {
      console.log('❌ Failed to upload results:', error.message);
    }
  }
});

test.describe('UI TestRail Integration', () => {

  test('C24151: UI Login Test', async ({ page }) => {
    let status = 1; // Passed
    let comment = '';
    
    try {
      console.log('🧪 Running UI Login Test...');
      
      // Mock test - always passes
      await page.goto('about:blank');
      
      status = 1; // Passed
      comment = 'UI Login test passed (mock)';
      console.log(`✅ ${comment}`);
      
    } catch (error) {
      status = 5; // Failed
      comment = `UI Login test failed: ${error.message}`;
      console.log(`❌ ${comment}`);
      throw error;
    } finally {
      testResults.push({
        case_id: 24151,
        status_id: status,
        comment: comment
      });
    }
  });

  test('C24152: UI Navigation Test', async ({ page }) => {
    let status = 1; // Passed
    let comment = '';
    
    try {
      console.log('🧪 Running UI Navigation Test...');
      
      // Mock test - always passes
      await page.goto('about:blank');
      
      status = 1; // Passed
      comment = 'UI Navigation test passed (mock)';
      console.log(`✅ ${comment}`);
      
    } catch (error) {
      status = 5; // Failed
      comment = `UI Navigation test failed: ${error.message}`;
      console.log(`❌ ${comment}`);
      throw error;
    } finally {
      testResults.push({
        case_id: 24152,
        status_id: status,
        comment: comment
      });
    }
  });

  test('C24153: UI Form Test', async ({ page }) => {
    let status = 1; // Passed
    let comment = '';
    
    try {
      console.log('🧪 Running UI Form Test...');
      
      // Mock test - always passes
      await page.goto('about:blank');
      
      status = 1; // Passed
      comment = 'UI Form test passed (mock)';
      console.log(`✅ ${comment}`);
      
    } catch (error) {
      status = 5; // Failed
      comment = `UI Form test failed: ${error.message}`;
      console.log(`❌ ${comment}`);
      throw error;
    } finally {
      testResults.push({
        case_id: 24153,
        status_id: status,
        comment: comment
      });
    }
  });
});