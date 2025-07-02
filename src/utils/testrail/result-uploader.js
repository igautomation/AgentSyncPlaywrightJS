const TestRailAPI = require('./testrail-api');
const fs = require('fs');
const path = require('path');

class ResultUploader {
  constructor() {
    this.api = new TestRailAPI();
    this.projectId = process.env.TESTRAIL_PROJECT_ID;
  }

  async uploadTestResults(runId, testResults, attachmentPaths = []) {
    try {
      console.log(`📤 Uploading ${testResults.length} test results to run ${runId}`);
      
      // Upload results
      const response = await this.api.addResultsForCases(runId, { results: testResults });
      
      // Get test IDs for attachment upload
      const tests = await this.api.getTests(runId);
      
      // Upload attachments if provided
      if (attachmentPaths.length > 0 && tests.length > 0) {
        await this.uploadAttachments(tests, attachmentPaths);
      }
      
      console.log(`✅ Successfully uploaded results to TestRail run ${runId}`);
      return response;
      
    } catch (error) {
      console.error(`❌ Failed to upload results to run ${runId}:`, error.message);
      throw error;
    }
  }

  async uploadAttachments(tests, attachmentPaths) {
    for (let i = 0; i < Math.min(tests.length, attachmentPaths.length); i++) {
      const test = tests[i];
      const attachmentPath = attachmentPaths[i];
      
      if (fs.existsSync(attachmentPath)) {
        try {
          // Get the latest result for this test
          const results = await this.api.getResults(test.id);
          if (results.length > 0) {
            const latestResult = results[0];
            await this.api.addAttachmentToResult(latestResult.id, attachmentPath);
            console.log(`📎 Uploaded attachment for test ${test.id}: ${path.basename(attachmentPath)}`);
          }
        } catch (error) {
          console.error(`Failed to upload attachment for test ${test.id}:`, error.message);
        }
      }
    }
  }

  async createRunWithResults(runName, testCaseIds, testResults, attachmentPaths = []) {
    try {
      // Create test run
      const run = await this.api.addRun(this.projectId, {
        name: runName,
        suite_id: process.env.TESTRAIL_SUITE_ID,
        include_all: false,
        case_ids: testCaseIds
      });
      
      console.log(`📋 Created TestRail run ${run.id}: ${runName}`);
      
      // Upload results
      await this.uploadTestResults(run.id, testResults, attachmentPaths);
      
      // Close run
      await this.api.closeRun(run.id);
      console.log(`🔒 Closed TestRail run ${run.id}`);
      
      return run;
      
    } catch (error) {
      console.error('Failed to create run with results:', error.message);
      throw error;
    }
  }

  formatPlaywrightResults(playwrightResults) {
    return playwrightResults.map(result => ({
      case_id: result.testCaseId,
      status_id: this.mapStatus(result.status),
      comment: this.formatComment(result),
      elapsed: result.duration ? `${Math.round(result.duration / 1000)}s` : undefined
    }));
  }

  mapStatus(status) {
    const statusMap = {
      'passed': 1,    // Passed
      'failed': 5,    // Failed
      'timedOut': 5,  // Failed
      'skipped': 3,   // Untested
      'interrupted': 2 // Blocked
    };
    return statusMap[status] || 3;
  }

  formatComment(result) {
    let comment = `${result.status.toUpperCase()}\n\n`;
    comment += `Test: ${result.title}\n`;
    comment += `Duration: ${result.duration ? Math.round(result.duration / 1000) + 's' : 'N/A'}\n`;
    
    if (result.error) {
      comment += `\nError: ${result.error}\n`;
    }
    
    if (result.steps && result.steps.length > 0) {
      comment += `\nSteps:\n${result.steps.join('\n')}\n`;
    }
    
    return comment;
  }
}

module.exports = ResultUploader;