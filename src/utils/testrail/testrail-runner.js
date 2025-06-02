/**
 * TestRail integration for Playwright tests
 */
const axios = require('axios');

class TestRailRunner {
  /**
   * @param {Object} config - TestRail configuration
   * @param {string} config.host - TestRail host URL
   * @param {string} config.username - TestRail username/email
   * @param {string} config.password - TestRail password/API key
   * @param {string} config.projectId - TestRail project ID
   * @param {string} [config.suiteId] - TestRail suite ID
   * @param {string} [config.runId] - Existing run ID (optional)
   */
  constructor(config) {
    this.host = config.host;
    this.username = config.username;
    this.password = config.password;
    this.projectId = config.projectId;
    this.suiteId = config.suiteId;
    this.runId = config.runId;
    
    // TestRail status IDs
    this.STATUS = {
      PASSED: 1,
      BLOCKED: 2,
      UNTESTED: 3,
      RETEST: 4,
      FAILED: 5
    };
  }

  /**
   * Create API client for TestRail
   * @returns {Object} Axios instance
   */
  _getClient() {
    return axios.create({
      baseURL: `${this.host}/index.php?/api/v2/`,
      headers: { 'Content-Type': 'application/json' },
      auth: {
        username: this.username,
        password: this.password
      }
    });
  }

  /**
   * Create a new test run
   * @param {string} name - Run name
   * @param {string} [description] - Run description
   * @param {Array<string>} [caseIds] - Test case IDs to include
   * @returns {Promise<string>} Run ID
   */
  async createRun(name, description = '', caseIds = []) {
    const client = this._getClient();
    
    const payload = {
      name,
      description,
      suite_id: this.suiteId,
      include_all: caseIds.length === 0
    };
    
    if (caseIds.length > 0) {
      payload.case_ids = caseIds;
    }
    
    try {
      const response = await client.post(`add_run/${this.projectId}`, payload);
      this.runId = response.data.id;
      console.log(`Created TestRail run: ${name} (ID: ${this.runId})`);
      return this.runId;
    } catch (error) {
      console.error('Error creating TestRail run:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Add test result
   * @param {string} caseId - Test case ID
   * @param {number} statusId - Status ID
   * @param {string} [comment] - Result comment
   * @param {number} [elapsed] - Elapsed time in seconds
   * @returns {Promise<Object>} Result data
   */
  async addResult(caseId, statusId, comment = '', elapsed = null) {
    if (!this.runId) {
      throw new Error('No run ID set. Create or set a run first.');
    }
    
    const client = this._getClient();
    
    const payload = {
      status_id: statusId,
      comment
    };
    
    if (elapsed) {
      payload.elapsed = `${Math.round(elapsed)}s`;
    }
    
    try {
      const response = await client.post(`add_result_for_case/${this.runId}/${caseId}`, payload);
      return response.data;
    } catch (error) {
      console.error('Error adding TestRail result:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Close a test run
   * @returns {Promise<Object>} Response data
   */
  async closeRun() {
    if (!this.runId) {
      throw new Error('No run ID set. Create or set a run first.');
    }
    
    const client = this._getClient();
    
    try {
      const response = await client.post(`close_run/${this.runId}`);
      console.log(`Closed TestRail run: ${this.runId}`);
      return response.data;
    } catch (error) {
      console.error('Error closing TestRail run:', error.response?.data || error.message);
      throw error;
    }
  }
}

module.exports = TestRailRunner;