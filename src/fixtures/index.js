/**
 * Fixtures Index
 * 
 * This file exports all fixtures for easier imports
 */

const baseFixtures = require('./base-fixtures');
const salesforceFixtures = require('./salesforce-fixtures');
const customFixtures = require('./custom-fixtures');

// Export all fixtures
module.exports = {
  baseFixtures,
  salesforceFixtures,
  customFixtures
};