---
sidebar_position: 1
title: Playwright Framework Guide
description: Comprehensive guide to using the Playwright test automation framework
---

# Playwright Framework Guide

This guide provides a comprehensive overview of our enterprise-grade Playwright test automation framework, designed for scalable, maintainable, and reliable automated testing.

## Framework Architecture

Our framework follows a modular architecture with clear separation of concerns:

### Key Components

1. **Test Layer**: Contains test files organized by domain and functionality
2. **Page Object Layer**: Encapsulates page elements and actions
3. **Fixture Layer**: Provides reusable test contexts and setup/teardown
4. **Utility Layer**: Offers helper functions and specialized utilities
5. **Configuration Layer**: Manages environment-specific settings

### Directory Structure

```
playwright-framework/
├── src/
│   ├── fixtures/           # Test fixtures
│   │   ├── base-fixtures.js
│   │   ├── salesforce-fixtures.js
│   │   └── custom-fixtures.js
│   ├── pages/              # Page objects
│   │   ├── components/     # Reusable page components
│   │   ├── locators/       # Element locators
│   │   ├── orangehrm/      # OrangeHRM page objects
│   │   └── salesforce/     # Salesforce page objects
│   ├── tests/              # Test files
│   │   ├── accessibility/  # Accessibility tests
│   │   ├── api/            # API tests
│   │   ├── core/           # Core functionality tests
│   │   ├── integration/    # Integration tests
│   │   ├── reporting/      # Reporting tests
│   │   └── salesforce/     # Salesforce-specific tests
│   └── utils/              # Utility functions
│       ├── accessibility/  # Accessibility utilities
│       ├── api/            # API utilities
│       ├── common/         # Common utilities
│       ├── salesforce/     # Salesforce utilities
│       └── web/            # Web interaction utilities
├── config/                 # Configuration files
│   ├── environments/       # Environment-specific configs
│   └── playwright.config.js
├── auth/                   # Authentication state storage
├── reports/                # Test reports
└── temp/                   # Temporary files
```

## Installation and Setup

### Prerequisites

- Node.js 18.0 or higher
- npm or yarn
- Git

### Installation Steps

```bash
# Clone the repository
git clone https://github.com/your-org/playwright-framework.git

# Navigate to the project directory
cd playwright-framework

# Install dependencies
npm install

# Install browsers
npx playwright install
```

### Environment Configuration

Create a `.env` file in the root directory:

```
# Browser settings
HEADLESS=false
BROWSER=chromium
ACTION_TIMEOUT=30000

# Salesforce credentials
SF_USERNAME=your.username@example.com
SF_PASSWORD=your_password
SF_LOGIN_URL=https://login.salesforce.com
SF_INSTANCE_URL=https://your-instance.lightning.force.com
SF_ACCESS_TOKEN=your_access_token

# API settings
API_BASE_URL=https://api.example.com
API_KEY=your_api_key
```

## Running Tests

### Basic Commands

```bash
# Run all tests
npx playwright test

# Run specific test file
npx playwright test src/tests/salesforce/salesforce-login.spec.js

# Run tests with specific tag
npx playwright test --grep @smoke

# Run tests in specific project
npx playwright test --project=salesforce

# Run tests in debug mode
npx playwright test --debug
```

### Test Projects

The framework supports multiple test projects defined in `playwright.config.js`:

- **chromium**: Default project for Chrome browser tests
- **firefox**: Firefox browser tests
- **webkit**: Safari browser tests
- **salesforce**: Salesforce-specific tests
- **api**: API tests

### Test Tags

Use tags to categorize and selectively run tests:

```javascript
// In your test file
test('Login with valid credentials @smoke @auth', async ({ page }) => {
  // Test implementation
});
```

Then run specific tags:

```bash
npx playwright test --grep "@smoke"
```

## Core Framework Components

### Page Object Model

Our framework implements the Page Object Model pattern to create maintainable tests:

```javascript
// src/pages/salesforce/LoginPage.js
class LoginPage {
  constructor(page) {
    this.page = page;
    this.usernameInput = page.locator('#username');
    this.passwordInput = page.locator('#password');
    this.loginButton = page.locator('#Login');
    this.errorMessage = page.locator('#error');
  }

  async goto() {
    await this.page.goto('/');
  }

  async login(username, password) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async getErrorMessage() {
    return this.errorMessage.textContent();
  }
}

module.exports = LoginPage;
```

