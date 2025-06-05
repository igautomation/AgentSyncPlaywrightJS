/**
 * OrangeHRM Specific Tests
 * 
 * These tests are specific to the OrangeHRM demo site and are skipped by default
 * due to site availability issues.
 */
const { test, expect } = require('@playwright/test');
const WebInteractions = require('../../utils/web/webInteractions');
const config = require('../../config');

// Environment detection to conditionally run tests
const shouldRunOrangeHRMTests = () => {
  // Check if FORCE_ORANGEHRM_TESTS is set to true
  if (process.env.FORCE_ORANGEHRM_TESTS === 'true') {
    return true;
  }
  
  // Check if we have valid credentials
  if (!process.env.ORANGE_HRM_USERNAME || !process.env.ORANGE_HRM_PASSWORD) {
    return false;
  }
  
  // Check if we have a valid auth state
  try {
    const fs = require('fs');
    const authStatePath = './auth/orangehrm-storage-state.json';
    if (!fs.existsSync(authStatePath)) {
      return false;
    }
    
    // Check if auth state is recent (less than 2 hours old)
    const stats = fs.statSync(authStatePath);
    const fileAgeHours = (Date.now() - stats.mtime) / (1000 * 60 * 60);
    return fileAgeHours < 2;
  } catch (error) {
    return false;
  }
};

// Define constants for the tests
const baseUrl = 'https://opensource-demo.orangehrmlive.com';
const loginPath = '/web/index.php/auth/login';
const dashboardPath = '/web/index.php/dashboard/index';

// Credentials
const validUsername = process.env.ORANGE_HRM_USERNAME || 'Admin';
const validPassword = process.env.ORANGE_HRM_PASSWORD || 'admin123';

// Selectors
const selectors = {
  usernameInput: 'input[name="username"]',
  passwordInput: 'input[name="password"]',
  loginButton: 'button[type="submit"]',
  userDropdown: '.oxd-userdropdown-tab',
  logoutMenuItem: 'a:has-text("Logout")',
};

test.describe('OrangeHRM Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Skip these tests unless explicitly enabled
    test.skip(!shouldRunOrangeHRMTests(), 'OrangeHRM tests are skipped due to site availability issues');
    
    // Navigate to the login page before each test
    await page.goto(`${baseUrl}${loginPath}`);
  });

  test('should login with valid credentials', async ({ page }) => {
    const webInteractions = new WebInteractions(page);
    
    // Fill in login form with valid credentials
    await webInteractions.fillForm({
      [selectors.usernameInput]: validUsername,
      [selectors.passwordInput]: validPassword,
    });

    // Click login button
    await webInteractions.click(selectors.loginButton);

    // Verify successful login
    await page.waitForURL(`**${dashboardPath}`);
    await expect(page.locator('.oxd-topbar-header-title')).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    const webInteractions = new WebInteractions(page);
    
    // Login first
    await webInteractions.fillForm({
      [selectors.usernameInput]: validUsername,
      [selectors.passwordInput]: validPassword,
    });
    await webInteractions.click(selectors.loginButton);

    // Wait for dashboard to load
    await page.waitForURL(`**${dashboardPath}`);

    // Click on user dropdown
    await webInteractions.click(selectors.userDropdown);

    // Click logout
    await webInteractions.click(selectors.logoutMenuItem);

    // Verify we're back at the login page
    await expect(page).toHaveURL(new RegExp(`.*${loginPath}`), { timeout: 15000 });
    await expect(page.locator(selectors.loginButton)).toBeVisible();
  });
});

