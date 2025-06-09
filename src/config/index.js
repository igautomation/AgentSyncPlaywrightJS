/**
 * Configuration module
 * 
 * Provides default configuration values for the framework
 */

module.exports = {
  api: {
    baseUrl: process.env.API_BASE_URL || 'https://reqres.in',
    apiKey: process.env.API_KEY || 'reqres-free-v1',
    timeout: parseInt(process.env.API_TIMEOUT || '30000')
  },
  test: {
    timeout: parseInt(process.env.TEST_TIMEOUT || '60000'),
    retries: parseInt(process.env.TEST_RETRIES || '2')
  }
};