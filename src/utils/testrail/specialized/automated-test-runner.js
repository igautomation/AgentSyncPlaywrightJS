const TestRailAPI = require('../core/testrail-api');
const fs = require('fs');
const path = require('path');

class AutomatedTestRunner {
  constructor() {
    this.api = new TestRailAPI();
    this.projectId = process.env.TESTRAIL_PROJECT_ID;
    this.suiteId = process.env.TESTRAIL_SUITE_ID;
  }

  async createNewTestRun(runName, description = '') {
    try {
      const run = await this.api.addRun(this.projectId, {
        name: runName,
        description: description,
        suite_id: this.suiteId,
        include_all: true
      });
      
      console.log(`📋 Created new TestRail run: ${run.id} - ${runName}`);
      return run.id;
    } catch (error) {
      console.error('Failed to create test run:', error.message);
      throw error;
    }
  }

  async addTestResults(runId, results) {
    try {
      const response = await this.api.addResultsForCases(runId, { results });
      console.log(`✅ Added ${results.length} test results to run ${runId}`);
      return response;
    } catch (error) {
      console.error('Failed to add test results:', error.message);
      throw error;
    }
  }

  async uploadPlaywrightReport(runId) {
    try {
      const reportPath = './playwright-report/index.html';
      
      if (fs.existsSync(reportPath)) {
        await this.api.addAttachmentToRun(runId, reportPath);
        console.log('📊 Uploaded Playwright HTML report');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to upload report:', error.message);
      return false;
    }
  }

  async uploadTestArtifacts(runId) {
    try {
      const testResultsDir = './test-results';
      let uploadCount = 0;

      if (fs.existsSync(testResultsDir)) {
        const files = fs.readdirSync(testResultsDir, { recursive: true });
        
        for (const file of files) {
          const filePath = path.join(testResultsDir, file);
          
          if (fs.statSync(filePath).isFile() && 
              (file.endsWith('.zip') || file.endsWith('.png') || file.endsWith('.webm'))) {
            
            await this.api.addAttachmentToRun(runId, filePath);
            console.log(`📎 Uploaded: ${path.basename(file)}`);
            uploadCount++;
          }
        }
      }

      console.log(`📁 Uploaded ${uploadCount} test artifacts`);
      return uploadCount;
    } catch (error) {
      console.error('Failed to upload artifacts:', error.message);
      return 0;
    }
  }

  async executeTestRun(testResults, runName = null) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const finalRunName = runName || `Automated Test Execution - ${timestamp}`;
      
      // Create new test run
      const runId = await this.createNewTestRun(finalRunName, 'Automated test execution with Playwright');
      
      // Add test results
      await this.addTestResults(runId, testResults);
      
      // Upload Playwright report
      await this.uploadPlaywrightReport(runId);
      
      // Upload test artifacts
      await this.uploadTestArtifacts(runId);
      
      // Close the run
      await this.api.closeRun(runId);
      console.log(`🔒 Closed test run ${runId}`);
      
      return runId;
    } catch (error) {
      console.error('Failed to execute test run:', error.message);
      throw error;
    }
  }
}

module.exports = AutomatedTestRunner;