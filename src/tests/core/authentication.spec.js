/**
 * Authentication Tests
 */
const { test, expect } = require('@playwright/test');

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Use a reliable test site
    await page.goto('https://the-internet.herokuapp.com/login');
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
    await page.fill('#username', 'invalid');
    await page.fill('#password', 'invalid');
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