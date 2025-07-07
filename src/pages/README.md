# Page Objects Directory

Organized page object models for test automation.

## Structure

```
src/pages/
├── core/                # Core page objects
├── salesforce/          # Salesforce page objects
│   ├── AppLauncherPage.js
│   ├── BaseSalesforcePage.js
│   ├── ContactPage.js
│   ├── LoginPage.js
│   ├── SalesforceContactPage.js
│   ├── SalesforceNewContactDialog.js
│   └── TestPage.js
├── common/              # Common page objects
└── README.md            # This file
```

## Usage

```javascript
// Import Salesforce page objects
const { LoginPage } = require('./salesforce/LoginPage');
const { ContactPage } = require('./salesforce/ContactPage');

// Use in tests
const loginPage = new LoginPage(page);
await loginPage.login(username, password);
```

## Page Object Guidelines

1. **Inheritance**: Extend BasePage for common functionality
2. **Locators**: Use data-testid attributes when possible
3. **Methods**: Return page objects for method chaining
4. **Assertions**: Keep assertions in test files, not page objects
5. **Reusability**: Design for multiple test scenarios