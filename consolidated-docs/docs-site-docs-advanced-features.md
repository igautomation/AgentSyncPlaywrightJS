<!-- Source: /Users/mzahirudeen/playwright-framework-dev/docs-site/docs/advanced-features.md -->

---
sidebar_position: 5
title: Advanced Features
description: Advanced features of the Playwright test automation framework
---

# Advanced Features

This guide covers advanced features of our Playwright test automation framework.

## Visual Testing

Our framework supports visual comparison testing:

```javascript
const { VisualComparisonUtils } = require('../../utils/visual');

test('should match visual baseline', async ({ page }) => {
  // Create visual comparison utils
  const visualUtils = new VisualComparisonUtils(page);
  
  // Navigate to page
  await page.goto('https://example.com');
  
  // Take screenshot
  await visualUtils.captureScreenshot('homepage');
  
  // Compare with baseline
  const result = await visualUtils.compareScreenshots(
    './baselines/homepage.png',
    './screenshots/homepage.png',
    { threshold: 0.1 }
  );
  
  expect(result.matches).toBe(true);
  if (!result.matches) {
    console.log(`Mismatch percentage: ${result.mismatchPercentage}%`);
  }
});
```

## Accessibility Testing

Our framework includes accessibility testing capabilities:

```javascript
const { AccessibilityUtils } = require('../../utils/accessibility');

test('should pass accessibility checks', async ({ page }) => {
  // Create accessibility utils
  const a11yUtils = new AccessibilityUtils(page);
  
  // Navigate to page
  await page.goto('https://example.com');
  
  // Run accessibility analysis
  const results = await a11yUtils.analyzeAccessibility();
  
  // Check for violations
  expect(results.violations).toHaveLength(0);
  
  // Generate report
  if (results.violations.length > 0) {
    await a11yUtils.generateAccessibilityReport(
      results,
      './reports/accessibility-report.html'
    );
  }
});
```

## Data Generation

The framework includes utilities for generating test data:

```javascript
const { DataGenerator } = require('../../utils/data');

test('should create user with generated data', async ({ page }) => {
  // Generate user data
  const userData = DataGenerator.generateUser();
  
  // Use generated data in test
  await page.goto('/register');
  await page.fill('#firstName', userData.firstName);
  await page.fill('#lastName', userData.lastName);
  await page.fill('#email', userData.email);
  await page.fill('#phone', userData.phone);
  await page.click('#submit');
  
  // Verify success
  await expect(page.locator('.success-message')).toBeVisible();
});
```

## Test Parameterization

Our framework supports parameterized tests:

```javascript
const { test, expect } = require('@playwright/test');

// Test data
const testCases = [
  { username: 'user1', password: 'pass1', isValid: true },
  { username: 'user2', password: 'pass2', isValid: true },
  { username: 'invalid', password: 'wrong', isValid: false }
];

for (const { username, password, isValid } of testCases) {
  test(`Login with ${username} should ${isValid ? 'succeed' : 'fail'}`, async ({ page }) => {
    await page.goto('/login');
    await page.fill('#username', username);
    await page.fill('#password', password);
    await page.click('#login-button');
    
    if (isValid) {
      await expect(page).toHaveURL('/dashboard');
    } else {
      await expect(page.locator('.error-message')).toBeVisible();
    }
  });
}
```

## API Mocking

Our framework supports API mocking:

```javascript
const { test, expect } = require('@playwright/test');

test('should display user data from mocked API', async ({ page }) => {
  // Mock API response
  await page.route('**/api/users/*', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 1,
        name: 'John Doe',
        email: 'john@example.com'
      })
    });
  });
  
  // Navigate to page that calls the API
  await page.goto('/user/1');
  
  // Verify mocked data is displayed
  await expect(page.locator('.user-name')).toHaveText('John Doe');
  await expect(page.locator('.user-email')).toHaveText('john@example.com');
});
```

## Network Interception

Our framework supports network interception:

```javascript
const { test, expect } = require('@playwright/test');

test('should intercept network requests', async ({ page }) => {
  // Track API calls
  const apiCalls = [];
  
  // Intercept all API requests
  await page.route('**/api/**', route => {
    const url = route.request().url();
    const method = route.request().method();
    apiCalls.push({ url, method });
    route.continue();
  });
  
  // Navigate to page
  await page.goto('/dashboard');
  
  // Perform actions that trigger API calls
  await page.click('#refresh-data');
  
  // Verify API calls
  expect(apiCalls.length).toBeGreaterThan(0);
  expect(apiCalls.some(call => call.url.includes('/api/users'))).toBe(true);
});
```

## Database Integration

Our framework supports database integration:

```javascript
const { test, expect } = require('@playwright/test');
const { DatabaseUtils } = require('../../utils/database');

test('should verify data in database', async ({ page }) => {
  // Create database utils
  const dbUtils = new DatabaseUtils({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  });
  
  // Connect to database
  await dbUtils.connect();
  
  // Create test data
  const userId = await dbUtils.executeQuery(
    'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id',
    ['Test User', 'test@example.com']
  ).then(result => result.rows[0].id);
  
  try {
    // Navigate to user page
    await page.goto(`/users/${userId}`);
    
    // Verify user data is displayed
    await expect(page.locator('.user-name')).toHaveText('Test User');
    await expect(page.locator('.user-email')).toHaveText('test@example.com');
  } finally {
    // Clean up test data
    await dbUtils.executeQuery('DELETE FROM users WHERE id = $1', [userId]);
    
    // Close connection
    await dbUtils.disconnect();
  }
});
```

