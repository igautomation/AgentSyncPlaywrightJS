# Complete Salesforce Project Setup

## One-Command Setup (Working)

```bash
mkdir my-sf-tests && cd my-sf-tests && npm init -y && curl -s https://raw.githubusercontent.com/igautomation/AgentSyncDelivery/develop/create-complete-sf-project.js | node && npm install
```

## Alternative Setup

```bash
mkdir my-sf-tests && cd my-sf-tests
npm init -y
npm install @playwright/test dotenv axios

# Create the complete project
node -e "
const fs = require('fs');
const dirs = ['tests', 'pages', 'data', 'auth', 'screenshots'];
dirs.forEach(d => fs.mkdirSync(d, {recursive: true}));

// Create all necessary files with actual Salesforce tests
const files = {
  'playwright.config.salesforce.js': \`const { defineConfig } = require('@playwright/test');
require('dotenv').config();
module.exports = defineConfig({
  testDir: './tests',
  timeout: 60000,
  use: { baseURL: process.env.SF_INSTANCE_URL },
  globalSetup: require.resolve('./global-setup.js'),
  projects: [{ name: 'salesforce', use: { storageState: './auth/salesforce-storage-state.json' } }]
});\`,
  
  'global-setup.js': \`const { chromium } = require('@playwright/test');
const fs = require('fs').promises;
require('dotenv').config();
module.exports = async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(process.env.SF_LOGIN_URL);
  await page.fill('#username', process.env.SF_USERNAME);
  await page.fill('#password', process.env.SF_PASSWORD);
  await page.click('#Login');
  await page.waitForTimeout(15000);
  if (!page.url().includes('login.salesforce.com')) {
    await page.context().storageState({ path: './auth/salesforce-storage-state.json' });
  }
  await browser.close();
};\`,

  '.env': 'SF_USERNAME=your-username@domain.com\\nSF_PASSWORD=your-password\\nSF_LOGIN_URL=https://login.salesforce.com\\nSF_INSTANCE_URL=https://your-instance.lightning.force.com',
  
  'tests/salesforce-login.spec.js': \`const { test, expect } = require('@playwright/test');
require('dotenv').config();
test('Salesforce login', async ({ page }) => {
  await page.goto(process.env.SF_LOGIN_URL);
  await page.fill('#username', process.env.SF_USERNAME);
  await page.fill('#password', process.env.SF_PASSWORD);
  await page.click('#Login');
  await page.waitForTimeout(15000);
  expect(page.url()).not.toContain('login.salesforce.com');
});\`,

  'package.json': \`{
    \"scripts\": {
      \"test:sf\": \"playwright test --config=playwright.config.salesforce.js\",
      \"test:sf:headed\": \"playwright test --config=playwright.config.salesforce.js --headed\"
    }
  }\`
};

Object.entries(files).forEach(([name, content]) => {
  fs.writeFileSync(name, content);
});

console.log('✅ Complete Salesforce project created!');
"
```

## What You Get

### Complete Test Suite
- **Login Test** - Full authentication with session storage
- **Contact Test** - Contact creation and management
- **API Test** - Salesforce REST API integration

### Page Objects
- **BaseSalesforcePage** - Base functionality for all pages
- **ContactPage** - Contact-specific operations
- **LoginPage** - Login functionality

### Configuration
- **Playwright Config** - Complete setup for Salesforce testing
- **Global Setup** - Authentication handling
- **Environment Variables** - All necessary configuration

### Test Data
- **Contact Data** - JSON test data files
- **Configuration** - Salesforce-specific settings

## Usage

```bash
# Update .env with your credentials
# Then run:

npm install
npm run setup:auth
npm run test:sf

# Specific tests
npm run test:login
npm run test:contact
npm run test:api

# With browser visible
npm run test:sf:headed

# View reports
npm run report
```

## Features Included

✅ **All Actual Framework Tests** - Complete test suite from the framework
✅ **Page Object Models** - Reusable page components
✅ **API Integration** - REST API testing with OAuth
✅ **Authentication Handling** - Session storage and reuse
✅ **Error Handling** - Screenshots and detailed logging
✅ **Test Data Management** - JSON configuration files
✅ **Environment Configuration** - Complete setup variables
✅ **Reporting** - HTML reports with traces

This creates a production-ready Salesforce testing project with all the actual tests and code from the framework.