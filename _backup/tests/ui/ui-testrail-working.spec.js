/**
 * Working UI TestRail Integration - Single Worker
 */
const { test, expect } = require('@playwright/test');
const { TestRailAPI } = require('../../utils/testrail');
require('dotenv').config({ path: '.env.unified' });

// Global variables
let testRailClient, testRunId;
const testResults = [];

test.describe.configure({ mode: 'serial' });

test.describe('Working UI TestRail Integration', () => {

  test.beforeAll(async () => {
    console.log('🚀 Starting Working UI TestRail Integration');
    
    try {
      testRailClient = new TestRailAPI();
      console.log('✅ TestRail client initialized');
      
      // Create test run
      const testRun = await testRailClient.addRun(
        parseInt(process.env.TESTRAIL_PROJECT_ID),
        {
          name: `Working UI Tests - ${new Date().toISOString()}`,
          description: 'Working UI test run with proper TestRail integration',
          case_ids: [24151, 24152, 24153],
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
        console.log(`📤 Uploading ${testResults.length} results to TestRail...`);
        console.log('Results to upload:', JSON.stringify(testResults, null, 2));
        
        await testRailClient.addResultsForCases(testRunId, { results: testResults });
        console.log('✅ Results uploaded successfully');
        
        await testRailClient.closeRun(testRunId);
        console.log(`🔒 Test run ${testRunId} closed`);
        console.log(`🔗 View results: ${process.env.TESTRAIL_URL}/index.php?/runs/view/${testRunId}`);
        
      } catch (error) {
        console.log('❌ Failed to upload results:', error.message);
        console.log('Error details:', error.response?.data || error);
      }
    }
  });

  test('C24151: Salesforce Login UI Test', async ({ page }) => {
    let status = 1;
    let comment = '';
    
    try {
      console.log('🧪 Running C24151: Salesforce Login UI Test...');
      
      await page.goto('https://login.salesforce.com');
      await page.fill('#username', process.env.SF_USERNAME);
      await page.fill('#password', process.env.SF_PASSWORD);
      await page.click('#Login');
      await page.waitForTimeout(10000);
      
      expect(page.url()).not.toContain('login.salesforce.com');
      const title = await page.title();
      
      status = 1;
      comment = `Login successful. Page title: ${title}`;
      console.log(`✅ C24151 PASSED: ${comment}`);
      
    } catch (error) {
      status = 5;
      comment = `Login failed: ${error.message}`;
      console.log(`❌ C24151 FAILED: ${comment}`);
      throw error;
    } finally {
      testResults.push({
        case_id: 24151,
        status_id: status,
        comment: comment
      });
      console.log(`📊 Added result for C24151: Status ${status}`);
    }
  });

  test('C24152: Salesforce Navigation UI Test', async ({ page }) => {
    let status = 1;
    let comment = '';
    
    try {
      console.log('🧪 Running C24152: Salesforce Navigation UI Test...');
      
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
      comment = `Navigation successful. Page title: ${title}`;
      console.log(`✅ C24152 PASSED: ${comment}`);
      
    } catch (error) {
      status = 5;
      comment = `Navigation failed: ${error.message}`;
      console.log(`❌ C24152 FAILED: ${comment}`);
      throw error;
    } finally {
      testResults.push({
        case_id: 24152,
        status_id: status,
        comment: comment
      });
      console.log(`📊 Added result for C24152: Status ${status}`);
    }
  });

  test('C24153: Salesforce Contact Page UI Test', async ({ page }) => {
    let status = 1;
    let comment = '';
    
    try {
      console.log('🧪 Running C24153: Salesforce Contact Page UI Test...');
      
      await page.goto('https://login.salesforce.com');
      await page.fill('#username', process.env.SF_USERNAME);
      await page.fill('#password', process.env.SF_PASSWORD);
      await page.click('#Login');
      await page.waitForTimeout(10000);
      
      await page.goto(`${process.env.SF_INSTANCE_URL}/lightning/o/Contact/list`);
      await page.waitForTimeout(5000);
      
      const title = await page.title();
      const hasNewButton = await page.locator('a[title="New"]').isVisible().catch(() => false);
      
      expect(page.url()).toContain('force.com');
      
      status = 1;
      comment = `Contact page loaded. Title: ${title}. New button: ${hasNewButton}`;
      console.log(`✅ C24153 PASSED: ${comment}`);
      
    } catch (error) {
      status = 5;
      comment = `Contact page test failed: ${error.message}`;
      console.log(`❌ C24153 FAILED: ${comment}`);
      throw error;
    } finally {
      testResults.push({
        case_id: 24153,
        status_id: status,
        comment: comment
      });
      console.log(`📊 Added result for C24153: Status ${status}`);
    }
  });
});