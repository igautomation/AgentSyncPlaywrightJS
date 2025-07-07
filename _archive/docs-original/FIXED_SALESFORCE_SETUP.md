# Fixed Salesforce Project Setup

## Working Commands

### Method 1: Using Framework Export
```bash
mkdir my-sf-tests && cd my-sf-tests
npm init -y
npm install git+https://github.com/igautomation/AgentSyncDelivery.git
node -e "require('@igautomation/playwright-framework').createSalesforceProject()"
```

### Method 2: Using CLI Command
```bash
mkdir my-sf-tests && cd my-sf-tests
npm init -y
npm install git+https://github.com/igautomation/AgentSyncDelivery.git
npx playwright-framework create-sf-project
```

### Method 3: Direct Script Access
```bash
mkdir my-sf-tests && cd my-sf-tests
npm init -y
npm install git+https://github.com/igautomation/AgentSyncDelivery.git
node node_modules/@igautomation/playwright-framework/setup-salesforce-project.js
```

## What Gets Created

Complete Salesforce testing project with:
- Tests (login, contact scenarios)
- Page objects (LoginPage, ContactPage)
- Test data (JSON files)
- Configuration (Playwright, environment)
- Authentication setup

## Next Steps

```bash
# After project creation
npm install
npm run setup:auth
npm run test:sf
```

All methods now work correctly!