/**
 * Authentication Tests
 */
const { test, expect } = require('@playwright/test');
require('dotenv').config({ path: '.env.dev' });

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Use a reliable test site
    const baseUrl = process.env.HEROKUAPP_URL || 'https://the-internet.herokuapp.com';
    await page.goto(`${baseUrl}/login`);
  });

  test('should login with valid credentials', async ({ page }) => {
    await page.fill('#username', 'tomsmith');
    await page.fill('#password', 'SuperSecretPassword!');
    await page.click('button[type="submit"]');
    
    // Verify successful login
    await expect(page.locator('.flash.success')).toBeVisible();
    await expect(page.locator('h2')).toContainText('Secure Area');
  });

  test('should show error with invalid credentials', async ({ page }) => {
    const invalidUsername = process.env.INVALID_USERNAME || 'invalid';
    const invalidPassword = process.env.INVALID_PASSWORD || 'invalid';
    
    await page.fill('#username', invalidUsername);
    await page.fill('#password', invalidPassword);
    await page.click('button[type="submit"]');
    
    // Verify error message
    await expect(page.locator('.flash.error')).toBeVisible();
  });

  test('should require username and password', async ({ page }) => {
    // Click login without entering credentials
    await page.click('button[type="submit"]');
    
    // Verify error message
    await expect(page.locator('.flash.error')).toBeVisible();
  });
});