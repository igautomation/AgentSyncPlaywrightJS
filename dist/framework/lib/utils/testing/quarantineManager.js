/**
 * Quarantine Manager for Flaky Tests
 * 
 * Tracks and isolates flaky tests to prevent them from affecting the main test suite
 */
const fs = require('fs');
const path = require('path');
const logger = require('../common/logger');

class QuarantineManager {
  /**
   * Constructor
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    this.options = {
      quarantineFile: options.quarantineFile || path.join(process.cwd(), 'data/quarantined-tests.json'),
      flakyThreshold: options.flakyThreshold || 3,
      trackingWindow: options.trackingWindow || 10,
      ...options
    };
    
    this.quarantinedTests = new Map();
    this.testHistory = new Map();
    
    // Load quarantined tests if file exists
    this._loadQuarantinedTests();
  }
  
  /**
   * Track test result
   * @param {string} testId - Test identifier (file path + test name)
   * @param {boolean} passed - Whether the test passed
   * @param {Object} metadata - Additional metadata
   */
  trackTest(testId, passed, metadata = {}) {
    if (!this.testHistory.has(testId)) {
      this.testHistory.set(testId, []);
    }
    
    const history = this.testHistory.get(testId);
    
    // Add result to history
    history.push({
      timestamp: new Date().toISOString(),
      passed,
      ...metadata
    });
    
    // Limit history size
    if (history.length > this.options.trackingWindow) {
      history.shift();
    }
    
    // Check if test is flaky
    this._checkFlaky(testId);
  }
  
  /**
   * Check if a test is flaky and should be quarantined
   * @param {string} testId - Test identifier
   * @private
   */
  _checkFlaky(testId) {
    const history = this.testHistory.get(testId);
    
    if (!history || history.length < this.options.trackingWindow) {
      return;
    }
    
    // Count failures and passes
    const failures = history.filter(result => !result.passed).length;
    const passes = history.filter(result => result.passed).length;
    
    // Check if test is flaky (has both passes and failures)
    const isFlaky = failures > 0 && passes > 0 && failures >= this.options.flakyThreshold;
    
    if (isFlaky && !this.quarantinedTests.has(testId)) {
      logger.warn(`Quarantining flaky test: ${testId} (${failures}/${history.length} failures)`);
      
      this.quarantinedTests.set(testId, {
        testId,
        quarantinedAt: new Date().toISOString(),
        history: [...history],
        failureRate: failures / history.length
      });
      
      this._saveQuarantinedTests();
    } else if (!isFlaky && this.quarantinedTests.has(testId)) {
      // Test is no longer flaky, remove from quarantine
      logger.info(`Removing test from quarantine: ${testId}`);
      this.quarantinedTests.delete(testId);
      this._saveQuarantinedTests();
    }
  }
  
  /**
   * Check if a test is quarantined
   * @param {string} testId - Test identifier
   * @returns {boolean} Whether the test is quarantined
   */
  isQuarantined(testId) {
    return this.quarantinedTests.has(testId);
  }
  
  /**
   * Get quarantined test info
   * @param {string} testId - Test identifier
   * @returns {Object|null} Quarantined test info
   */
  getQuarantinedTest(testId) {
    return this.quarantinedTests.get(testId) || null;
  }
  
  /**
   * Get all quarantined tests
   * @returns {Array<Object>} Quarantined tests
   */
  getAllQuarantinedTests() {
    return Array.from(this.quarantinedTests.values());
  }
  
  /**
   * Manually quarantine a test
   * @param {string} testId - Test identifier
   * @param {string} reason - Reason for quarantine
   */
  quarantineTest(testId, reason = '') {
    this.quarantinedTests.set(testId, {
      testId,
      quarantinedAt: new Date().toISOString(),
      manuallyQuarantined: true,
      reason,
      history: this.testHistory.get(testId) || []
    });
    
    this._saveQuarantinedTests();
  }
  
  /**
   * Remove a test from quarantine
   * @param {string} testId - Test identifier
   */
  removeFromQuarantine(testId) {
    if (this.quarantinedTests.has(testId)) {
      this.quarantinedTests.delete(testId);
      this._saveQuarantinedTests();
    }
  }
  
  /**
   * Load quarantined tests from file
   * @private
   */
  _loadQuarantinedTests() {
    try {
      if (fs.existsSync(this.options.quarantineFile)) {
        const data = JSON.parse(fs.readFileSync(this.options.quarantineFile, 'utf8'));
        
        data.forEach(item => {
          this.quarantinedTests.set(item.testId, item);
          
          // Also load test history
          if (item.history && Array.isArray(item.history)) {
            this.testHistory.set(item.testId, item.history);
          }
        });
        
        logger.info(`Loaded ${this.quarantinedTests.size} quarantined tests`);
      }
    } catch (error) {
      logger.error(`Error loading quarantined tests: ${error.message}`);
    }
  }
  
  /**
   * Save quarantined tests to file
   * @private
   */
  _saveQuarantinedTests() {
    try {
      const dir = path.dirname(this.options.quarantineFile);
      
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      const data = Array.from(this.quarantinedTests.values());
      fs.writeFileSync(this.options.quarantineFile, JSON.stringify(data, null, 2));
      
      logger.info(`Saved ${data.length} quarantined tests`);
    } catch (error) {
      logger.error(`Error saving quarantined tests: ${error.message}`);
    }
  }
}

module.exports = QuarantineManager;