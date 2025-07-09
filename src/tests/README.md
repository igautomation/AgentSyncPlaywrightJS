# AgentSync Salesforce Test Suite

This directory contains a streamlined set of tests for the AgentSync Playwright Test Framework, focusing on real-time Salesforce sandbox testing without mocks. All tests are integrated with TestRail for reporting.

## Test Categories

### API Tests
- `api/salesforce-api-limits.spec.js` - Tests Salesforce API limits and record counts (TestRail cases C24151, C24152)
- `api/salesforce-api-objects.spec.js` - Tests Salesforce object metadata access (TestRail cases C24153, C24154)

### UI Tests
- `ui/salesforce-login.spec.js` - Tests Salesforce login and saves authentication state (TestRail case C24155)
- `ui/salesforce-contact-view.spec.js` - Tests viewing and searching contacts in Salesforce UI (TestRail cases C24156, C24157)

### Salesforce Tests
- `salesforce/salesforce-apex.spec.js` - Tests Apex code execution (TestRail case C24158)
- `salesforce/salesforce-db.spec.js` - Tests database CRUD operations (TestRail case C24159)
- `salesforce/salesforce-soql.spec.js` - Tests SOQL query building and execution (TestRail case C24160)

## Running Tests

```bash
# Run all tests
npx playwright test

# Run specific test categories
npx playwright test src/tests/api
npx playwright test src/tests/ui
npx playwright test src/tests/salesforce

# Run a specific test file
npx playwright test src/tests/api/salesforce-api-limits.spec.js
```

## Environment Configuration

These tests use the `.env.unified` and `.env.salesforce` configuration files for credentials and settings. Make sure these files are properly configured before running the tests.

### TestRail Configuration

The following environment variables are required for TestRail integration:

```
TESTRAIL_URL=https://agentsync.testrail.io
TESTRAIL_USERNAME=your_username
TESTRAIL_API_KEY=your_api_key
TESTRAIL_PROJECT_ID=18
TESTRAIL_SUITE_ID=412
```

These are already configured in the `.env.unified` file.

## Authentication

UI tests require authentication state to be saved. Run the login test first:

```bash
npx playwright test src/tests/ui/salesforce-login.spec.js
```

This will create the necessary authentication state file in the `auth` directory.

## Test Results

All test results are automatically uploaded to TestRail at the end of each test run. You can view the results in the TestRail dashboard.