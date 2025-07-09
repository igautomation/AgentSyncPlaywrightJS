# AgentSync Playwright Test Framework

A comprehensive test automation framework built with Playwright for end-to-end testing of web applications, APIs, and Salesforce.

## 🚀 Framework Overview

This enterprise-grade Playwright test framework provides:

- **Cross-browser testing** across Chrome, Firefox, Safari, and Edge
- **API testing** for REST and GraphQL endpoints
- **Salesforce-specific testing** capabilities with specialized utilities
- **TestRail integration** for test case management and reporting
- **Page Object Model** implementation for maintainable tests
- **Utility libraries** for common testing tasks
- **CI/CD integration** with GitHub Actions

## 📂 Project Structure

```
AgentSyncProfessionalServicesDelivery/
├── src/                    # Source code
│   ├── config/             # Configuration files
│   ├── pages/              # Page objects
│   │   └── salesforce/     # Salesforce page objects
│   ├── tests/              # Test files
│   │   ├── api/            # API tests
│   │   ├── ui/             # UI tests
│   │   └── salesforce/     # Salesforce tests
│   └── utils/              # Utility modules
│       ├── salesforce/     # Salesforce utilities
│       ├── testrail/       # TestRail integration
│       └── many others...  # Various utility modules
├── .github/                # GitHub Actions workflows
├── auth/                   # Authentication state storage
├── config/                 # Framework configuration
└── scripts/                # Helper scripts
```

## 🛠️ Key Features

### Salesforce Testing

The framework includes specialized support for Salesforce testing:

- **Authentication**: OAuth and token-based authentication
- **API Testing**: REST API testing for Salesforce objects
- **UI Testing**: Page objects for Salesforce Lightning UI
- **Apex Code Execution**: Run and test Apex code
- **Database Operations**: CRUD operations on Salesforce objects
- **SOQL Queries**: Builder pattern for SOQL queries

### API Testing

Robust API testing capabilities:

- REST API testing with request/response validation
- JSON Schema validation
- Data-driven API tests
- Authentication handling
- Error scenario testing

### UI Testing

Comprehensive UI testing features:

- Page Object Model for maintainable tests
- Cross-browser testing
- Visual testing
- Accessibility testing
- Performance metrics

### TestRail Integration

Complete TestRail integration:

- Automatic test run creation
- Test result reporting
- Test case mapping
- Detailed test reporting

## 🧩 Design Patterns

### Page Object Model (POM)

The framework implements the Page Object Model pattern:

```javascript
// Example page object
class LoginPage {
  constructor(page) {
    this.page = page;
    this.usernameInput = page.locator('#username');
    this.passwordInput = page.locator('#password');
    this.loginButton = page.locator('#Login');
  }

  async navigate() {
    await this.page.goto('/login');
  }

  async login(username, password) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}
```

### Builder Pattern

Used for constructing complex objects like SOQL queries:

```javascript
const query = new SoqlBuilder()
  .select('Id', 'Name', 'Phone')
  .from('Account')
  .where('CreatedDate = LAST_N_DAYS:30')
  .orderBy('Name')
  .limit(5)
  .build();
```

### Facade Pattern

Simplifies complex subsystems:

```javascript
// SalesforceApexUtils provides a simple facade for Apex operations
const result = await apexUtils.executeAnonymous(apexCode);
```

## 🔧 Utilities

### Salesforce Utilities

- **SalesforceApexUtils**: Execute Apex code, run tests
- **SalesforceDbUtils**: Database operations (CRUD)
- **SoqlBuilder**: Build SOQL queries

### TestRail Utilities

- **TestRailAPI**: TestRail API client
- **TestCaseIdManager**: Map test cases to TestRail IDs
- **ReportUploader**: Upload test results to TestRail

### Core Utilities

- **WebInteractions**: Common web interactions
- **ApiClient**: API testing client
- **DataGenerator**: Generate test data

## 🔄 CI/CD Integration

The framework includes GitHub Actions workflows:

- **framework-validation.yml**: Validates framework structure
- **tests.yml**: Runs all tests with TestRail integration
- **ci.yml**: Continuous integration workflow

## 📊 Test Reporting

Test results are reported to:

- TestRail for test case management
- HTML reports for local viewing
- CI/CD pipeline for build status

## 📝 Coding Standards

### JavaScript/TypeScript

- Use modern ES6+ syntax
- Prefer async/await over promises
- Use meaningful variable and function names
- Add JSDoc comments for functions

### Test Structure

- One assertion per test when possible
- Use descriptive test names
- Group related tests in describe blocks
- Use beforeAll/beforeEach for setup

### Page Objects

- One page object per page/component
- Keep methods focused on single actions
- Use chainable methods when appropriate
- Expose high-level actions, not low-level details

## 🚀 Getting Started

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd AgentSyncProfessionalServicesDelivery

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
```

### Configuration

```bash
# Set up environment variables
cp .env.example .env
# Edit .env with your credentials
```

### Running Tests

```bash
# Run all tests
npx playwright test

# Run specific test categories
npx playwright test src/tests/api
npx playwright test src/tests/ui
npx playwright test src/tests/salesforce

# Run a specific test file
npx playwright test src/tests/api/salesforce-api-limits.spec.js
```

## 🔑 Best Practices

1. **Test Independence**: Each test should be independent and not rely on other tests
2. **Data Management**: Create and clean up test data within tests
3. **Error Handling**: Add proper error handling and reporting
4. **Logging**: Include meaningful logs for debugging
5. **Maintainability**: Follow design patterns and coding standards
6. **Performance**: Optimize tests for speed and reliability
7. **Security**: Never hardcode credentials
8. **Documentation**: Document complex test scenarios

## 🤝 Contributing

1. Follow the coding standards
2. Write tests for new features
3. Update documentation
4. Create pull requests with clear descriptions