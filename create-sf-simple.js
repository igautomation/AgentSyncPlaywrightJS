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

  'pages/BaseSalesforcePage.js': `class BaseSalesforcePage {
  constructor(page) {
    this.page = page;
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
    await this.page.waitForLoadState('domcontentloaded', { timeout: 30000 });
    
    const spinner = this.page.locator('.slds-spinner_container, .slds-spinner');
    if (await spinner.isVisible({ timeout: 1000 }).catch(() => false)) {
      await spinner.waitFor({ state: 'hidden', timeout: 30000 }).catch(() => {});
    }
    
    await this.page.waitForTimeout(1000);
  }

  async getToastMessage() {
    const toast = this.page.locator('.slds-notify__content');
    await toast.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
    return toast.textContent();
  }
}

module.exports = BaseSalesforcePage;`,

  'pages/LoginPage.js': `const BaseSalesforcePage = require('./BaseSalesforcePage');

class LoginPage extends BaseSalesforcePage {
  constructor(page) {
    super(page);
    this.usernameInput = '#username';
    this.passwordInput = '#password';
    this.loginButton = '#Login';
  }

  async navigate(loginUrl) {
    await this.page.goto(loginUrl);
    await this.waitForPageLoad();
  }

  async login(username, password) {
    await this.page.fill(this.usernameInput, username);
    await this.page.fill(this.passwordInput, password);
    await this.page.click(this.loginButton);
    await this.waitForPageLoad();
  }
}

module.exports = LoginPage;`,

  'pages/ContactPage.js': `const BaseSalesforcePage = require('./BaseSalesforcePage');

class ContactPage extends BaseSalesforcePage {
  constructor(page) {
    super(page);
    this.newContactButton = 'button[title="New"]';
    this.firstNameInput = 'input[name="firstName"]';
    this.lastNameInput = 'input[name="lastName"]';
    this.emailInput = 'input[name="Email"]';
    this.phoneInput = 'input[name="Phone"]';
    this.saveButton = 'button[name="SaveEdit"]';
  }

  async createContact(contactData) {
    await this.page.click(this.newContactButton);
    await this.page.fill(this.firstNameInput, contactData.firstName);
    await this.page.fill(this.lastNameInput, contactData.lastName);
    await this.page.fill(this.emailInput, contactData.email);
    await this.page.fill(this.phoneInput, contactData.phone);
    await this.page.click(this.saveButton);
    await this.waitForPageLoad();
  }
}

module.exports = ContactPage;`,

  'data/salesforce-contacts.json': `[
  {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "555-123-4567",
    "title": "Software Engineer",
    "department": "Engineering"
  },
  {
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane.smith@example.com",
    "phone": "555-987-6543",
    "title": "Product Manager",
    "department": "Product"
  }
]`,

  'data/test-users.json': `[
  {
    "username": "test.user@example.com",
    "password": "TestPassword123",
    "role": "admin",
    "active": true
  },
  {
    "username": "demo.user@example.com",
    "password": "DemoPassword123",
    "role": "user",
    "active": true
  }
]`,

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
}`,
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
