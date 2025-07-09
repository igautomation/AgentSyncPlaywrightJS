// @ts-check
const { defineConfig, devices } = require('@playwright/test');
const dotenv = require('dotenv');

// Load Salesforce-specific environment variables
dotenv.config({ path: '.env.salesforce' });
// Also load unified environment variables as fallback
dotenv.config({ path: '.env.unified' });

/**
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  // Test directory
  testDir: './src/tests/salesforce',
  
  // Test file pattern
  testMatch: '**/*.spec.js',
  
  // Maximum time one test can run for
  timeout: parseInt(process.env.DEFAULT_TIMEOUT) || 60000,
  
  // Expect assertion timeout
  expect: {
    timeout: parseInt(process.env.EXPECT_TIMEOUT) || 10000,
  },
  
  // Run tests in files in parallel
  fullyParallel: false,
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry tests
  retries: parseInt(process.env.RETRY_COUNT) || 1,
  
  // Opt out of parallel tests on CI
  workers: 1,
  
  // Reporter to use
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
    ['junit', { outputFile: 'reports/salesforce-junit-results.xml' }],
  ],
  
  // Shared settings for all projects
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: process.env.SF_INSTANCE_URL,
    
    // Maximum time each action can take
    actionTimeout: parseInt(process.env.ACTION_TIMEOUT) || 30000,
    navigationTimeout: parseInt(process.env.BROWSER_TIMEOUT) || 45000,
    
    // Collect trace when retrying the failed test
    trace: 'on-first-retry',
    
    // Record video
    video: process.env.VIDEO_ON_FAILURE === 'true' ? 'on-first-retry' : 'off',
    
    // Take screenshot on failure
    screenshot: process.env.SCREENSHOT_ON_FAILURE === 'true' ? 'only-on-failure' : 'off',
    
    // Viewport size
    viewport: { width: 1280, height: 720 },
    
    // Ignore HTTPS errors
    ignoreHTTPSErrors: true,
    
    // Browser launch options
    launchOptions: {
      slowMo: parseInt(process.env.BROWSER_SLOW_MO || '0'),
      args: ['--disable-dev-shm-usage']
    },
    
    // Headless mode
    headless: process.env.HEADLESS !== 'false'
  },
  
  // Configure projects for major browsers
  projects: [
    {
      name: 'salesforce',
      use: { 
        ...devices['Desktop Chrome'],
        storageState: './auth/salesforce-storage-state.json'
      }
    }
  ],
  
  // Folder for test artifacts such as screenshots, videos, traces, etc.
  outputDir: 'test-results/salesforce/',
});