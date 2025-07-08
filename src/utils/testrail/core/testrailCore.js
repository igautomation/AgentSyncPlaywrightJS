/**
 * TestRail Core Utilities
 * Consolidated and cleaned TestRail utilities
 */
const TestRailAPI = require('./testrail-api-simple');
const fs = require('fs');
const path = require('path');

class TestRailCore {
  constructor(config = {}) {
    this.config = {
      url: config.url || process.env.TESTRAIL_URL,
      username: config.username || process.env.TESTRAIL_USERNAME,
      apiKey: config.apiKey || process.env.TESTRAIL_API_KEY,
      projectId: config.projectId || process.env.TESTRAIL_PROJECT_ID,
      suiteId: config.suiteId || process.env.TESTRAIL_SUITE_ID,
      ...config
    };

    this.api = new TestRailAPI();
  }

  // Test Run Management
  async createTestRun(name, description = '', caseIds = []) {
    const runData = {
      name,
      description,
      suite_id: this.config.suiteId,
      include_all: caseIds.length === 0,
      case_ids: caseIds.length > 0 ? caseIds : undefined
    };

    const run = await this.api.addRun(this.config.projectId, runData);
    console.log(`📋 Created test run: ${run.id} - ${name}`);
    return run;
  }

  async closeTestRun(runId) {
    await this.api.closeRun(runId);
    console.log(`🔒 Closed test run: ${runId}`);
  }

  async deleteTestRun(runId) {
    await this.api.deleteRun(runId);
    console.log(`🗑️ Deleted test run: ${runId}`);
  }

  // Test Results
  async addTestResults(runId, results) {
    const response = await this.api.addResultsForCases(runId, { results });
    console.log(`✅ Added ${results.length} test results to run ${runId}`);
    return response;
  }

  async addSingleResult(runId, caseId, status, comment = '', elapsed = null) {
    const result = {
      status_id: status,
      comment,
      elapsed
    };

    const response = await this.api.addResultForCase(runId, caseId, result);
    console.log(`✅ Added result for case ${caseId} in run ${runId}`);
    return response;
  }

  // Test Cases
  async getTestCases(suiteId = null) {
    const targetSuiteId = suiteId || this.config.suiteId;
    return await this.api.getCases(this.config.projectId, targetSuiteId);
  }

  async createTestCase(sectionId, caseData) {
    const testCase = await this.api.addCase(sectionId, caseData);
    console.log(`✅ Created test case: ${testCase.id} - ${caseData.title}`);
    return testCase;
  }

  async getLastTestCaseId() {
    try {
      const cases = await this.getTestCases();
      const caseArray = Array.isArray(cases) ? cases : cases.cases || [];
      
      if (caseArray.length === 0) {
        return 24000;
      }
      
      const lastCase = caseArray.reduce((max, current) => 
        current.id > max.id ? current : max
      );
      
      return lastCase.id;
    } catch (error) {
      console.error('Failed to get last test case ID:', error.message);
      return 24000;
    }
  }

  async generateUniqueTestCaseIds(count) {
    const lastId = await this.getLastTestCaseId();
    const newIds = [];
    
    for (let i = 1; i <= count; i++) {
      newIds.push(lastId + i);
    }
    
    console.log(`🔢 Generated unique test case IDs: ${newIds.join(', ')}`);
    return newIds;
  }

  // File Attachments
  async uploadReportToRun(runId, reportPath) {
    if (!fs.existsSync(reportPath)) {
      console.log(`⚠️ Report not found: ${reportPath}`);
      return false;
    }

    try {
      await this.api.addAttachmentToRun(runId, reportPath);
      console.log(`📊 Uploaded report: ${path.basename(reportPath)}`);
      return true;
    } catch (error) {
      console.error('Failed to upload report:', error.message);
      return false;
    }
  }

  async uploadArtifactsToRun(runId, artifactsDir = './test-results') {
    if (!fs.existsSync(artifactsDir)) {
      console.log(`⚠️ Artifacts directory not found: ${artifactsDir}`);
      return 0;
    }

    let uploadCount = 0;
    const files = fs.readdirSync(artifactsDir, { recursive: true });
    
    for (const file of files) {
      const filePath = path.join(artifactsDir, file);
      
      if (fs.statSync(filePath).isFile() && 
          (file.endsWith('.zip') || file.endsWith('.png') || file.endsWith('.webm'))) {
        
        try {
          await this.api.addAttachmentToRun(runId, filePath);
          console.log(`📎 Uploaded: ${path.basename(file)}`);
          uploadCount++;
        } catch (error) {
          console.error(`Failed to upload ${file}:`, error.message);
        }
      }
    }

    console.log(`📁 Uploaded ${uploadCount} artifacts`);
    return uploadCount;
  }

  // Complete Test Execution
  async executeTestRun(testResults, runName = null, options = {}) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const finalRunName = runName || `Automated Test Run - ${timestamp}`;
    
    try {
      // Create test run
      const run = await this.createTestRun(finalRunName, options.description || 'Automated test execution');
      
      // Add test results
      await this.addTestResults(run.id, testResults);
      
      // Upload reports and artifacts
      if (options.uploadReport !== false) {
        await this.uploadReportToRun(run.id, './playwright-report/index.html');
      }
      
      if (options.uploadArtifacts !== false) {
        await this.uploadArtifactsToRun(run.id, options.artifactsDir);
      }
      
      // Close run if requested
      if (options.closeRun !== false) {
        await this.closeTestRun(run.id);
      }
      
      return run.id;
    } catch (error) {
      console.error('Failed to execute test run:', error.message);
      throw error;
    }
  }

  // Status Helpers
  getStatusId(status) {
    const statusMap = {
      'passed': 1,
      'blocked': 2,
      'untested': 3,
      'retest': 4,
      'failed': 5
    };
    return statusMap[status.toLowerCase()] || 3;
  }

  formatResult(testResult) {
    return {
      case_id: testResult.caseId,
      status_id: this.getStatusId(testResult.status),
      comment: testResult.comment || '',
      elapsed: testResult.duration ? `${Math.round(testResult.duration / 1000)}s` : null
    };
  }

  formatPlaywrightResults(playwrightResults) {
    return playwrightResults.map(result => this.formatResult({
      caseId: result.testCaseId,
      status: result.status === 'passed' ? 'passed' : 'failed',
      comment: result.error || `Test ${result.status}`,
      duration: result.duration
    }));
  }
}

module.exports = TestRailCore;