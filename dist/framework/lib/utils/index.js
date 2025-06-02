/**
 * Framework Utilities
 * 
 * Exports all utility modules
 */

// API utilities
const api = require('./api');

// Common utilities
const common = require('./common');

// Web utilities
const web = require('./web');

// Salesforce utilities
const salesforce = require('./salesforce');
const salesforceObjects = require('./salesforce/objects');

// Test management utilities
const testrail = require('./testrail');
const xray = require('./xray');
const jira = require('./jira');

module.exports = {
  api,
  common,
  web,
  salesforce,
  salesforceObjects,
  testrail,
  xray,
  jira
};