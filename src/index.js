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

  // Test templates (as strings to avoid Playwright config issues)
  tests: {
    templates: {
      apiTemplate: `const { test, expect } = require('@playwright/test');
const { TestRailAPI } = require('@agentsync/playwright-framework').utils.testrail;

test.describe('API Tests', () => {
  test('Sample API Test', async ({ request }) => {
    const response = await request.get('https://api.example.com/data');
    expect(response.status()).toBe(200);
  });
});`,
      uiTemplate: `const { test, expect } = require('@playwright/test');
const { TestRailAPI } = require('@agentsync/playwright-framework').utils.testrail;

test.describe('UI Tests', () => {
  test('Sample UI Test', async ({ page }) => {
    await page.goto('https://example.com');
    expect(await page.title()).toContain('Example');
  });
});`,
      salesforceApiTemplate: `const { test, expect } = require('@playwright/test');
const { TestRailAPI } = require('@agentsync/playwright-framework').utils.testrail;
const authManager = require('@agentsync/playwright-framework').utils.salesforce.authManager;

test.describe('Salesforce API Tests', () => {
  test('Salesforce API Test', async ({ request }) => {
    const auth = await authManager.authenticate();
    const response = await request.get(auth.instanceUrl + '/services/data/v62.0/');
    expect(response.status()).toBe(200);
  });
});`
    },
    examples: {
      workingTests: [
        'src/tests/api/testrail-demo.spec.js',
        'src/tests/api/salesforce-api-clean.spec.js', 
        'src/tests/ui/ui-testrail-final.spec.js'
      ]
    }
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
