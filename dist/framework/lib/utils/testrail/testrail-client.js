const axios = require('axios');

class TestRailClient {
  constructor(options) {
    this.baseUrl = options.baseUrl;
    this.username = options.username;
    this.password = options.password || options.apiKey;
    this.projectId = options.projectId;
    
    this.client = axios.create({
      baseURL: `${this.baseUrl}/index.php?/api/v2/`,
      auth: {
        username: this.username,
        password: this.password
      },
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  async getCase(caseId) {
    try {
      const response = await this.client.get(`get_case/${caseId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching test case ${caseId}:`, error.message);
      throw error;
    }
  }

  async getCaseSteps(caseId) {
    try {
      const testCase = await this.getCase(caseId);
      return testCase.custom_steps_separated || [];
    } catch (error) {
      console.error(`Error fetching test case steps for ${caseId}:`, error.message);
      throw error;
    }
  }

  async addRun(name, caseIds, suiteId = null) {
    try {
      const payload = {
        name,
        include_all: false,
        case_ids: caseIds,
        project_id: this.projectId
      };
      
      if (suiteId) {
        payload.suite_id = suiteId;
      }
      
      const response = await this.client.post('add_run', payload);
      return response.data;
    } catch (error) {
      console.error('Error creating test run:', error.message);
      throw error;
    }
  }

  async addResultForCase(runId, caseId, status, comment = '', elapsed = null, attachments = []) {
    try {
      const payload = {
        status_id: status,
        comment: comment,
      };
      
      if (elapsed) {
        payload.elapsed = elapsed;
      }
      
      const response = await this.client.post(`add_result_for_case/${runId}/${caseId}`, payload);
      const resultId = response.data.id;
      
      // Upload attachments if any
      for (const attachment of attachments) {
        await this.addAttachmentToResult(resultId, attachment);
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error adding result for case ${caseId}:`, error.message);
      throw error;
    }
  }

  async addAttachmentToResult(resultId, filePath) {
    try {
      const FormData = require('form-data');
      const fs = require('fs');
      const form = new FormData();
      
      form.append('attachment', fs.createReadStream(filePath));
      
      await axios.post(
        `${this.baseUrl}/index.php?/api/v2/add_attachment_to_result/${resultId}`,
        form,
        {
          auth: {
            username: this.username,
            password: this.password
          },
          headers: form.getHeaders()
        }
      );
      
      return true;
    } catch (error) {
      console.error(`Error adding attachment to result ${resultId}:`, error.message);
      throw error;
    }
  }
}

module.exports = TestRailClient;