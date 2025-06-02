/**
 * Main entry point for the framework
 * Exports all framework components
 */

const path = require('path');
const fs = require('fs');
const pluginLoader = require('./utils/plugins/plugin-loader');

// Export framework components
module.exports = {
  // Core utilities
  utils: {
    api: require('./utils/api'),
    web: require('./utils/web'),
    common: require('./utils/common'),
    reporting: require('./utils/reporting'),
    database: require('./utils/database'),
    visual: require('./utils/visual'),
    accessibility: require('./utils/accessibility'),
    performance: require('./utils/performance'),
    mobile: require('./utils/mobile'),
    localization: require('./utils/localization'),
    security: require('./utils/security'),
    testrail: require('./utils/testrail')
  },
  
  // Fixtures
  ...require('./fixtures/custom-fixtures'),
  
  // Page objects
  pages: {
    BasePage: require('./pages/BasePage')
  },
  
  /**
   * Load framework configuration
   * @returns {Object} Framework configuration
   */
  loadFrameworkConfig: () => {
    return pluginLoader.loadConfig();
  },
  
  /**
   * Load plugins
   * @returns {Object} Loaded plugins
   */
  loadPlugins: () => {
    return pluginLoader.loadPlugins();
  },
  
  /**
   * Get plugin by name
   * @param {string} name - Plugin name
   * @returns {Object} Plugin instance
   */
  getPlugin: (name) => {
    return pluginLoader.getPlugin(name);
  },
  
  /**
   * Create a custom reporter
   * @param {Object} options - Reporter options
   * @returns {Object} Reporter instance
   */
  createReporter: (options = {}) => {
    const { CustomReporter } = require('./utils/reporting/customReporter');
    return new CustomReporter(options);
  },
  
  /**
   * Create a custom fixture
   * @param {Object} fixtures - Fixture definitions
   * @returns {Object} Test object with fixtures
   */
  createFixtures: (fixtures = {}) => {
    const { test } = require('@playwright/test');
    return test.extend(fixtures);
  }
};