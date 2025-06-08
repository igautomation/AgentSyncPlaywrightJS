/**
 * Flaky Test Tracker Utilities
 * Renamed to follow naming conventions
 */

const fs = require('fs').promises;
const path = require('path');
const logger = require('../common/logger');

/**
 * Utility class for tracking flaky tests
 */
class FlakyTestTrackerUtils {
  /**
   * Constructor
   * @param {Object} options - Configuration options
   * @param {string} options.dataDir - Directory to store flaky test data
   * @param {number} options.flakyThreshold - Threshold for considering a test flaky
   * @param {number} options.quarantineThreshold - Threshold for quarantining a test
   */
  constructor(options = {}) {
    this.dataDir = options.dataDir || path.resolve(process.cwd(), 'data', 'flaky-tests');
    this.flakyThreshold = options.flakyThreshold || 0.2; // 20% failure rate
    this.quarantineThreshold = options.quarantineThreshold || 0.5; // 50% failure rate
    this.historyFile = path.join(this.dataDir, 'flaky-test-history.json');
    this.quarantineFile = path.join(this.dataDir, 'quarantined-tests.json');
    
    // Ensure data directory exists
    this._ensureDataDir();
  }
  
  /**
   * Ensure data directory exists
   * @private
   */
  async _ensureDataDir() {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
    } catch (error) {
      logger.error('Failed to create data directory', error);
    }
  }
  
  /**
   * Load test history
   * @returns {Promise<Object>} Test history data
   */
  async loadTestHistory() {
    try {
      const data = await fs.readFile(this.historyFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      // If file doesn't exist or is invalid, return empty history
      return { tests: {}, lastUpdated: new Date().toISOString() };
    }
  }
  
  /**
   * Save test history
   * @param {Object} history - Test history data
   * @returns {Promise<void>}
   */
  async saveTestHistory(history) {
    try {
      history.lastUpdated = new Date().toISOString();
      await fs.writeFile(this.historyFile, JSON.stringify(history, null, 2));
    } catch (error) {
      logger.error('Failed to save test history', error);
    }
  }
  
  /**
   * Load quarantined tests
   * @returns {Promise<Object>} Quarantined tests data
   */
  async loadQuarantinedTests() {
    try {
      const data = await fs.readFile(this.quarantineFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      // If file doesn't exist or is invalid, return empty quarantine list
      return { tests: {}, lastUpdated: new Date().toISOString() };
    }
  }
  
  /**
   * Save quarantined tests
   * @param {Object} quarantinedTests - Quarantined tests data
   * @returns {Promise<void>}
   */
  async saveQuarantinedTests(quarantinedTests) {
    try {
      quarantinedTests.lastUpdated = new Date().toISOString();
      await fs.writeFile(this.quarantineFile, JSON.stringify(quarantinedTests, null, 2));
    } catch (error) {
      logger.error('Failed to save quarantined tests', error);
    }
  }
  
  /**
   * Record test result
   * @param {string} testId - Test identifier
   * @param {boolean} passed - Whether the test passed
   * @param {Object} metadata - Additional test metadata
   * @returns {Promise<Object>} Updated test history
   */
  async recordTestResult(testId, passed, metadata = {}) {
    const history = await this.loadTestHistory();
    
    // Initialize test entry if it doesn't exist
    if (!history.tests[testId]) {
      history.tests[testId] = {
        id: testId,
        runs: [],
        passCount: 0,
        failCount: 0,
        flakyRate: 0,
        firstSeen: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };
    }
    
    // Update test entry
    const test = history.tests[testId];
    test.runs.push({
      passed,
      timestamp: new Date().toISOString(),
      metadata
    });
    
    // Keep only the last 100 runs
    if (test.runs.length > 100) {
      test.runs = test.runs.slice(-100);
    }
    
    // Update pass/fail counts
    test.passCount = test.runs.filter(run => run.passed).length;
    test.failCount = test.runs.length - test.passCount;
    test.flakyRate = test.failCount / test.runs.length;
    test.lastUpdated = new Date().toISOString();
    
    // Check if test should be quarantined
    if (test.runs.length >= 5 && test.flakyRate >= this.quarantineThreshold) {
      await this.quarantineTest(testId, test);
    }
    
    // Save updated history
    await this.saveTestHistory(history);
    
    return history;
  }
  
  /**
   * Quarantine a test
   * @param {string} testId - Test identifier
   * @param {Object} testData - Test data
   * @returns {Promise<Object>} Updated quarantined tests
   */
  async quarantineTest(testId, testData) {
    const quarantinedTests = await this.loadQuarantinedTests();
    
    // Add test to quarantine if not already quarantined
    if (!quarantinedTests.tests[testId]) {
      quarantinedTests.tests[testId] = {
        id: testId,
        flakyRate: testData.flakyRate,
        quarantinedAt: new Date().toISOString(),
        reason: `Automatically quarantined due to flaky rate of ${(testData.flakyRate * 100).toFixed(2)}%`,
        lastUpdated: new Date().toISOString()
      };
      
      logger.warn(`Test "${testId}" has been quarantined due to flaky rate of ${(testData.flakyRate * 100).toFixed(2)}%`);
      
      // Save updated quarantined tests
      await this.saveQuarantinedTests(quarantinedTests);
    }
    
    return quarantinedTests;
  }
  
  /**
   * Remove a test from quarantine
   * @param {string} testId - Test identifier
   * @returns {Promise<Object>} Updated quarantined tests
   */
  async unquarantineTest(testId) {
    const quarantinedTests = await this.loadQuarantinedTests();
    
    // Remove test from quarantine if it exists
    if (quarantinedTests.tests[testId]) {
      delete quarantinedTests.tests[testId];
      
      logger.info(`Test "${testId}" has been removed from quarantine`);
      
      // Save updated quarantined tests
      await this.saveQuarantinedTests(quarantinedTests);
    }
    
    return quarantinedTests;
  }
  
  /**
   * Check if a test is quarantined
   * @param {string} testId - Test identifier
   * @returns {Promise<boolean>} Whether the test is quarantined
   */
  async isTestQuarantined(testId) {
    const quarantinedTests = await this.loadQuarantinedTests();
    return !!quarantinedTests.tests[testId];
  }
  
  /**
   * Get flaky tests
   * @param {number} threshold - Flaky rate threshold (default: this.flakyThreshold)
   * @returns {Promise<Object[]>} Array of flaky tests
   */
  async getFlakyTests(threshold = this.flakyThreshold) {
    const history = await this.loadTestHistory();
    
    // Filter tests with flaky rate above threshold and at least 5 runs
    const flakyTests = Object.values(history.tests).filter(test => {
      return test.runs.length >= 5 && test.flakyRate >= threshold;
    });
    
    // Sort by flaky rate (highest first)
    return flakyTests.sort((a, b) => b.flakyRate - a.flakyRate);
  }
  
  /**
   * Generate flaky test report
   * @returns {Promise<Object>} Flaky test report
   */
  async generateFlakyTestReport() {
    const history = await this.loadTestHistory();
    const quarantinedTests = await this.loadQuarantinedTests();
    const flakyTests = await this.getFlakyTests();
    
    return {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests: Object.keys(history.tests).length,
        flakyTests: flakyTests.length,
        quarantinedTests: Object.keys(quarantinedTests.tests).length
      },
      flakyTests,
      quarantinedTests: quarantinedTests.tests
    };
  }
}

module.exports = FlakyTestTrackerUtils;