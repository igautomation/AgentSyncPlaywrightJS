const axios = require('axios').default || require('axios');

class TestRailUploader {
  constructor() {
    this.baseURL = process.env.TESTRAIL_URL;
    this.username = process.env.TESTRAIL_USERNAME;
    this.apiKey = process.env.TESTRAIL_API_KEY;
    this.projectId = process.env.TESTRAIL_PROJECT_ID;
    this.suiteId = process.env.TESTRAIL_SUITE_ID;
    
    if (!this.baseURL || !this.username || !this.apiKey) {
      throw new Error('TestRail credentials not found in environment variables');
    }
    
    this.client = axios.create({
      baseURL: `${this.baseURL}/index.php?/api/v2/`,
      auth: {
        username: this.username,
        password: this.apiKey
      },
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  async createTestRun(name, caseIds) {
    try {
      const response = await this.client.post(`add_run/${this.projectId}`, {
        suite_id: parseInt(this.suiteId),
        name: name,
        include_all: false,
        case_ids: caseIds
      });
      return response.data.id;
    } catch (error) {
      console.error('Failed to create test run:', error.response?.data || error.message);
      throw error;
    }
  }

  async addResults(runId, results) {
    try {
      const response = await this.client.post(`add_results_for_cases/${runId}`, {
        results: results
      });
      console.log(`✅ Uploaded ${results.length} results to TestRail run ${runId}`);
      
      // Return individual result IDs for attachment upload
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      }
      
      // If bulk response, get individual results
      const tests = await this.getTestsInRun(runId);
      return tests.slice(0, results.length);
    } catch (error) {
      console.error('Failed to upload results:', error.response?.data || error.message);
      throw error;
    }
  }

  async getTestsInRun(runId) {
    try {
      const response = await this.client.get(`get_tests/${runId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get tests in run:', error.message);
      return [];
    }
  }

  async closeRun(runId) {
    try {
      await this.client.post(`close_run/${runId}`, {});
      console.log(`🔒 Closed TestRail run ${runId}`);
    } catch (error) {
      console.error('Failed to close run:', error.response?.data || error.message);
    }
  }
}

module.exports = TestRailUploader;