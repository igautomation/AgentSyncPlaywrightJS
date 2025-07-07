const TestRailAPI = require('../core/testrail-api');

class TestCaseFetcher {
  constructor() {
    this.api = new TestRailAPI();
    this.projectId = process.env.TESTRAIL_PROJECT_ID;
    this.suiteId = process.env.TESTRAIL_SUITE_ID;
  }

  async getTestCases() {
    try {
      const response = await this.api.getCases(this.projectId, this.suiteId);
      let cases = [];
      
      if (Array.isArray(response)) {
        cases = response;
      } else if (response && response.cases) {
        cases = response.cases;
      } else if (response && typeof response === 'object') {
        // Handle different response formats
        cases = Object.values(response).filter(item => item && item.id && item.title);
      }
      
      console.log(`📋 Found ${cases.length} test cases in suite ${this.suiteId}`);
      return cases;
    } catch (error) {
      console.error('Failed to fetch test cases:', error.message);
      return [];
    }
  }

  async getTestCaseIds() {
    const cases = await this.getTestCases();
    return cases.map(testCase => testCase.id);
  }

  async getTestCasesByTitle(titlePattern) {
    const cases = await this.getTestCases();
    return cases.filter(testCase => 
      testCase.title && testCase.title.toLowerCase().includes(titlePattern.toLowerCase())
    );
  }

  async getUITestCases() {
    return await this.getTestCasesByTitle('ui');
  }

  async getAPITestCases() {
    return await this.getTestCasesByTitle('api');
  }
}

module.exports = TestCaseFetcher;