/**
 * Global setup for Playwright tests
 * 
 * This file runs once before all tests start
 */
const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs').promises;
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

/**
 * Global setup function
 */
async function globalSetup(config) {
  console.log('Starting global setup...');
  
  // Create directories for test artifacts
  await createDirectories();
  
  // Set up authentication states if needed
  if (process.env.SETUP_AUTH === 'true') {
    await setupAuthenticationStates(config);
  }
  
  console.log('Global setup completed successfully');
}

/**
 * Create necessary directories
 */
async function createDirectories() {
  const dirs = [
    './auth',
    './reports',
    './test-results',
    './temp'
  ];
  
  for (const dir of dirs) {
    await fs.mkdir(dir, { recursive: true }).catch(() => {});
  }
}

/**
 * Set up authentication states for different applications
 */
async function setupAuthenticationStates(config) {
  // Set up Salesforce authentication if credentials are available
  if (process.env.SF_USERNAME && process.env.SF_PASSWORD) {
    await setupSalesforceAuth();
  }
  
  // Add more authentication setups as needed
  // await setupAppAuth();
}

/**
 * Set up Salesforce authentication
 */
async function setupSalesforceAuth() {
  console.log('Setting up Salesforce authentication...');
  
  const storageStatePath = path.resolve('./auth/salesforce-storage-state.json');
  
  // Check if we already have a recent storage state file
  try {
    const stats = await fs.stat(storageStatePath);
    const fileAgeHours = (Date.now() - stats.mtime) / (1000 * 60 * 60);
    
    // If file exists and is less than 4 hours old, skip authentication
    if (fileAgeHours < 4) {
      console.log('Using existing Salesforce authentication state');
      return;
    }
  } catch (error) {
    // File doesn't exist, continue with authentication
  }
  
  // Launch browser
  const browser = await chromium.launch({ headless: true });
  
  try {
    // Create context and page
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Navigate to login page
    await page.goto(process.env.SF_LOGIN_URL || 'https://login.salesforce.com');
    
    // Fill login form
    await page.fill('#username', process.env.SF_USERNAME);
    await page.fill('#password', process.env.SF_PASSWORD);
    await page.click('#Login');
    
    // Wait for login to complete
    await page.waitForTimeout(10000);
    
    // Save storage state
    await context.storageState({ path: storageStatePath });
    
    console.log('Salesforce authentication state saved successfully');
  } catch (error) {
    console.error('Failed to set up Salesforce authentication:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

module.exports = globalSetup;