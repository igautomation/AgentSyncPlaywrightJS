/**
 * Jira API Client
 * 
 * Direct integration with Jira REST API
 */
const axios = require('axios');
const logger = require('../common/logger');

class JiraClient {
  /**
   * Create a new JiraClient instance
   * @param {Object} config - Configuration
   * @param {string} config.baseUrl - Jira base URL
   * @param {string} config.username - Jira username
   * @param {string} config.apiToken - Jira API token
   * @param {string} config.projectKey - Jira project key
   */
  constructor(config = {}) {
    this.baseUrl = config.baseUrl || process.env.JIRA_BASE_URL;
    this.username = config.username || process.env.JIRA_USERNAME;
    this.apiToken = config.apiToken || process.env.JIRA_API_TOKEN;
    this.projectKey = config.projectKey || process.env.JIRA_PROJECT_KEY;
    
    if (!this.baseUrl || !this.username || !this.apiToken) {
      logger.warn('Jira API client not fully configured. Set JIRA_BASE_URL, JIRA_USERNAME, and JIRA_API_TOKEN environment variables.');
    }
  }
  
  /**
   * Get API client
   * @returns {Object} Axios instance
   * @private
   */
  _getClient() {
    return {
      get: async (url) => {
        return await axios({
          method: 'get',
          url: `${this.baseUrl}/rest/api/3${url}`,
          auth: {
            username: this.username,
            password: this.apiToken
          },
          headers: {
            'Content-Type': 'application/json'
          }
        });
      },
      post: async (url, data) => {
        return await axios({
          method: 'post',
          url: `${this.baseUrl}/rest/api/3${url}`,
          auth: {
            username: this.username,
            password: this.apiToken
          },
          headers: {
            'Content-Type': 'application/json'
          },
          data
        });
      },
      put: async (url, data) => {
        return await axios({
          method: 'put',
          url: `${this.baseUrl}/rest/api/3${url}`,
          auth: {
            username: this.username,
            password: this.apiToken
          },
          headers: {
            'Content-Type': 'application/json'
          },
          data
        });
      }
    };
  }
  
  /**
   * Get issue by key
   * @param {string} issueKey - Issue key
   * @returns {Promise<Object>} Issue data
   */
  async getIssue(issueKey) {
    try {
      const client = this._getClient();
      const response = await client.get(`/issue/${issueKey}`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to get issue ${issueKey}:`, error.message);
      throw error;
    }
  }
  
  /**
   * Create issue
   * @param {Object} issueData - Issue data
   * @returns {Promise<Object>} Created issue
   */
  async createIssue(issueData) {
    try {
      const client = this._getClient();
      
      // Set default project if not provided
      if (!issueData.fields?.project?.key && this.projectKey) {
        if (!issueData.fields) issueData.fields = {};
        issueData.fields.project = { key: this.projectKey };
      }
      
      const response = await client.post('/issue', issueData);
      return response.data;
    } catch (error) {
      logger.error('Failed to create issue:', error.message);
      throw error;
    }
  }
  
  /**
   * Update issue
   * @param {string} issueKey - Issue key
   * @param {Object} issueData - Issue data
   * @returns {Promise<Object>} Updated issue
   */
  async updateIssue(issueKey, issueData) {
    try {
      const client = this._getClient();
      const response = await client.put(`/issue/${issueKey}`, issueData);
      return response.data;
    } catch (error) {
      logger.error(`Failed to update issue ${issueKey}:`, error.message);
      throw error;
    }
  }
  
  /**
   * Search issues
   * @param {string} jql - JQL query
   * @param {Object} options - Search options
   * @returns {Promise<Object>} Search results
   */
  async searchIssues(jql, options = {}) {
    try {
      const client = this._getClient();
      const response = await client.post('/search', {
        jql,
        startAt: options.startAt || 0,
        maxResults: options.maxResults || 50,
        fields: options.fields || ['summary', 'status', 'assignee']
      });
      return response.data;
    } catch (error) {
      logger.error('Failed to search issues:', error.message);
      throw error;
    }
  }
}