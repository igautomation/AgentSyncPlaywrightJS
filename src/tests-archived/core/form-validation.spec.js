/**
 * Form Validation Tests
 */
const { test, expect } = require('@playwright/test');
require('dotenv').config({ path: '.env.dev' });

test.describe('Form Validation', () => {
  test.beforeEach(async ({ page }) => {
    // Use a reliable test site
    const baseUrl = process.env.HEROKUAPP_URL || 'https://the-internet.herokuapp.com';
    await page.goto(`${baseUrl}/login`);
  });

  test('should validate required fields', async ({ page }) => {
    // Click submit without filling required fields
    await page.click('button[type="submit"]');
    
    // Check for validation error message
    const flashError = page.locator('.flash.error');
    await expect(flashError).toBeVisible();
    await expect(flashError).toContainText('username');
  });

  test('should validate input format', async ({ page }) => {
    // For this test, we'll use a different approach since the login page doesn't validate email format
    // Instead, we'll check that an invalid username shows an error
    const invalidUsername = process.env.INVALID_USERNAME || 'invalid';
    const invalidPassword = process.env.INVALID_PASSWORD || 'invalid';
    
    await page.fill('#username', invalidUsername);
    await page.fill('#password', invalidPassword);
    await page.click('button[type="submit"]');
    
    // Check for validation error
    const flashError = page.locator('.flash.error');
    await expect(flashError).toBeVisible();
    await expect(flashError).toContainText('invalid');
  });

  test('should accept valid form submission', async ({ page }) => {
    // Fill form with valid data
    await page.fill('#username', 'tomsmith');
    await page.fill('#password', 'SuperSecretPassword!');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Verify submission was successful
    const flashSuccess = page.locator('.flash.success');
    await expect(flashSuccess).toBeVisible();
    await expect(flashSuccess).toContainText('logged into');
    await expect(page.locator('h2')).toContainText('Secure Area');
  });
});