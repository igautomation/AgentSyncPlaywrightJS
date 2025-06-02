/**
 * Custom fixtures for Playwright tests
 * These fixtures can be used in tests to provide common functionality
 */

const base = require('@playwright/test');
const { ApiClient } = require('../utils/api/apiClient');
const { WebInteractions } = require('../utils/web/webInteractions');

/**
 * Define custom fixtures
 */
const fixtures = {
  /**
   * API client fixture
   * @param {Object} options - Fixture options
   * @param {Function} use - Fixture use callback
   */
  apiClient: async ({ request, baseURL }, use) => {
    // Create API client
    const apiClient = new ApiClient({
      baseURL: process.env.API_URL || baseURL,
      request
    });
    
    // Use the fixture
    await use(apiClient);
  },
  
  /**
   * Web interactions fixture
   * @param {Object} options - Fixture options
   * @param {Function} use - Fixture use callback
   */
  webInteractions: async ({ page }, use) => {
    // Create web interactions helper
    const webInteractions = new WebInteractions(page);
    
    // Use the fixture
    await use(webInteractions);
  },
  
  /**
   * Authenticated page fixture
   * @param {Object} options - Fixture options
   * @param {Function} use - Fixture use callback
   */
  authenticatedPage: async ({ page, baseURL }, use) => {
    // Navigate to login page
    await page.goto(`${baseURL || process.env.BASE_URL}/login`);
    
    // Perform login
    await page.fill('#username', process.env.USERNAME || 'test-user');
    await page.fill('#password', process.env.PASSWORD || 'password');
    await page.click('button[type="submit"]');
    
    // Wait for login to complete
    await page.waitForNavigation();
    
    // Use the authenticated page
    await use(page);
    
    // Optional: Logout after test
    // await page.click('#logout');
  },
  
  /**
   * Database fixture
   * @param {Object} options - Fixture options
   * @param {Function} use - Fixture use callback
   */
  database: async ({}, use) => {
    // Import database utilities
    const { DatabaseClient } = require('../utils/database/dbClient');
    
    // Create database client
    const dbClient = new DatabaseClient({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    
    // Connect to database
    await dbClient.connect();
    
    // Use the fixture
    await use(dbClient);
    
    // Disconnect from database
    await dbClient.disconnect();
  }
};

/**
 * Export fixtures
 */
module.exports = base.test.extend(fixtures);