# Tests Directory

Organized test files for the automation framework.

## Structure

```
src/tests/
├── core/                # Core framework tests
│   └── framework-validation.spec.js
├── api/                 # API tests
│   ├── salesforce-api-advanced.spec.js
│   ├── salesforce-api-extended.spec.js
│   ├── salesforce-api-mock.spec.js
│   └── salesforce-api-testrail.spec.js
├── ui/                  # UI tests
│   ├── salesforce-login.spec.js
│   ├── salesforce-simple-contact.spec.js
│   └── SalesforceNewContactDialog.spec.js
├── integration/         # Integration tests
│   ├── salesforce-testrail.spec.js
│   └── salesforce-ui-testrail.spec.js
├── demo/                # Demo tests
│   ├── salesforce-auth-demo.spec.js
│   ├── salesforce-core-demo.spec.js
│   ├── salesforce-locators-demo.spec.js
│   ├── salesforce-ui-demo.spec.js
│   ├── testrail-core-demo.spec.js
│   └── testrail-demo.js
├── archive/             # Archived tests
│   ├── accessibility/
│   ├── api/
│   ├── core/
│   ├── examples/
│   ├── integration/
│   ├── jest/
│   └── reporting/
└── README.md            # This file
```

## Test Categories

### **Core Tests**
Framework validation and core functionality tests.

### **API Tests**
REST API testing for Salesforce and other services.
```bash
npm run test:api
```

### **UI Tests**
User interface automation tests.
```bash
npm run test:ui
```

### **Integration Tests**
Tests that integrate with external services (TestRail, JIRA).
```bash
npm run test:integration
```

### **Demo Tests**
Demonstration tests showing framework capabilities.
```bash
npm run demo:all
npm run demo:api
npm run demo:ui
```

## Running Tests

```bash
# Run all tests
npm test

# Run specific categories
npm run test:api
npm run test:ui
npm run test:integration

# Run demo tests
npm run demo:all
npm run demo:api
npm run demo:ui
npm run demo:auth
npm run demo:core
npm run demo:testrail
```

## Test Guidelines

1. **Organization**: Place tests in appropriate category directories
2. **Naming**: Use descriptive test names with .spec.js extension
3. **Structure**: Follow AAA pattern (Arrange, Act, Assert)
4. **Data**: Use test data factories for consistent data
5. **Cleanup**: Clean up test data after tests complete