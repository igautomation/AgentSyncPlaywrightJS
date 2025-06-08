/**
 * API Header Provider
 * 
 * Provides headers for API requests based on environment configuration
 */

/**
 * Get API headers for requests
 * @param {Object} options - Options for header generation
 * @returns {Object} Headers object
 */
function getApiHeaders(options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  // Add API key if available
  const apiKey = process.env.API_KEY;
  const apiHeaderName = process.env.API_HEADER_NAME || 'x-api-key';
  
  if (apiKey) {
    headers[apiHeaderName] = apiKey;
  }

  // Add authorization if available
  const authToken = process.env.AUTH_TOKEN;
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  // Add custom headers
  if (options.customHeaders) {
    Object.assign(headers, options.customHeaders);
  }

  return headers;
}

module.exports = {
  getApiHeaders
};