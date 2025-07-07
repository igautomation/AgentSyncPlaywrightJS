/**
 * TestRail Core Utilities Demo Test
 */
const { test, expect } = require('@playwright/test');
const { TestRailCore } = require('../../utils/testrail');
require('dotenv').config({ path: '.env.unified' });

test.describe('TestRail Core Demo', () => {
  let testRail;
  let testRunId;

  test.beforeAll(() => {
    testRail = new TestRailCore();
  });

  test.afterAll(async () => {
    // Clean up test run if created
    if (testRunId) {
      try {
        await testRail.deleteTestRun(testRunId);
        console.log('🧹 Cleaned up test run');
      } catch (error) {
        console.log('⚠️ Failed to clean up test run:', error.message);
      }
    }
  });

  test('Demo: Create and manage test run', async () => {
    // Create test run
    const run = await testRail.createTestRun('Core Demo Test Run', 'Demo test run for core utilities');
    testRunId = run.id;
    
    expect(run.id).toBeTruthy();
    expect(run.name).toBe('Core Demo Test Run');
    
    console.log('✅ Test run created successfully');
    console.log(`Run ID: ${run.id}, Name: ${run.name}`);
  });

  test('Demo: Add test results', async () => {
    if (!testRunId) {
      const run = await testRail.createTestRun('Core Demo Results Test');
      testRunId = run.id;
    }

    // Sample test results
    const results = [
      {
        case_id: 24148,
        status_id: testRail.getStatusId('passed'),
        comment: 'Demo test passed successfully',
        elapsed: '5s'
      },
      {
        case_id: 24150,
        status_id: testRail.getStatusId('failed'),
        comment: 'Demo test failed for demonstration',
        elapsed: '3s'
      }
    ];

    const response = await testRail.addTestResults(testRunId, results);
    expect(response).toBeTruthy();
    
    console.log('✅ Test results added successfully');
    console.log(`Added ${results.length} results to run ${testRunId}`);
  });

  test('Demo: Status helpers', async () => {
    // Test status ID mapping
    expect(testRail.getStatusId('passed')).toBe(1);
    expect(testRail.getStatusId('failed')).toBe(5);
    expect(testRail.getStatusId('blocked')).toBe(2);
    expect(testRail.getStatusId('untested')).toBe(3);
    
    console.log('✅ Status helpers working correctly');
    console.log('Status mappings verified');
  });

  test('Demo: Format test results', async () => {
    const testResult = {
      caseId: 12345,
      status: 'passed',
      comment: 'Test completed successfully',
      duration: 5000
    };

    const formatted = testRail.formatResult(testResult);
    
    expect(formatted.case_id).toBe(12345);
    expect(formatted.status_id).toBe(1);
    expect(formatted.comment).toBe('Test completed successfully');
    expect(formatted.elapsed).toBe('5s');
    
    console.log('✅ Result formatting working');
    console.log('Formatted result:', formatted);
  });

  test('Demo: Get test cases', async () => {
    const cases = await testRail.getTestCases();
    
    expect(Array.isArray(cases) || (cases && Array.isArray(cases.cases))).toBeTruthy();
    
    const caseArray = Array.isArray(cases) ? cases : cases.cases || [];
    console.log('✅ Test cases retrieved successfully');
    console.log(`Found ${caseArray.length} test cases`);
  });

  test('Demo: Generate unique test case IDs', async () => {
    const uniqueIds = await testRail.generateUniqueTestCaseIds(3);
    
    expect(Array.isArray(uniqueIds)).toBeTruthy();
    expect(uniqueIds.length).toBe(3);
    
    // Check IDs are sequential
    for (let i = 1; i < uniqueIds.length; i++) {
      expect(uniqueIds[i]).toBe(uniqueIds[i-1] + 1);
    }
    
    console.log('✅ Unique test case IDs generated');
    console.log(`Generated IDs: ${uniqueIds.join(', ')}`);
  });

  test('Demo: Complete test execution', async () => {
    const testResults = [
      {
        case_id: 24148,
        status_id: 1,
        comment: 'Complete execution test - passed',
        elapsed: '2s'
      },
      {
        case_id: 24150,
        status_id: 1,
        comment: 'Complete execution test - passed',
        elapsed: '3s'
      }
    ];

    const runId = await testRail.executeTestRun(
      testResults,
      'Complete Execution Demo',
      {
        description: 'Demo of complete test execution workflow',
        uploadReport: false, // Skip report upload in demo
        uploadArtifacts: false, // Skip artifacts upload in demo
        closeRun: true
      }
    );

    expect(runId).toBeTruthy();
    
    console.log('✅ Complete test execution successful');
    console.log(`Executed test run: ${runId}`);
  });
});