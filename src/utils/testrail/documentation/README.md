# TestRail Utilities

Clean and organized TestRail utilities for test automation integration.

## Core Utilities (Recommended)

### TestRailCore
Main utility class with essential TestRail operations.

```javascript
const { TestRailCore } = require('../utils/testrail');

const testRail = new TestRailCore();
const run = await testRail.createTestRun('My Test Run');
await testRail.addTestResults(run.id, results);
await testRail.closeTestRun(run.id);
```

### TestRailAPI
Low-level API client for direct TestRail API access.

```javascript
const { TestRailAPI } = require('../utils/testrail');

const api = new TestRailAPI();
const projects = await api.getProjects();
const cases = await api.getCases(projectId, suiteId);
```

## File Structure

```
src/utils/testrail/
├── testrailCore.js            # Main utility (recommended)
├── testrail-api.js            # Low-level API client
├── index.js                   # Main exports
├── README.md                  # This file
│
├── Specialized:
├── automated-test-runner.js   # Automated test execution
├── test-case-id-manager.js    # Test case ID management
├── report-uploader.js         # Report upload utilities
│
├── Legacy Files (backward compatibility):
├── testrail-helper.js         # Helper utilities
├── testrail-uploader.js       # Upload utilities
├── simple-testrail-reporter.js # Simple reporter
├── test-case-fetcher.js       # Test case fetching
├── test-case-manager.js       # Test case management
└── result-uploader.js         # Result upload utilities
```

## Usage Examples

### Basic Test Run Management
```javascript
const { TestRailCore } = require('../utils/testrail');

const testRail = new TestRailCore();

// Create test run
const run = await testRail.createTestRun('API Tests', 'Automated API testing');

// Add test results
const results = [
  { case_id: 123, status_id: 1, comment: 'Test passed' },
  { case_id: 124, status_id: 5, comment: 'Test failed' }
];
await testRail.addTestResults(run.id, results);

// Upload Playwright report
await testRail.uploadReportToRun(run.id, './playwright-report/index.html');

// Close test run
await testRail.closeTestRun(run.id);
```

### Complete Test Execution
```javascript
const { TestRailCore } = require('../utils/testrail');

const testRail = new TestRailCore();

// Execute complete test run with all features
const runId = await testRail.executeTestRun(
  testResults,
  'Automated Test Execution',
  {
    description: 'Full test suite execution',
    uploadReport: true,
    uploadArtifacts: true,
    closeRun: true
  }
);
```

### Test Case Management
```javascript
const { TestRailCore } = require('../utils/testrail');

const testRail = new TestRailCore();

// Get test cases
const cases = await testRail.getTestCases();

// Generate unique test case IDs
const newIds = await testRail.generateUniqueTestCaseIds(5);

// Create test case
const testCase = await testRail.createTestCase(sectionId, {
  title: 'New Test Case',
  priority_id: 2,
  type_id: 1
});
```

### Status Helpers
```javascript
const { TestRailCore } = require('../utils/testrail');

const testRail = new TestRailCore();

// Convert status string to ID
const statusId = testRail.getStatusId('passed'); // Returns 1

// Format test result
const result = testRail.formatResult({
  caseId: 123,
  status: 'passed',
  comment: 'Test completed successfully',
  duration: 5000
});
```

## Environment Variables

```bash
# Required
TESTRAIL_URL=https://your-company.testrail.io
TESTRAIL_USERNAME=your-email@company.com
TESTRAIL_API_KEY=your-api-key
TESTRAIL_PROJECT_ID=1
TESTRAIL_SUITE_ID=1
```

## Status IDs

TestRail uses numeric status IDs:
- `1` - Passed
- `2` - Blocked  
- `3` - Untested
- `4` - Retest
- `5` - Failed

## Migration Guide

### From Legacy to Core

**Old:**
```javascript
const TestRailUploader = require('../utils/testrail/testrail-uploader');
const uploader = new TestRailUploader();
```

**New:**
```javascript
const { TestRailCore } = require('../utils/testrail');
const testRail = new TestRailCore();
```

### Benefits of Core Utilities

1. **Simplified API**: Cleaner method names and structure
2. **Better Error Handling**: Consistent error management
3. **Built-in Helpers**: Status mapping and result formatting
4. **File Management**: Automatic report and artifact uploads
5. **Backward Compatibility**: Legacy utilities still available

## Best Practices

1. Use `TestRailCore` for new implementations
2. Use `TestRailAPI` for direct API access when needed
3. Keep legacy utilities for existing integrations
4. Always close test runs after completion
5. Upload reports and artifacts for better traceability
6. Use meaningful test run names and descriptions

## Common Patterns

### Playwright Integration
```javascript
test.afterAll(async () => {
  if (testResults.length > 0) {
    const { TestRailCore } = require('../utils/testrail');
    const testRail = new TestRailCore();
    
    await testRail.executeTestRun(
      testResults,
      `Test Run - ${new Date().toISOString()}`
    );
  }
});
```

### Result Collection
```javascript
const testResults = [];

test('My Test', async () => {
  let status = 'passed';
  let comment = 'Test completed successfully';
  
  try {
    // Test logic here
  } catch (error) {
    status = 'failed';
    comment = error.message;
    throw error;
  } finally {
    testResults.push({
      case_id: 123,
      status_id: testRail.getStatusId(status),
      comment: comment
    });
  }
});
```