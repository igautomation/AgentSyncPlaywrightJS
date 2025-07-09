# Clean Salesforce Test Suite

This directory contains a streamlined set of tests for the AgentSync Playwright Test Framework, focusing on real-time Salesforce sandbox testing without mocks.

## Test Categories

### API Tests
- `api/salesforce-api-limits.spec.js` - Tests Salesforce API limits and record counts
- `api/salesforce-api-objects.spec.js` - Tests Salesforce object metadata access

### UI Tests
- `ui/salesforce-login.spec.js` - Tests Salesforce login and saves authentication state
- `ui/salesforce-contact-view.spec.js` - Tests viewing and searching contacts in Salesforce UI

### Salesforce Tests
- `salesforce/salesforce-apex.spec.js` - Tests Apex code execution
- `salesforce/salesforce-db.spec.js` - Tests database CRUD operations
- `salesforce/salesforce-soql.spec.js` - Tests SOQL query building and execution

## Running Tests

```bash
# Run all clean tests
npx playwright test src/tests/clean

# Run specific test categories
npx playwright test src/tests/clean/api
npx playwright test src/tests/clean/ui
npx playwright test src/tests/clean/salesforce

# Run a specific test file
npx playwright test src/tests/clean/api/salesforce-api-limits.spec.js
```

## Environment Configuration

These tests use the `.env.unified` and `.env.salesforce` configuration files for credentials and settings. Make sure these files are properly configured before running the tests.

## Authentication

UI tests require authentication state to be saved. Run the login test first:

```bash
npx playwright test src/tests/clean/ui/salesforce-login.spec.js
```

This will create the necessary authentication state file in the `auth` directory.