#!/usr/bin/env node

/**
 * Salesforce Project Setup Script
 * Automatically configures a new project for Salesforce testing
 */

const fs = require('fs');
const path = require('path');

const projectFiles = {
  'playwright.config.salesforce.js': `const { defineConfig } = require('@playwright/test');
const { utils } = require('@your-org/playwright-framework');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 60000,
  use: {
    baseURL: process.env.SF_LOGIN_URL || 'https://login.salesforce.com',
    headless: process.env.HEADLESS !== 'false'
  },
  globalSetup: require.resolve('./global-setup.js'),
  projects: [{ name: 'salesforce', use: { ...utils.salesforce.getDefaultConfig() } }]
});`,

  'global-setup.js': `const { utils } = require('@your-org/playwright-framework');

async function globalSetup() {
  await utils.salesforce.setupCredentials();
  console.log('✅ Salesforce setup complete');
}

module.exports = globalSetup;`,

  '.env.example': `SF_USERNAME=your-username@domain.com
SF_PASSWORD=your-password
SF_SECURITY_TOKEN=your-security-token
SF_LOGIN_URL=https://login.salesforce.com
SF_CONSUMER_KEY=your-consumer-key
SF_CONSUMER_SECRET=your-consumer-secret
HEADLESS=true
TIMEOUT=60000`,

  'tests/salesforce-login.spec.js': `const { test, expect } = require('@playwright/test');
const { utils } = require('@your-org/playwright-framework');

test.describe('Salesforce Login Tests', () => {
  test('should login to Salesforce', async ({ page }) => {
    const sf = new utils.salesforce.salesforceUtils(page);
    await sf.login();
    await expect(page).toHaveTitle(/Salesforce/);
  });
});`,

  'package.json': `{
  "name": "salesforce-tests",
  "version": "1.0.0",
  "scripts": {
    "test:sf": "playwright test --config=playwright.config.salesforce.js",
    "test:sf:headed": "playwright test --config=playwright.config.salesforce.js --headed",
    "test:sf:debug": "playwright test --config=playwright.config.salesforce.js --debug"
  },
  "dependencies": {
    "@your-org/playwright-framework": "^1.0.0"
  }
}`
};

function createProjectFiles() {
  console.log('🚀 Creating Salesforce test project...');
  
  ['tests', 'pages', 'data', 'reports'].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ Created ${dir}/ directory`);
    }
  });
  
  Object.entries(projectFiles).forEach(([filename, content]) => {
    const filePath = path.resolve(filename);
    const dir = path.dirname(filePath);
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Created ${filename}`);
  });
  
  console.log('\n📋 Next steps:');
  console.log('1. Copy .env.example to .env and add your Salesforce credentials');
  console.log('2. Run: npm install');
  console.log('3. Run: npm run test:sf');
}

if (require.main === module) {
  createProjectFiles();
}

module.exports = { createProjectFiles, projectFiles };