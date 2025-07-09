/**
 * Salesforce Utilities Index
 * 
 * This file exports all Salesforce utilities for easier imports
 */

// Core utilities (recommended)
const SalesforceCore = require('./core/salesforceCore');
const SalesforceAuthUtils = require('./core/salesforceAuthUtils');
const SalesforceLocators = require('./core/salesforceLocators');
const SalesforceApiUtils = require('./core/salesforceApiUtils');
const SalesforceApexUtils = require('./core/salesforceApexUtils');
const SalesforceDbUtils = require('./core/salesforceDbUtils');
const SoqlBuilder = require('./core/soqlBuilder');

// Legacy utilities (for backward compatibility)
const SalesforceUtils = require('./legacy/salesforceUtils');
const SalesforceUtilsExtended = require('./legacy/salesforceUtilsExtended');
const SalesforceSessionManager = require('./legacy/sessionManager');

// Specialized utilities
const SObjectManager = require('./specialized/objects/SObjectManager');
const TestCaseObject = require('./specialized/objects/TestCaseObject');

// Export all utilities
module.exports = {
  // Core (recommended)
  SalesforceCore,
  SalesforceAuthUtils,
  SalesforceLocators,
  SalesforceApiUtils,
  SalesforceApexUtils,
  SalesforceDbUtils,
  SoqlBuilder,
  
  // Legacy (backward compatibility)
  SalesforceUtils,
  SalesforceUtilsExtended,
  SalesforceSessionManager,
  
  // Specialized
  SObjectManager,
  TestCaseObject
};