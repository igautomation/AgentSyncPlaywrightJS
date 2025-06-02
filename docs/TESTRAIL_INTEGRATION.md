# TestRail Integration Guide

This guide explains how to use the TestRail integration with the Playwright framework.

## Overview

The TestRail integration allows you to:

1. Fetch test cases from TestRail
2. Execute test steps defined in TestRail
3. Update test results back to TestRail
4. Attach artifacts (screenshots, reports, videos) to test results

## Setup

### Prerequisites

- TestRail account with API access
- API key from TestRail

### Configuration

1. Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your TestRail credentials:
   ```
   TESTRAIL_URL=https://yourcompany.testrail.io
   TESTRAIL_USERNAME=your.email@example.com
   TESTRAIL_API_KEY=your_api_key
   TESTRAIL_PROJECT_ID=1
   TESTRAIL_CASE_ID=1
   TESTRAIL_SUITE_ID=2
   TESTRAIL_RUN_PREFIX=Playwright Test Run
   TESTRAIL_ARTIFACTS_DIR=./artifacts/testrail
   TESTRAIL_REPORT_DIR=playwright-report
   TESTRAIL_RESULTS_DIR=test-results
   ```

## Usage

### Basic Usage

```javascript
const { test } = require('@playwright/test');
const { TestRailRunner } = require('../utils/testrail');

test('Execute TestRail test case', async ({ page }) => {
  // Create TestRail runner
  const runner = new TestRailRunner({
    baseUrl: process.env.TESTRAIL_URL,
    username: process.env.TESTRAIL_USERNAME,
    apiKey: process.env.TESTRAIL_API_KEY,
    projectId: parseInt(process.env.TESTRAIL_PROJECT_ID, 10),
    suiteId: parseInt(process.env.TESTRAIL_SUITE_ID, 10),
    runNamePrefix: process.env.TESTRAIL_RUN_PREFIX,
    artifactsDir: process.env.TESTRAIL_ARTIFACTS_DIR,
    reportDir: process.env.TESTRAIL_REPORT_DIR,
    resultsDir: process.env.TESTRAIL_RESULTS_DIR
  });
  
  // TestRail case ID to execute
  const testCaseId = parseInt(process.env.TESTRAIL_CASE_ID, 10);
  
  try {
    // Start test and get test case details
    const { testCase, steps } = await runner.startTest(testCaseId);
    
    // Execute test steps
    for (const step of steps) {
      // Implement step execution logic
      // ...
    }
    
    // End test with success
    await runner.endTest(page, true, 'Test passed');
  } catch (error) {
    // End test with failure
    await runner.endTest(page, false, `Test failed: ${error.message}`);
    throw error;
  }
});
```

### Running Tests

To run a test that integrates with TestRail:

```bash
npx playwright test src/tests/testrail-example.spec.js
```

## Components

### TestRailClient

Low-level client for interacting with the TestRail API.

```javascript
const { TestRailClient } = require('../utils/testrail');

const client = new TestRailClient({
  baseUrl: 'https://yourcompany.testrail.io',
  username: 'your.email@example.com',
  apiKey: 'your_api_key',
  projectId: 1
});

// Get test case
const testCase = await client.getCase(1);

// Get test case steps
const steps = await client.getCaseSteps(1);

// Create test run
const run = await client.addRun('Automated Run', [1, 2, 3], 2); // With suite ID

// Add test result
const result = await client.addResultForCase(run.id, 1, 1, 'Test passed');

// Add attachment to result
await client.addAttachmentToResult(result.id, 'screenshot.png');
```

### TestRailIntegration

Mid-level integration for managing test runs and results.

```javascript
const { TestRailIntegration } = require('../utils/testrail');

const integration = new TestRailIntegration({
  baseUrl: 'https://yourcompany.testrail.io',
  username: 'your.email@example.com',
  apiKey: 'your_api_key',
  projectId: 1,
  suiteId: 2,
  artifactsDir: './artifacts/testrail'
});

// Create test run
const runId = await integration.createRun('Automated Run', [1, 2, 3]);

// Update test result
await integration.updateResult(1, TestRailIntegration.STATUS.PASSED, 'Test passed');

// Capture screenshot
const screenshotPath = await integration.captureScreenshot(page, 'test-pass');
```

### TestRailRunner

High-level runner for executing tests based on TestRail test cases.

```javascript
const { TestRailRunner } = require('../utils/testrail');

const runner = new TestRailRunner({
  baseUrl: 'https://yourcompany.testrail.io',
  username: 'your.email@example.com',
  apiKey: 'your_api_key',
  projectId: 1,
  suiteId: 2,
  runNamePrefix: 'Custom Run',
  reportDir: 'custom-reports',
  resultsDir: 'custom-results'
});

// Start test with custom run name
const { testCase, steps } = await runner.startTest(1, 'My Custom Run Name');

// End test with additional artifacts
await runner.endTest(page, true, 'Test passed', ['path/to/custom/artifact.log']);
```

## Test Case Structure in TestRail

For best results, structure your TestRail test cases with clear steps:

1. Use the "Test Steps" field in TestRail
2. Each step should have:
   - **Step**: Clear action to perform (e.g., "Click on Login button")
   - **Expected Result**: Expected outcome (e.g., "User is logged in")

## Status Mapping

TestRail statuses are mapped as follows:

- **Passed (1)**: Test passed
- **Failed (5)**: Test failed
- **Blocked (2)**: Test was blocked
- **Untested (3)**: Test was not executed
- **Retest (4)**: Test needs to be retested

## Artifacts

The following artifacts can be attached to test results:

- Screenshots
- HTML reports
- Trace files
- Videos

## Best Practices

1. **Step Descriptions**: Write clear, actionable step descriptions in TestRail
2. **Expected Results**: Include specific expected results for each step
3. **Test Data**: Use environment variables or fixtures for test data
4. **Error Handling**: Implement proper error handling to ensure results are reported correctly
5. **Screenshots**: Take screenshots at key points during test execution