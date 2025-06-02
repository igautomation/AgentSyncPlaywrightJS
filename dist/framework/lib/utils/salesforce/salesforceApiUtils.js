/**
 * Salesforce API Utilities
 * 
 * Provides functions for interacting with Salesforce REST APIs
 */
const fetch = require('node-fetch');
const fs = require('fs').promises;
const path = require('path');

class SalesforceApiUtils {
  /**
   * @param {Object} config - Configuration object
   * @param {string} [config.instanceUrl] - Salesforce instance URL
   * @param {string} [config.accessToken] - Salesforce access token
   * @param {string} [config.apiVersion] - Salesforce API version
   */
  constructor(config = {}) {
    this.instanceUrl = config.instanceUrl || process.env.SF_INSTANCE_URL;
    this.accessToken = config.accessToken || process.env.SF_ACCESS_TOKEN;
    this.apiVersion = config.apiVersion || 'v62.0';
    
    // Remove trailing slash from instance URL if present
    if (this.instanceUrl && this.instanceUrl.endsWith('/')) {
      this.instanceUrl = this.instanceUrl.slice(0, -1);
    }
  }

  /**
   * Set access token
   * @param {string} accessToken - Salesforce access token
   */
  setAccessToken(accessToken) {
    this.accessToken = accessToken;
  }

  /**
   * Make API request
   * @param {string} method - HTTP method
   * @param {string} path - API path
   * @param {Object} [data] - Request data
   * @param {Object} [options] - Request options
   * @returns {Promise<Object>} Response data
   */
  async request(method, path, data = null, options = {}) {
    if (!this.instanceUrl) {
      throw new Error('Instance URL is required');
    }
    
    if (!this.accessToken) {
      throw new Error('Access token is required');
    }
    
    const url = `${this.instanceUrl}/services/data/${this.apiVersion}${path}`;
    
    const fetchOptions = {
      method,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };
    
    if (data) {
      fetchOptions.body = JSON.stringify(data);
    }
    
    try {
      const response = await fetch(url, fetchOptions);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Salesforce API error: ${response.status} - ${errorText}`);
      }
      
      // For binary responses
      if (options.responseType === 'arraybuffer') {
        return await response.buffer();
      }
      
      // For JSON responses
      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get API limits
   * @returns {Promise<Object>} API limits
   */
  async getLimits() {
    return this.request('GET', '/limits');
  }

  /**
   * Describe global objects
   * @returns {Promise<Object>} Global objects description
   */
  async describeGlobal() {
    return this.request('GET', '/sobjects');
  }

  /**
   * Describe specific object
   * @param {string} objectName - Object API name
   * @returns {Promise<Object>} Object description
   */
  async describeObject(objectName) {
    return this.request('GET', `/sobjects/${objectName}/describe`);
  }

  /**
   * Query records
   * @param {string} soql - SOQL query
   * @returns {Promise<Object>} Query results
   */
  async query(soql) {
    return this.request('GET', `/query?q=${encodeURIComponent(soql)}`);
  }

  /**
   * Create record
   * @param {string} objectName - Object API name
   * @param {Object} data - Record data
   * @returns {Promise<Object>} Create result
   */
  async createRecord(objectName, data) {
    return this.request('POST', `/sobjects/${objectName}`, data);
  }

  /**
   * Update record
   * @param {string} objectName - Object API name
   * @param {string} recordId - Record ID
   * @param {Object} data - Record data
   * @returns {Promise<Object>} Update result
   */
  async updateRecord(objectName, recordId, data) {
    return this.request('PATCH', `/sobjects/${objectName}/${recordId}`, data);
  }

  /**
   * Delete record
   * @param {string} objectName - Object API name
   * @param {string} recordId - Record ID
   * @returns {Promise<Object>} Delete result
   */
  async deleteRecord(objectName, recordId) {
    return this.request('DELETE', `/sobjects/${objectName}/${recordId}`);
  }

  /**
   * Download file from Salesforce
   * @param {string} contentVersionId - Content Version ID
   * @param {string} outputPath - Output file path
   * @returns {Promise<string>} File path
   */
  async downloadFile(contentVersionId, outputPath) {
    // Get content version details
    const contentVersion = await this.request('GET', `/sobjects/ContentVersion/${contentVersionId}`);
    
    // Download file
    const fileData = await this.request('GET', `/sobjects/ContentVersion/${contentVersionId}/VersionData`, null, {
      responseType: 'arraybuffer'
    });
    
    // Ensure directory exists
    const directory = path.dirname(outputPath);
    await fs.mkdir(directory, { recursive: true });
    
    // Write file
    await fs.writeFile(outputPath, fileData);
    
    return outputPath;
  }

  /**
   * Upload file to Salesforce
   * @param {string} filePath - File path
   * @param {string} title - File title
   * @param {Object} [options] - Upload options
   * @returns {Promise<Object>} Upload result
   */
  async uploadFile(filePath, title, options = {}) {
    // Read file
    const fileContent = await fs.readFile(filePath);
    const base64Data = fileContent.toString('base64');
    
    // Create ContentVersion
    const contentVersion = {
      Title: title,
      PathOnClient: path.basename(filePath),
      VersionData: base64Data,
      ...options
    };
    
    return this.request('POST', '/sobjects/ContentVersion', contentVersion);
  }

  /**
   * Extract metadata for object
   * @param {string} objectName - Object API name
   * @param {string} outputPath - Output file path
   * @returns {Promise<string>} File path
   */
  async extractObjectMetadata(objectName, outputPath) {
    // Get object description
    const metadata = await this.describeObject(objectName);
    
    // Ensure directory exists
    const directory = path.dirname(outputPath);
    await fs.mkdir(directory, { recursive: true });
    
    // Write metadata to file
    await fs.writeFile(outputPath, JSON.stringify(metadata, null, 2));
    
    return outputPath;
  }
  
  /**
   * Get a fresh access token using OAuth
   * @param {Object} credentials - OAuth credentials
   * @param {string} credentials.clientId - OAuth client ID
   * @param {string} credentials.clientSecret - OAuth client secret
   * @param {string} credentials.username - Salesforce username
   * @param {string} credentials.password - Salesforce password
   * @returns {Promise<string>} Access token
   */
  async getAccessToken(credentials) {
    const { clientId, clientSecret, username, password } = credentials;
    
    const params = new URLSearchParams();
    params.append('grant_type', 'password');
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);
    params.append('username', username);
    params.append('password', password);
    
    const response = await fetch(`${this.loginUrl}/services/oauth2/token`, {
      method: 'POST',
      body: params,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OAuth error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    this.accessToken = data.access_token;
    
    return this.accessToken;
  }
}

module.exports = SalesforceApiUtils;