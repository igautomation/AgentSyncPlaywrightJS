/**
 * API Client Utility
 * 
 * Provides a reusable client for API testing with error handling and retry logic
 */
const axios = require('axios').default;
const logger = require('../common/logger');

class ApiClient {
  /**
   * Create a new API client
   * @param {string} baseUrl - Base URL for API requests
   * @param {Object} options - Client options
   */
  constructor(baseUrl, options = {}) {
    this.baseUrl = baseUrl;
    this.options = {
      timeout: options.timeout || 10000,
      maxRetries: options.maxRetries || 2,
      ...options
    };
    
    this.headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers
    };
    
    this.authToken = null;
  }
  
  /**
   * Set authentication token
   * @param {string} token - Authentication token
   */
  setAuthToken(token) {
    this.authToken = token;
    if (token) {
      this.headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  /**
   * Make API request with retry logic
   * @param {string} method - HTTP method
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Request options
   * @returns {Promise<Object>} - Response data
   */
  async request(method, endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const requestOptions = {
      method,
      url,
      headers: { ...this.headers, ...options.headers },
      timeout: options.timeout || this.options.timeout,
      ...(options.data && { data: options.data }),
      ...(options.params && { params: options.params })
    };
    
    // Log request
    logger.debug(`API Request: ${method} ${url}`);
    
    // Implement retry logic
    let lastError;
    for (let attempt = 1; attempt <= this.options.maxRetries + 1; attempt++) {
      try {
        const response = await axios(requestOptions);
        
        // Log success response
        logger.debug(`API Response: ${response.status}`);
        
        return response.data;
      } catch (error) {
        lastError = error;
        
        // Log error response
        const errorDetails = {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        };
        
        if (attempt <= this.options.maxRetries) {
          const delay = Math.pow(2, attempt) * 500; // Exponential backoff
          logger.warn(`API request failed (attempt ${attempt}/${this.options.maxRetries + 1}). Retrying in ${delay}ms`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          logger.error(`API request failed after ${this.options.maxRetries + 1} attempts`);
          
          // Enhance error with additional information
          error.status = error.response?.status;
          error.response = error.response?.data;
          throw error;
        }
      }
    }
  }
  
  /**
   * Make GET request
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Request options
   * @returns {Promise<Object>} - Response data
   */
  async get(endpoint, options = {}) {
    return this.request('GET', endpoint, options);
  }
  
  /**
   * Make POST request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request data
   * @param {Object} options - Request options
   * @returns {Promise<Object>} - Response data
   */
  async post(endpoint, data, options = {}) {
    return this.request('POST', endpoint, { ...options, data });
  }
  
  /**
   * Make PUT request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request data
   * @param {Object} options - Request options
   * @returns {Promise<Object>} - Response data
   */
  async put(endpoint, data, options = {}) {
    return this.request('PUT', endpoint, { ...options, data });
  }
  
  /**
   * Make PATCH request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request data
   * @param {Object} options - Request options
   * @returns {Promise<Object>} - Response data
   */
  async patch(endpoint, data, options = {}) {
    return this.request('PATCH', endpoint, { ...options, data });
  }
  
  /**
   * Make DELETE request
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Request options
   * @returns {Promise<Object>} - Response data
   */
  async delete(endpoint, options = {}) {
    return this.request('DELETE', endpoint, options);
  }
}

module.exports = { ApiClient };