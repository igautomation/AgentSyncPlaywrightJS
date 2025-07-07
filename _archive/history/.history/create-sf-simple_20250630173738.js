#!/usr/bin/env node

const fs = require('fs');

console.log('🚀 Creating Salesforce testing project...');

// Create directories
['tests', 'pages', 'data', 'auth', 'screenshots'].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Created ${dir}/ directory`);
  }
});

// Create files
const files = {
  'playwright.config.salesforce.js': `const { defineConfig } = require('@playwright/test');
require('dotenv').config();

module.exports = defineConfig({
  testDir: './tests',
  timeout: 60000,
  use: {
    baseURL: process.env.SF_INSTANCE_URL,
    headless: process.env.HEADLESS === 'true'
  },
  globalSetup: require.resolve('./global-setup.js'),
  projects: [{
    name: 'salesforce',
    use: { storageState: './auth/salesforce-storage-state.json' }
  }]
});`,

  'global-setup.js': `const { chromium } = require('@playwright/test');
const fs = require('fs').promises;
require('dotenv').config();

module.exports = async () => {
  console.log('🔧 Setting up Salesforce authentication...');
  
  try {
    const browser = await chromium.launch({ headless: process.env.HEADLESS === 'true' });
    const page = await browser.newPage();
    
    await page.goto(process.env.SF_LOGIN_URL);
    await page.fill('#username', process.env.SF_USERNAME);
    await page.fill('#password', process.env.SF_PASSWORD);
    await page.click('#Login');
    await page.waitForTimeout(15000);
    
    if (!page.url().includes('login.salesforce.com')) {
      await page.context().storageState({ path: './auth/salesforce-storage-state.json' });
      console.log('✅ Authentication successful');
    }
    
    await browser.close();
  } catch (error) {
    console.log('⚠️ Authentication setup failed:', error.message);
  }
};`,

  '.env': `# Salesforce Configuration
SF_USERNAME=your-username@domain.com
SF_PASSWORD=your-password
SF_SECURITY_TOKEN=your-token
SF_LOGIN_URL=https://login.salesforce.com
SF_INSTANCE_URL=https://your-instance.lightning.force.com
SF_CLIENT_ID=your-consumer-key
SF_CLIENT_SECRET=your-consumer-secret
HEADLESS=true`,

  'tests/salesforce-login.spec.js': `const { test, expect } = require('@playwright/test');
require('dotenv').config();

test.describe('Salesforce Login Test', () => {
  test('should login successfully', async ({ page }) => {
    await page.goto(process.env.SF_LOGIN_URL);
    await page.fill('#username', process.env.SF_USERNAME);
    await page.fill('#password', process.env.SF_PASSWORD);
    await page.click('#Login');
    await page.waitForTimeout(15000);
    
    await page.screenshot({ path: './auth/login-result.png' });
    
    expect(page.url()).not.toContain('login.salesforce.com');
    console.log('✅ Login successful');
  });
});`,

  'tests/salesforce-contact.spec.js': `const { test, expect } = require('@playwright/test');
require('dotenv').config();

test.describe('Salesforce Contact Test', () => {
  test.use({ storageState: './auth/salesforce-storage-state.json' });
  
  test('should navigate to contacts', async ({ page }) => {
    await page.goto(process.env.SF_INSTANCE_URL);
    await page.waitForTimeout(5000);
    
    await page.goto(process.env.SF_INSTANCE_URL + '/lightning/o/Contact/list');
    await page.waitForTimeout(5000);
    
    const title = await page.title();
    expect(title).toContain('Contacts');
    console.log('✅ Contacts page loaded');
  });
});`,

  'package.json': `{
  "name": "salesforce-tests",
  "version": "1.0.0",
  "scripts": {
    "test:sf": "playwright test --config=playwright.config.salesforce.js",
    "test:sf:headed": "playwright test --config=playwright.config.salesforce.js --headed",
    "test:login": "playwright test tests/salesforce-login.spec.js",
    "test:contact": "playwright test tests/salesforce-contact.spec.js",
    "report": "playwright show-report"
  },
  "dependencies": {
    "@playwright/test": "^1.40.0",
    "dotenv": "^16.3.1"
  }
}`
};

Object.entries(files).forEach(([filename, content]) => {
  fs.writeFileSync(filename, content);
  console.log(`✅ Created ${filename}`);
});

console.log('\\n🎉 Salesforce project created!');
console.log('\\nNext steps:');
console.log('1. Update .env with your Salesforce credentials');
console.log('2. Run: npm install');
console.log('3. Run: npm run test:sf');
console.log('\\nAvailable commands:');
console.log('- npm run test:login (test login)');
console.log('- npm run test:contact (test contacts)');
console.log('- npm run test:sf:headed (with browser)');
console.log('- npm run report (view results)');