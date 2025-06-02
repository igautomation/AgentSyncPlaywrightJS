/**
 * Jira Test Manager
 * 
 * Manages test cases and results in Jira
 */
const JiraClient = require('./jiraClient');
const path = require('path');
const fs = require('fs');
const logger = require('../common/logger');

class JiraTestManager {
  /**
   * Create a new JiraTestManager instance
   * @param {Object} config - Configuration
   */
  constructor(config = {}) {
    this.jiraClient = new JiraClient(config);
    this.config = {
      testIssueType: config.testIssueType || 'Test',
      bugIssueType: config.bugIssueType || 'Bug',
      testCycleIssueType: config.testCycleIssueType || 'Test Cycle',
      testExecutionIssueType: config.testExecutionIssueType || 'Test Execution',
      testStatusField: config.testStatusField || 'Test Status',
      testResultField: config.testResultField || 'Test Result',
      ...config
    };
  }
  
  /**
   * Extract test IDs from test files
   * @param {string} testDir - Directory containing test files
   * @param {string} pattern - Glob pattern for test files
   * @returns {Promise<Object>} Object mapping test files to test IDs
   */
  async extractTestIds(testDir = 'src/tests', pattern = '**/*.spec.js') {
    try {
      const glob = require('glob');
      const files = glob.sync(path.join(testDir, pattern));
      const testIdMap = {};
      
      for (const file of files) {
        const content = fs.readFileSync(file, 'utf-8');
        const matches = content.match(/@[A-Z]+-\\d+/g) || [];
        
        if (matches.length > 0) {
          testIdMap[file] = matches.map(match => match.replace('@', ''));
        }
      }
      
      return testIdMap;
    } catch (error) {
      logger.error('Failed to extract test IDs:', error);
      throw error;
    }
  }
  
