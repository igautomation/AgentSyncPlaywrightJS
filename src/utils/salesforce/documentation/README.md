# Salesforce Utilities

Clean and organized Salesforce utilities for test automation.

## Core Utilities (Recommended)

### SalesforceCore
Main utility class with essential Salesforce operations.

```javascript
const { SalesforceCore } = require('../utils/salesforce');

const sf = new SalesforceCore();
await sf.login();
const records = await sf.queryRecords('SELECT Id, Name FROM Account LIMIT 5');
```

### SalesforceAuthUtils
OAuth2 token generation and management.

```javascript
const { SalesforceAuthUtils } = require('../utils/salesforce');

const auth = new SalesforceAuthUtils();
const token = await auth.getAccessToken();
const headers = await auth.getAuthHeaders();
```

### SalesforceLocators
Centralized locator management for UI automation.

```javascript
const { SalesforceLocators } = require('../utils/salesforce');

const locators = new SalesforceLocators(page);
await locators.fillElement('login', 'username', 'user@example.com');
await locators.clickElement('login', 'loginButton');
```

### SalesforceApiUtils
REST API operations and utilities.

```javascript
const { SalesforceApiUtils } = require('../utils/salesforce');

const api = new SalesforceApiUtils();
const result = await api.createRecord('Account', { Name: 'Test Account' });
```

## File Structure

```
src/utils/salesforce/
├── salesforceCore.js          # Main utility (recommended)
├── salesforceAuthUtils.js     # Authentication utilities
├── salesforceLocators.js      # UI locator management
├── salesforceApiUtils.js      # REST API utilities
├── index.js                   # Main exports
├── README.md                  # This file
│
├── Legacy Files (backward compatibility):
├── salesforceUtils.js         # Original utilities
├── salesforceUtilsExtended.js # Extended utilities
├── sessionManager.js          # Session management
│
├── Generators:
├── generators/
│   └── generate-salesforce-page.js
│
├── Objects:
├── objects/
│   ├── SObjectManager.js
│   ├── TestCaseObject.js
│   └── index.js
│
└── Resources:
    └── salesforce_actions.resource
```

## Usage Examples

### Basic Authentication and Query
```javascript
const { SalesforceCore } = require('../utils/salesforce');

const sf = new SalesforceCore();
await sf.login();
const accounts = await sf.queryRecords('SELECT Id, Name FROM Account LIMIT 10');
```

### Token-based API Calls
```javascript
const { SalesforceAuthUtils, SalesforceApiUtils } = require('../utils/salesforce');

const auth = new SalesforceAuthUtils();
const token = await auth.getAccessToken();

const api = new SalesforceApiUtils({ accessToken: token });
const result = await api.createRecord('Contact', {
  FirstName: 'John',
  LastName: 'Doe',
  Email: 'john.doe@example.com'
});
```

### UI Automation with Locators
```javascript
const { SalesforceLocators } = require('../utils/salesforce');

test('Salesforce Login', async ({ page }) => {
  const locators = new SalesforceLocators(page);
  
  await page.goto(process.env.SF_LOGIN_URL);
  await locators.fillElement('login', 'username', process.env.SF_USERNAME);
  await locators.fillElement('login', 'password', process.env.SF_PASSWORD);
  await locators.clickElement('login', 'loginButton');
  await locators.waitForSpinnerToDisappear();
});
```

## Environment Variables

```bash
# Required
SF_USERNAME=your-username@example.com
SF_PASSWORD=your-password
SF_LOGIN_URL=https://login.salesforce.com
SF_INSTANCE_URL=https://your-instance.salesforce.com

# Optional (for OAuth2)
SF_CLIENT_ID=your-client-id
SF_CLIENT_SECRET=your-client-secret
SF_SECURITY_TOKEN=your-security-token

# Optional (for direct token use)
SF_ACCESS_TOKEN=your-access-token
SF_API_VERSION=62.0
```

## Migration Guide

### From Legacy to Core

**Old:**
```javascript
const SalesforceUtils = require('../utils/salesforce/salesforceUtils');
const sf = new SalesforceUtils(config);
```

**New:**
```javascript
const { SalesforceCore } = require('../utils/salesforce');
const sf = new SalesforceCore(config);
```

### Benefits of Core Utilities

1. **Cleaner API**: Simplified method names and structure
2. **Better Error Handling**: Consistent error management
3. **Token Management**: Built-in authentication utilities
4. **Modular Design**: Use only what you need
5. **Backward Compatibility**: Legacy utilities still available

## Best Practices

1. Use `SalesforceCore` for new implementations
2. Use `SalesforceAuthUtils` for token management
3. Use `SalesforceLocators` for UI automation
4. Keep legacy utilities for existing tests
5. Migrate gradually to core utilities