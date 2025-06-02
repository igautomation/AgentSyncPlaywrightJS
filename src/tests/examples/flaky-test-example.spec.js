/**
 * Example of using flaky test annotations and quarantine
 */
const { test, expect } = require('@playwright/test');

// Example of a test that's marked as flaky
test('flaky test with annotation', {
  annotation: { type: 'flaky', description: 'This test is known to be flaky' },
  retries: 3 // Retry flaky tests more times
}, async ({ page }) => {
  await page.goto('https://example.com');
  
  // Make this test always pass for demonstration purposes
  expect(await page.title()).toContain('Example');
});

// Example of a test that will be auto-quarantined if it fails intermittently
test('test that might be quarantined automatically', async ({ page }) => {
  await page.goto('https://example.com');
  
  // Make this test always pass for demonstration purposes
  expect(await page.title()).toContain('Example');
});

// Example of manually skipping a potentially flaky test
test('manually skipped test if needed', async ({ page }) => {
  // Skip test if needed
  // test.skip('Test is quarantined');
  
  await page.goto('https://example.com');
  expect(await page.title()).toContain('Example');
});