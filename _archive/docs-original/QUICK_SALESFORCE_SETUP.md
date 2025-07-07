# Quick Salesforce Project Setup

## One-Command Setup

```bash
# Create new directory and setup Salesforce project
mkdir my-sf-tests && cd my-sf-tests
npx @your-org/playwright-framework create:sf-project
```

## Manual Setup

### 1. Install Framework
```bash
npm install @your-org/playwright-framework
```

### 2. Create Essential Files

**playwright.config.salesforce.js**
```javascript
const { defineConfig } = require('@playwright/test');
const { utils } = require('@your-org/playwright-framework');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 60000,
  use: { baseURL: process.env.SF_LOGIN_URL || 'https://login.salesforce.com' },
  globalSetup: require.resolve('./global-setup.js'),
  projects: [{ name: 'salesforce' }]
});
```

**global-setup.js**
```javascript
const { utils } = require('@your-org/playwright-framework');
module.exports = async () => await utils.salesforce.setupCredentials();
```

**.env**
```bash
SF_USERNAME=your-username@domain.com
SF_PASSWORD=your-password
SF_SECURITY_TOKEN=your-token
SF_LOGIN_URL=https://login.salesforce.com
```

**tests/login.spec.js**
```javascript
const { test, expect } = require('@playwright/test');
const { utils } = require('@your-org/playwright-framework');

test('Salesforce login', async ({ page }) => {
  const sf = new utils.salesforce.salesforceUtils(page);
  await sf.login();
  await expect(page).toHaveTitle(/Salesforce/);
});
```

### 3. Run Tests
```bash
npm run test:sf
```

## Available Commands
- `npm run test:sf` - Run all Salesforce tests
- `npm run test:sf:headed` - Run with browser visible
- `npm run test:sf:debug` - Debug mode

## Docker Support
```bash
# Copy Docker files from framework
node -e "
const { assets } = require('@your-org/playwright-framework');
const fs = require('fs');
const docker = assets.getDockerConfig();
fs.copyFileSync(docker.dockerfile, './Dockerfile');
fs.copyFileSync(docker.compose, './docker-compose.yml');
"

# Run in Docker
docker-compose up --build
```

## CI/CD Setup
```bash
# Copy GitHub workflows
node -e "
const { assets } = require('@your-org/playwright-framework');
const fs = require('fs');
const path = require('path');
fs.mkdirSync('.github/workflows', { recursive: true });
const workflows = assets.getWorkflows();
fs.copyFileSync(
  path.join(workflows, 'salesforce-generators.yml'),
  '.github/workflows/salesforce-tests.yml'
);
"
```

That's it! Your Salesforce testing project is ready.