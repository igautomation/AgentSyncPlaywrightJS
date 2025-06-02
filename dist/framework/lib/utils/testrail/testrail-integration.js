const TestRailClient = require('./testrail-client');
const path = require('path');
const fs = require('fs');

class TestRailIntegration {
undefined

  /**
   * Fetch test case details from TestRail
   * @param {number} caseId - TestRail case ID
   * @returns {Promise<Object>} - Test case details
   */
  async getTestCase(caseId) {
    return await this.client.getCase(caseId);
  }

  /**
   * Fetch test steps from a TestRail test case
   * @param {number} caseId - TestRail case ID
   * @returns {Promise<Array>} - Array of test steps
   */
  async getTestSteps(caseId) {
    return await this.client.getCaseSteps(caseId);
  }

  /**
   * Create a new test run in TestRail
   * @param {string} name - Name of the test run
   * @param {Array<number>} caseIds - Array of test case IDs to include
   * @param {number} suiteId - Optional suite ID
   * @returns {Promise<number>} - ID of the created test run
   */
undefined

  /**
   * Update test result in TestRail
   * @param {number} caseId - TestRail case ID
   * @param {number} status - TestRail status ID (1=Passed, 2=Blocked, 3=Untested, 4=Retest, 5=Failed)
   * @param {string} comment - Comment to add to the result
   * @param {string} elapsed - Time elapsed (e.g., "30s", "1m 45s")
   * @param {Array<string>} artifacts - Array of file paths to attach
   * @returns {Promise<Object>} - Result details
   */
  async updateResult(caseId, status, comment = '', elapsed = null, artifacts = []) {
    if (!this.runId) {
      throw new Error('No test run created. Call createRun() first.');
    }
    
    return await this.client.addResultForCase(this.runId, caseId, status, comment, elapsed, artifacts);
  }

  /**
   * Capture screenshot and save to artifacts directory
   * @param {Object} page - Playwright page object
   * @param {string} name - Name for the screenshot
   * @returns {Promise<string>} - Path to the saved screenshot
   */
  async captureScreenshot(page, name) {
    const screenshotPath = path.join(this.artifactsDir, `${name}-${Date.now()}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    return screenshotPath;
  }

  /**
   * Get TestRail status ID from test result
   * @param {boolean} passed - Whether the test passed
   * @returns {number} - TestRail status ID
   */
  getStatusId(passed) {
    return passed ? 1 : 5; // 1=Passed, 5=Failed
  }
}

// TestRail status IDs
TestRailIntegration.STATUS = {
  PASSED: 1,
  BLOCKED: 2,
  UNTESTED: 3,
  RETEST: 4,
  FAILED: 5
};

module.exports = TestRailIntegration;