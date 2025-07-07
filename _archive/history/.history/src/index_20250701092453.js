/**
 * Main entry point for the framework
 * Exports all framework components
 */

// Helper function to safely require modules
function safeRequire(modulePath) {
  try {
    return require(modulePath);
  } catch (error) {
    console.warn(`Warning: Could not load module ${modulePath}:`, error.message);
    return {};
  }
}

// Export framework components
module.exports = {
  // Core utilities
  utils: {
    api: safeRequire('./utils/api'),
    web: safeRequire('./utils/web'),
    common: safeRequire('./utils/common'),
    core: safeRequire('./utils/core'),
    data: safeRequire('./utils/data'),
    database: safeRequire('./utils/database'),
    accessibility: safeRequire('./utils/accessibility'),
    performance: safeRequire('./utils/performance'),
    visual: safeRequire('./utils/visual'),
    mobile: safeRequire('./utils/mobile'),
    localization: safeRequire('./utils/localization'),
    security: safeRequire('./utils/security'),
    testrail: safeRequire('./utils/testrail'),
    salesforce: safeRequire('./utils/salesforce'),
    jira: safeRequire('./utils/jira'),
    xray: safeRequire('./utils/xray'),
    generators: safeRequire('./utils/generators'),
    visualization: safeRequire('./utils/visualization'),
    scheduler: safeRequire('./utils/scheduler'),
    ci: safeRequire('./utils/ci'),
    cli: safeRequire('./utils/cli'),
    git: safeRequire('./utils/git'),
    testing: safeRequire('./utils/testing'),
  },

  // Fixtures
  fixtures: safeRequire('./fixtures'),

  // Page objects
  pages: {
    BasePage: safeRequire('./pages/BasePage'),
  },

  // Direct exports for common usage
  apiClient: safeRequire('./utils/api').apiClient,
  webInteractions: safeRequire('./utils/web').webInteractions,
  salesforceUtils: safeRequire('./utils/salesforce').salesforceUtils,

  // Framework assets access
  FrameworkAssets: require('./framework-assets'),
  assets: new (require('./framework-assets'))(),

  /**
   * Create a custom fixture
   * @param {Object} fixtures - Fixture definitions
   * @returns {Object} Test object with fixtures
   */
  createFixtures: (fixtures = {}) => {
    const { test } = require('@playwright/test');
    return test.extend(fixtures);
  },

  /**
   * Get framework version
   * @returns {string} Framework version
   */
  getVersion: () => {
    const packageJson = require('../package.json');
    return packageJson.version;
  },

  /**
   * Create Salesforce project files
   */
  createSalesforceProject: require('../scripts/setup/setup-salesforce-project').createProjectFiles,
};
