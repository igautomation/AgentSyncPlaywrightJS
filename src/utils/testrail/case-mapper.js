/**
 * TestRail Case Mapper
 * Queries TestRail to get actual case IDs and maps them to tests
 */
const { TestRailClient } = require('./index');
require('dotenv').config({ path: '.env.unified' });

class TestRailCaseMapper {
  constructor() {
    this.testRailClient = new TestRailClient({
      baseUrl: process.env.TESTRAIL_URL,
      username: process.env.TESTRAIL_USERNAME,
      password: process.env.TESTRAIL_PASSWORD,
      projectId: process.env.TESTRAIL_PROJECT_ID
    });
    this.caseMap = new Map();
  }

  async initializeCaseMapping() {
    try {
      // Get all test cases from TestRail suite
      const cases = await this.testRailClient.getCases(
        process.env.TESTRAIL_PROJECT_ID,
        process.env.TESTRAIL_SUITE_ID
      );

      // Map test titles to case IDs
      cases.forEach(testCase => {
        const title = testCase.title.toLowerCase();
        
        if (title.includes('api limits') || title.includes('salesforce api limits')) {
          this.caseMap.set('C1: Salesforce API Limits Test', testCase.id);
        }
        else if (title.includes('record count') || title.includes('api record count')) {
          this.caseMap.set('C2: Salesforce API Record Count Test', testCase.id);
        }
        else if (title.includes('login ui') || title.includes('salesforce login')) {
          this.caseMap.set('C3: Salesforce Login UI Test', testCase.id);
        }
        else if (title.includes('contact navigation') || title.includes('navigation')) {
          this.caseMap.set('C4: Salesforce Contact Navigation Test', testCase.id);
        }
        else if (title.includes('framework validation') || title.includes('validation')) {
          this.caseMap.set('C5: Framework Validation Test', testCase.id);
        }
      });

      console.log('📋 TestRail case mapping initialized:');
      this.caseMap.forEach((caseId, testTitle) => {
        console.log(`  ${testTitle} → Case ID: ${caseId}`);
      });

      return this.caseMap;
    } catch (error) {
      console.log('⚠️ Failed to initialize TestRail case mapping:', error.message);
      // Return default mapping as fallback
      return new Map([
        ['C1: Salesforce API Limits Test', 1],
        ['C2: Salesforce API Record Count Test', 2],
        ['C3: Salesforce Login UI Test', 3],
        ['C4: Salesforce Contact Navigation Test', 4],
        ['C5: Framework Validation Test', 5]
      ]);
    }
  }

  getCaseId(testTitle) {
    return this.caseMap.get(testTitle) || 1; // Default fallback
  }

  getAllCaseIds() {
    return Array.from(this.caseMap.values());
  }
}

module.exports = TestRailCaseMapper;