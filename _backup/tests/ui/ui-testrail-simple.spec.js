/**
 * Simple UI TestRail Integration - Create Cases First
 */
const { test, expect } = require('@playwright/test');
const { TestRailAPI } = require('../../utils/testrail');
require('dotenv').config({ path: '.env.unified' });

// Global variables
let testRailClient, testRunId;
const testResults = [];
let createdCases = [];

test.describe.configure({ mode: 'serial' });

test.describe('Simple UI TestRail Integration', () => {

  test.beforeAll(async () => {
    console.log('🚀 Starting Simple UI TestRail Integration');
    
    try {
      testRailClient = new TestRailAPI();
      console.log('✅ TestRail client initialized');
      
      // Create test cases first
      const testCaseDefinitions = [
        { title: 'Salesforce Login UI Test', description: 'Test Salesforce login functionality' },
        { title: 'Salesforce Navigation UI Test', description: 'Test navigation to Contact page' },
        { title: 'Salesforce Contact Page UI Test', description: 'Test Contact page elements' }
      ];
      
      console.log('📝 Creating test cases...');
      for (const caseDef of testCaseDefinitions) {
        try {
          const createdCase = await testRailClient.addCase(412, {
            title: caseDef.title,
            custom_steps_separated: [{
              content: caseDef.description,
              expected: 'Test should pass successfully'
            }]
          });
          createdCases.push(createdCase);
          console.log(`✅ Created case: ${createdCase.id} - ${createdCase.title}`);
        } catch (error) {
          console.log(`⚠️ Failed to create case "${caseDef.title}":`, error.message);
        }
      }
      
      if (createdCases.length > 0) {
        // Create test run with created case IDs
        const testRun = await testRailClient.addRun(
          parseInt(process.env.TESTRAIL_PROJECT_ID),
          {
            name: `Simple UI Tests - ${new Date().toISOString()}`,
            description: 'Simple UI test run with created test cases',
            case_ids: createdCases.map(c => c.id),
            suite_id: parseInt(process.env.TESTRAIL_SUITE_ID)
          }
        );
        testRunId = testRun.id;
        console.log(`📋 Created TestRail run: ${testRunId}`);
        console.log(`🔗 View run: ${process.env.TESTRAIL_URL}/index.php?/runs/view/${testRunId}`);
      }
      
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
        
        await testRailClient.addResultsForCases(testRunId, { results: testResults });
        console.log('✅ Results uploaded successfully');
        
        await testRailClient.closeRun(testRunId);
        console.log(`🔒 Test run ${testRunId} closed`);
        console.log(`🔗 View results: ${process.env.TESTRAIL_URL}/index.php?/runs/view/${testRunId}`);
        
      } catch (error) {
        console.log('❌ Failed to upload results:', error.message);
      }
    }
  });

  test('Salesforce Login UI Test', async ({ page }) => {
    const caseId = createdCases.find(c => c.title === 'Salesforce Login UI Test')?.id;
    let status = 1;
    let comment = '';
    
    try {
      console.log(`🧪 Running Login UI Test (Case ${caseId})...`);
      
      await page.goto('https://login.salesforce.com');
      await page.fill('#username', process.env.SF_USERNAME);
      await page.fill('#password', process.env.SF_PASSWORD);
      await page.click('#Login');
      await page.waitForTimeout(10000);
      
      expect(page.url()).not.toContain('login.salesforce.com');
      const title = await page.title();
      
      status = 1;
      comment = `Login successful. Page title: ${title}`;
      console.log(`✅ Case ${caseId} PASSED: ${comment}`);
      
    } catch (error) {
      status = 5;
      comment = `Login failed: ${error.message}`;
      console.log(`❌ Case ${caseId} FAILED: ${comment}`);
      throw error;
    } finally {
      if (caseId) {
        testResults.push({
          case_id: caseId,
          status_id: status,
          comment: comment
        });
      }
    }
  });

  test('Salesforce Navigation UI Test', async ({ page }) => {
    const caseId = createdCases.find(c => c.title === 'Salesforce Navigation UI Test')?.id;
    let status = 1;
    let comment = '';
    
    try {
      console.log(`🧪 Running Navigation UI Test (Case ${caseId})...`);
      
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
      console.log(`✅ Case ${caseId} PASSED: ${comment}`);
      
    } catch (error) {
      status = 5;
      comment = `Navigation failed: ${error.message}`;
      console.log(`❌ Case ${caseId} FAILED: ${comment}`);
      throw error;
    } finally {
      if (caseId) {
        testResults.push({
          case_id: caseId,
          status_id: status,
          comment: comment
        });
      }
    }
  });

  test('Salesforce Contact Page UI Test', async ({ page }) => {
    const caseId = createdCases.find(c => c.title === 'Salesforce Contact Page UI Test')?.id;
    let status = 1;
    let comment = '';
    
    try {
      console.log(`🧪 Running Contact Page UI Test (Case ${caseId})...`);
      
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
      console.log(`✅ Case ${caseId} PASSED: ${comment}`);
      
    } catch (error) {
      status = 5;
      comment = `Contact page test failed: ${error.message}`;
      console.log(`❌ Case ${caseId} FAILED: ${comment}`);
      throw error;
    } finally {
      if (caseId) {
        testResults.push({
          case_id: caseId,
          status_id: status,
          comment: comment
        });
      }
    }
  });
});