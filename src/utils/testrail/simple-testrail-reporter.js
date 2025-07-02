class SimpleTestRailReporter {
  constructor(options = {}) {
    this.config = {
      host: process.env.TESTRAIL_URL,
      username: process.env.TESTRAIL_USERNAME,
      password: process.env.TESTRAIL_API_KEY,
      projectId: process.env.TESTRAIL_PROJECT_ID,
      suiteId: process.env.TESTRAIL_SUITE_ID
    };
    
    this.results = [];
    console.log('🔗 TestRail Reporter initialized');
  }

  onBegin(config, suite) {
    console.log('🚀 Starting TestRail integration...');
  }

  onTestEnd(test, result) {
    const testCaseId = this.extractTestCaseId(test.title);
    if (!testCaseId) return;

    const status = this.mapStatus(result.status);
    const comment = `Test executed via Playwright - Status: ${result.status}, Duration: ${Math.round(result.duration / 1000)}s`;
    
    this.results.push({
      case_id: testCaseId,
      status_id: status,
      comment: comment
    });
    
    console.log(`📊 Test C${testCaseId}: ${result.status} (${Math.round(result.duration / 1000)}s)`);
  }

  onEnd(result) {
    console.log(`✅ TestRail integration completed - ${this.results.length} results collected`);
    console.log('Results:', this.results);
  }

  extractTestCaseId(title) {
    const match = title.match(/C(\d+):/);
    return match ? parseInt(match[1]) : null;
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
}

module.exports = SimpleTestRailReporter;