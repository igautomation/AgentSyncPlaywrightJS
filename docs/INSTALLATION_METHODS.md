# Installation Methods

## Method 1: Direct GitHub Installation (Recommended)

```bash
# Install directly from GitHub repository
npm install git+https://github.com/igautomation/AgentSyncDelivery.git

# Create Salesforce project
mkdir my-sf-tests && cd my-sf-tests
npm init -y
npm install git+https://github.com/igautomation/AgentSyncDelivery.git
node -e "require('@igautomation/playwright-framework').assets.createProjectFiles()"
```

## Method 2: Local Package Installation

```bash
# Clone repository
git clone https://github.com/igautomation/AgentSyncDelivery.git
cd AgentSyncDelivery

# Create package
npm pack

# Install in your project
mkdir my-sf-tests && cd my-sf-tests
npm install ../AgentSyncDelivery/igautomation-playwright-framework-1.0.0.tgz
```

## Method 3: NPM Registry (After Publishing)

```bash
# Will work after package is published
npm install @igautomation/playwright-framework
npx @igautomation/playwright-framework create:sf-project
```

## Quick Salesforce Setup

**Using GitHub installation:**
```bash
mkdir my-sf-tests && cd my-sf-tests
npm init -y
npm install git+https://github.com/igautomation/AgentSyncDelivery.git

# Create project files
node -e "
const { createProjectFiles } = require('./setup-salesforce-project.js');
createProjectFiles();
"
```

**Manual setup:**
```javascript
// package.json
{
  "dependencies": {
    "@igautomation/playwright-framework": "git+https://github.com/igautomation/AgentSyncDelivery.git"
  }
}

// playwright.config.js
const { utils } = require('@igautomation/playwright-framework');
module.exports = {
  testDir: './tests',
  use: { baseURL: 'https://login.salesforce.com' }
};

// tests/login.spec.js
const { test } = require('@playwright/test');
const { utils } = require('@igautomation/playwright-framework');

test('login', async ({ page }) => {
  const sf = new utils.salesforce.salesforceUtils(page);
  await sf.login();
});
```