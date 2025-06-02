# Advanced Testing Features

This document describes the advanced testing features available in the Playwright Framework.

## Smart Rerun

Smart rerun allows you to retry failed tests with additional diagnostics to help identify and fix flaky tests.

### Usage

```javascript
// In your test file
const { test, expect } = require('@playwright/test');

test('my test', async ({ page }) => {
  // Your test code
});

// In your playwright.config.js
module.exports = defineConfig({
  retries: 2, // Number of retries for failed tests
  // Other configuration...
});
```

### Features

- Automatic retry of failed tests
- Collection of additional diagnostics on each retry
- Analysis of failure patterns
- Detailed reporting of retry attempts

## Auto-Wait and Flaky Locator Detection

The framework includes built-in support for automatically waiting for elements and detecting flaky locators.

### Usage

```javascript
const { test } = require('@playwright/test');
const { FlakyLocatorDetector } = require('@your-org/playwright-framework').utils.web;

test('detect flaky locators', async ({ page }) => {
  const detector = new FlakyLocatorDetector({}, page);
  
  // Track locator usage
  await detector.trackLocatorAction('button.submit', async (element) => {
    await element.click();
  });
  
  // Get flaky locators
  const flakyLocators = detector.getFlakyLocators();
  console.log('Flaky locators:', flakyLocators);
});
```

### Features

- Automatic waiting for elements with configurable timeouts
- Detection of flaky locators based on success/failure patterns
- Generation of alternative locators for flaky elements
- Reporting of flaky locators for further analysis

## Retry with Backoff

The framework provides a utility for retrying operations with exponential backoff to handle transient failures.

### Usage

```javascript
const { RetryWithBackoff } = require('@your-org/playwright-framework').utils.common;

test('retry with backoff', async ({ page }) => {
  const retry = new RetryWithBackoff({
    maxRetries: 5,
    initialDelay: 1000,
    backoffFactor: 2
  });
  
  await retry.execute(async () => {
    // Operation that might fail transiently
    await page.click('#flaky-button');
  });
});
```

### Features

- Configurable retry count
- Exponential backoff with jitter
- Customizable hooks for success, failure, and final failure
- Detailed logging of retry attempts

## Git Diff-Based Test Selection

This feature allows you to run only the tests that are affected by code changes in a PR, improving CI efficiency.

### Usage

```javascript
const { TestSelector } = require('@your-org/playwright-framework').utils.ci;

// In your CI script
const testSelector = new TestSelector();
const changedTests = testSelector.selectTestsByDiff('main', 'HEAD');

// Run only changed tests
console.log('Running tests:', changedTests);
```

### Features

- Selection of tests based on Git diffs
- Identification of tests affected by source code changes
- Integration with CI/CD pipelines
- Improved test execution efficiency

## Flaky Test Quarantine

The framework includes a system to track and isolate flaky tests to prevent them from affecting the main test suite.

### Usage

```javascript
// Use the quarantine fixtures
const { test, expect } = require('@your-org/playwright-framework').fixtures.quarantineFixtures;

// Mark a test as flaky
test('flaky test', {
  annotation: { type: 'flaky', description: 'This test is known to be flaky' },
  retry: 3
}, async ({ page }) => {
  // Test code
});

// Manually check if a test is quarantined
test('check quarantine', async ({ page, quarantineManager }) => {
  const testId = `${test.info().file}::check quarantine`;
  
  if (quarantineManager.isQuarantined(testId)) {
    test.skip('Test is quarantined');
    return;
  }
  
  // Test code
});
```

### Features

- Automatic tracking of test results
- Identification of flaky tests based on pass/fail patterns
- Automatic quarantining of flaky tests
- Annotations for flaky tests
- Reporting of quarantined tests