### Test Fixtures

Fixtures provide reusable setup and teardown logic:

```javascript
// src/fixtures/salesforce-fixtures.js
const base = require('@playwright/test');
const SalesforceSessionManager = require('../utils/salesforce/sessionManager');

const test = base.test.extend({
  // Session fixture - runs once per worker
  salesforceSession: [async ({}, use) => {
    const sessionManager = new SalesforceSessionManager();
    await sessionManager.ensureValidSession();
    await use(sessionManager);
  }, { scope: 'worker' }],
  
  // Page fixture - runs for each test
  salesforcePage: async ({ browser, salesforceSession }, use) => {
    const context = await browser.newContext({
      storageState: './auth/salesforce-storage-state.json'
    });
    const page = await context.newPage();
    await use(page);
    await page.close();
    await context.close();
  }
});

module.exports = { test, expect: base.expect };
```

### Web Interactions

Our `WebInteractions` class provides robust methods for interacting with web elements:

```javascript
// src/utils/web/webInteractions.js
class WebInteractions {
  constructor(page) {
    this.page = page;
    this.defaultTimeout = 30000;
  }

  async goto(url, options = {}) {
    await this.page.goto(url, options);
  }

  async waitForElement(selector, options = {}) {
    await this.page.waitForSelector(selector, {
      state: 'visible',
      timeout: options.timeout || this.defaultTimeout
    });
  }

  async fill(selector, value, options = {}) {
    await this.waitForElement(selector, options);
    await this.page.fill(selector, value);
  }

  async click(selector, options = {}) {
    await this.waitForElement(selector, options);
    await this.page.click(selector, options);
  }

  async verifyText(text, options = {}) {
    const locator = this.page.getByText(text, options);
    return await locator.isVisible({ timeout: options.timeout || this.defaultTimeout });
  }
}

module.exports = WebInteractions;
```

## Salesforce Integration

### Authentication

Our framework provides robust Salesforce authentication handling:

```javascript
// src/utils/salesforce/sessionManager.js
class SalesforceSessionManager {
  constructor(config = {}) {
    this.storageStatePath = config.storageStatePath || './auth/salesforce-storage-state.json';
    this.loginUrl = config.loginUrl || process.env.SF_LOGIN_URL;
    this.username = config.username || process.env.SF_USERNAME;
    this.password = config.password || process.env.SF_PASSWORD;
  }

  async hasValidSession() {
    // Check if storage state exists and is recent
    // ...implementation...
  }

  async createSession() {
    // Create a new session by logging in
    // ...implementation...
  }

  async ensureValidSession() {
    if (await this.hasValidSession()) {
      return true;
    }
    return await this.createSession();
  }
}

module.exports = SalesforceSessionManager;
```

### Salesforce API Utilities

Our `SalesforceApiUtils` class provides methods for interacting with Salesforce REST APIs:

```javascript
// src/utils/salesforce/salesforceApiUtils.js
class SalesforceApiUtils {
  constructor(config = {}) {
    this.instanceUrl = config.instanceUrl || process.env.SF_INSTANCE_URL;
    this.accessToken = config.accessToken || process.env.SF_ACCESS_TOKEN;
    this.apiVersion = config.apiVersion || 'v62.0';
  }

  async request(method, path, data = null, options = {}) {
    // Make API request
    // ...implementation...
  }

  async getLimits() {
    return this.request('GET', '/limits');
  }

  async describeGlobal() {
    return this.request('GET', '/sobjects');
  }

  async describeObject(objectName) {
    return this.request('GET', `/sobjects/${objectName}/describe`);
  }

  async query(soql) {
    return this.request('GET', `/query?q=${encodeURIComponent(soql)}`);
  }

  async createRecord(objectName, data) {
    return this.request('POST', `/sobjects/${objectName}`, data);
  }

  async updateRecord(objectName, recordId, data) {
    return this.request('PATCH', `/sobjects/${objectName}/${recordId}`, data);
  }

  async deleteRecord(objectName, recordId) {
    return this.request('DELETE', `/sobjects/${objectName}/${recordId}`);
  }

  async extractObjectMetadata(objectName, outputPath) {
    // Extract and save object metadata
    // ...implementation...
  }
}

module.exports = SalesforceApiUtils;
```

