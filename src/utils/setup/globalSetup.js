/**
 * Global setup for Playwright tests
 * 
 * This file runs once before all tests start
 */
const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs').promises;
const dotenv = require('dotenv');
const logger = require('../common/logger');

// Load environment variables
dotenv.config();

/**
 * Global setup function
 */
async function globalSetup(config) {
  console.log('Starting global setup...');
  logger.info('Global setup started');
  
  // Create directories for test artifacts
  await createDirectories();
  
  // Set up authentication states if needed
  if (process.env.SETUP_AUTH === 'true') {
    await setupAuthenticationStates(config);
  }
  
  console.log('Global setup completed successfully');
  logger.info('Global setup completed');
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
    await setupSalesforceAuth().catch(error => {
      logger.error(`Salesforce auth failed: ${error.message}`);
      logger.warn('Salesforce tests may be skipped due to auth failure');
    });
  }
  
  // Set up OrangeHRM authentication if needed
  if (process.env.ORANGE_HRM_USERNAME && process.env.ORANGE_HRM_PASSWORD) {
    await setupOrangeHRMAuth(config).catch(error => {
      logger.error(`OrangeHRM auth failed: ${error.message}`);
      logger.warn('OrangeHRM tests may be skipped due to auth failure');
    });
  }
}

/**
 * Set up Salesforce authentication
 */
async function setupSalesforceAuth() {
  logger.info('Setting up Salesforce authentication...');
  
  const storageStatePath = path.resolve('./auth/salesforce-storage-state.json');
  
  // Check if we already have a recent storage state file
  try {
    const stats = await fs.stat(storageStatePath);
    const fileAgeHours = (Date.now() - stats.mtime) / (1000 * 60 * 60);
    
    // If file exists and is less than 4 hours old, skip authentication
    if (fileAgeHours < 4) {
      logger.info('Using existing Salesforce authentication state');
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
    
    // Implement retry mechanism
    const maxRetries = 3;
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Navigate to login page
        await page.goto(process.env.SF_LOGIN_URL || 'https://login.salesforce.com');
        
        // Fill login form
        await page.fill('#username', process.env.SF_USERNAME);
        await page.fill('#password', process.env.SF_PASSWORD);
        await page.click('#Login');
        
        // Wait for login to complete
        await page.waitForTimeout(10000);
        
        // Take screenshot for verification
        await page.screenshot({ path: './auth/salesforce-auth-state.png' });
        
        // Save storage state
        await context.storageState({ path: storageStatePath });
        
        logger.info('Salesforce authentication state saved successfully');
        return;
      } catch (error) {
        lastError = error;
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          logger.warn(`Auth attempt ${attempt} failed. Retrying in ${delay}ms`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw new Error(`Failed after ${maxRetries} attempts: ${lastError.message}`);
  } finally {
    await browser.close();
  }
}

/**
 * Set up OrangeHRM authentication
 */
async function setupOrangeHRMAuth(config) {
  logger.info('Setting up OrangeHRM authentication...');
  
  const storageStatePath = path.resolve('./auth/orangehrm-storage-state.json');
  const baseURL = config.projects && config.projects[0] && config.projects[0].use ? config.projects[0].use.baseURL : null;
  
  // Check if we already have a recent storage state file
  try {
    const stats = await fs.stat(storageStatePath);
    const fileAgeHours = (Date.now() - stats.mtime) / (1000 * 60 * 60);
    
    // If file exists and is less than 2 hours old, skip authentication
    if (fileAgeHours < 2) {
      logger.info('Using existing OrangeHRM authentication state');
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
    
    // Implement retry mechanism
    const maxRetries = 3;
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Navigate to login page
        await page.goto(baseURL || process.env.ORANGE_HRM_URL || 'https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');
        
        // Wait for page to load
        await page.waitForSelector('input[name="username"]');
        
        // Fill login form
        await page.fill('input[name="username"]', process.env.ORANGE_HRM_USERNAME || 'Admin');
        await page.fill('input[name="password"]', process.env.ORANGE_HRM_PASSWORD || 'admin123');
        await page.click('button[type="submit"]');
        
        // Wait for login to complete
        await page.waitForTimeout(5000);
        
        // Take screenshot for verification
        await page.screenshot({ path: './auth/orangehrm-auth-state.png' });
        
        // Save storage state
        await context.storageState({ path: storageStatePath });
        
        logger.info('OrangeHRM authentication state saved successfully');
        return;
      } catch (error) {
        lastError = error;
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          logger.warn(`Auth attempt ${attempt} failed. Retrying in ${delay}ms`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw new Error(`Failed after ${maxRetries} attempts: ${lastError.message}`);
  } finally {
    await browser.close();
  }
}

module.exports = globalSetup;