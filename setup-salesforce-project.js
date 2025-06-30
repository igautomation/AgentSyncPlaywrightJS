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
const ContactPage = require('../pages/ContactPage');
require('dotenv').config();

test.describe('Salesforce Contact Tests', () => {
  test.use({ storageState: './auth/salesforce-storage-state.json' });
  
  test('should create a new contact', async ({ page }) => {
    const contactPage = new ContactPage(page);
    const testData = require('../data/contact-data.json');
    
    await page.goto(process.env.SF_INSTANCE_URL);
    await contactPage.createContact(testData.validContact);
    
    const isCreated = await contactPage.verifyContactCreated();
    expect(isCreated).toBeTruthy();
  });
});`,

  'tests/salesforce-api.spec.js': `const { test, expect } = require('@playwright/test');
const axios = require('axios');
require('dotenv').config();

test.describe('Salesforce API Tests', () => {
  let accessToken;
  
  test.beforeAll(async () => {
    // Get OAuth token
    const tokenResponse = await axios.post(
      \`\${process.env.SF_LOGIN_URL}/services/oauth2/token\`,
      new URLSearchParams({
        grant_type: 'password',
        client_id: process.env.SF_CLIENT_ID,
        client_secret: process.env.SF_CLIENT_SECRET,
        username: process.env.SF_USERNAME,
        password: \`\${process.env.SF_PASSWORD}\${process.env.SF_SECURITY_TOKEN}\`
      })
    );
    accessToken = tokenResponse.data.access_token;
  });
  
  test('should get account list via API', async () => {
    const response = await axios.get(
      \`\${process.env.SF_INSTANCE_URL}/services/data/v\${process.env.SF_API_VERSION}/sobjects/Account\`,
      { headers: { Authorization: \`Bearer \${accessToken}\` } }
    );
    
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('objectDescribe');
  });
});`,

  'data/contact-data.json': `{
  "validContact": {
    "salutation": "Mr.",
    "firstName": "Test",
    "lastName": "Contact",
    "email": "test.contact@example.com",
    "phone": "555-0123",
    "title": "Software Engineer",
    "department": "Engineering",
    "accountName": "Postman"
  },
  "invalidContact": {
    "firstName": "",
    "lastName": "",
    "email": "invalid-email"
  }
}`,

  'data/salesforce-config.json': `{
  "selectors": {
    "login": {
      "usernameInput": "#username",
      "passwordInput": "#password",
      "loginButton": "#Login"
    },
    "navigation": {
      "appLauncher": ".slds-icon-waffle",
      "accountsTab": "a[title='Accounts']",
      "contactsTab": "a[title='Contacts']"
    }
  },
  "timeouts": {
    "login": 60000,
    "navigation": 30000,
    "form": 10000
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

  'pages/BaseSalesforcePage.js': `class BaseSalesforcePage {
  constructor(page) {
    this.page = page;
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(2000);
  }

  async waitForSpinner() {
    const spinner = this.page.locator('.slds-spinner');
    if (await spinner.isVisible()) {
      await spinner.waitFor({ state: 'hidden', timeout: 30000 });
    }
  }
}

module.exports = BaseSalesforcePage;`,

  'pages/ContactPage.js': `const BaseSalesforcePage = require('./BaseSalesforcePage');

class ContactPage extends BaseSalesforcePage {
  constructor(page) {
    super(page);
    this.accountsTab = page.getByRole('link', { name: /Accounts/i });
    this.accountLink = page.getByRole('link', { name: /Postman|Account/i }).first();
    this.contactsRelatedTab = page.getByRole('tab', { name: /Contacts|Related/i });
    this.newContactButton = page.getByRole('button', { name: /New|New Contact/i });
    this.salutationDropdown = page.getByLabel(/Salutation/i);
    this.firstNameInput = page.getByLabel(/First Name/i);
    this.lastNameInput = page.getByLabel(/Last Name/i);
    this.phoneInput = page.getByLabel(/Phone/i, { exact: true });
    this.emailInput = page.getByLabel(/Email/i);
    this.titleInput = page.getByLabel(/Title/i);
    this.departmentInput = page.getByLabel(/Department/i);
    this.saveButton = page.getByRole('button', { name: /Save/i, exact: true });
  }

  async navigateToContactCreation(accountName = 'Postman') {
    try {
      await this.accountLink.click({ timeout: 5000 });
      await this.waitForPageLoad();
      await this.contactsRelatedTab.click({ timeout: 5000 });
      await this.waitForPageLoad();
      await this.newContactButton.click();
      await this.waitForPageLoad();
    } catch (error) {
      console.error('Error navigating to contact creation:', error.message);
      await this.page.screenshot({ path: \`./contact-navigation-error-\${Date.now()}.png\` });
      throw error;
    }
  }

  async createContact(contactData) {
    await this.navigateToContactCreation(contactData.accountName);
    
    if (contactData.salutation) {
      try {
        await this.salutationDropdown.selectOption({ label: contactData.salutation });
      } catch (error) {
        console.log('Salutation dropdown not found');
      }
    }
    
    await this.firstNameInput.fill(contactData.firstName);
    await this.lastNameInput.fill(contactData.lastName);
    await this.phoneInput.fill(contactData.phone);
    await this.emailInput.fill(contactData.email);
    
    if (contactData.title) await this.titleInput.fill(contactData.title);
    if (contactData.department) await this.departmentInput.fill(contactData.department);
    
    await this.saveButton.click();
    await this.waitForPageLoad();
  }

  async verifyContactCreated() {
    const toast = this.page.locator('.slds-notify__content');
    return await toast.isVisible();
  }
}

module.exports = ContactPage;`,

  'package.json': `{
  "name": "salesforce-tests",
  "version": "1.0.0",
  "description": "Complete Salesforce testing project with AgentSync framework",
  "scripts": {
    "test:sf": "playwright test --config=playwright.config.salesforce.js",
    "test:sf:headed": "playwright test --config=playwright.config.salesforce.js --headed",
    "test:sf:debug": "playwright test --config=playwright.config.salesforce.js --debug",
    "test:sf:ui": "playwright test --config=playwright.config.salesforce.js --ui",
    "test:login": "playwright test tests/salesforce-login.spec.js",
    "test:contact": "playwright test tests/salesforce-contact.spec.js",
    "test:api": "playwright test tests/salesforce-api.spec.js",
    "report": "playwright show-report",
    "setup:auth": "mkdir -p auth test-results",
    "lint": "eslint tests/ pages/",
    "format": "prettier --write tests/ pages/"
  },
  "dependencies": {
    "@playwright/test": "^1.40.0",
    "dotenv": "^16.3.1",
    "axios": "^1.6.0"
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