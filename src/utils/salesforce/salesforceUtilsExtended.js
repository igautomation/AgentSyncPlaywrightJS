// @ts-check
const SalesforceUtils = require('./salesforceUtils');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Extended Salesforce Utilities
 */
class SalesforceUtilsExtended extends SalesforceUtils {
  /**
   * @param {Object} config - Configuration object
   */
  constructor(config) {
    super(config);
    this.orgAlias = config.orgAlias || process.env.SF_ORG_ALIAS;
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

module.exports = SalesforceUtilsExtended;