/**
 * Salesforce Locators Handler Demo Test
 */
const { test, expect } = require('@playwright/test');
const { SalesforceLocators } = require('../../utils/salesforce');
require('dotenv').config({ path: '.env.unified' });

test.describe('Salesforce Locators Handler Demo', () => {
  let locators;

  test.beforeEach(async ({ page }) => {
    locators = new SalesforceLocators(page);
  });

  test('Demo: Login using locators handler', async ({ page }) => {
    await page.goto(process.env.SF_LOGIN_URL);

    // Using locators handler
    await locators.fillElement('login', 'username', process.env.SF_USERNAME);
    await locators.fillElement('login', 'password', process.env.SF_PASSWORD);
    await locators.clickElement('login', 'loginButton');

    // Wait for page load
    await locators.waitForSpinnerToDisappear();
    await page.waitForTimeout(5000);

    // Verify login success
    expect(page.url()).toContain('force.com');
    console.log('✅ Login successful using locators handler');
  });

  test('Demo: Navigation using locators handler', async ({ page }) => {
    await page.goto(process.env.SF_LOGIN_URL);

    // Login
    await locators.fillElement('login', 'username', process.env.SF_USERNAME);
    await locators.fillElement('login', 'password', process.env.SF_PASSWORD);
    await locators.clickElement('login', 'loginButton');
    await locators.waitForSpinnerToDisappear();
    await page.waitForTimeout(5000);

    // Navigate to Contacts
    await page.goto(`${process.env.SF_INSTANCE_URL}/lightning/o/Contact/list`);
    await locators.waitForSpinnerToDisappear();
    await page.waitForTimeout(3000);

    // Verify navigation
    const isContactsVisible = await locators.isVisible('objects', 'listView');
    expect(isContactsVisible).toBeTruthy();
    console.log('✅ Navigation successful using locators handler');
  });

  test('Demo: Self-healing locators', async ({ page }) => {
    await page.goto(process.env.SF_LOGIN_URL);

    // Test multiple selector fallback
    const loginButton = await locators.findElementByMultipleSelectors([
      '#Login',
      'input[type="submit"]',
      'button[name="Login"]',
      'input[value="Log In"]'
    ]);

    expect(loginButton).toBeTruthy();
    console.log('✅ Self-healing locators working');
  });

  test('Demo: Dynamic locator generation', async ({ page }) => {
    await page.goto(process.env.SF_LOGIN_URL);

    // Generate dynamic locators
    const usernameSelectors = locators.generateFieldLocator('username');
    const loginButtonSelectors = locators.generateButtonLocator('Log In');

    console.log('Username selectors:', usernameSelectors);
    console.log('Login button selectors:', loginButtonSelectors);

    // Test generated locators
    const usernameField = await locators.findElementByMultipleSelectors(usernameSelectors);
    expect(usernameField).toBeTruthy();
    console.log('✅ Dynamic locator generation working');
  });

  test('Demo: Locator validation', async ({ page }) => {
    await page.goto(process.env.SF_LOGIN_URL);

    // Validate individual locators
    const isUsernameValid = await locators.validateLocator('login', 'username');
    const isPasswordValid = await locators.validateLocator('login', 'password');
    const isLoginButtonValid = await locators.validateLocator('login', 'loginButton');

    expect(isUsernameValid).toBeTruthy();
    expect(isPasswordValid).toBeTruthy();
    expect(isLoginButtonValid).toBeTruthy();

    console.log('✅ Locator validation working');
    console.log(`Username valid: ${isUsernameValid}`);
    console.log(`Password valid: ${isPasswordValid}`);
    console.log(`Login button valid: ${isLoginButtonValid}`);
  });
});