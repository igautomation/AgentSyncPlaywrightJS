# Enhanced Salesforce Project Setup

## Quick Setup

```bash
mkdir my-sf-tests && cd my-sf-tests
npm init -y
npm install git+https://github.com/igautomation/AgentSyncDelivery.git
node -e "require('@igautomation/playwright-framework/setup-salesforce-project.js').createProjectFiles()"
```

## What Gets Created

### Project Structure
```
my-sf-tests/
├── tests/
│   ├── salesforce-login.spec.js
│   └── salesforce-contact.spec.js
├── pages/
│   ├── LoginPage.js
│   └── ContactPage.js
├── data/
│   └── contact-data.json
├── auth/
├── test-results/
├── reports/
├── playwright.config.salesforce.js
├── global-setup.js
├── .env
└── package.json
```

### Complete Configuration Files

**playwright.config.salesforce.js** - Full Playwright config with:
- Salesforce-specific settings
- Proper timeouts and retries
- Video/screenshot capture
- Authentication state management

**global-setup.js** - Environment setup with:
- Credential validation
- Framework initialization
- Error handling

**.env** - Environment variables for:
- Salesforce credentials
- Instance URLs
- Test configuration
- Timeout settings

### Ready-to-Run Tests

**Login Test** - Validates Salesforce authentication
**Contact Test** - Creates and manages contacts
**Page Objects** - Reusable page components
**Test Data** - JSON data files for test scenarios

## Usage

```bash
# Install dependencies
npm install

# Setup authentication directory
npm run setup:auth

# Run all Salesforce tests
npm run test:sf

# Run with browser visible
npm run test:sf:headed

# Debug mode
npm run test:sf:debug

# Interactive UI mode
npm run test:sf:ui

# View reports
npm run report
```

## Configuration

Update `.env` with your Salesforce credentials:
```bash
SF_USERNAME=your-username@domain.com
SF_PASSWORD=your-password
SF_SECURITY_TOKEN=your-token
SF_INSTANCE_URL=https://your-instance.lightning.force.com
```

## Features Included

✅ **Complete Playwright Configuration**
✅ **Salesforce Page Objects**
✅ **Sample Test Scenarios**
✅ **Test Data Management**
✅ **Environment Configuration**
✅ **Authentication Handling**
✅ **Error Handling & Retries**
✅ **Reporting & Screenshots**
✅ **Framework Integration**

This creates a production-ready Salesforce testing project with all necessary components.