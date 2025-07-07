# TestRail Integration for Salesforce Tests

## Configuration

### Environment Variables
```bash
TESTRAIL_URL=https://agentsync.testrail.io/index.php?
TESTRAIL_USERNAME=cnmuhammad.ghouseimran@agentsync.io
TESTRAIL_PASSWORD=MyPass@2025
TESTRAIL_PROJECT_ID=1
TESTRAIL_SUITE_ID=1
```

## Features

✅ **Automatic Test Run Creation** - Creates new test run for each execution  
✅ **Real-time Result Updates** - Updates TestRail with pass/fail status  
✅ **Detailed Comments** - Includes test execution details and error messages  
✅ **Test Case Mapping** - Maps Playwright tests to TestRail cases  
✅ **Error Handling** - Graceful fallback if TestRail is unavailable  

## Test Cases Included

| Test Case | TestRail ID | Description |
|-----------|-------------|-------------|
| C1 | 1 | Salesforce Login Test |
| C2 | 2 | Salesforce API Record Count Test |
| C3 | 3 | Salesforce Contact Navigation Test |

## Usage

### Run Salesforce Tests with TestRail Integration
```bash
npm run test:salesforce:testrail
```

### Run All Salesforce Tests
```bash
npm run test:salesforce
```

## TestRail Status Mapping

- **1** - Passed ✅
- **2** - Blocked 🚫
- **3** - Untested ⏸️
- **4** - Retest 🔄
- **5** - Failed ❌

## Test Execution Flow

1. **Before Tests** - Creates new test run in TestRail
2. **During Tests** - Executes Salesforce test scenarios
3. **After Each Test** - Updates TestRail with result and comments
4. **Test Results** - Available in both Playwright reports and TestRail

## Example Output

```
✅ Created TestRail run: 123
✅ Salesforce login test passed
📊 Updated TestRail case 1 with status 1
✅ Salesforce API test passed
📊 Updated TestRail case 2 with status 1
```

## Setup Requirements

1. **TestRail Account** - Access to AgentSync TestRail instance
2. **Test Cases** - Create corresponding test cases in TestRail
3. **Project/Suite IDs** - Update environment variables with correct IDs
4. **Case IDs** - Map test case IDs in the test file

The integration automatically handles test run creation, result reporting, and error handling for seamless TestRail integration.