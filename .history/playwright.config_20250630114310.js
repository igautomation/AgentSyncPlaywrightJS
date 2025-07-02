// @ts-check
const { defineConfig, devices } = require('@playwright/test');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config();

// Environment-specific configuration
const environment = process.env.TEST_ENV || 'dev';
const configPath = path.join(__dirname, `config/environments/${environment}.config.js`);
const envConfig = require('fs').existsSync(configPath) ? require(configPath) : {};

/**
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  // Test directory
  testDir: './src/tests',
  
  // Test file pattern
  testMatch: '**/*.spec.js',
  
  // Maximum time one test can run for
  timeout: parseInt(process.env.TEST_TIMEOUT) || 60 * 1000,
  
  // Expect assertion timeout
  expect: {
    timeout: parseInt(process.env.EXPECT_TIMEOUT) || 10000,
    toMatchSnapshot: { maxDiffPixelRatio: 0.05 }
  },
  
  // Run tests in files in parallel
  fullyParallel: process.env.PARALLEL !== 'false',
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Opt out of parallel tests on CI
  workers: process.env.CI ? parseInt(process.env.CI_WORKERS || '4') : undefined,
  
  // Reporter to use
  reporter: [
    ['html', { open: process.env.OPEN_REPORT === 'true' ? 'on-failure' : 'never' }],
    ['list'],
    ['junit', { outputFile: 'reports/junit-results.xml' }],
    ['json', { outputFile: 'reports/test-results.json' }]
  ],
  
  // Global setup and teardown
  globalSetup: require.resolve('./src/utils/setup/globalSetup.js'),
  globalTeardown: require.resolve('./src/utils/setup/globalTeardown.js'),
  
  // Shared settings for all projects
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: process.env.BASE_URL || envConfig.baseURL,
    
    // Maximum time each action can take
    actionTimeout: parseInt(process.env.ACTION_TIMEOUT) || 30000,
    navigationTimeout: parseInt(process.env.NAVIGATION_TIMEOUT) || 30000,
    
    // Collect trace when retrying the failed test
    trace: process.env.TRACE || 'on-first-retry',
    
    // Record video only when retrying a test for the first time
    video: process.env.VIDEO || 'on-first-retry',
    
    // Take screenshot on failure
    screenshot: 'only-on-failure',
    
    // Viewport size
    viewport: { width: 1280, height: 720 },
    
    // Ignore HTTPS errors
    ignoreHTTPSErrors: true,
    
    // Browser launch options
    launchOptions: {
      slowMo: parseInt(process.env.SLOW_MO || '0'),
      args: ['--disable-dev-shm-usage']
    },
    
    // Context options
    contextOptions: {
      reducedMotion: 'reduce',
      strictSelectors: true
    },
    
    // Custom attributes for selectors
    testIdAttribute: 'data-testid'
  },
  
  // Configure projects for major browsers
  projects: [
    // Base setup for all projects
    {
      name: 'setup',
      testMatch: /global\.setup\.js/,
    },
    
    // Main browser projects
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        channel: 'chrome',
      },
      dependencies: ['setup'],
      testIgnore: ['**/salesforce/**', '**/mobile/**', '**/api/**']
    },
    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'] 
      },
      dependencies: ['setup'],
      testIgnore: ['**/salesforce/**', '**/mobile/**', '**/api/**']
    },
    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'] 
      },
      dependencies: ['setup'],
      testIgnore: ['**/salesforce/**', '**/mobile/**', '**/api/**']
    },
    
    // Mobile browser projects
    {
      name: 'mobile-chrome',
      use: { 
        ...devices['Pixel 5'] 
      },
      dependencies: ['setup'],
      testMatch: '**/mobile/**/*.spec.js'
    },
    {
      name: 'mobile-safari',
      use: { 
        ...devices['iPhone 13'] 
      },
      dependencies: ['setup'],
      testMatch: '**/mobile/**/*.spec.js'
    },
    
    // Specialized projects
    {
      name: 'salesforce',
      use: { 
        ...devices['Desktop Chrome'],
        storageState: './auth/salesforce-storage-state.json',
        baseURL: process.env.SF_INSTANCE_URL
      },
      dependencies: ['setup'],
      testMatch: '**/salesforce/**/*.spec.js'
    },
    {
      name: 'api',
      use: { 
        baseURL: process.env.API_BASE_URL
      },
      dependencies: ['setup'],
      testMatch: '**/api/**/*.spec.js'
    },
    
    // Visual testing project
    {
      name: 'visual',
      use: { 
        ...devices['Desktop Chrome'],
        screenshot: 'on',
        video: 'off',
        trace: 'off'
      },
      dependencies: ['setup'],
      testMatch: '**/visual/**/*.spec.js'
    },
    
    // Accessibility testing project
    {
      name: 'accessibility',
      use: { 
        ...devices['Desktop Chrome'],
        extraHTTPHeaders: {
          'Accept-Language': 'en-US,en;q=0.9'
        }
      },
      dependencies: ['setup'],
      testMatch: '**/accessibility/**/*.spec.js'
    }
  ],
  
  // Folder for test artifacts such as screenshots, videos, traces, etc.
  outputDir: 'test-results/',
  
  // Opt out of parallel tests
  webServer: process.env.START_SERVER === 'true' ? {
    command: 'npm run start:test-server',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000
  } : undefined,
  
  // Custom patterns to ignore
  snapshotPathTemplate: '{testDir}/__snapshots__/{testFilePath}/{arg}{ext}'
});