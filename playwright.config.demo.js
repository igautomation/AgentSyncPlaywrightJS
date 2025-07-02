const { defineConfig, devices } = require('@playwright/test');
require('dotenv').config({ path: '.env.unified' });

module.exports = defineConfig({
  testDir: './src/tests',
  timeout: 60000,
  expect: { timeout: 10000 },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: 1,
  
  reporter: [
    ['html'],
    ['list'],
    ['./src/utils/testrail/simple-testrail-reporter.js']
  ],
  
  use: {
    baseURL: process.env.SF_INSTANCE_URL,
    trace: 'on',
    screenshot: 'on',
    video: 'on',
    actionTimeout: 15000,
    navigationTimeout: 30000,
    headless: false
  },

  projects: [
    {
      name: 'salesforce-demo',
      use: { ...devices['Desktop Chrome'] }
    }
  ]
});