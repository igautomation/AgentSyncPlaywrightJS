---
sidebar_position: 2
title: Getting Started
description: Getting started with the Playwright test automation framework
---

# Getting Started

This guide will help you get started with our Playwright test automation framework.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 18.0 or higher
- **npm** or **yarn**: For package management
- **Git**: For version control

## Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-org/playwright-framework.git
cd playwright-framework
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Install Browsers

```bash
npx playwright install
```

This will install the browser binaries needed by Playwright (Chromium, Firefox, and WebKit).

## Configuration

### Environment Setup

Create a `.env` file in the root directory with your environment-specific configuration:

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

# API settings
API_BASE_URL=https://api.example.com
API_KEY=your_api_key
```

### Playwright Configuration

The framework uses a `playwright.config.js` file for configuration:

```javascript
// playwright.config.js
const { defineConfig, devices } = require('@playwright/test');
require('dotenv').config();

module.exports = defineConfig({
  testDir: './src/tests',
  timeout: 60 * 1000,
  expect: {
    timeout: 10000
  },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { open: 'never' }],
    ['list']
  ],
  use: {
    actionTimeout: 30000,
    baseURL: process.env.BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: ['**/salesforce/**']
    },
    {
      name: 'salesforce',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /.*salesforce.*\.spec\.js/
    }
  ],
});
```

## Writing Your First Test

### Basic Test Structure

Create a new test file in the `src/tests` directory:

```javascript
// src/tests/example.spec.js
const { test, expect } = require('@playwright/test');

test.describe('Example Tests', () => {
  test('should navigate to Playwright website', async ({ page }) => {
    // Navigate to the page
    await page.goto('https://playwright.dev/');
    
    // Verify page title
    const title = await page.title();
    expect(title).toContain('Playwright');
    
    // Verify content
    await expect(page.locator('text=Playwright').first()).toBeVisible();
  });
});
```

### Using Page Objects

Create a page object:

```javascript
// src/pages/PlaywrightPage.js
class PlaywrightPage {
  constructor(page) {
    this.page = page;
    this.getStartedLink = page.locator('text=Get Started');
    this.docsLink = page.locator('text=Docs');
    this.apiLink = page.locator('text=API');
  }

  async goto() {
    await this.page.goto('https://playwright.dev/');
  }

  async clickGetStarted() {
    await this.getStartedLink.click();
  }

  async clickDocs() {
    await this.docsLink.click();
  }

  async clickApi() {
    await this.apiLink.click();
  }
}

module.exports = PlaywrightPage;
```

Use the page object in your test:

```javascript
// src/tests/playwright-site.spec.js
const { test, expect } = require('@playwright/test');
const PlaywrightPage = require('../pages/PlaywrightPage');

test.describe('Playwright Website', () => {
  let playwrightPage;

  test.beforeEach(async ({ page }) => {
    playwrightPage = new PlaywrightPage(page);
    await playwrightPage.goto();
  });

  test('should navigate to Get Started page', async ({ page }) => {
    await playwrightPage.clickGetStarted();
    await expect(page).toHaveURL(/.*\/docs\/intro/);
  });

  test('should navigate to Docs page', async ({ page }) => {
    await playwrightPage.clickDocs();
    await expect(page).toHaveURL(/.*\/docs\//);
  });

  test('should navigate to API page', async ({ page }) => {
    await playwrightPage.clickApi();
    await expect(page).toHaveURL(/.*\/docs\/api\//);
  });
});
```

## Running Tests

### Run All Tests

```bash
npx playwright test
```

### Run a Specific Test File

```bash
npx playwright test src/tests/example.spec.js
```

### Run Tests with a Specific Tag

```bash
npx playwright test --grep @smoke
```

### Run Tests in a Specific Project

```bash
npx playwright test --project=salesforce
```

### Run Tests in Debug Mode

```bash
npx playwright test --debug
```

### Run Tests in UI Mode

```bash
npx playwright test --ui
```

## Viewing Test Reports

### HTML Report

After running tests, you can view the HTML report:

```bash
npx playwright show-report
```

### Trace Viewer

If you've enabled trace recording, you can view traces:

```bash
npx playwright show-trace trace.zip
```

## Using Fixtures

### Creating a Custom Fixture

```javascript
// src/fixtures/custom-fixtures.js
const base = require('@playwright/test');

const test = base.test.extend({
  // Page fixture with custom setup
  customPage: async ({ page }, use) => {
    // Setup
    await page.goto('https://example.com');
    
    // Use in test
    await use(page);
    
    // Cleanup
    // ...
  },
  
  // Data fixture
  testData: async ({}, use) => {
    const data = {
      username: 'testuser',
      password: 'password123'
    };
    
    await use(data);
  }
});

module.exports = { test, expect: base.expect };
```

### Using Custom Fixtures

```javascript
// src/tests/custom-fixture.spec.js
const { test, expect } = require('../fixtures/custom-fixtures');

test('should use custom page fixture', async ({ customPage }) => {
  // customPage is already navigated to https://example.com
  await expect(customPage).toHaveURL('https://example.com/');
});

test('should use test data fixture', async ({ testData }) => {
  expect(testData.username).toBe('testuser');
  expect(testData.password).toBe('password123');
});
```

## Using Utilities

### Web Interactions

```javascript
const { WebInteractions } = require('../utils/web');

test('should use web interactions', async ({ page }) => {
  const webInteractions = new WebInteractions(page);
  
  await webInteractions.goto('https://example.com');
  await webInteractions.waitForElement('#username');
  await webInteractions.fill('#username', 'testuser');
  await webInteractions.fill('#password', 'password123');
  await webInteractions.click('#login-button');
  
  const isVisible = await webInteractions.verifyText('Welcome');
  expect(isVisible).toBe(true);
});
```

### API Client

```javascript
const { ApiClient } = require('../utils/api');

test('should use API client', async () => {
  const apiClient = new ApiClient({
    baseUrl: 'https://api.example.com'
  });
  
  const response = await apiClient.get('/users');
  expect(response.data).toBeInstanceOf(Array);
});
```

## Next Steps

Now that you've set up the framework and written your first tests, you can explore more advanced features:

- [API Testing](./api-testing.md)
- [Salesforce Integration](./salesforce-integration.md)
- Advanced Features
- Accessibility Testing