## API Testing

### API Client

Our framework includes a robust API client for testing REST APIs:

```javascript
// src/utils/api/apiClient.js
class ApiClient {
  constructor(config = {}) {
    this.baseUrl = config.baseUrl || process.env.API_BASE_URL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...config.headers
    };
  }

  async request(method, path, options = {}) {
    const url = `${this.baseUrl}${path}`;
    const headers = { ...this.defaultHeaders, ...options.headers };
    
    const response = await fetch(url, {
      method,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
      ...options
    });
    
    return this.handleResponse(response);
  }

  async get(path, options = {}) {
    return this.request('GET', path, options);
  }

  async post(path, body, options = {}) {
    return this.request('POST', path, { ...options, body });
  }

  async put(path, body, options = {}) {
    return this.request('PUT', path, { ...options, body });
  }

  async patch(path, body, options = {}) {
    return this.request('PATCH', path, { ...options, body });
  }

  async delete(path, options = {}) {
    return this.request('DELETE', path, options);
  }

  async handleResponse(response) {
    const contentType = response.headers.get('content-type');
    
    if (response.ok) {
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      return await response.text();
    }
    
    // Handle error responses
    const error = new Error(`API request failed with status ${response.status}`);
    error.status = response.status;
    error.response = response;
    
    throw error;
  }
}

module.exports = ApiClient;
```

### Schema Validation

Our framework includes JSON schema validation for API responses:

```javascript
// src/utils/api/schemaValidator.js
const Ajv = require('ajv');

class SchemaValidator {
  constructor() {
    this.ajv = new Ajv({ allErrors: true });
  }

  validate(schema, data) {
    const validate = this.ajv.compile(schema);
    const valid = validate(data);
    
    if (!valid) {
      return {
        valid: false,
        errors: validate.errors
      };
    }
    
    return { valid: true };
  }
}

module.exports = SchemaValidator;
```

## Best Practices

### Writing Maintainable Tests

1. **Use Page Objects**: Encapsulate page elements and actions in page objects
2. **Keep Tests Independent**: Each test should be able to run independently
3. **Use Descriptive Names**: Give tests and variables clear, descriptive names
4. **Minimize Duplication**: Use fixtures and helpers to avoid code duplication
5. **Handle Asynchronous Operations**: Use proper async/await patterns

### Handling Flaky Tests

1. **Add Retry Logic**: Configure retries for flaky tests
2. **Use Explicit Waits**: Wait for specific conditions instead of fixed timeouts
3. **Implement Self-Healing Locators**: Use multiple locator strategies
4. **Take Screenshots on Failure**: Capture screenshots when tests fail
5. **Use Trace Viewer**: Enable trace recording for detailed debugging

### Performance Optimization

1. **Reuse Authentication State**: Store and reuse authentication tokens
2. **Parallelize Tests**: Run tests in parallel when possible
3. **Use Test Sharding**: Distribute tests across multiple machines
4. **Optimize Resource Usage**: Close unused contexts and pages
5. **Minimize External Dependencies**: Mock external services when appropriate

## Troubleshooting

### Common Issues

1. **Authentication Failures**
   - Verify credentials in `.env` file
   - Check if session token is expired
   - Ensure proper permissions for the user

2. **Element Not Found**
   - Check if selectors are correct
   - Increase timeout values
   - Verify element is in the viewport

3. **Test Timeouts**
   - Check network connectivity
   - Increase test timeout in `playwright.config.js`
   - Add proper waits for asynchronous operations

### Debugging Techniques

1. **Use Debug Mode**:
   ```bash
   npx playwright test --debug
   ```

2. **Enable Verbose Logging**:
   ```bash
   DEBUG=pw:api npx playwright test
   ```

3. **Use Trace Viewer**:
   ```javascript
   // In playwright.config.js
   use: {
     trace: 'on-first-retry'
   }
   ```

4. **Inspect Network Traffic**:
   ```javascript
   // In your test
   await page.route('**/*', route => {
     console.log(`${route.request().method()} ${route.request().url()}`);
     route.continue();
   });
   ```

## Resources

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Salesforce API Documentation](https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/intro_what_is_rest_api.htm)
- [Framework GitHub Repository](https://github.com/your-org/playwright-framework)
- [Playwright Discord Community](https://discord.com/invite/playwright)