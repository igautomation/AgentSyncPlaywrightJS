/**
 * Salesforce Test Case Object
 * 
 * Represents a test case in Salesforce
 */
const SObjectManager = require('./SObjectManager');
const logger = require('../../common/logger');

class TestCaseObject {
  /**
   * Create a new TestCaseObject instance
   * @param {Object} config - Configuration
   */
  constructor(config = {}) {
    this.objectManager = new SObjectManager(config);
    this.objectName = config.testCaseObject || 'TestCase__c';
  }
  
  /**
   * Create a test case
   * @param {Object} data - Test case data
   * @returns {Promise<Object>} Created test case
   */
  async createTestCase(data) {
    try {
      return await this.objectManager.createRecord(this.objectName, data);
    } catch (error) {
      logger.error('Failed to create test case:', error);
      throw error;
    }
  }
  
  /**
   * Get test case by ID
   * @param {string} testCaseId - Test case ID
   * @returns {Promise<Object>} Test case data
   */
  async getTestCase(testCaseId) {
    try {
      return await this.objectManager.getRecord(this.objectName, testCaseId);
    } catch (error) {
      logger.error(`Failed to get test case ${testCaseId}:`, error);
      throw error;
    }
  }
  
  /**
   * Update test case
   * @param {string} testCaseId - Test case ID
   * @param {Object} data - Test case data
   * @returns {Promise<Object>} Update result
   */
  async updateTestCase(testCaseId, data) {
    try {
      return await this.objectManager.updateRecord(this.objectName, testCaseId, data);
    } catch (error) {
      logger.error(`Failed to update test case ${testCaseId}:`, error);
      throw error;
    }
  }
  
  /**
   * Delete test case
   * @param {string} testCaseId - Test case ID
   * @returns {Promise<Object>} Delete result
   */
  async deleteTestCase(testCaseId) {
    try {
      return await this.objectManager.deleteRecord(this.objectName, testCaseId);
    } catch (error) {
      logger.error(`Failed to delete test case ${testCaseId}:`, error);
      throw error;
    }
  }
  
  /**
   * Find test cases
   * @param {Object} criteria - Search criteria
   * @returns {Promise<Array<Object>>} Matching test cases
   */
  async findTestCases(criteria = {}) {
    try {
      return await this.objectManager.findRecords(this.objectName, criteria);
    } catch (error) {
      logger.error('Failed to find test cases:', error);
      throw error;
    }
  }
  
  /**
   * Get test cases by external ID
   * @param {string} externalId - External ID
   * @returns {Promise<Array<Object>>} Matching test cases
   */
  async getTestCasesByExternalId(externalId) {
    try {
      return await this.objectManager.findRecords(this.objectName, {
        ExternalId__c: externalId
      });
    } catch (error) {
      logger.error(`Failed to get test cases by external ID ${externalId}:`, error);
      throw error;
    }
  }
  
  /**
   * Update test case status
   * @param {string} testCaseId - Test case ID
   * @param {string} status - Test case status
   * @param {Object} options - Update options
   * @returns {Promise<Object>} Update result
   */
  async updateTestCaseStatus(testCaseId, status, options = {}) {
    try {
      const data = {
        Status__c: status,
        LastRunDate__c: new Date().toISOString()
      };
      
      if (options.result) {
        data.Result__c = options.result;
      }
      
      if (options.comment) {
        data.Comments__c = options.comment;
      }
      
      return await this.updateTestCase(testCaseId, data);
    } catch (error) {
      logger.error(`Failed to update test case status ${testCaseId}:`, error);
      throw error;
    }
  }
  
  /**
   * Create test run
   * @param {Object} data - Test run data
   * @returns {Promise<Object>} Created test run
   */
  async createTestRun(data) {
    try {
      return await this.objectManager.createRecord('TestRun__c', data);
    } catch (error) {
      logger.error('Failed to create test run:', error);
      throw error;
    }
  }
  
  /**
   * Create test result
   * @param {Object} data - Test result data
   * @returns {Promise<Object>} Created test result
   */
  async createTestResult(data) {
    try {
      return await this.objectManager.createRecord('TestResult__c', data);
    } catch (error) {
      logger.error('Failed to create test result:', error);
      throw error;
    }
  }
  
  /**
   * Import test cases from Playwright tests
   * @param {string} testDir - Directory containing test files
   * @param {string} pattern - Glob pattern for test files
   * @returns {Promise<Array<Object>>} Imported test cases
   */
  async importTestCasesFromPlaywright(testDir = 'src/tests', pattern = '**/*.spec.js') {
    try {
      const glob = require('glob');
      const files = glob.sync(path.join(testDir, pattern));
      const importedTestCases = [];
      
      for (const file of files) {
        const content = fs.readFileSync(file, 'utf-8');
        
        // Extract test titles
        const testTitleRegex = /test\s*\(\s*['"](.+?)['"]/g;
        let match;
        while ((match = testTitleRegex.exec(content)) !== null) {
          const testTitle = match[1];
          
          // Create test case
          const testCase = await this.createTestCase({
            Name: testTitle,
            Description__c: `Imported from ${file}`,
            ExternalId__c: `${file}:${testTitle}`,
            Status__c: 'Not Run',
            Type__c: 'Automated',
            AutomationFile__c: file
          });
          
          importedTestCases.push(testCase);
        }
      }
      
      logger.info(`Imported ${importedTestCases.length} test cases from Playwright tests`);
      
      return importedTestCases;
    } catch (error) {
      logger.error('Failed to import test cases from Playwright tests:', error);
      throw error;
    }
  }
  
  /**
   * Update test results from Playwright results
   * @param {Object} results - Playwright test results
   * @returns {Promise<Array<Object>>} Updated test cases
   */
  async updateTestResultsFromPlaywright(results) {
    try {
      const updatedTestCases = [];
      
      // Create test run
      const testRun = await this.createTestRun({
        Name: `Test Run - ${new Date().toISOString()}`,
        StartDate__c: new Date().toISOString(),
        Status__c: 'Completed'
      });
      
      // Process results
      for (const test of results.tests || []) {
        // Find test case by external ID
        const externalId = `${test.file}:${test.title}`;
        const testCases = await this.getTestCasesByExternalId(externalId);
        
        if (testCases.length > 0) {
          const testCase = testCases[0];
          
          // Map status
          const status = test.status === 'passed' ? 'Passed' : 'Failed';
          
          // Update test case
          await this.updateTestCaseStatus(testCase.Id, status, {
            result: status,
            comment: test.error ? `Error: ${test.error}` : 'Test completed successfully'
          });
          
          // Create test result
          await this.createTestResult({
            TestCase__c: testCase.Id,
            TestRun__c: testRun.id,
            Status__c: status,
            Duration__c: test.duration || 0,
            Error__c: test.error || ''
          });
          
          updatedTestCases.push(testCase);
        }
      }
      
      logger.info(`Updated ${updatedTestCases.length} test cases from Playwright results`);
      
      return updatedTestCases;
    } catch (error) {
      logger.error('Failed to update test results from Playwright results:', error);
      throw error;
    }
  }
}

module.exports = TestCaseObject;