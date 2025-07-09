/**
 * Salesforce Database Utilities
 * 
 * Enhanced database operations for Salesforce
 */
const jsforce = require('jsforce');

class SalesforceDbUtils {
  constructor(config = {}) {
    this.config = {
      username: config.username || process.env.SF_USERNAME,
      password: config.password || process.env.SF_PASSWORD,
      securityToken: config.securityToken || process.env.SF_SECURITY_TOKEN || '',
      loginUrl: config.loginUrl || process.env.SF_LOGIN_URL || 'https://login.salesforce.com',
      instanceUrl: config.instanceUrl || process.env.SF_INSTANCE_URL,
      accessToken: config.accessToken || process.env.SF_ACCESS_TOKEN,
      ...config
    };

    this.conn = new jsforce.Connection({ 
      loginUrl: this.config.loginUrl,
      instanceUrl: this.config.instanceUrl,
      accessToken: this.config.accessToken
    });
    
    this.isLoggedIn = !!this.config.accessToken;
  }

  /**
   * Login to Salesforce
   * @returns {Promise<Object>} Login result
   */
  async login() {
    if (this.isLoggedIn) return { success: true };
    
    try {
      const result = await this.conn.login(
        this.config.username,
        this.config.password + this.config.securityToken
      );
      this.isLoggedIn = true;
      return result;
    } catch (error) {
      throw new Error(`DB login error: ${error.message}`);
    }
  }

  /**
   * Execute SOQL query with relationship traversal
   * @param {string} soql - SOQL query
   * @returns {Promise<Object>} Query results
   */
  async query(soql) {
    if (!this.isLoggedIn) await this.login();
    
    try {
      return await this.conn.query(soql);
    } catch (error) {
      throw new Error(`DB query error: ${error.message}`);
    }
  }

  /**
   * Execute SOQL query with all records (handles pagination)
   * @param {string} soql - SOQL query
   * @returns {Promise<Array>} All records
   */
  async queryAll(soql) {
    if (!this.isLoggedIn) await this.login();
    
    try {
      const records = [];
      let result = await this.conn.query(soql);
      records.push(...result.records);
      
      while (!result.done) {
        result = await this.conn.queryMore(result.nextRecordsUrl);
        records.push(...result.records);
      }
      
      return records;
    } catch (error) {
      throw new Error(`DB queryAll error: ${error.message}`);
    }
  }

  /**
   * Execute bulk query for large datasets
   * @param {string} soql - SOQL query
   * @returns {Promise<Array>} Query results
   */
  async bulkQuery(soql) {
    if (!this.isLoggedIn) await this.login();
    
    return new Promise((resolve, reject) => {
      const records = [];
      
      this.conn.bulk.query(soql)
        .on('record', record => records.push(record))
        .on('error', error => reject(new Error(`Bulk query error: ${error.message}`)))
        .on('end', () => resolve(records));
    });
  }

  /**
   * Perform bulk create operation
   * @param {string} objectName - Object API name
   * @param {Array<Object>} records - Records to create
   * @returns {Promise<Array>} Results
   */
  async bulkCreate(objectName, records) {
    if (!this.isLoggedIn) await this.login();
    
    return new Promise((resolve, reject) => {
      this.conn.bulk.load(objectName, 'insert', records, (err, results) => {
        if (err) return reject(new Error(`Bulk create error: ${err.message}`));
        resolve(results);
      });
    });
  }

  /**
   * Perform bulk update operation
   * @param {string} objectName - Object API name
   * @param {Array<Object>} records - Records to update
   * @returns {Promise<Array>} Results
   */
  async bulkUpdate(objectName, records) {
    if (!this.isLoggedIn) await this.login();
    
    return new Promise((resolve, reject) => {
      this.conn.bulk.load(objectName, 'update', records, (err, results) => {
        if (err) return reject(new Error(`Bulk update error: ${err.message}`));
        resolve(results);
      });
    });
  }

  /**
   * Perform bulk delete operation
   * @param {string} objectName - Object API name
   * @param {Array<string>} recordIds - Record IDs to delete
   * @returns {Promise<Array>} Results
   */
  async bulkDelete(objectName, recordIds) {
    if (!this.isLoggedIn) await this.login();
    
    const records = recordIds.map(id => ({ Id: id }));
    
    return new Promise((resolve, reject) => {
      this.conn.bulk.load(objectName, 'delete', records, (err, results) => {
        if (err) return reject(new Error(`Bulk delete error: ${err.message}`));
        resolve(results);
      });
    });
  }
}

module.exports = SalesforceDbUtils;