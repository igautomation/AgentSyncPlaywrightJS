/**
 * Global setup for specific test projects
 *
 * This file is used by the setup project in playwright.config.js
 */
const { test: setup } = require('@playwright/test');
const { SalesforceSessionManager } = require('../salesforce/sessionManager');
const logger = require('../common/logger');

/**
 * Setup for Salesforce tests
 */
setup('Salesforce authentication setup', async ({ browser }) => {
  logger.info('Starting Salesforce authentication setup');
  
  try {
    // Create session manager
    const sessionManager = new SalesforceSessionManager();

    // Ensure valid session with retry mechanism
    await sessionManager.ensureValidSession(browser, {
      maxRetries: 3,
      retryInterval: 5000
    });
    
    logger.info('Salesforce authentication setup completed successfully');
  } catch (error) {
    // Log error without exposing sensitive data
    logger.error(`Salesforce authentication failed: ${error.message}`);
    
    // Don't throw - tests will be skipped if auth fails
    logger.warn('Salesforce tests may be skipped due to authentication failure');
  }
});

/**
 * Setup for API tests
 */
setup('API authentication setup', async ({}) => {
  logger.info('Starting API authentication setup');
  
  try {
    // Set up API authentication if needed
    // For example, get and store OAuth tokens
    
    logger.info('API authentication setup completed successfully');
  } catch (error) {
    // Log error without exposing sensitive data
    logger.error(`API authentication failed: ${error.message}`);
    
    // Don't throw - tests will handle missing auth
    logger.warn('API tests may fail due to authentication issues');
  }
});