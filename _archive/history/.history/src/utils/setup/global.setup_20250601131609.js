/**
 * Global setup for specific test projects
 * 
 * This file is used by the setup project in playwright.config.js
 */
const { test: setup } = require('@playwright/test');
const { SalesforceSessionManager } = require('../salesforce/sessionManager');

/**
 * Setup for Salesforce tests
 */
setup('Salesforce authentication setup', async ({ browser }) => {
  // Create session manager
  const sessionManager = new SalesforceSessionManager();
  
  // Ensure valid session
  await sessionManager.ensureValidSession(browser);
});

/**
 * Setup for API tests
 */
setup('API authentication setup', async ({}) => {
  // Set up API authentication if needed
  // For example, get and store OAuth tokens
  
  console.log('API authentication setup completed');
});