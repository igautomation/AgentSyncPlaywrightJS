/**
 * Framework Validation Test
 */
const { test, expect } = require('@playwright/test');

test('Framework validation test', async ({ page }) => {
  // Navigate to Example website (more reliable than playwright.dev)
  await page.goto('https://example.com/');
  
  // Verify page title contains 'Example'
  const title = await page.title();
  expect(title).toContain('Example');
});