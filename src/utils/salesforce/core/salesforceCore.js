/**
 * Salesforce Core Utilities
 * Consolidated and cleaned Salesforce utilities
 */
const jsforce = require('jsforce');
const SalesforceAuthUtils = require('./salesforceAuthUtils');

class SalesforceCore {
  constructor(config = {}) {
    this.config = {
      username: config.username || process.env.SF_USERNAME,
      password: config.password || process.env.SF_PASSWORD,
      securityToken: config.securityToken || process.env.SF_SECURITY_TOKEN || '',
      loginUrl: config.loginUrl || process.env.SF_LOGIN_URL || 'https://login.salesforce.com',
      instanceUrl: config.instanceUrl || process.env.SF_INSTANCE_URL,
      accessToken: config.accessToken || process.env.SF_ACCESS_TOKEN,
      apiVersion: config.apiVersion || process.env.SF_API_VERSION || '62.0',
      ...config
    };

    this.conn = new jsforce.Connection({ loginUrl: this.config.loginUrl });
    this.authUtils = new SalesforceAuthUtils(this.config);
    this.isLoggedIn = false;
  }

  // Authentication Methods
  async login() {
    try {
      const result = await this.conn.login(
        this.config.username,
        this.config.password + this.config.securityToken
      );
      this.isLoggedIn = true;
      return result;
    } catch (error) {
      console.error(`Login error: ${error.message}`);
      throw error;
    }
  }

  async getAccessToken() {
    return await this.authUtils.getAccessToken();
  }

  async getInstanceUrl() {
    return await this.authUtils.getInstanceUrl();
  }

  async getAuthHeaders() {
    return await this.authUtils.getAuthHeaders();
  }

  // CRUD Operations
  async createRecord(objectType, data) {
    if (!this.isLoggedIn) await this.login();
    try {
      return await this.conn.sobject(objectType).create(data);
    } catch (error) {
      console.error(`Error creating ${objectType}: ${error.message}`);
      throw error;
    }
  }

  async updateRecord(objectType, recordId, data) {
    if (!this.isLoggedIn) await this.login();
    try {
      return await this.conn.sobject(objectType).update({ Id: recordId, ...data });
    } catch (error) {
      console.error(`Error updating ${objectType}: ${error.message}`);
      throw error;
    }
  }

  async deleteRecord(objectType, recordId) {
    if (!this.isLoggedIn) await this.login();
    try {
      return await this.conn.sobject(objectType).destroy(recordId);
    } catch (error) {
      console.error(`Error deleting ${objectType}: ${error.message}`);
      throw error;
    }
  }

  // Query Operations
  async query(soql) {
    if (!this.isLoggedIn) await this.login();
    try {
      return await this.conn.query(soql);
    } catch (error) {
      console.error(`Query error: ${error.message}`);
      throw error;
    }
  }

  async queryRecords(soql) {
    const result = await this.query(soql);
    return result.records || [];
  }

  async queryCount(soql) {
    const result = await this.query(soql);
    return result.totalSize || 0;
  }

  // Utility Methods
  async cleanupTestData(objectType, fieldName, fieldValue) {
    if (!this.isLoggedIn) await this.login();
    try {
      const query = `SELECT Id FROM ${objectType} WHERE ${fieldName} = '${fieldValue}'`;
      const result = await this.conn.query(query);
      
      if (result.records.length > 0) {
        const ids = result.records.map(record => record.Id);
        return await this.conn.sobject(objectType).destroy(ids);
      }
      
      return { success: true, message: 'No records found to delete' };
    } catch (error) {
      console.error(`Error cleaning up test data: ${error.message}`);
      throw error;
    }
  }

  async waitForQueryData(query, expectedRecordSize, options = {}) {
    const maxRetries = options.maxRetries || 10;
    const retryInterval = options.retryInterval || 5000;
    const initialWait = options.initialWait || 10000;
    
    await new Promise(resolve => setTimeout(resolve, initialWait));
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const size = await this.queryCount(query);
      
      if (size === expectedRecordSize) {
        return true;
      }
      
      console.log(`Waiting for records... (${attempt + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, retryInterval));
    }
    
    throw new Error(`Condition not met within ${maxRetries} retries`);
  }
}

module.exports = SalesforceCore;