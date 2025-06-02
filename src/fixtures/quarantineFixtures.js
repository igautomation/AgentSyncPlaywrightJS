/**
 * Quarantine fixtures for Playwright tests
 * 
 * Provides fixtures for handling flaky tests and quarantine
 */
const base = require('@playwright/test');
const { QuarantineManager } = require('../utils/testing');

/**
 * Create a unique test ID from test info
 * @param {Object} testInfo - Playwright test info
 * @returns {string} Unique test ID
 */
function createTestId(testInfo) {
  return `${testInfo.file}::${testInfo.title}`;
}

/**
 * Quarantine fixtures
 */
const quarantineFixtures = {
  /**
   * Quarantine manager fixture
   */
  quarantineManager: [async ({}, use) => {
    // Create quarantine manager
    const manager = new QuarantineManager();
    
    // Use the fixture
    await use(manager);
  }, { scope: 'worker' }],
  
  /**
   * Auto-quarantine fixture that tracks test results
   */
  autoQuarantine: [async ({ quarantineManager }, use, testInfo) => {
    // Create test ID
    const testId = createTestId(testInfo);
    
    // Check if test is already quarantined
    const isQuarantined = quarantineManager.isQuarantined(testId);
    
    if (isQuarantined) {
      console.warn(`Test is quarantined: ${testId}`);
      testInfo.annotations.push({ type: 'quarantined', description: 'This test is quarantined due to flakiness' });
    }
    
    // Use the fixture (empty object as it's just for tracking)
    await use({});
    
    // After test completes, track the result
    const passed = testInfo.status === 'passed' || testInfo.status === 'skipped';
    
    quarantineManager.trackTest(testId, passed, {
      duration: testInfo.duration,
      status: testInfo.status,
      retries: testInfo.retry
    });
  }, { auto: true }]
};

/**
 * Export test object with quarantine fixtures
 */
module.exports = base.test.extend(quarantineFixtures);