const TestRailAPI = require('./testrail-api');
const fs = require('fs');
const path = require('path');

class TestCaseManager {
  constructor() {
    this.api = new TestRailAPI();
    this.projectId = process.env.TESTRAIL_PROJECT_ID;
    this.suiteId = process.env.TESTRAIL_SUITE_ID;
  }

  async createOrUpdateTestCase(testCaseData) {
    try {
      // Check if test case exists
      const existingCases = await this.api.getCases(this.projectId, this.suiteId);
      const existingCase = Array.isArray(existingCases) 
        ? existingCases.find(c => c.title === testCaseData.title)
        : null;

      if (existingCase) {
        // Update existing test case
        await this.api.updateCase(existingCase.id, {
          title: testCaseData.title,
          custom_steps_separated: testCaseData.steps,
          custom_expected: testCaseData.expected_result,
          priority_id: testCaseData.priority_id || 2,
          type_id: testCaseData.type_id || 1
        });
        return existingCase.id;
      } else {
        // Create new test case
        const sections = await this.api.getSections(this.projectId, this.suiteId);
        const sectionId = Array.isArray(sections) && sections.length > 0 
          ? sections[0].id 
          : await this.createDefaultSection();

        const newCase = await this.api.addCase(sectionId, {
          title: testCaseData.title,
          custom_steps_separated: testCaseData.steps,
          custom_expected: testCaseData.expected_result,
          priority_id: testCaseData.priority_id || 2,
          type_id: testCaseData.type_id || 1
        });
        return newCase.id;
      }
    } catch (error) {
      console.error('Failed to create/update test case:', error.message);
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

  async uploadAttachments(resultId, attachments) {
    for (const attachment of attachments) {
      if (fs.existsSync(attachment)) {
        try {
          await this.api.addAttachmentToResult(resultId, attachment);
          console.log(`📎 Uploaded attachment: ${path.basename(attachment)}`);
        } catch (error) {
          console.error(`Failed to upload ${attachment}:`, error.message);
        }
      }
    }
  }
}

module.exports = TestCaseManager;