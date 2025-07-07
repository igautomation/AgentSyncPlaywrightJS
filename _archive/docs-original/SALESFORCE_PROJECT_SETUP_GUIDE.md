# Salesforce Testing Project Setup Guide

Complete guide to set up a new project using this framework as a dependency for Salesforce testing.

## Quick Start

### 1. Initialize New Project

```bash
# Create new project directory
mkdir my-salesforce-tests
cd my-salesforce-tests

# Initialize with framework template
npx @your-org/playwright-framework init --template salesforce

# Or manual setup
npm init -y
npm install @your-org/playwright-framework
```

### 2. Essential Configuration Files

Create these files in your project root:

**package.json**
```json
{
  "name": "my-salesforce-tests",
  "scripts": {
    "test:sf": "playwright test --config=playwright.config.salesforce.js",
    "test:sf:headed": "playwright test --config=playwright.config.salesforce.js --headed",
    "test:sf:debug": "playwright test --config=playwright.config.salesforce.js --debug",
    "setup:sf": "node setup-salesforce.js"
  },
  "dependencies": {
    "@your-org/playwright-framework": "^1.0.0"
  }
}
```

**playwright.config.salesforce.js**
```javascript
const { defineConfig } = require('@playwright/test');
const { utils } = require('@your-org/playwright-framework');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 60000,
  use: {
    baseURL: process.env.SF_LOGIN_URL || 'https://login.salesforce.com',
    headless: process.env.HEADLESS !== 'false'
  },
  globalSetup: require.resolve('./global-setup.js'),
  projects: [
    {
      name: 'salesforce',
      use: { ...utils.salesforce.getDefaultConfig() }
    }
  ]
});
```

**global-setup.js**
```javascript
const { utils } = require('@your-org/playwright-framework');

async function globalSetup() {
  await utils.salesforce.setupCredentials();
  console.log('✅ Salesforce setup complete');
}

module.exports = globalSetup;
```

**.env**
```bash
# Salesforce Credentials
SF_USERNAME=your-username@domain.com
SF_PASSWORD=your-password
SF_SECURITY_TOKEN=your-security-token
SF_LOGIN_URL=https://login.salesforce.com
SF_CONSUMER_KEY=your-consumer-key
SF_CONSUMER_SECRET=your-consumer-secret

# Test Configuration
HEADLESS=true
TIMEOUT=60000
```

### 3. Create Test Files

**tests/salesforce-login.spec.js**
```javascript
const { test, expect } = require('@playwright/test');
const { utils } = require('@your-org/playwright-framework');

test.describe('Salesforce Login Tests', () => {
  test('should login to Salesforce', async ({ page }) => {
    const sf = new utils.salesforce.salesforceUtils(page);
    
    await sf.login();
    await expect(page).toHaveTitle(/Salesforce/);
  });
});
```

**tests/salesforce-objects.spec.js**
```javascript
const { test, expect } = require('@playwright/test');
const { utils } = require('@your-org/playwright-framework');

test.describe('Salesforce Objects Tests', () => {
  test('should create account', async ({ page }) => {
    const sf = new utils.salesforce.salesforceUtils(page);
    const objects = new utils.salesforce.salesforceObjects(page);
    
    await sf.login();
    const accountId = await objects.createAccount({
      name: 'Test Account',
      type: 'Customer'
    });
    
    expect(accountId).toBeTruthy();
  });
});
```

### 4. Setup Script

**setup-salesforce.js**
```javascript
const { utils, assets } = require('@your-org/playwright-framework');
const fs = require('fs');

async function setupSalesforceProject() {
  console.log('🚀 Setting up Salesforce project...');
  
  // Copy essential files from framework
  const dockerFile = assets.getDockerConfig().dockerfile;
  const huskyHooks = assets.getHuskyHooks();
  
  // Copy Docker configuration
  if (fs.existsSync(dockerFile)) {
    fs.copyFileSync(dockerFile, './Dockerfile');
    console.log('✅ Docker configuration copied');
  }
  
  // Setup git hooks
  const { execSync } = require('child_process');
  try {
    execSync('npm run setup:husky', { stdio: 'inherit' });
    console.log('✅ Git hooks configured');
  } catch (error) {
    console.log('⚠️ Git hooks setup skipped');
  }
  
  // Validate Salesforce credentials
  await utils.salesforce.validateCredentials();
  console.log('✅ Salesforce credentials validated');
  
  console.log('🎉 Setup complete! Run: npm run test:sf');
}

setupSalesforceProject().catch(console.error);
```

## Running Tests

```bash
# Setup project
npm run setup:sf

# Run all Salesforce tests
npm run test:sf

# Run with browser visible
npm run test:sf:headed

# Debug mode
npm run test:sf:debug

# Run specific test
npx playwright test tests/salesforce-login.spec.js
```

## Docker Support

**docker-compose.yml**
```yaml
version: '3.8'
services:
  salesforce-tests:
    build: .
    environment:
      - SF_USERNAME=${SF_USERNAME}
      - SF_PASSWORD=${SF_PASSWORD}
      - SF_SECURITY_TOKEN=${SF_SECURITY_TOKEN}
      - HEADLESS=true
    volumes:
      - ./tests:/app/tests
      - ./reports:/app/reports
```

```bash
# Run tests in Docker
docker-compose up --build
```

## CI/CD Integration

**Copy GitHub workflow:**
```bash
# Copy framework workflows
node -e "
const { assets } = require('@your-org/playwright-framework');
const fs = require('fs');
fs.mkdirSync('.github/workflows', { recursive: true });
const workflows = assets.getWorkflows();
fs.copyFileSync(
  require('path').join(workflows, 'salesforce-generators.yml'),
  '.github/workflows/salesforce-tests.yml'
);
"
```

## Advanced Features

### Page Object Generation
```bash
# Generate Salesforce page objects
npx playwright-framework generate --page AccountPage
npx playwright-framework generate --page ContactPage
```

### Data Management
```javascript
const { assets } = require('@your-org/playwright-framework');

// Use framework test data
const testData = require(assets.getData('testData.json'));
const schemas = require(assets.getData('schemas/user.schema.json'));
```

### API Testing
```javascript
const { utils } = require('@your-org/playwright-framework');

test('Salesforce API test', async ({ request }) => {
  const api = new utils.api.apiClient({ request });
  const sf = new utils.salesforce.salesforceApiUtils();
  
  const token = await sf.getAccessToken();
  const response = await api.get('/services/data/v58.0/sobjects/Account', {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  expect(response.status()).toBe(200);
});
```

## Project Structure
```
my-salesforce-tests/
├── tests/
│   ├── salesforce-login.spec.js
│   ├── salesforce-objects.spec.js
│   └── api/
├── pages/
├── data/
├── reports/
├── .env
├── playwright.config.salesforce.js
├── global-setup.js
├── setup-salesforce.js
└── package.json
```

## Troubleshooting

**Common Issues:**
- Credentials: Ensure `.env` file has correct Salesforce credentials
- Timeouts: Increase timeout in config for slow Salesforce responses
- Selectors: Use framework's self-healing locators for dynamic elements

**Debug Commands:**
```bash
# Validate framework
npm run validate:framework

# Health check
npm run health:check

# Generate debug report
npx playwright test --reporter=html
```

This setup provides a complete Salesforce testing project using the framework as a dependency with minimal configuration required.