test.describe('OrangeHRM Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Skip these tests unless explicitly enabled
    test.skip(!shouldRunOrangeHRMTests(), 'OrangeHRM tests are skipped due to site availability issues');
    
    // Navigate to the login page
    await page.goto(config.baseUrl);

    // Login with default credentials
    await page.getByPlaceholder('Username').fill(config.credentials.username);
    await page.getByPlaceholder('Password').fill(config.credentials.password);
    await page.getByRole('button', { name: 'Login' }).click();

    // Wait for dashboard to load
    await page.waitForURL('**/dashboard/index');
  });

  test('should navigate to Admin page', async ({ page }) => {
    // Click on Admin in the sidebar
    await page.getByRole('link', { name: 'Admin' }).click();

    // Verify navigation to Admin page
    await page.waitForURL('**/admin/viewSystemUsers');
    await expect(page.locator('.oxd-topbar-header-breadcrumb')).toContainText('Admin');
  });

  test('should navigate to PIM page', async ({ page }) => {
    // Click on PIM in the sidebar
    await page.getByRole('link', { name: 'PIM' }).click();

    // Verify navigation to PIM page
    await page.waitForURL('**/pim/viewEmployeeList');
    await expect(page.locator('.oxd-topbar-header-breadcrumb')).toContainText('PIM');
  });

  test('should navigate back to Dashboard', async ({ page }) => {
    // First navigate to another page
    await page.getByRole('link', { name: 'Admin' }).click();
    await page.waitForURL('**/admin/viewSystemUsers');

    // Then navigate back to Dashboard
    await page.getByRole('link', { name: 'Dashboard' }).click();

    // Verify navigation to Dashboard
    await page.waitForURL('**/dashboard/index');
    await expect(page.locator('.oxd-topbar-header-breadcrumb')).toContainText('Dashboard');
  });
});

test.describe('OrangeHRM Form Validation', () => {
  test.beforeEach(async ({ page }) => {
    // Skip these tests unless explicitly enabled
    test.skip(!shouldRunOrangeHRMTests(), 'OrangeHRM tests are skipped due to site availability issues');
    
    // Navigate to the login page
    await page.goto(config.baseUrl);

    // Login with default credentials
    await page.getByPlaceholder('Username').fill(config.credentials.username);
    await page.getByPlaceholder('Password').fill(config.credentials.password);
    await page.getByRole('button', { name: 'Login' }).click();

    // Wait for dashboard to load
    await page.waitForURL('**/dashboard/index');
    
    // Navigate to Admin page
    await page.getByRole('link', { name: 'Admin' }).click();

    // Click Add button
    await page.getByRole('button', { name: 'Add' }).click();

    // Wait for form to load
    await page.waitForSelector('.oxd-form');
  });

  test('should validate password strength in Add User form', async ({ page }) => {
    // Fill in a weak password
    const passwordInputs = page.locator('input[type=password]');
    await passwordInputs.first().fill('weak');

    // Click elsewhere to trigger validation
    await page.locator('body').click();

    // Wait for validation to appear
    await page.waitForTimeout(1000);

    // Verify password strength validation message
    const passwordError = page.locator('.oxd-input-field-error-message').first();
    await expect(passwordError).toBeVisible();
    
    // Try to submit the form
    await page.getByRole('button', { name: 'Save' }).click();
    
    // Verify form was not submitted (we're still on the same page)
    await expect(page.locator('.oxd-form')).toBeVisible();
  });

  test('should validate password confirmation in Add User form', async ({ page }) => {
    // Fill in different passwords
    const passwordInputs = page.locator('input[type=password]');
    await passwordInputs.first().fill('Password123');
    await passwordInputs.last().fill('DifferentPassword123');

    // Click elsewhere to trigger validation
    await page.locator('body').click();

    // Wait for validation to appear
    await page.waitForTimeout(1000);

    // Verify password confirmation validation message
    const confirmPasswordError = page
      .locator('.oxd-input-field-error-message')
      .filter({ hasText: /[Pp]asswords?/ });
    await expect(confirmPasswordError).toBeVisible();
    
    // Try to submit the form
    await page.getByRole('button', { name: 'Save' }).click();
    
    // Verify form was not submitted (we're still on the same page)
    await expect(page.locator('.oxd-form')).toBeVisible();
  });
});