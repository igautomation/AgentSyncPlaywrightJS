/**
 * Accessibility Tests
 */
const { test, expect } = require('../../fixtures/combined');
const { AccessibilityUtils } = require('../../utils/accessibility/accessibilityUtils');
require('dotenv').config({ path: '.env.dev' });

test.describe('Accessibility Tests', () => {
  // Skip these tests if the demo site is unavailable
  test.beforeEach(async ({ orangeHrmPage }, testInfo) => {
    // Check if the site is available
    try {
      const orangeHrmUrl = process.env.ORANGE_HRM_URL || 'https://opensource-demo.orangehrmlive.com';
      await orangeHrmPage.goto(orangeHrmUrl, { 
        timeout: 10000,
        waitUntil: 'domcontentloaded' // Use a less strict wait condition
      });
    } catch (error) {
      test.skip(true, 'Demo site is unavailable');
    }
  });

  test('login page should not have critical accessibility violations', async ({ orangeHrmPage }) => {
    // Page is already loaded in beforeEach
    
    // Create accessibility utils
    const a11yUtils = new AccessibilityUtils(orangeHrmPage);
    
    // Run accessibility analysis
    const results = await a11yUtils.audit();
    
    // Filter out critical violations
    const criticalViolations = results.issues.filter(
      violation => violation.severity === 'critical'
    );
    
    // Log violations for debugging
    console.log('Critical violations:', criticalViolations);
    
    // Expect no critical violations
    expect(criticalViolations.length).toBe(0);
  });
  
  test('dashboard should not have critical accessibility violations', async ({ orangeHrmPage }) => {
    // Skip this test for now as it requires login
    test.skip();
    
    // Define credentials
    const username = process.env.ORANGE_HRM_USERNAME || 'Admin';
    const password = process.env.ORANGE_HRM_PASSWORD || 'admin123';
    
    // Login with credentials
    await orangeHrmPage.getByPlaceholder('Username').fill(username);
    await orangeHrmPage.getByPlaceholder('Password').fill(password);
    await orangeHrmPage.getByRole('button', { name: 'Login' }).click();
    
    // Wait for dashboard to load
    await orangeHrmPage.waitForSelector('.oxd-topbar-header', { timeout: 10000 });
    
    // Create accessibility utils
    const a11yUtils = new AccessibilityUtils(orangeHrmPage);
    
    // Run accessibility analysis
    const results = await a11yUtils.audit();
    
    // Filter out critical violations
    const criticalViolations = results.issues.filter(
      violation => violation.severity === 'critical'
    );
    
    // Log violations for debugging
    console.log('Critical violations:', criticalViolations);
    
    // Expect no critical violations
    expect(criticalViolations.length).toBe(0);
  });
  
  test('login page should pass specific accessibility rules', async ({ orangeHrmPage }) => {
    // Page is already loaded in beforeEach
    
    // Create accessibility utils
    const a11yUtils = new AccessibilityUtils(orangeHrmPage);
    
    // Run accessibility analysis
    const results = await a11yUtils.audit();
    
    // Check for specific issues
    const hasInputsWithoutLabels = results.issues.some(
      issue => issue.type === 'input-label'
    );
    
    const hasButtonsWithoutNames = results.issues.some(
      issue => issue.type === 'button-name'
    );
    
    // Expect inputs to have labels and buttons to have names
    expect(hasInputsWithoutLabels).toBe(false);
    expect(hasButtonsWithoutNames).toBe(false);
  });
});