/**
 * Final UI TestRail Integration - Using Working Pattern from API Demo
 */
const { test, expect } = require('@playwright/test');
const { TestRailAPI } = require('../../utils/testrail');
require('dotenv').config({ path: '.env.unified' });

// Global variables
let testRailClient, testRunId;
const testResults = [];

// Use same case IDs that worked in API demo
const TEST_CASES = [
  { id: 24148, title: 'Salesforce Login UI Test' },
  { id: 24149, title: 'Salesforce Navigation UI Test' },
  { id: 24150, title: 'Salesforce Contact Page UI Test' }
];

test.describe.configure({ mode: 'serial' });

test.describe('Final UI TestRail Integration', () => {

  test.beforeAll(async () => {
    console.log('🚀 Starting Final UI TestRail Integration');
    
    try {
      testRailClient = new TestRailAPI();
      console.log('✅ TestRail client initialized');
      
      // Create test run using same pattern as working API demo
      const testRun = await testRailClient.addRun(
        parseInt(process.env.TESTRAIL_PROJECT_ID),
        {
          name: `Final UI Tests - ${new Date().toISOString()}`,
          description: 'Final UI test run using working TestRail pattern',
          case_ids: TEST_CASES.map(tc => tc.id),
          suite_id: parseInt(process.env.TESTRAIL_SUITE_ID)
        }
      );
      testRunId = testRun.id;
      console.log(`📋 Created TestRail run: ${testRunId}`);
      console.log(`🔗 View run: ${process.env.TESTRAIL_URL}/index.php?/runs/view/${testRunId}`);
      
    } catch (error) {
      console.log('❌ TestRail setup failed:', error.message);
      console.log('Error details:', error.response?.data || error);
      testRailClient = null;
    }
  });

  test.afterAll(async () => {
    if (testRailClient && testRunId && testResults.length > 0) {
      try {
        console.log(`📤 Uploading ${testResults.length} UI results to TestRail...`);
        console.log('Results to upload:', JSON.stringify(testResults, null, 2));
        
        await testRailClient.addResultsForCases(testRunId, { results: testResults });
        console.log('✅ UI results uploaded successfully');
        
        await testRailClient.closeRun(testRunId);
        console.log(`🔒 UI test run ${testRunId} closed`);
        console.log(`🔗 View results: ${process.env.TESTRAIL_URL}/index.php?/runs/view/${testRunId}`);
        
      } catch (error) {
        console.log('❌ Failed to upload UI results:', error.message);
        console.log('Error details:', error.response?.data || error);
      }
    }
  });

  test('C24148: Salesforce Login UI Test', async ({ page }) => {
    let status = 1;
    let comment = '';
    
    try {
      console.log('🧪 Running C24148: Salesforce Login UI Test...');
      
      await page.goto('https://login.salesforce.com');
      await page.fill('#username', process.env.SF_USERNAME);
      await page.fill('#password', process.env.SF_PASSWORD);
      await page.click('#Login');
      await page.waitForTimeout(10000);
      
      expect(page.url()).not.toContain('login.salesforce.com');
      const title = await page.title();
      
      status = 1;
      comment = `UI Login successful. Page title: ${title}. URL: ${page.url()}`;
      console.log(`✅ C24148 UI PASSED: ${comment}`);
      
    } catch (error) {
      status = 5;
      comment = `UI Login failed: ${error.message}`;
      console.log(`❌ C24148 UI FAILED: ${comment}`);
      throw error;
    } finally {
      testResults.push({
        case_id: 24148,
        status_id: status,
        comment: comment
      });
    }
  });

  test('C24149: Salesforce Navigation UI Test', async ({ page }) => {
    let status = 1;
    let comment = '';
    
    try {
      console.log('🧪 Running C24149: Salesforce Navigation UI Test...');
      
      await page.goto('https://login.salesforce.com');
      await page.fill('#username', process.env.SF_USERNAME);
      await page.fill('#password', process.env.SF_PASSWORD);
      await page.click('#Login');
      await page.waitForTimeout(10000);
      
      await page.goto(`${process.env.SF_INSTANCE_URL}/lightning/o/Contact/list`);
      await page.waitForTimeout(5000);
      
      const title = await page.title();
      expect(page.url()).toContain('force.com');
      
      status = 1;
      comment = `UI Navigation successful. Page title: ${title}. Contact page loaded.`;
      console.log(`✅ C24149 UI PASSED: ${comment}`);
      
    } catch (error) {
      status = 5;
      comment = `UI Navigation failed: ${error.message}`;
      console.log(`❌ C24149 UI FAILED: ${comment}`);
      throw error;
    } finally {
      testResults.push({
        case_id: 24149,
        status_id: status,
        comment: comment
      });
    }
  });

  test('C24150: Salesforce Contact Page UI Test', async ({ page }) => {
    let status = 1;
    let comment = '';
    
    try {
      console.log('🧪 Running C24150: Salesforce Contact Page UI Test...');
      
      await page.goto('https://login.salesforce.com');
      await page.fill('#username', process.env.SF_USERNAME);
      await page.fill('#password', process.env.SF_PASSWORD);
      await page.click('#Login');
      await page.waitForTimeout(10000);
      
      await page.goto(`${process.env.SF_INSTANCE_URL}/lightning/o/Contact/list`);
      await page.waitForTimeout(5000);
      
      const title = await page.title();
      const hasNewButton = await page.locator('a[title="New"]').isVisible().catch(() => false);
      const hasListView = await page.locator('[data-aura-class="forceListViewManager"]').isVisible().catch(() => false);
      
      expect(page.url()).toContain('force.com');
      
      status = 1;
      comment = `UI Contact page loaded. Title: ${title}. New button: ${hasNewButton}. List view: ${hasListView}`;
      console.log(`✅ C24150 UI PASSED: ${comment}`);
      
    } catch (error) {
      status = 5;
      comment = `UI Contact page test failed: ${error.message}`;
      console.log(`❌ C24150 UI FAILED: ${comment}`);
      throw error;
    } finally {
      testResults.push({
        case_id: 24150,
        status_id: status,
        comment: comment
      });
    }
  });
});