/**
 * Salesforce Utilities Index
 * 
 * This file exports all Salesforce utilities for easier imports
 */

const SalesforceUtils = require('./salesforceUtils');
const SalesforceSessionManager = require('./sessionManager');
const SalesforceApiUtils = require('./salesforceApiUtils');

// Export all utilities
module.exports = {
  SalesforceUtils,
  SalesforceSessionManager,
  SalesforceApiUtils
};