## Parallel Testing

Our framework supports parallel test execution:

```javascript
// playwright.config.js
module.exports = defineConfig({
  // Run tests in parallel
  fullyParallel: true,
  
  // Number of workers
  workers: process.env.CI ? 4 : undefined,
  
  // Projects for parallel execution
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    }
  ]
});
```

## Test Retries

Our framework supports test retries:

```javascript
// playwright.config.js
module.exports = defineConfig({
  // Retry failed tests
  retries: process.env.CI ? 2 : 0,
  
  // Trace on first retry
  use: {
    trace: 'on-first-retry'
  }
});
```

## Custom Reporters

Our framework supports custom reporters:

```javascript
// src/utils/reporting/customReporter.js
class CustomReporter {
  onBegin(config, suite) {
    console.log(`Starting the run with ${suite.allTests().length} tests`);
  }

  onTestBegin(test) {
    console.log(`Starting test: ${test.title}`);
  }

  onTestEnd(test, result) {
    console.log(`Finished test: ${test.title} with status ${result.status}`);
  }

  onEnd(result) {
    console.log(`Finished the run with status ${result.status}`);
  }
}

module.exports = CustomReporter;
```

Configure the custom reporter:

```javascript
// playwright.config.js
const { CustomReporter } = require('./src/utils/reporting/customReporter');

module.exports = defineConfig({
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
    ['./src/utils/reporting/customReporter.js']
  ]
});
```

## CI/CD Integration

Our framework supports CI/CD integration:

```javascript
// .github/workflows/playwright.yml
name: Playwright Tests

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: 18
        
    - name: Install dependencies
      run: npm ci
      
    - name: Install Playwright browsers
      run: npx playwright install --with-deps
      
    - name: Run tests
      run: npx playwright test
      
    - name: Upload test results
      if: always()
      uses: actions/upload-artifact@v3
      with:
        name: playwright-report
        path: playwright-report/
        retention-days: 30
```

## Mobile Testing

Our framework supports mobile testing:

```javascript
// playwright.config.js
module.exports = defineConfig({
  projects: [
    {
      name: 'Mobile Chrome',
      use: {
        ...devices['Pixel 5'],
      },
    },
    {
      name: 'Mobile Safari',
      use: {
        ...devices['iPhone 12'],
      },
    }
  ]
});
```

Mobile-specific tests:

```javascript
const { test, expect } = require('@playwright/test');

test('should display mobile menu', async ({ page, isMobile }) => {
  // Skip if not mobile
  test.skip(!isMobile, 'This test is only for mobile devices');
  
  await page.goto('/');
  
  // Check if hamburger menu is visible
  await expect(page.locator('.hamburger-menu')).toBeVisible();
  
  // Open mobile menu
  await page.click('.hamburger-menu');
  
  // Verify mobile menu is open
  await expect(page.locator('.mobile-menu')).toBeVisible();
});
```

## Performance Testing

Our framework supports performance testing:

```javascript
const { test, expect } = require('@playwright/test');
const { PerformanceUtils } = require('../../utils/performance');

test('should load page within performance budget', async ({ page }) => {
  // Create performance utils
  const perfUtils = new PerformanceUtils(page);
  
  // Start measuring
  await perfUtils.startMeasuring();
  
  // Navigate to page
  await page.goto('https://example.com');
  
  // Stop measuring
  const metrics = await perfUtils.stopMeasuring();
  
  // Verify performance metrics
  expect(metrics.firstContentfulPaint).toBeLessThan(1000);
  expect(metrics.largestContentfulPaint).toBeLessThan(2500);
  expect(metrics.cumulativeLayoutShift).toBeLessThan(0.1);
  
  // Generate performance report
  await perfUtils.generatePerformanceReport(
    metrics,
    './reports/performance-report.html'
  );
});
```

## Geolocation Testing

Our framework supports geolocation testing:

```javascript
const { test, expect } = require('@playwright/test');

test('should show content based on location', async ({ browser }) => {
  // Create context with geolocation
  const context = await browser.newContext({
    geolocation: {
      latitude: 40.7128,
      longitude: -74.0060
    },
    permissions: ['geolocation']
  });
  
  // Create page
  const page = await context.newPage();
  
  // Navigate to page
  await page.goto('https://example.com');
  
  // Verify location-specific content
  await expect(page.locator('.location-info')).toContainText('New York');
});
```

## Internationalization Testing

Our framework supports internationalization testing:

```javascript
const { test, expect } = require('@playwright/test');

// Test with different locales
const locales = ['en-US', 'fr-FR', 'ja-JP'];

for (const locale of locales) {
  test(`should display content in ${locale}`, async ({ browser }) => {
    // Create context with locale
    const context = await browser.newContext({
      locale
    });
    
    // Create page
    const page = await context.newPage();
    
    // Navigate to page
    await page.goto('https://example.com');
    
    // Verify locale-specific content
    if (locale === 'en-US') {
      await expect(page.locator('h1')).toHaveText('Welcome');
    } else if (locale === 'fr-FR') {
      await expect(page.locator('h1')).toHaveText('Bienvenue');
    } else if (locale === 'ja-JP') {
      await expect(page.locator('h1')).toHaveText('ようこそ');
    }
  });
}