  /**
   * Create a test cycle in Jira
   * @param {string} name - Test cycle name
   * @param {string} description - Test cycle description
   * @returns {Promise<Object>} Created test cycle
   */
  async createTestCycle(name, description) {
    try {
      const issueData = {
        fields: {
          summary: name,
          description: {
            type: 'doc',
            version: 1,
            content: [
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: description
                  }
                ]
              }
            ]
          },
          issuetype: {
            name: this.config.testCycleIssueType
          }
        }
      };
      
      return await this.jiraClient.createIssue(issueData);
    } catch (error) {
      logger.error('Failed to create test cycle:', error);
      throw error;
    }
  }
  
  /**
   * Create a test execution in Jira
   * @param {string} name - Test execution name
   * @param {string} description - Test execution description
   * @param {string} testCycleKey - Test cycle key
   * @returns {Promise<Object>} Created test execution
   */
  async createTestExecution(name, description, testCycleKey) {
    try {
      const issueData = {
        fields: {
          summary: name,
          description: {
            type: 'doc',
            version: 1,
            content: [
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: description
                  }
                ]
              }
            ]
          },
          issuetype: {
            name: this.config.testExecutionIssueType
          }
        }
      };
      
      const execution = await this.jiraClient.createIssue(issueData);
      
      // Link to test cycle
      if (testCycleKey) {
        await this.jiraClient.linkIssues(execution.key, testCycleKey, 'Tests');
      }
      
      return execution;
    } catch (error) {
      logger.error('Failed to create test execution:', error);
      throw error;
    }
  }
  
  /**
   * Update test result in Jira
   * @param {string} testKey - Test key
   * @param {string} status - Test status (PASS, FAIL, BLOCKED, etc.)
   * @param {Object} options - Update options
   * @returns {Promise<Object>} Updated test
   */
  async updateTestResult(testKey, status, options = {}) {
    try {
      // Get the test issue
      const test = await this.jiraClient.getIssue(testKey);
      
      // Prepare fields to update
      const fields = {};
      fields[this.config.testStatusField] = { value: status };
      
      if (options.comment) {
        await this.jiraClient.addComment(testKey, options.comment);
      }
      
      // Add attachments
      if (options.attachments && Array.isArray(options.attachments)) {
        for (const attachment of options.attachments) {
          await this.jiraClient.addAttachment(testKey, attachment);
        }
      }
      
      // Update the test issue
      await this.jiraClient.updateIssue(testKey, { fields });
      
      // Create bug if test failed and createBug option is true
      if (status === 'FAIL' && options.createBug) {
        await this.createBugFromFailedTest(testKey, options.bugSummary || `Bug from failed test ${testKey}`, options.bugDescription || '');
      }
      
      return test;
    } catch (error) {
      logger.error(`Failed to update test result for ${testKey}:`, error);
      throw error;
    }
  }
  
  /**
   * Create a bug from a failed test
   * @param {string} testKey - Test key
   * @param {string} summary - Bug summary
   * @param {string} description - Bug description
   * @returns {Promise<Object>} Created bug
   */
  async createBugFromFailedTest(testKey, summary, description) {
    try {
      const issueData = {
        fields: {
          summary,
          description: {
            type: 'doc',
            version: 1,
            content: [
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: description
                  }
                ]
              }
            ]
          },
          issuetype: {
            name: this.config.bugIssueType
          }
        }
      };
      
      const bug = await this.jiraClient.createIssue(issueData);
      
      // Link bug to test
      await this.jiraClient.linkIssues(bug.key, testKey, 'Tests');
      
      return bug;
    } catch (error) {
      logger.error(`Failed to create bug from test ${testKey}:`, error);
      throw error;
    }
  }
  
  /**
   * Generate test report
   * @param {Array<Object>} results - Test results
   * @param {Object} options - Report options
   * @returns {Promise<Object>} Report data
   */
  async generateTestReport(results, options = {}) {
    try {
      const reportData = {
        summary: options.summary || `Test Report - ${new Date().toISOString()}`,
        description: options.description || 'Automated test report',
        testCycle: options.testCycle,
        testExecution: options.testExecution,
        results: [],
        stats: {
          total: results.length,
          passed: 0,
          failed: 0,
          skipped: 0,
          blocked: 0
        }
      };
      
      // Process results
      for (const result of results) {
        // Extract test key from test name or description
        const testKeyMatch = (result.name || result.description || '').match(/@([A-Z]+-\\d+)/);
        const testKey = testKeyMatch ? testKeyMatch[1] : null;
        
        if (testKey) {
          const status = this._mapStatus(result.status);
          
          // Update stats
          reportData.stats[status.toLowerCase()]++;
          
          // Add to results
          reportData.results.push({
            testKey,
            status,
            name: result.name,
            duration: result.duration,
            error: result.error
          });
          
          // Update test in Jira if updateJira option is true
          if (options.updateJira) {
            await this.updateTestResult(testKey, status, {
              comment: result.error ? `Test failed: ${result.error}` : 'Test passed',
              attachments: result.attachments || [],
              createBug: status === 'FAIL' && options.createBugsForFailures
            });
          }
        }
      }
      
      // Save report to file if outputPath is provided
      if (options.outputPath) {
        const outputDir = path.dirname(options.outputPath);
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }
        
        fs.writeFileSync(options.outputPath, JSON.stringify(reportData, null, 2));
      }
      
      return reportData;
    } catch (error) {
      logger.error('Failed to generate test report:', error);
      throw error;
    }
  }
  
  /**
   * Map test status
   * @param {string} status - Test status
   * @returns {string} Mapped status
   * @private
   */
  _mapStatus(status) {
    const statusMap = {
      passed: 'PASS',
      failed: 'FAIL',
      skipped: 'SKIPPED',
      pending: 'PENDING',
      undefined: 'FAIL',
      ambiguous: 'FAIL',
      unknown: 'FAIL'
    };
    
    return statusMap[status?.toLowerCase()] || 'FAIL';
  }
}

module.exports = JiraTestManager;