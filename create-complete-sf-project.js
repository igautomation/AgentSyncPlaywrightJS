#!/usr/bin/env node

/**
 * Complete Salesforce Project Creator
 * Ships all actual Salesforce tests and related code files
 */

const fs = require('fs');
const path = require('path');

function createCompleteSalesforceProject() {
  console.log('🚀 Creating complete Salesforce testing project...');
  
  // Create directories
  const dirs = ['tests', 'pages', 'data', 'auth', 'test-results', 'screenshots', 'temp'];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ Created ${dir}/ directory`);
    }
  });

  const files = {
    // Playwright Configuration
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
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    headless: process.env.HEADLESS === 'true'
  },
  projects: [{
    name: 'salesforce',
    use: { ...devices['Desktop Chrome'], storageState: './auth/salesforce-storage-state.json' }
  }],
  outputDir: 'test-results/'
});`,

    // Global Setup
    'global-setup.js': `const { chromium } = require('@playwright/test');
const fs = require('fs').promises;
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: '.env' });

async function globalSetup() {
  console.log('🔧 Starting Salesforce global setup...');
  
  const authDir = path.join(process.cwd(), 'auth');
  await fs.mkdir(authDir, { recursive: true }).catch(() => {});
  
  try {
    const browser = await chromium.launch({ headless: process.env.HEADLESS === 'true' });
    const context = await browser.newContext();
    const page = await context.newPage();
    
    await page.goto(process.env.SF_LOGIN_URL);
    await page.fill('#username', process.env.SF_USERNAME);
    await page.fill('#password', process.env.SF_PASSWORD);
    await page.click('#Login');
    await page.waitForTimeout(15000);
    
    if (!page.url().includes('login.salesforce.com')) {
      await context.storageState({ path: path.join(authDir, 'salesforce-storage-state.json') });
      console.log('✅ Salesforce authentication state saved');
    } else {
      const minimalState = { cookies: [], origins: [] };
      await fs.writeFile(
        path.join(authDir, 'salesforce-storage-state.json'),
        JSON.stringify(minimalState, null, 2)
      );
    }
    
    await browser.close();
  } catch (error) {
    console.error('❌ Error during setup:', error.message);
    const minimalState = { cookies: [], origins: [] };
    await fs.writeFile(
      path.join(authDir, 'salesforce-storage-state.json'),
      JSON.stringify(minimalState, null, 2)
    );
  }
  
  console.log('✅ Salesforce global setup completed');
}

module.exports = globalSetup;`,

    // Environment Variables
    '.env': \`# Salesforce Configuration
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
RETRY_COUNT=2\`,

    // Login Test
    'tests/salesforce-login.spec.js': \`const { test, expect } = require('@playwright/test');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config({ path: '.env' });

const authDir = path.join(process.cwd(), 'auth');
if (!fs.existsSync(authDir)) {
  fs.mkdirSync(authDir, { recursive: true });
}

test.describe('Salesforce Login Test', () => {
  test('should login to Salesforce successfully', async ({ page }) => {
    await page.goto(process.env.SF_LOGIN_URL);
    await page.fill('#username', process.env.SF_USERNAME);
    await page.fill('#password', process.env.SF_PASSWORD);
    await page.click('#Login');
    await page.waitForTimeout(15000);
    
    await page.screenshot({ path: './auth/salesforce-login-attempt.png' });
    
    if (page.url().includes('login.salesforce.com')) {
      const errorElement = await page.$('#error');
      if (errorElement) {
        const errorText = await errorElement.textContent();
        throw new Error(\`Login error: \${errorText}\`);
      } else {
        throw new Error('Failed to login to Salesforce');
      }
    }
    
    await page.context().storageState({ path: './auth/salesforce-storage-state.json' });
    
    const pageTitle = await page.title();
    console.log(\`Current page title: \${pageTitle}\`);
    console.log(\`Current URL: \${page.url()}\`);
    
    expect(page.url()).not.toContain('login.salesforce.com');
    console.log('✅ Successfully logged in to Salesforce and saved authentication state');
  });
});\`,

    // Contact Test
    'tests/salesforce-contact.spec.js': \`const { test, expect } = require('@playwright/test');
const ContactPage = require('../pages/ContactPage');
require('dotenv').config({ path: '.env' });

test.describe('Salesforce Contact Tests', () => {
  test.use({ storageState: './auth/salesforce-storage-state.json' });
  
  test('should navigate to contacts list', async ({ page }) => {
    await page.goto(process.env.SF_INSTANCE_URL);
    await page.waitForTimeout(5000);
    await page.screenshot({ path: './auth/salesforce-home.png' });
    
    await page.goto(\`\${process.env.SF_INSTANCE_URL}/lightning/o/Contact/list\`);
    await page.waitForTimeout(5000);
    await page.screenshot({ path: './auth/salesforce-contacts.png' });
    
    const pageTitle = await page.title();
    console.log(\`Page title: \${pageTitle}\`);
    
    expect(pageTitle).toContain('Contacts');
    expect(page.url()).toContain('Contact/list');
    
    console.log('✅ Successfully navigated to Salesforce contacts page');
  });
});\`,

    // API Test
    'tests/salesforce-api.spec.js': \`const { test, expect } = require('@playwright/test');
const axios = require('axios');
require('dotenv').config({ path: '.env' });

test.describe('Salesforce API Tests', () => {
  let accessToken;
  
  test.beforeAll(async () => {
    try {
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
    } catch (error) {
      console.log('Failed to get access token:', error.message);
    }
  });
  
  test('should get account list via API', async () => {
    test.skip(!accessToken, 'No access token available');
    
    const response = await axios.get(
      \`\${process.env.SF_INSTANCE_URL}/services/data/v\${process.env.SF_API_VERSION}/sobjects/Account\`,
      { headers: { Authorization: \`Bearer \${accessToken}\` } }
    );
    
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('objectDescribe');
  });
});\`,

    // Base Page Object
    'pages/BaseSalesforcePage.js': \`class BaseSalesforcePage {
  constructor(page) {
    this.page = page;
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle', { timeout: 30000 }).catch(e => {
      console.log('Network did not reach idle state, continuing anyway');
    });
    
    await this.page.waitForLoadState('domcontentloaded', { timeout: 30000 });
    
    const spinner = this.page.locator('.slds-spinner_container, .slds-spinner');
    if (await spinner.isVisible({ timeout: 1000 }).catch(() => false)) {
      await spinner.waitFor({ state: 'hidden', timeout: 30000 }).catch(e => {
        console.log('Spinner did not disappear, continuing anyway');
      });
    }
    
    await this.page.waitForTimeout(1000);
  }

  async getToastMessage() {
    const toast = this.page.locator('.slds-notify__content');
    await toast.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
    return toast.textContent();
  }

  async isToastVisible(partialText) {
    const toast = this.page.locator('.slds-notify__content');
    const isVisible = await toast.isVisible({ timeout: 10000 }).catch(() => false);
    
    if (!isVisible) return false;
    
    if (partialText) {
      const text = await toast.textContent();
      return text.includes(partialText);
    }
    
    return true;
  }
  
  async takeScreenshot(name) {
    await this.page.screenshot({ 
      path: \`./screenshots/salesforce-\${name}-\${Date.now()}.png\`,
      fullPage: true
    });
  }
}

module.exports = BaseSalesforcePage;\`,

    // Contact Page Object
    'pages/ContactPage.js': \`const BaseSalesforcePage = require('./BaseSalesforcePage');

class ContactPage extends BaseSalesforcePage {
  constructor(page) {
    super(page);
    this.accountsTab = page.getByRole('link', { name: /Accounts/i });
    this.accountLink = page.getByRole('link', { name: /Postman|Account/i }).first();
    this.contactsRelatedTab = page.getByRole('tab', { name: /Contacts|Related/i });
    this.newContactButton = page.getByRole('button', { name: /New|New Contact/i });
    this.firstNameInput = page.getByLabel(/First Name/i);
    this.lastNameInput = page.getByLabel(/Last Name/i);
    this.phoneInput = page.getByLabel(/Phone/i, { exact: true });
    this.emailInput = page.getByLabel(/Email/i);
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
    
    await this.firstNameInput.fill(contactData.firstName);
    await this.lastNameInput.fill(contactData.lastName);
    await this.phoneInput.fill(contactData.phone);
    await this.emailInput.fill(contactData.email);
    
    await this.saveButton.click();
    await this.waitForPageLoad();
  }

  async verifyContactCreated() {
    const toast = this.page.locator('.slds-notify__content');
    return await toast.isVisible();
  }
}

module.exports = ContactPage;\`,

    // Test Data
    'data/contact-data.json': \`{
  "validContact": {
    "firstName": "Test",
    "lastName": "Contact",
    "email": "test.contact@example.com",
    "phone": "555-0123",
    "accountName": "Postman"
  },
  "invalidContact": {
    "firstName": "",
    "lastName": "",
    "email": "invalid-email"
  }
}\`,

    // Package.json
    'package.json': \`{
  "name": "complete-salesforce-tests",
  "version": "1.0.0",
  "description": "Complete Salesforce testing project with all framework tests",
  "scripts": {
    "test:sf": "playwright test --config=playwright.config.salesforce.js",
    "test:sf:headed": "playwright test --config=playwright.config.salesforce.js --headed",
    "test:sf:debug": "playwright test --config=playwright.config.salesforce.js --debug",
    "test:sf:ui": "playwright test --config=playwright.config.salesforce.js --ui",
    "test:login": "playwright test tests/salesforce-login.spec.js",
    "test:contact": "playwright test tests/salesforce-contact.spec.js",
    "test:api": "playwright test tests/salesforce-api.spec.js",
    "report": "playwright show-report",
    "setup:auth": "mkdir -p auth test-results screenshots"
  },
  "dependencies": {
    "@playwright/test": "^1.40.0",
    "dotenv": "^16.3.1",
    "axios": "^1.6.0"
  }
}\`
  };

  // Create all files
  Object.entries(files).forEach(([filename, content]) => {
    const filePath = path.resolve(filename);
    const dir = path.dirname(filePath);
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Created ${filename}`);
  });

  console.log('\\n🎉 Complete Salesforce project created successfully!');
  console.log('\\n📋 Next steps:');
  console.log('1. Update .env with your Salesforce credentials');
  console.log('2. Run: npm install');
  console.log('3. Run: npm run setup:auth');
  console.log('4. Run: npm run test:sf');
  console.log('\\n🚀 Available commands:');
  console.log('- npm run test:login    # Test login functionality');
  console.log('- npm run test:contact  # Test contact operations');
  console.log('- npm run test:api      # Test API endpoints');
  console.log('- npm run test:sf:headed # Run with browser visible');
  console.log('- npm run report        # View test reports');
}

if (require.main === module) {
  createCompleteSalesforceProject();
}

module.exports = { createCompleteSalesforceProject };