#!/usr/bin/env node

/**
 * Salesforce Project Setup Script
 * Automatically configures a new project for Salesforce testing
 */

const fs = require('fs');
const path = require('path');

const projectFiles = {
  'playwright.config.salesforce.js': `const { defineConfig, devices } = require('@playwright/test');
const dotenv = require('dotenv');
dotenv.config({ path: '.env' });

module.exports = defineConfig({
  testDir: './tests',
  timeout: parseInt(process.env.DEFAULT_TIMEOUT) || 60000,
  expect: { timeout: parseInt(process.env.EXPECT_TIMEOUT) || 10000 },
  fullyParallel: false,
  retries: parseInt(process.env.RETRY_COUNT) || 2,
  workers: 1,
  reporter: [['html', { open: 'never' }], ['list']],
  globalSetup: require.resolve('./global-setup.js'),
  use: {
    baseURL: process.env.SF_INSTANCE_URL,
    actionTimeout: parseInt(process.env.ACTION_TIMEOUT) || 30000,
    navigationTimeout: parseInt(process.env.BROWSER_TIMEOUT) || 30000,
    trace: 'on',
    video: 'on',
    screenshot: 'on',
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    headless: process.env.HEADLESS === 'true'
  },
  projects: [{
    name: 'salesforce',
    use: { ...devices['Desktop Chrome'], storageState: './auth/salesforce-storage-state.json' }
  }],
  outputDir: 'test-results/salesforce/'
});`,

  'global-setup.js': `const { utils } = require('@igautomation/playwright-framework');

async function globalSetup() {
  console.log('🚀 Setting up Salesforce environment...');
  try {
    await utils.salesforce.setupCredentials();
    console.log('✅ Salesforce setup complete');
  } catch (error) {
    console.error('❌ Salesforce setup failed:', error.message);
  }
}

module.exports = globalSetup;`,

  '.env': `# Salesforce Configuration
SF_USERNAME=your-username@domain.com
SF_PASSWORD=your-password
SF_SECURITY_TOKEN=your-security-token
SF_LOGIN_URL=https://login.salesforce.com
SF_INSTANCE_URL=https://your-instance.lightning.force.com
SF_CLIENT_ID=your-consumer-key
SF_CLIENT_SECRET=your-consumer-secret
SF_API_VERSION=57.0

# Test Configuration
HEADLESS=true
DEFAULT_TIMEOUT=60000
ACTION_TIMEOUT=30000
EXPECT_TIMEOUT=10000
BROWSER_TIMEOUT=45000
RETRY_COUNT=2`,

  'tests/salesforce-login.spec.js': `const { test, expect } = require('@playwright/test');
const { utils } = require('@igautomation/playwright-framework');

test.describe('Salesforce Login Tests', () => {
  test('should login to Salesforce successfully', async ({ page }) => {
    const loginPage = new utils.salesforce.LoginPage(page);
    
    await loginPage.navigate();
    await loginPage.login(
      process.env.SF_USERNAME,
      process.env.SF_PASSWORD
    );
    
    await expect(page).toHaveTitle(/Salesforce/);
    await expect(page.locator('.slds-global-header')).toBeVisible();
  });
});`,

  'tests/salesforce-contact.spec.js': `const { test, expect } = require('@playwright/test');
const { utils } = require('@igautomation/playwright-framework');

test.describe('Salesforce Contact Tests', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new utils.salesforce.LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(process.env.SF_USERNAME, process.env.SF_PASSWORD);
  });

  test('should create a new contact', async ({ page }) => {
    const contactPage = new utils.salesforce.ContactPage(page);
    const testData = require('../data/contact-data.json');
    
    await contactPage.navigate();
    await contactPage.clickNew();
    await contactPage.fillContactForm(testData.validContact);
    await contactPage.save();
    
    await expect(page.locator('.toastMessage')).toContainText('Contact');
  });
});`,

  'data/contact-data.json': `{
  "validContact": {
    "firstName": "Test",
    "lastName": "Contact",
    "email": "test.contact@example.com",
    "phone": "555-0123"
  },
  "invalidContact": {
    "firstName": "",
    "lastName": "",
    "email": "invalid-email"
  }
}`,

  'pages/LoginPage.js': `class LoginPage {
  constructor(page) {
    this.page = page;
    this.usernameInput = '#username';
    this.passwordInput = '#password';
    this.loginButton = '#Login';
  }

  async navigate() {
    await this.page.goto(process.env.SF_LOGIN_URL);
  }

  async login(username, password) {
    await this.page.fill(this.usernameInput, username);
    await this.page.fill(this.passwordInput, password);
    await this.page.click(this.loginButton);
    await this.page.waitForLoadState('networkidle');
  }
}

module.exports = LoginPage;`,

  'pages/ContactPage.js': `class ContactPage {
  constructor(page) {
    this.page = page;
    this.newButton = 'div[title="New"]';
    this.firstNameInput = 'input[name="firstName"]';
    this.lastNameInput = 'input[name="lastName"]';
    this.emailInput = 'input[name="Email"]';
    this.phoneInput = 'input[name="Phone"]';
    this.saveButton = 'button[name="SaveEdit"]';
  }

  async navigate() {
    await this.page.goto(\`\${process.env.SF_INSTANCE_URL}/lightning/o/Contact/list\`);
  }

  async clickNew() {
    await this.page.click(this.newButton);
  }

  async fillContactForm(contactData) {
    await this.page.fill(this.firstNameInput, contactData.firstName);
    await this.page.fill(this.lastNameInput, contactData.lastName);
    if (contactData.email) await this.page.fill(this.emailInput, contactData.email);
    if (contactData.phone) await this.page.fill(this.phoneInput, contactData.phone);
  }

  async save() {
    await this.page.click(this.saveButton);
  }
}

module.exports = ContactPage;`,

  'package.json': `{
  "name": "salesforce-tests",
  "version": "1.0.0",
  "description": "Salesforce testing project using AgentSync framework",
  "scripts": {
    "test:sf": "playwright test --config=playwright.config.salesforce.js",
    "test:sf:headed": "playwright test --config=playwright.config.salesforce.js --headed",
    "test:sf:debug": "playwright test --config=playwright.config.salesforce.js --debug",
    "test:sf:ui": "playwright test --config=playwright.config.salesforce.js --ui",
    "report": "playwright show-report",
    "setup:auth": "mkdir -p auth"
  },
  "dependencies": {
    "@igautomation/playwright-framework": "git+https://github.com/igautomation/AgentSyncDelivery.git",
    "@playwright/test": "^1.40.0",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "eslint": "^8.53.0",
    "prettier": "^3.0.3"
  }
}`
};

function createProjectFiles() {
  console.log('🚀 Creating comprehensive Salesforce test project...');
  
  ['tests', 'pages', 'data', 'reports', 'auth', 'test-results'].forEach(dir => {
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
  console.log('1. Update .env file with your Salesforce credentials');
  console.log('2. Run: npm install');
  console.log('3. Run: npm run setup:auth');
  console.log('4. Run: npm run test:sf');
  console.log('\n📦 Project includes:');
  console.log('- Complete Playwright configuration for Salesforce');
  console.log('- Sample login and contact tests');
  console.log('- Page object models');
  console.log('- Test data files');
  console.log('- Environment configuration');
  console.log('- Authentication storage setup');
}

if (require.main === module) {
  createProjectFiles();
}

module.exports = { createProjectFiles, projectFiles };