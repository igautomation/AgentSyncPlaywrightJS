const TestRailAPI = require('../core/testrail-api');

class TestCaseIdManager {
  constructor() {
    this.api = new TestRailAPI();
    this.projectId = process.env.TESTRAIL_PROJECT_ID;
    this.suiteId = process.env.TESTRAIL_SUITE_ID;
  }

  async getLastTestCaseId() {
    try {
      const cases = await this.api.getCases(this.projectId, this.suiteId);
      const caseArray = Array.isArray(cases) ? cases : cases.cases || [];
      
      if (caseArray.length === 0) {
        return 24000; // Default starting ID
      }
      
      const lastCase = caseArray.reduce((max, current) => 
        current.id > max.id ? current : max
      );
      
      console.log(`📋 Last test case ID: ${lastCase.id}`);
      return lastCase.id;
    } catch (error) {
      console.error('Failed to get last test case ID:', error.message);
      return 24000;
    }
  }

  async assignUniqueTestCaseIds(testCount) {
    try {
      const lastId = await this.getLastTestCaseId();
      const newIds = [];
      
      for (let i = 1; i <= testCount; i++) {
        newIds.push(lastId + i);
      }
      
      console.log(`🔢 Assigned unique test case IDs: ${newIds.join(', ')}`);
      return newIds;
    } catch (error) {
      console.error('Failed to assign unique test case IDs:', error.message);
      return Array.from({length: testCount}, (_, i) => 24000 + i + 1);
    }
  }

  async createTestCaseWithId(testCaseData) {
    try {
      const sections = await this.api.getSections(this.projectId, this.suiteId);
      const sectionId = Array.isArray(sections) && sections.length > 0 
        ? sections[0].id 
        : await this.createDefaultSection();

      const newCase = await this.api.addCase(sectionId, {
        title: testCaseData.title,
        custom_steps_separated: testCaseData.steps || [],
        custom_expected: testCaseData.expected_result || '',
        priority_id: testCaseData.priority_id || 2,
        type_id: testCaseData.type_id || 1
      });
      
      console.log(`✅ Created test case: ${newCase.id} - ${testCaseData.title}`);
      return newCase.id;
    } catch (error) {
      console.error('Failed to create test case:', error.message);
      return null;
    }
  }

  async createDefaultSection() {
    try {
      const section = await this.api.addSection(this.projectId, {
        name: 'Automated Tests',
        suite_id: this.suiteId
      });
      return section.id;
    } catch (error) {
      console.error('Failed to create default section:', error.message);
      return null;
    }
  }
}

module.exports = TestCaseIdManager;