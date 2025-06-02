/**
 * Fixed Accessibility Tests
 */
const { test, expect } = require('@playwright/test');
const AccessibilityUtils = require('../../utils/web/accessibilityUtils');

test.describe('Fixed Accessibility Tests', () => {
  // Skip these tests if the demo site is unavailable
  test.beforeEach(async ({ page }, testInfo) => {
    // Check if the site is available
    try {
      await page.goto('https://opensource-demo.orangehrmlive.com', { 
        timeout: 10000,
        waitUntil: 'domcontentloaded' // Use a less strict wait condition
      });
    } catch (error) {
      test.skip(true, 'Demo site is unavailable');
    }
  });

  test('OrangeHRM login page should generate accessibility report', async ({ page }) => {
    // Page is already loaded in beforeEach
    
    // Create accessibility utils
    const a11yUtils = new AccessibilityUtils(page);
    
    // Run accessibility analysis
    const results = await a11yUtils.scan();
    
    // Log violations
    console.log('Accessibility violations:', results.violations);
    
    // Generate report
    const reportPath = await a11yUtils.generateReport();
    
    // Verify report was generated
    expect(reportPath).toBeTruthy();
  });
  
  test('OrangeHRM dashboard should generate accessibility report', async ({ page }) => {
    // Page is already loaded in beforeEach
    
    // Login with default credentials
    await page.getByPlaceholder('Username').fill('Admin');
    await page.getByPlaceholder('Password').fill('admin123');
    await page.getByRole('button', { name: 'Login' }).click();
    
    // Wait for dashboard to load with a shorter timeout
    try {
      await page.waitForSelector('.oxd-topbar-header', { timeout: 10000 });
    } catch (error) {
      test.skip(true, 'Could not load dashboard');
      return;
    }
    
    // Create accessibility utils
    const a11yUtils = new AccessibilityUtils(page);
    
    // Run accessibility analysis
    const results = await a11yUtils.scan();
    
    // Log violations
    console.log('Accessibility violations:', results.violations);
    
    // Generate report
    const reportPath = await a11yUtils.generateReport();
    
    // Verify report was generated
    expect(reportPath).toBeTruthy();
  });
  
  test('OrangeHRM login form should be accessible', async ({ page }) => {
    // Page is already loaded in beforeEach
    
    // Create accessibility utils
    const a11yUtils = new AccessibilityUtils(page);
    
    // Run accessibility analysis on login form
    const results = await a11yUtils.scan();
    
    // Filter out critical violations
    const criticalViolations = results.violations.filter(
      violation => violation.impact === 'critical'
    );
    
    // Expect no critical violations
    expect(criticalViolations.length).toBe(0);
  });
});