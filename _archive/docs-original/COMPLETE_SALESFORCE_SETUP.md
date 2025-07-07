# Complete Salesforce Project Setup

## One-Command Setup

```bash
mkdir my-sf-tests && cd my-sf-tests && npm init -y && npm install git+https://github.com/igautomation/AgentSyncDelivery.git && node node_modules/agentsyncprofessionalservicesdelivery/setup-salesforce-project.js && npm install
```

## What Gets Created

### Complete Project Structure
```
my-sf-tests/
├── tests/
│   ├── salesforce-login.spec.js      # Login authentication test
│   ├── salesforce-contact.spec.js    # Contact creation test
│   └── salesforce-api.spec.js        # API integration test
├── pages/
│   ├── BaseSalesforcePage.js         # Base page object
│   ├── LoginPage.js                  # Login page object
│   └── ContactPage.js                # Contact page object
├── data/
│   ├── contact-data.json             # Test data for contacts
│   └── salesforce-config.json        # Salesforce configuration
├── auth/                             # Authentication storage
├── test-results/                     # Test results and reports
├── playwright.config.salesforce.js  # Complete Playwright config
├── global-setup.js                  # Environment setup
├── .env                             # Environment variables
└── package.json                     # Dependencies and scripts
```

### Ready-to-Run Tests

**Login Test** - Validates Salesforce authentication and saves session
**Contact Test** - Creates contacts using page objects and test data
**API Test** - Tests Salesforce REST API endpoints

### Complete Dependencies

- **@playwright/test** - Testing framework
- **dotenv** - Environment configuration
- **axios** - API testing
- **eslint** - Code linting
- **prettier** - Code formatting

## Usage Commands

```bash
# Run all Salesforce tests
npm run test:sf

# Run specific tests
npm run test:login
npm run test:contact
npm run test:api

# Run with browser visible
npm run test:sf:headed

# Debug mode
npm run test:sf:debug

# Interactive UI
npm run test:sf:ui

# View reports
npm run report

# Code quality
npm run lint
npm run format
```

## Configuration

Update `.env` with your Salesforce credentials:
```bash
SF_USERNAME=your-username@domain.com
SF_PASSWORD=your-password
SF_SECURITY_TOKEN=your-token
SF_LOGIN_URL=https://login.salesforce.com
SF_INSTANCE_URL=https://your-instance.lightning.force.com
SF_CLIENT_ID=your-consumer-key
SF_CLIENT_SECRET=your-consumer-secret
SF_API_VERSION=57.0
```

## Features Included

✅ **Complete Test Suite** - Login, Contact, API tests
✅ **Page Object Models** - Reusable page components
✅ **Test Data Management** - JSON data files
✅ **API Integration** - REST API testing with OAuth
✅ **Authentication Handling** - Session storage and reuse
✅ **Error Handling** - Screenshots on failure
✅ **Reporting** - HTML reports with traces
✅ **Code Quality** - Linting and formatting
✅ **Environment Management** - Configurable settings

This creates a production-ready Salesforce testing framework with all necessary components and real test scenarios.