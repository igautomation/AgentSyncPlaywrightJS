# AgentSync Playwright Test Framework

A comprehensive test automation framework built with Playwright for end-to-end testing of web applications, APIs, and Salesforce.

## Table of Contents

- [User Guide](#user-guide)
  - [Getting Started](#getting-started)
  - [Running Tests](#running-tests)
  - [Working with Salesforce](#working-with-salesforce)
  - [Test Reports](#test-reports)
  - [Common Workflows](#common-workflows)
- [Technical Guide](#technical-guide)
  - [Framework Architecture](#framework-architecture)
  - [Core Components](#core-components)
  - [Salesforce Integration](#salesforce-integration)
  - [TestRail Integration](#testrail-integration)
  - [CI/CD Integration](#cicd-integration)
  - [Extending the Framework](#extending-the-framework)
  - [Best Practices](#best-practices)

## User Guide

### Getting Started

#### Prerequisites

- Node.js 16 or higher
- npm or yarn
- Git

#### Installation

```bash
# Clone the repository
git clone <repository-url>
cd AgentSyncProfessionalServicesDelivery

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials
```

#### Environment Setup

The framework uses environment variables for configuration. Create a `.env` file based on the `.env.example` template:

```
# Base Configuration
BASE_URL=https://your-app-url.com
TEST_ENV=dev

# Salesforce Configuration
SF_USERNAME=your.username@example.com
SF_PASSWORD=your-password
SF_SECURITY_TOKEN=your-security-token
SF_LOGIN_URL=https://login.salesforce.com
SF_INSTANCE_URL=https://your-instance.salesforce.com

# TestRail Configuration (if used)
TESTRAIL_URL=https://your-instance.testrail.io
TESTRAIL_USERNAME=your-username
TESTRAIL_API_KEY=your-api-key
TESTRAIL_PROJECT_ID=1
TESTRAIL_SUITE_ID=1
```

For Salesforce-specific testing, you can use the `.env.salesforce` file.

### Running Tests

The framework provides various npm scripts to run different types of tests:

```bash
# Run all tests
npm test

# Run tests with UI mode
npx playwright test --ui

# Run specific test types
npm run test:api            # API tests
npm run test:e2e            # End-to-end tests
npm run test:accessibility  # Accessibility tests
npm run test:salesforce     # Salesforce tests

# Run tests in headed mode
npx playwright test --headed

# View test reports
npm run report
```

#### Test Categories

- **API Tests**: Located in `src/tests/api/`, these tests validate API endpoints and responses
- **UI Tests**: Located in `src/tests/ui/`, these tests validate user interface functionality
- **Salesforce Tests**: Located in `src/tests/salesforce/`, these tests are specific to Salesforce functionality
- **Integration Tests**: Located in `src/tests/integration/`, these tests validate integrated components

### Working with Salesforce

#### Salesforce Authentication Setup

Before running Salesforce tests, you need to set up authentication:

```bash
# Create auth directory if it doesn't exist
mkdir -p auth

# Set up Salesforce authentication state
npm run setup:salesforce
```

This will create a storage state file in the `auth` directory that contains authentication cookies for subsequent tests.

#### Running Salesforce Tests

```bash
# Run all Salesforce tests
npm run test:salesforce

# Run Salesforce tests with UI mode
npm run test:salesforce:ui

# Run Salesforce tests in headed mode
npm run test:salesforce:headed

# Run Salesforce tests with debugging
npm run test:salesforce:debug
```

#### Salesforce Page Objects

The framework uses a Page Object Model for Salesforce testing. Page objects are located in `src/pages/salesforce/` and include:

- `LoginPage.js`: Handles Salesforce login functionality
- `AppLauncherPage.js`: Handles navigation through the Salesforce App Launcher
- `ContactPage.js`: Handles Contact object operations
- `BaseSalesforcePage.js`: Base class with common Salesforce functionality

### Test Reports

After running tests, reports are generated in multiple formats:

- **HTML Report**: View with `npm run report`
- **JUnit XML**: Available at `reports/junit-results.xml`
- **JSON Report**: Available at `reports/test-results.json`

For Salesforce-specific results:
- **Salesforce JSON**: Available at `reports/salesforce-results.json`
- **Salesforce XML**: Available at `reports/salesforce-results.xml`

### Common Workflows

#### Creating a New Test

1. Identify the appropriate test category (API, UI, Salesforce)
2. Create a new test file in the corresponding directory
3. Use the existing test files as templates
4. Run the test to verify functionality

#### Debugging Tests

```bash
# Run tests in debug mode
npx playwright test --debug

# Run specific test file in debug mode
npx playwright test path/to/test.spec.js --debug
```

#### Working with TestRail

If your project uses TestRail for test case management:

```bash
# Run tests with TestRail integration
npm run test:testrail

# Run Salesforce tests with TestRail integration
npm run test:salesforce:testrail
```

## Technical Guide

### Framework Architecture

The framework follows a modular architecture:

```
AgentSyncProfessionalServicesDelivery/
├── src/                    # Source code
│   ├── cli/                # Command-line interface tools
│   ├── config/             # Configuration files
│   ├── core/               # Core framework functionality
│   ├── dashboard/          # Test dashboard components
│   ├── data/               # Test data files
│   ├── fixtures/           # Test fixtures
│   ├── helpers/            # Helper utilities
│   ├── pages/              # Page objects
│   │   └── salesforce/     # Salesforce page objects
│   ├── tests/              # Test files
│   │   ├── api/            # API tests
│   │   ├── ui/             # UI tests
│   │   ├── integration/    # Integration tests
│   │   └── salesforce/     # Salesforce tests
│   └── utils/              # Utility modules
│       ├── api/            # API testing utilities
│       ├── salesforce/     # Salesforce utilities
│       └── many others...  # Various utility modules
├── config/                 # Configuration files
├── docs/                   # Documentation
├── reports/                # Test reports
└── scripts/                # Helper scripts
```

### Core Components

#### Playwright Configuration

The framework uses Playwright's configuration system (`playwright.config.js`) to define:

- Test directories and patterns
- Browser configurations
- Reporting options
- Timeouts and retry strategies
- Project-specific settings

#### Page Object Model

The framework implements the Page Object Model pattern:

- **Base Page**: `src/pages/BasePage.js` provides common functionality
- **Specialized Pages**: Extend the base page for specific functionality
- **Component Objects**: Reusable UI components across pages

#### Test Fixtures

Custom fixtures in `src/fixtures/` provide:

- Preconfigured browser contexts
- Authentication helpers
- Data generation utilities
- API clients

### Salesforce Integration

#### Salesforce Authentication

The framework supports multiple authentication methods:

- Username/password authentication
- OAuth 2.0 authentication
- Session ID authentication

Authentication state is stored in `auth/salesforce-storage-state.json` for reuse across tests.

#### Salesforce API Utilities

Located in `src/utils/salesforce/core/salesforceApiUtils.js`, these utilities provide:

- SOQL query execution
- Record creation, retrieval, update, and deletion
- Bulk operations
- Custom API calls

#### Salesforce Locators

Located in `src/utils/salesforce/core/salesforceLocators.js`, this utility provides:

- Centralized selector management
- Self-healing locator strategies
- Dynamic locator generation
- Specialized Salesforce selectors

### TestRail Integration

The framework integrates with TestRail for test case management:

- Test case mapping in `src/utils/testrail/case-mapper.js`
- Result reporting in `src/utils/testrail/index.js`
- Suite management in `src/utils/testrail/specialized/`

### CI/CD Integration

#### GitHub Actions

The framework includes GitHub Actions workflows:

- **CI**: Main CI pipeline that runs validation and API tests
- **UI Tests**: Runs UI tests with TestRail integration
- **TestRail Integration**: Dedicated workflow for TestRail integration tests

#### Docker Support

Run tests in Docker for consistent execution environments:

```bash
# Build and run with Docker
docker-compose up

# Run specific tests
docker-compose run playwright npm run test:api
```

### Extending the Framework

#### Adding New Page Objects

1. Create a new file in `src/pages/` or the appropriate subdirectory
2. Extend the appropriate base page class
3. Implement page-specific methods and selectors

Example:

```javascript
const BasePage = require('./BasePage');

class NewFeaturePage extends BasePage {
  constructor(page) {
    super(page);
    this.featureButton = page.locator('#feature-button');
    this.featureInput = page.locator('#feature-input');
  }

  async useFeature(inputText) {
    await this.featureButton.click();
    await this.featureInput.fill(inputText);
    await this.page.keyboard.press('Enter');
  }
}

module.exports = NewFeaturePage;
```

#### Adding New Tests

1. Create a new test file in the appropriate directory
2. Import the necessary page objects and utilities
3. Define test cases using Playwright's test framework

Example:

```javascript
const { test, expect } = require('@playwright/test');
const NewFeaturePage = require('../../pages/NewFeaturePage');

test.describe('New Feature Tests', () => {
  test('should use the new feature successfully', async ({ page }) => {
    const featurePage = new NewFeaturePage(page);
    await featurePage.navigate();
    await featurePage.useFeature('test input');
    
    // Add assertions
    await expect(page.locator('.success-message')).toBeVisible();
  });
});
```

#### Adding Custom Utilities

1. Create a new utility file in the appropriate directory
2. Export functions or classes that provide the desired functionality
3. Import and use the utility in tests or other components

### Best Practices

#### Test Organization

- Group tests by functionality
- Use descriptive test names
- Separate UI, API, and integration tests
- Use test tags for categorization

#### Test Data Management

- Use fixtures for test data
- Avoid hardcoded test data
- Clean up test data after tests
- Use data generation utilities for dynamic data

#### Salesforce Testing

- Use the Page Object Model for UI interactions
- Use API calls for test data setup when possible
- Minimize UI interactions for test setup
- Handle Salesforce's dynamic IDs and components

#### Performance Optimization

- Run tests in parallel when possible
- Use API calls for setup and teardown
- Minimize browser restarts
- Use shared authentication states

#### Maintenance

- Keep selectors updated
- Review and update tests regularly
- Monitor test stability
- Document known issues and workarounds

## Additional Resources

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Salesforce API Documentation](https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/intro_what_is_rest_api.htm)
- [TestRail API Documentation](https://support.gurock.com/hc/en-us/articles/7077446652564-TestRail-API-Introduction)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)