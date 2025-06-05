/**
 * Data Protection Utilities
 * Handles masking of sensitive data in logs and reports
 */

/**
 * Mask sensitive data in strings
 * @param {string} text - Text that might contain sensitive data
 * @returns {string} - Text with sensitive data masked
 */
function maskSensitiveData(text) {
  if (!text) return text;
  
  // Define patterns for sensitive data
  const patterns = [
    { regex: /(password["']?\s*[:=]\s*["']?)([^"']+)(["'])/gi, replacement: '$1********$3' },
    { regex: /(token["']?\s*[:=]\s*["']?)([^"']{4})([^"']+)(["'])/gi, replacement: '$1$2********$4' },
    { regex: /(key["']?\s*[:=]\s*["']?)([^"']{4})([^"']+)(["'])/gi, replacement: '$1$2********$4' },
    { regex: /([A-Za-z0-9+/=]{30,})/g, replacement: '********' } // Likely base64 encoded credentials
  ];
  
  // Apply all patterns
  let maskedText = text;
  for (const pattern of patterns) {
    maskedText = maskedText.replace(pattern.regex, pattern.replacement);
  }
  
  return maskedText;
}

/**
 * Mask sensitive data in objects
 * @param {Object} obj - Object that might contain sensitive data
 * @returns {Object} - Object with sensitive data masked
 */
function maskSensitiveObject(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  
  const sensitiveKeys = [
    'password', 'token', 'key', 'secret', 'credential', 'auth',
    'apiKey', 'api_key', 'accessToken', 'access_token'
  ];
  
  const result = { ...obj };
  
  for (const key in result) {
    if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
      // Mask sensitive values but keep first 4 chars if long enough
      const value = result[key];
      if (typeof value === 'string' && value.length > 8) {
        result[key] = value.substring(0, 4) + '********';
      } else {
        result[key] = '********';
      }
    } else if (typeof result[key] === 'object' && result[key] !== null) {
      // Recursively mask nested objects
      result[key] = maskSensitiveObject(result[key]);
    }
  }
  
  return result;
}

module.exports = {
  maskSensitiveData,
  maskSensitiveObject
};