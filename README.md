# AgentSync Playwright Test Framework

![TestRail Integration](https://github.com/yourusername/AgentSyncProfessionalServicesDelivery/actions/workflows/testrail-integration.yml/badge.svg)
![CI](https://github.com/yourusername/AgentSyncProfessionalServicesDelivery/actions/workflows/ci.yml/badge.svg)

A comprehensive test automation framework built with Playwright for end-to-end testing of web applications, APIs, and Salesforce.

## 🚀 Quick Start

### Prerequisites
- Node.js 16 or higher
- npm or yarn
- Git

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd AgentSyncProfessionalServices

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials
```

### Common Setup Issues & Solutions

1. **Missing Playwright Browsers**
   ```bash
   # If browsers are missing, install them explicitly
   npx playwright install chromium firefox webkit
   ```

2. **Environment Variables**
   - Ensure your `.env` file has all required variables from `.env.example`
   - For Salesforce testing, make sure to set all SF_* variables

3. **Permission Issues**
   ```bash
   # If you encounter permission issues with scripts
   chmod +x scripts/*.sh
   chmod +x bin/*
   ```

4. **Node Version Issues**
   ```bash
   # Check your Node.js version
   node -v
   # Use nvm to install correct version if needed
   nvm install 16
   nvm use 16
   ```

### Salesforce Setup

```bash
# Create auth directory if it doesn't exist
mkdir -p auth

# Set up Salesforce authentication state
npm run setup:salesforce
```

## 🧪 Running Tests

```bash
# Run all tests
npm test

# Run tests with UI mode
npx playwright test --ui

# Run specific test types
npm run test:api            # API tests
npm run test:e2e            # End-to-end tests
npm run test:accessibility  # Accessibility tests
npm run test:salesforce     # Salesforce tests

# Run tests in headed mode
npx playwright test --headed

# View test reports
npm run report
```

## 🏗️ Framework Architecture

The framework follows a modular architecture:

```
AgentSyncProfessionalServices/
├── src/                    # Source code
│   ├── cli/                # Command-line interface tools
│   ├── config/             # Configuration files
│   ├── core/               # Core framework functionality
│   ├── dashboard/          # Test dashboard components
│   ├── data/               # Test data files
│   ├── fixtures/           # Test fixtures
│   ├── helpers/            # Helper utilities
│   ├── pages/              # Page objects
│   │   └── salesforce/     # Salesforce page objects
│   ├── tests/              # Test files
│   │   ├── accessibility/  # Accessibility tests
│   │   ├── api/            # API tests
│   │   ├── core/           # Core functionality tests
│   │   ├── examples/       # Example tests
│   │   ├── integration/    # Integration tests
│   │   ├── salesforce/     # Salesforce tests
│   └── utils/              # Utility modules
│       ├── accessibility/  # Accessibility testing utilities
│       ├── api/            # API testing utilities
│       ├── salesforce/     # Salesforce utilities
│       └── many others...  # Various utility modules
├── auth/                   # Authentication state storage
├── docs/                   # Documentation
├── reports/                # Test reports
└── scripts/                # Helper scripts
```

## 🛠️ Key Features

- **Cross-browser Testing**: Chrome, Firefox, Safari, and Edge support
- **API Testing**: REST and GraphQL API testing capabilities
- **Accessibility Testing**: Automated accessibility audits
- **Performance Testing**: Core Web Vitals and performance metrics
- **Data-Driven Testing**: Support for multiple data formats
- **Self-Healing Locators**: Automatic recovery from broken selectors
- **Reporting**: Customizable HTML reports and dashboards
- **CI/CD Integration**: GitHub Actions workflows and Docker support
- **Salesforce Integration**: Specialized utilities for Salesforce testing
- **Mobile Testing**: Mobile browser emulation capabilities
- **Visual Testing**: Screenshot comparison and visual regression testing

## 🔌 Salesforce Testing

The framework includes specialized support for Salesforce testing:

```bash
# Set up Salesforce credentials in .env file
# Required variables:
# SF_USERNAME, SF_PASSWORD, SF_LOGIN_URL, SF_SECURITY_TOKEN, SF_INSTANCE_URL

# Set up Salesforce authentication state
npm run setup:salesforce

# Run Salesforce tests
npm run test:salesforce

# Run Salesforce tests with specific configuration
npm run test:salesforce:config

# Run Apex code tests
npm run test:salesforce:apex
```

### Apex Code Testing

The framework now supports Apex code execution and testing:

```javascript
const { SalesforceApexUtils } = require('../utils/salesforce');

// Initialize Apex utilities
const apexUtils = new SalesforceApexUtils({ accessToken });

// Execute anonymous Apex
const result = await apexUtils.executeAnonymous('System.debug("Hello World");');

// Run Apex tests
const jobId = await apexUtils.runApexTests(['MyTestClass']);

// Get test results
const testResults = await apexUtils.getApexTestResults(jobId);

// Get code coverage
const coverage = await apexUtils.getCodeCoverage('MyClass');
```

### Enhanced Database Operations

```javascript
const { SalesforceDbUtils } = require('../utils/salesforce');

// Initialize DB utilities
const dbUtils = new SalesforceDbUtils({ accessToken });

// Query with pagination
const allRecords = await dbUtils.queryAll('SELECT Id, Name FROM Account');

// Bulk operations
const createResults = await dbUtils.bulkCreate('Contact', contacts);
const updateResults = await dbUtils.bulkUpdate('Account', accounts);
const deleteResults = await dbUtils.bulkDelete('Lead', leadIds);
```

### SOQL Query Builder

```javascript
const { SoqlBuilder } = require('../utils/salesforce');

// Build a SOQL query
const query = new SoqlBuilder()
  .select('Id', 'Name', 'Phone')
  .from('Account')
  .where('CreatedDate = LAST_N_DAYS:30')
  .orderBy('Name')
  .limit(5)
  .build();

// Execute the query
const result = await dbUtils.query(query);
```

For detailed information, see the [Salesforce Testing Guide](docs/salesforce-testing-guide.md).

## 📊 Reporting

Test reports are generated automatically and can be viewed with:

```bash
npm run report
```

Reports include:
- Test results with pass/fail status
- Screenshots of failures
- Performance metrics
- Accessibility violations
- Visual comparison results

## 🐳 Docker Support

Run tests in Docker for consistent execution environments:

```bash
# Build and run with Docker
docker-compose up

# Run specific tests
docker-compose run playwright npm run test:api
```

## 🔄 CI/CD with GitHub Actions

This framework includes GitHub Actions workflows for continuous integration:

### Available Workflows

- **CI**: Main CI pipeline that runs validation and API tests
- **UI Tests**: Runs UI tests with TestRail integration
- **TestRail Integration**: Dedicated workflow for TestRail integration tests

### Running GitHub Actions

```bash
# Workflows run automatically on push to main/develop branches and on pull requests
# You can also trigger workflows manually from the GitHub Actions tab
```

### Required Secrets

Set these secrets in your GitHub repository settings:

- `SF_USERNAME`: Salesforce username
- `SF_PASSWORD`: Salesforce password
- `SF_INSTANCE_URL`: Salesforce instance URL
- `TESTRAIL_URL`: TestRail URL
- `TESTRAIL_USERNAME`: TestRail username
- `TESTRAIL_API_KEY`: TestRail API key
- `TESTRAIL_PROJECT_ID`: TestRail project ID
- `TESTRAIL_SUITE_ID`: TestRail suite ID

## 📚 Documentation

Comprehensive documentation is available in the `docs/` directory:

- [Installation Guide](docs/INSTALLATION.md)
- [Running Tests](docs/RUNNING_TESTS.md)
- [Framework Guide](docs/FRAMEWORK_GUIDE.md)
- [User Guide](docs/USER_GUIDE.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Salesforce Testing Guide](docs/salesforce-testing-guide.md)

## 🤝 Contributing

Please see [CONTRIBUTING.md](docs/CONTRIBUTING.md) for details on contributing to this project.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.