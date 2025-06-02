// @ts-check
require('dotenv').config();
const jsforce = require('jsforce');
const { execSync } = require('child_process');

/**
 * Utility class for Salesforce API operations
 */
class SalesforceUtils {
  /**
   * @param {Object} config - Configuration object
   * @param {string} config.username - Salesforce username
   * @param {string} config.password - Salesforce password
   * @param {string} [config.securityToken] - Salesforce security token
   * @param {string} [config.loginUrl] - Salesforce login URL
   * @param {string} [config.orgAlias] - Salesforce org alias for CLI operations
   */
  constructor(config) {
    this.username = config.username || process.env.SF_USERNAME;
    this.password = config.password || process.env.SF_PASSWORD;
    this.securityToken = config.securityToken || process.env.SF_SECURITY_TOKEN || '';
    this.loginUrl = config.loginUrl || process.env.SF_LOGIN_URL || 'https://login.salesforce.com';
    this.orgAlias = config.orgAlias || process.env.SF_ORG_ALIAS;
    this.conn = new jsforce.Connection({ loginUrl: this.loginUrl });
    this.isLoggedIn = false;
  }

  /**
   * Login to Salesforce
   * @returns {Promise<Object>} Login result
   */
  async login() {
    try {
      const result = await this.conn.login(
        this.username, 
        this.password + this.securityToken
      );
      this.isLoggedIn = true;
      return result;
    } catch (error) {
      console.error(`Salesforce login error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create a record
   * @param {string} objectType - Salesforce object type (e.g., 'Account', 'Contact')
   * @param {Object} data - Record data
   * @returns {Promise<Object>} Create result
   */
  async createRecord(objectType, data) {
    if (!this.isLoggedIn) await this.login();
    
    try {
      return await this.conn.sobject(objectType).create(data);
    } catch (error) {
      console.error(`Error creating ${objectType}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update a record
   * @param {string} objectType - Salesforce object type
   * @param {string} recordId - Record ID
   * @param {Object} data - Record data
   * @returns {Promise<Object>} Update result
   */
  async updateRecord(objectType, recordId, data) {
    if (!this.isLoggedIn) await this.login();
    
    try {
      return await this.conn.sobject(objectType).update({ Id: recordId, ...data });
    } catch (error) {
      console.error(`Error updating ${objectType}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete a record
   * @param {string} objectType - Salesforce object type
   * @param {string} recordId - Record ID
   * @returns {Promise<Object>} Delete result
   */
  async deleteRecord(objectType, recordId) {
    if (!this.isLoggedIn) await this.login();
    
    try {
      return await this.conn.sobject(objectType).destroy(recordId);
    } catch (error) {
      console.error(`Error deleting ${objectType}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Execute a SOQL query
   * @param {string} query - SOQL query
   * @returns {Promise<Object>} Query result
   */
  async query(query) {
    if (!this.isLoggedIn) await this.login();
    
    try {
      return await this.conn.query(query);
    } catch (error) {
      console.error(`Query error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Clean up test data
   * @param {string} objectType - Salesforce object type
   * @param {string} fieldName - Field name to filter by
   * @param {string} fieldValue - Field value to filter by
   * @returns {Promise<Object>} Delete result
   */
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

  /**
   * Execute SOQL query and return records
   * @param {string} query - SOQL query
   * @returns {Promise<Array>} Query records
   */
  async executeSOQLQueryAndReturnRecords(query) {
    const result = await this.query(query);
    return result.records || [];
  }

  /**
   * Execute SOQL query and return total size
   * @param {string} query - SOQL query
   * @returns {Promise<number>} Total size
   */
  async executeSOQLQueryAndReturnTotalSize(query) {
    const result = await this.query(query);
    return result.totalSize || 0;
  }

  /**
   * Wait for query data to match expected record size
   * @param {string} query - SOQL query
   * @param {number} expectedRecordSize - Expected record count
   * @param {Object} options - Options
   * @returns {Promise<boolean>} True if condition met
   */
  async waitForQueryData(query, expectedRecordSize, options = {}) {
    const maxRetries = options.maxRetries || 10;
    const retryInterval = options.retryInterval || 5000;
    const initialWait = options.initialWait || 10000;
    
    // Initial wait
    await new Promise(resolve => setTimeout(resolve, initialWait));
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const size = await this.executeSOQLQueryAndReturnTotalSize(query);
      
      if (size === expectedRecordSize) {
        return true;
      }
      
      console.log(`Waiting for records... (${attempt + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, retryInterval));
    }
    
    throw new Error(`Condition not met within ${maxRetries} retries`);
  }

  /**
   * Deploy metadata file to org
   * @param {string} pathToMetadata - Path to metadata file/directory
   * @returns {Promise<Object>} Deployment result
   */
  async deployMetadataFileToOrg(pathToMetadata) {
    if (!this.orgAlias) {
      throw new Error('Org alias is required for deployment');
    }
    
    try {
      const result = execSync(
        `sf project:start:deploy -d ${pathToMetadata} -o ${this.orgAlias} -c`,
        { encoding: 'utf8' }
      );
      return { success: true, output: result };
    } catch (error) {
      console.error(`Deployment error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Run anonymous Apex
   * @param {string} pathToApex - Path to Apex file
   * @param {string} cwd - Current working directory
   * @returns {Promise<Object>} Execution result
   */
  async runAnonymousApex(pathToApex, cwd) {
    if (!this.orgAlias) {
      throw new Error('Org alias is required for Apex execution');
    }
    
    try {
      const result = execSync(
        `sf apex:run -f ${pathToApex} -o ${this.orgAlias}`,
        { encoding: 'utf8', cwd }
      );
      return { success: true, output: result };
    } catch (error) {
      console.error(`Apex execution error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get latest field history record
   * @param {string} objectName - Object name
   * @param {string} field - Field name
   * @returns {Promise<Object|null>} Field history record
   */
  async getLatestFieldHistoryRecord(objectName, field) {
    const query = `SELECT Field, NewValue, OldValue FROM ${objectName}__history WHERE Field = '${field}' ORDER BY CreatedDate DESC LIMIT 1`;
    const records = await this.executeSOQLQueryAndReturnRecords(query);
    return records.length > 0 ? records[0] : null;
  }

  /**
   * Validate deployment status
   * @returns {Promise<boolean>} True if deployment succeeded
   */
  async validateDeploymentStatus() {
    const records = await this.executeSOQLQueryAndReturnRecords(
      'Select Id, Status FROM DeployRequest Order By StartDate DESC LIMIT 1'
    );
    
    if (records.length === 0) {
      throw new Error('No deployment records found');
    }
    
    return records[0].Status === 'Succeeded';
  }
}

module.exports = SalesforceUtils;