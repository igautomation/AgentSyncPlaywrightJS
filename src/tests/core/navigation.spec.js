/**
 * Navigation Tests
 */
const { test, expect } = require('@playwright/test');

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Use a reliable test site
    await page.goto('https://the-internet.herokuapp.com/');
  });

  test('should navigate to Checkboxes page', async ({ page }) => {
    // Click on Checkboxes link
    await page.click('a[href="/checkboxes"]');
    
    // Verify navigation
    await expect(page).toHaveURL(/.*\/checkboxes/);
    await expect(page.locator('h3')).toContainText('Checkboxes');
  });

  test('should navigate to Dropdown page', async ({ page }) => {
    // Click on Dropdown link
    await page.click('a[href="/dropdown"]');
    
    // Verify navigation
    await expect(page).toHaveURL(/.*\/dropdown/);
    await expect(page.locator('h3')).toContainText('Dropdown List');
  });

  test('should navigate to Form Authentication page', async ({ page }) => {
    // Click on Form Authentication link
    await page.click('a[href="/login"]');
    
    // Verify navigation
    await expect(page).toHaveURL(/.*\/login/);
    await expect(page.locator('h2')).toContainText('Login Page');
  });

  test('should navigate back to home page', async ({ page }) => {
    // First navigate to another page
    await page.click('a[href="/checkboxes"]');
    await expect(page).toHaveURL(/.*\/checkboxes/);
    
    // Navigate back
    await page.goBack();
    
    // Verify we're back at the home page
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/');
    await expect(page.locator('h1')).toContainText('Welcome to the-internet');
  });
});