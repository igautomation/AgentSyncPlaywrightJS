// @ts-check
const { defineConfig, devices } = require('@playwright/test');
const dotenv = require('dotenv');

// Load environment variables from .env.unified file
dotenv.config({ path: '.env.unified' });

/**
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  // Test directory
  testDir: './src/tests',

  // Test file pattern
  testMatch: '**/*.spec.js',

  // Maximum time one test can run for
  timeout: parseInt(process.env.DEFAULT_TIMEOUT) || 60000,

  // Expect assertion timeout
  expect: {
    timeout: parseInt(process.env.EXPECT_TIMEOUT) || 10000,
    toMatchSnapshot: { maxDiffPixelRatio: 0.05 },
  },

  // Run tests in files in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry tests
  retries: parseInt(process.env.RETRY_COUNT) || 1,

  // Limit parallel workers
  workers: process.env.CI ? 2 : 1,

  // Reporter to use
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
    ['junit', { outputFile: 'reports/junit-results.xml' }],
  ],

  // Shared settings for all projects
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: process.env.BASE_URL,

    // Maximum time each action can take
    actionTimeout: parseInt(process.env.ACTION_TIMEOUT) || 30000,
    navigationTimeout: parseInt(process.env.BROWSER_TIMEOUT) || 45000,

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Record video for all tests
    video: 'on',

    // Take screenshot on failure
    screenshot: process.env.SCREENSHOT_ON_FAILURE === 'true' ? 'only-on-failure' : 'off',

    // Viewport size
    viewport: { width: 1280, height: 720 },

    // Ignore HTTPS errors
    ignoreHTTPSErrors: true,

    // Browser launch options
    launchOptions: {
      slowMo: parseInt(process.env.BROWSER_SLOW_MO || '0'),
      args: ['--disable-dev-shm-usage', '--no-sandbox'],
    },
    
    // Context options for proper cleanup
    contextOptions: {
      ignoreHTTPSErrors: true,
    },
  },

  // Configure projects for major browsers
  projects: [
    // Main browser projects
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
      testIgnore: ['**/salesforce/**', '**/api/**'],
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
      },
      testIgnore: ['**/salesforce/**', '**/api/**'],
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
      },
      testIgnore: ['**/salesforce/**', '**/api/**'],
    },

    // Specialized projects
    {
      name: 'salesforce',
      use: {
        ...devices['Desktop Chrome'],
        storageState: './auth/salesforce-storage-state.json',
        baseURL: process.env.SF_INSTANCE_URL,
      },
      testMatch: '**/salesforce/**/*.spec.js',
    },
    {
      name: 'api',
      use: {
        baseURL: process.env.API_BASE_URL || process.env.SF_INSTANCE_URL,
      },
      testMatch: '**/api/**/*.spec.js',
    },
  ],

  // Folder for test artifacts such as screenshots, videos, traces, etc.
  outputDir: 'test-results/',
  
  // Video recording settings
  use: {
    ...module.exports.use,
    video: {
      mode: 'on',
      size: { width: 1280, height: 720 }
    }
  },
});
