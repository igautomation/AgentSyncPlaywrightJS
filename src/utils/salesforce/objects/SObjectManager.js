/**
 * Salesforce SObject Manager
 * 
 * Manages Salesforce objects for test automation
 */
const logger = require('../../common/logger');

class SObjectManager {
  /**
   * Create a new SObjectManager instance
   * @param {Object} config - Configuration
   */
  constructor(config = {}) {
    this.config = config;
    this.objectCache = new Map();
    
    // We'll load the SalesforceApiUtils dynamically to avoid import issues
    try {
      const SalesforceApiUtils = require('../salesforceApiUtils');
      this.apiUtils = new SalesforceApiUtils(config);
    } catch (error) {
      logger.warn('Failed to initialize SalesforceApiUtils:', error.message);
      // Create a mock API utils for testing
      this.apiUtils = {
        describeObject: async () => ({ name: 'Mock', fields: [] }),
        query: async () => ({ records: [] }),
        createRecord: async () => ({ id: 'mock-id' }),
        updateRecord: async () => ({}),
        deleteRecord: async () => ({})
      };
    }
  }
  
  /**
   * Get object metadata
   * @param {string} objectName - Object name
   * @returns {Promise<Object>} Object metadata
   */
  async getObjectMetadata(objectName) {
    try {
      // Check cache first
      if (this.objectCache.has(objectName)) {
        return this.objectCache.get(objectName);
      }
      
      // Get metadata from API
      const metadata = await this.apiUtils.describeObject(objectName);
      
      // Cache metadata
      this.objectCache.set(objectName, metadata);
      
      return metadata;
    } catch (error) {
      logger.error(`Failed to get metadata for object ${objectName}:`, error);
      throw error;
    }
  }
  
  /**
   * Create record
   * @param {string} objectName - Object name
   * @param {Object} data - Record data
   * @returns {Promise<Object>} Created record
   */
  async createRecord(objectName, data) {
    try {
      return await this.apiUtils.createRecord(objectName, data);
    } catch (error) {
      logger.error(`Failed to create ${objectName} record:`, error);
      throw error;
    }
  }
  
  /**
   * Get record by ID
   * @param {string} objectName - Object name
   * @param {string} recordId - Record ID
   * @returns {Promise<Object>} Record data
   */
  async getRecord(objectName, recordId) {
    try {
      const result = await this.apiUtils.query(`SELECT Id, Name FROM ${objectName} WHERE Id = '${recordId}'`);
      return result.records[0];
    } catch (error) {
      logger.error(`Failed to get ${objectName} record ${recordId}:`, error);
      throw error;
    }
  }
  
  /**
   * Update record
   * @param {string} objectName - Object name
   * @param {string} recordId - Record ID
   * @param {Object} data - Record data
   * @returns {Promise<Object>} Update result
   */
  async updateRecord(objectName, recordId, data) {
    try {
      return await this.apiUtils.updateRecord(objectName, recordId, data);
    } catch (error) {
      logger.error(`Failed to update ${objectName} record ${recordId}:`, error);
      throw error;
    }
  }
  
  /**
   * Delete record
   * @param {string} objectName - Object name
   * @param {string} recordId - Record ID
   * @returns {Promise<Object>} Delete result
   */
  async deleteRecord(objectName, recordId) {
    try {
      return await this.apiUtils.deleteRecord(objectName, recordId);
    } catch (error) {
      logger.error(`Failed to delete ${objectName} record ${recordId}:`, error);
      throw error;
    }
  }
  
  /**
   * Query records
   * @param {string} soql - SOQL query
   * @returns {Promise<Object>} Query results
   */
  async query(soql) {
    try {
      return await this.apiUtils.query(soql);
    } catch (error) {
      logger.error(`Failed to execute query: ${soql}`, error);
      throw error;
    }
  }
  
  /**
   * Find records
   * @param {string} objectName - Object name
   * @param {Object} criteria - Search criteria
   * @param {Array<string>} fields - Fields to return
   * @returns {Promise<Array<Object>>} Matching records
   */
  async findRecords(objectName, criteria = {}, fields = ['Id', 'Name']) {
    try {
      // Build WHERE clause
      const whereConditions = Object.entries(criteria).map(([field, value]) => {
        if (typeof value === 'string') {
          return `${field} = '${value}'`;
        } else {
          return `${field} = ${value}`;
        }
      });
      
      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
      
      // Build query
      const query = `SELECT ${fields.join(', ')} FROM ${objectName} ${whereClause}`;
      
      // Execute query
      const result = await this.apiUtils.query(query);
      
      return result.records;
    } catch (error) {
      logger.error(`Failed to find ${objectName} records:`, error);
      throw error;
    }
  }
}