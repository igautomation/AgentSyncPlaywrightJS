/**
 * Framework Validation Test
 */
const { test, expect } = require('@playwright/test');
require('dotenv').config({ path: '.env.dev' });

test.describe('Framework Validation', () => {
  test('Framework validation test', async ({ page }) => {
    // Navigate to Example website (more reliable than playwright.dev)
    const exampleUrl = process.env.EXAMPLE_URL || 'https://example.com/';
    await page.goto(exampleUrl);
    
    // Verify page title contains 'Example'
    const title = await page.title();
    expect(title).toContain('Example');
  });
});