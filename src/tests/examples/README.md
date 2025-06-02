# Example Tests

This directory contains example tests that demonstrate various features of the Playwright framework.

## Flaky Test Example

The `flaky-test-example.spec.js` file demonstrates how to handle flaky tests:

1. **Test with Flaky Annotation**: Shows how to mark a test as flaky and configure retries.
2. **Auto-Quarantine Test**: Demonstrates a test that could be automatically quarantined if it fails intermittently.
3. **Manual Skip Example**: Shows how to manually skip a test when needed.

### Original Implementation

The original implementation included random failures to demonstrate the quarantine system:

```javascript
// This will pass sometimes and fail sometimes
const randomValue = Math.random();
expect(randomValue).toBeLessThan(0.7); // 70% pass rate
```

### Current Implementation

For demonstration purposes, the tests have been modified to always pass:

```javascript
// Make this test always pass for demonstration purposes
expect(await page.title()).toContain('Example');
```

## How to Demonstrate Flaky Tests

To demonstrate the flaky test behavior:

1. Modify the tests to include random failures again:

```javascript
// This will pass sometimes and fail sometimes
const randomValue = Math.random();
expect(randomValue).toBeLessThan(0.7); // 70% pass rate
```

2. Run the tests multiple times:

```bash
npx playwright test src/tests/examples --repeat-each=5
```

3. Observe how the quarantine system tracks the flaky tests.

## Advanced Testing Features

These examples demonstrate the following advanced testing features:

- **Smart Rerun**: Using test.retries to retry flaky tests
- **Flaky Test Annotations**: Marking tests as known flaky
- **Quarantine System**: Tracking and isolating flaky tests