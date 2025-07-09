const fetch = require('node-fetch');

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
    
    // Create auth header
    const authString = Buffer.from(`${this.username}:${this.apiKey}`).toString('base64');
    this.headers = {
      'Authorization': `Basic ${authString}`,
      'Content-Type': 'application/json'
    };
  }
  
  // Helper method for API requests
  async request(method, endpoint, data = null) {
    const url = `${this.baseURL}/index.php?/api/v2/${endpoint}`;
    
    const options = {
      method,
      headers: this.headers
    };
    
    if (data && method !== 'GET') {
      options.body = JSON.stringify(data);
    }
    
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`TestRail API error: ${response.status} - ${errorText}`);
    }
    
    return await response.json();
  }

  async createTestRun(name, caseIds) {
    try {
      const data = {
        suite_id: parseInt(this.suiteId),
        name: name,
        include_all: false,
        case_ids: caseIds
      };
      
      const response = await this.request('POST', `add_run/${this.projectId}`, data);
      return response.id;
    } catch (error) {
      console.error('Failed to create test run:', error.message);
      throw error;
    }
  }

  async addResults(runId, results) {
    try {
      const data = { results: results };
      const response = await this.request('POST', `add_results_for_cases/${runId}`, data);
      console.log(`✅ Uploaded ${results.length} results to TestRail run ${runId}`);
      
      // Return individual result IDs for attachment upload
      if (response && Array.isArray(response)) {
        return response;
      }
      
      // If bulk response, get individual results
      const tests = await this.getTestsInRun(runId);
      return tests.slice(0, results.length);
    } catch (error) {
      console.error('Failed to upload results:', error.message);
      throw error;
    }
  }

  async getTestsInRun(runId) {
    try {
      return await this.request('GET', `get_tests/${runId}`);
    } catch (error) {
      console.error('Failed to get tests in run:', error.message);
      return [];
    }
  }

  async closeRun(runId) {
    try {
      await this.request('POST', `close_run/${runId}`, {});
      console.log(`🔒 Closed TestRail run ${runId}`);
    } catch (error) {
      console.error('Failed to close run:', error.message);
    }
  }
}

module.exports = TestRailUploader;