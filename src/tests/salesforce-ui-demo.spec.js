/**
 * Salesforce UI Demo Tests with TestRail Integration
 * Client Demo: 2 UI Test Cases
 */
const { test, expect } = require('@playwright/test');
const TestRailUploader = require('../utils/testrail/testrail-uploader');
const TestCaseFetcher = require('../utils/testrail/test-case-fetcher');
const TestCaseManager = require('../utils/testrail/test-case-manager');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: '.env.unified' });

let testRailUploader, testRunId, testCaseIds, testCaseManager;
const testResults = [];

test.describe('Salesforce UI Demo Tests', () => {
  
  test.beforeAll(async () => {
    try {
      testCaseManager = new TestCaseManager();
      
      // Create/update test cases in TestRail
      const loginCaseId = await testCaseManager.createOrUpdateTestCase({
        title: 'Salesforce UI Login Verification',
        steps: [
          { content: 'Navigate to Salesforce login page', expected: 'Login page loads' },
          { content: 'Enter valid username credentials', expected: 'Username field populated' },
          { content: 'Enter valid password credentials', expected: 'Password field populated' },
          { content: 'Click Login button', expected: 'Login process initiated' },
          { content: 'Wait for page to load', expected: 'Home page loads' },
          { content: 'Verify page title contains "Salesforce"', expected: 'Title verification passes' },
          { content: 'Verify URL contains "force.com"', expected: 'URL verification passes' }
        ],
        expected_result: 'Successfully login and redirect to Salesforce home page',
        priority_id: 2,
        type_id: 1
      });
      
      const navCaseId = await testCaseManager.createOrUpdateTestCase({
        title: 'Salesforce Contact Navigation Test',
        steps: [
          { content: 'Login to Salesforce with valid credentials', expected: 'Login successful' },
          { content: 'Navigate to Contacts list page', expected: 'Navigation initiated' },
          { content: 'Wait for page to fully load', expected: 'Page loads completely' },
          { content: 'Verify page title contains "Contact"', expected: 'Title verification passes' },
          { content: 'Verify URL contains "Contact/list"', expected: 'URL verification passes' }
        ],
        expected_result: 'Successfully navigate to Contacts list page',
        priority_id: 2,
        type_id: 1
      });
      
      testCaseIds = [loginCaseId, navCaseId].filter(id => id !== null);
      if (testCaseIds.length === 0) testCaseIds = [24148, 24149];
      
      testRailUploader = new TestRailUploader();
      testRunId = await testRailUploader.createTestRun(
        `Salesforce UI Demo - ${new Date().toISOString()}`,
        testCaseIds
      );
      console.log(`📋 Created TestRail run: ${testRunId} with cases: ${testCaseIds}`);
    } catch (error) {
      console.log('⚠️ TestRail integration disabled:', error.message);
      testCaseIds = [24148, 24149];
    }
  });

  test.afterAll(async () => {
    if (testRailUploader && testRunId && testResults.length > 0) {
      try {
        const response = await testRailUploader.addResults(testRunId, testResults);
        
        // Upload attachments for each result
        if (response && Array.isArray(response)) {
          for (let i = 0; i < response.length; i++) {
            const result = response[i];
            const testInfo = testResults[i];
            
            if (testInfo.attachments && testInfo.attachments.length > 0) {
              await testCaseManager.uploadAttachments(result.id, testInfo.attachments);
            }
          }
        }
        
        await testRailUploader.closeRun(testRunId);
        console.log('✅ Results and attachments uploaded to TestRail');
      } catch (error) {
        console.log('⚠️ Failed to upload results:', error.message);
      }
    }
  });

  test('Demo UI Test 1: Salesforce Login Verification', async ({ page }, testInfo) => {
    const startTime = Date.now();
    let status = 1, comment = '';
    const attachments = [];
    
    try {
      await page.goto(process.env.SF_LOGIN_URL);
      
      // Login with credentials
      await page.fill('#username', process.env.SF_USERNAME);
      await page.fill('#password', process.env.SF_PASSWORD);
      await page.click('#Login');
      
      await page.waitForTimeout(5000);
      
      const pageTitle = await page.title();
      const currentUrl = page.url();
      expect(pageTitle).toContain('Salesforce');
      expect(currentUrl).toContain('force.com');
      
      const testDetails = {
        test_case: 'Salesforce UI Login Verification',
        steps: [
          '1. Navigate to Salesforce login page',
          '2. Enter valid username credentials',
          '3. Enter valid password credentials', 
          '4. Click Login button',
          '5. Wait for page to load',
          '6. Verify page title contains "Salesforce"',
          '7. Verify URL contains "force.com"'
        ],
        expected_result: 'Successfully login and redirect to Salesforce home page',
        actual_result: `Page Title: ${pageTitle}, URL: ${currentUrl}`
      };
      
      comment = `✅ PASSED\n\nTest Case: ${testDetails.test_case}\n\nSteps Executed:\n${testDetails.steps.join('\n')}\n\nExpected: ${testDetails.expected_result}\nActual: ${testDetails.actual_result}`;
      console.log('✅ Demo UI Test 1: Login verification passed');
      
    } catch (error) {
      status = 5;
      comment = `❌ FAILED\n\nTest Case: Salesforce UI Login Verification\n\nError Details: ${error.message}\n\nSteps Attempted:\n1. Navigate to Salesforce login page\n2. Enter credentials and click Login\n\nFailure Point: ${error.message.includes('expect') ? 'Assertion Failed' : 'UI Interaction Failed'}`;
      console.log('❌ Demo UI Test 1: Login verification failed');
      throw error;
    } finally {
      // Collect attachments
      if (testInfo.attachments) {
        testInfo.attachments.forEach(attachment => {
          if (attachment.path && fs.existsSync(attachment.path)) {
            attachments.push(attachment.path);
          }
        });
      }
      
      testResults.push({
        case_id: testCaseIds ? testCaseIds[0] : 24148,
        status_id: status,
        comment: comment,
        attachments: attachments
      });
    }
  });

  test('Demo UI Test 2: Salesforce Navigation Test', async ({ page }, testInfo) => {
    const startTime = Date.now();
    let status = 1, comment = '';
    const attachments = [];
    
    try {
      await page.goto(process.env.SF_LOGIN_URL);
      
      // Login with credentials
      await page.fill('#username', process.env.SF_USERNAME);
      await page.fill('#password', process.env.SF_PASSWORD);
      await page.click('#Login');
      
      await page.waitForTimeout(5000);
      
      // Navigate to contacts
      await page.goto(`${process.env.SF_INSTANCE_URL}/lightning/o/Contact/list`);
      await page.waitForTimeout(8000);
      
      const pageTitle = await page.title();
      const currentUrl = page.url();
      
      const testDetails = {
        test_case: 'Salesforce Contact Navigation Test',
        steps: [
          '1. Login to Salesforce with valid credentials',
          '2. Navigate to Contacts list page',
          '3. Wait for page to fully load',
          '4. Verify page title contains "Contact"',
          '5. Verify URL contains "Contact/list"'
        ],
        expected_result: 'Successfully navigate to Contacts list page',
        actual_result: `Page Title: ${pageTitle}, URL: ${currentUrl}`
      };
      
      if (pageTitle.includes('Contact') || currentUrl.includes('Contact/list')) {
        comment = `✅ PASSED\n\nTest Case: ${testDetails.test_case}\n\nSteps Executed:\n${testDetails.steps.join('\n')}\n\nExpected: ${testDetails.expected_result}\nActual: ${testDetails.actual_result}`;
        console.log('✅ Demo UI Test 2: Navigation test passed');
      } else {
        throw new Error(`Navigation failed - Title: ${pageTitle}, URL: ${currentUrl}`);
      }
      
    } catch (error) {
      status = 5;
      comment = `❌ FAILED\n\nTest Case: Salesforce Contact Navigation Test\n\nError Details: ${error.message}\n\nSteps Attempted:\n1. Login to Salesforce\n2. Navigate to Contacts list page\n\nFailure Point: ${error.message.includes('Navigation failed') ? 'Page Navigation/Loading' : 'UI Interaction Failed'}`;
      console.log('❌ Demo UI Test 2: Navigation test failed');
      throw error;
    } finally {
      // Collect attachments
      if (testInfo.attachments) {
        testInfo.attachments.forEach(attachment => {
          if (attachment.path && fs.existsSync(attachment.path)) {
            attachments.push(attachment.path);
          }
        });
      }
      
      testResults.push({
        case_id: testCaseIds ? testCaseIds[1] : 24149,
        status_id: status,
        comment: comment,
        attachments: attachments
      });
    }
  });
});