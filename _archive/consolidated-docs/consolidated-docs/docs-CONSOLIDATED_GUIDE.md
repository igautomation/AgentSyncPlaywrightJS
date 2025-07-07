<!-- Source: /Users/mzahirudeen/playwright-framework-dev/docs/CONSOLIDATED_GUIDE.md -->

# Playwright Testing Framework - Consolidated Guide

## Table of Contents

1. [Introduction](#introduction)
2. [Framework Features](#framework-features)
3. [Installation](#installation)
4. [Running Tests](#running-tests)
5. [Framework Architecture](#framework-architecture)
6. [Utility Modules](#utility-modules)
7. [CI/CD Integration](#cicd-integration)
8. [Docker Setup](#docker-setup)
9. [Helper Classes](#helper-classes)
10. [Out-of-the-Box Features](#out-of-the-box-features)
11. [Useful Commands](#useful-commands)
12. [Advanced Features](#advanced-features)
13. [Standards and Best Practices](#standards-and-best-practices)
14. [Additional Resources](#additional-resources)

## Introduction

The Playwright Testing Framework is a comprehensive end-to-end testing solution built on top of Playwright. It provides tools and utilities for UI testing, API testing, visual regression testing, accessibility testing, and more.

## Framework Features

The framework includes the following key capabilities:

- **UI Testing**: Automated browser testing with cross-browser support
- **API Testing**: REST and GraphQL API testing capabilities
- **Visual Testing**: Screenshot comparison and visual regression testing
- **Accessibility Testing**: Automated accessibility audits
- **Performance Testing**: Core Web Vitals and performance metrics
- **Data-Driven Testing**: Support for multiple data formats (CSV, JSON, YAML)
- **Self-Healing Locators**: Automatic recovery from broken selectors
- **Reporting**: Customizable HTML, Allure, and dashboard reports
- **CI/CD Integration**: GitHub Actions workflows and Docker support
- **Documentation**: Auto-generated documentation with Docusaurus
- **Salesforce Integration**: Specialized utilities for Salesforce testing
- **Mobile Testing**: Mobile browser emulation capabilities
- **Localization Testing**: Multi-language support
- **Scheduling**: Test execution scheduling and history tracking
- **Web Scraping**: Data extraction and web scraping capabilities
- **Data Visualization**: Generate charts and visual reports from test data

### Feature Details

#### 1. UI Testing

- **Path**: `/src/tests/e2e`, `/src/utils/web`
- **Purpose**: Automated browser-based UI testing across multiple browsers
- **Core Functions**: Page object models, component testing, form interactions
- **Integration Points**: Works with visual testing, accessibility testing
- **Useful Commands**:
  ```bash
  npm run test:e2e
  npm run test:ui -- --project=chromium
  ```

#### 2. API Testing

- **Path**: `/src/utils/api`, `/src/tests/api`
- **Purpose**: Test REST and GraphQL APIs with schema validation
- **Core Functions**: Request building, response validation, authentication
- **Integration Points**: Can be combined with UI tests for end-to-end flows
- **Useful Commands**:
  ```bash
  npm run test:api
  npm run test:api:rest
  ```

#### 3. Visual Testing

- **Path**: `/src/utils/visual`
- **Purpose**: Screenshot comparison and visual regression detection
- **Core Functions**: Baseline creation, visual diff generation, reporting
- **Integration Points**: Works with UI testing components
- **Useful Commands**:
  ```bash
  npm run test:visual
  npm run visual:update-baseline
  ```

#### 4. Accessibility Testing

- **Path**: `/src/utils/accessibility`, `/src/tests/accessibility`
- **Purpose**: Automated accessibility audits using axe-core
- **Core Functions**: WCAG compliance checking, violation reporting
- **Integration Points**: Integrated with UI testing and reporting
- **Useful Commands**:
  ```bash
  npm run test:accessibility
  npm run accessibility:report
  ```

#### 5. Performance Testing

- **Path**: `/src/utils/performance`
- **Purpose**: Performance metrics & Core Web Vitals (CWV) analysis
- **Core Functions**: Navigation timing, resource timing, CWV metrics
- **Integration Points**: Works with UI testing and reporting
- **Useful Commands**:
  ```bash
  npm run test:performance
  npm run performance:report
  ```

#### 6. Salesforce Integration

- **Path**: `/src/utils/salesforce`, `/src/tests/salesforce`
- **Purpose**: Specialized utilities for Salesforce testing
- **Core Functions**: Salesforce API integration, UI automation
- **Integration Points**: Works with API and UI testing components
- **Useful Commands**:
  ```bash
  npm run test:salesforce
  npm run sf:generate-page
  ```

#### 7. Mobile Testing

- **Path**: `/src/utils/mobile`
- **Purpose**: Mobile browser emulation and testing
- **Core Functions**: Device emulation, responsive testing
- **Integration Points**: Extends UI testing capabilities
- **Useful Commands**:
  ```bash
  npm run test:mobile
  npm run test:responsive
  ```

#### 8. Localization Testing

- **Path**: `/src/utils/localization`, `/locales`
- **Purpose**: Multi-language testing support
- **Core Functions**: Language switching, translation validation
- **Integration Points**: Works with UI testing
- **Useful Commands**:
  ```bash
  npm run test:l10n
  npm run test:i18n
  ```

#### 9. Web Scraping

- **Path**: `/src/utils/web`
- **Purpose**: Data extraction and web scraping capabilities
- **Core Functions**: Table extraction, structured data extraction, DOM snapshots
- **Integration Points**: Data-driven testing, content validation
- **Useful Commands**:
  ```bash
  npm run scrape:table
  npm run scrape:structured
  ```

#### 10. Data Visualization

- **Path**: `/src/utils/visualization`
- **Purpose**: Generate charts and visual reports from test data
- **Core Functions**: Chart generation, data analysis, report creation
- **Integration Points**: Test results, extracted data
- **Useful Commands**:
  ```bash
  npm run visualize:data
  npm run generate:chart
  ```

## Installation

### Prerequisites

- Node.js 16 or higher
- npm or yarn
- Git

### Standard Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/playwright-framework.git
   cd playwright-framework
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Install Playwright browsers:
   ```bash
   npx playwright install
   ```

4. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit the `.env` file to configure your environment variables.

### Docker Installation

If you prefer to use Docker, you can use the provided Docker configuration:

```bash
# Build the Docker image
docker-compose build

# Run tests using Docker
docker-compose up
```

### Configuration

The framework uses several configuration files:

- `playwright.config.js`: Main Playwright configuration
- `.env`: Environment variables
- `package.json`: npm scripts and dependencies

### Verification

To verify your installation:

```bash
npm run validate
```

This will check that all test files follow best practices.

## Running Tests

### Basic Test Commands

```bash
# Run all tests
npm test

# Run tests in headed mode
npm run test:headed

# Run tests with UI mode
npm run test:ui

# Run specific test file
npx playwright test path/to/test.spec.js

# Run tests with specific project
npx playwright test --project=chromium
```

### Running Specific Test Types

```bash
# Smoke Tests
npm run test:smoke

# API Tests
npm run test:api

# Visual Tests
npm run test:visual

# Accessibility Tests
npm run test:accessibility

# Performance Tests
npm run test:performance

# End-to-End Tests
npm run test:e2e
```

### Test Filtering

```bash
# Run tests with specific tag
npx playwright test --grep "@smoke"

# Run tests excluding specific tag
npx playwright test --grep-invert "@slow"

# Run tests matching a pattern
npx playwright test -g "pattern"
```

### Test Reporting

```bash
# Generate HTML report
npx playwright show-report

# Generate and open HTML report
npm run report

# Generate coverage report
npm run coverage
```

### Debugging Tests

```bash
# Run in headed mode
npx playwright test --headed

# Use debug mode
npx playwright test --debug

# Use UI mode for interactive debugging
npx playwright test --ui
```

## Framework Architecture

The framework follows a modular architecture with clear separation of concerns:

```
playwright-framework/
├── src/                    # Source code
│   ├── config/             # Configuration files
│   ├── pages/              # Page objects
│   ├── tests/              # Test files
│   └── utils/              # Utility modules
├── data/                   # Test data
├── reports/                # Test reports
└── scripts/                # Helper scripts
```

### Key Components

1. **Page Objects**: Located in `src/pages/`, these represent web pages with their elements and actions.
2. **Test Files**: Located in `src/tests/`, these contain the actual test scenarios.
3. **Utility Modules**: Located in `src/utils/`, these provide reusable functionality.
4. **Configuration**: Located in `src/config/`, these control the framework behavior.

## Utility Modules

### API Testing

```javascript
const { ApiClient } = require('../../utils/api');

// Create API client
const apiClient = new ApiClient('https://api.example.com');

// Make requests
const response = await apiClient.get('/users/1');
const user = await apiClient.post('/users', { name: 'John', job: 'Developer' });
```

### Performance Testing

```javascript
const { runPerformanceTest } = require('../../utils/performance/performanceUtils');

// Run performance test
const results = await runPerformanceTest(page, 'https://example.com', {
  reportPath: './reports/performance/example-report.html',
});

// Access metrics
console.log(`Page load time: ${results.pageLoad.measureTiming.duration}ms`);
console.log(`First contentful paint: ${results.pageLoad.firstContentfulPaint.startTime}ms`);
```

### Accessibility Testing

```javascript
const { checkAccessibility } = require('../../utils/accessibility/accessibilityUtils');

// Check accessibility
const result = await checkAccessibility(page, {
  includedImpacts: ['critical', 'serious'],
});

// Handle results
if (!result.passes) {
  console.log(`Found ${result.violations.length} accessibility violations`);
}
```

### Visual Comparison

```javascript
const VisualComparisonUtils = require('../../utils/visual/visualComparisonUtils');

// Create visual comparison utility
const visualUtils = new VisualComparisonUtils(page);

// Compare screenshot with baseline
const result = await visualUtils.compareScreenshot('homepage');

// Check result
if (!result.match) {
  console.log(`Visual difference detected: ${result.diffPercentage}%`);
}
```

### Web Scraping

```javascript
const WebScrapingUtils = require('../../utils/web/webScrapingUtils');

// Create web scraping utility
const scraper = new WebScrapingUtils(page);

// Extract table data
const products = await scraper.extractTableData('#products-table');

// Extract structured data
const productDetails = await scraper.extractStructuredData({
  name: '.product-name',
  price: '.product-price',
  description: '.product-description',
});
```

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/playwright.yml
name: Playwright Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
      - name: Run tests
        run: npm test
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
```

### Jenkins Integration

```groovy
pipeline {
    agent {
        docker {
            image 'mcr.microsoft.com/playwright:v1.40.0-focal'
        }
    }
    stages {
        stage('Install dependencies') {
            steps {
                sh 'npm ci'
            }
        }
        stage('Run tests') {
            steps {
                sh 'npm test'
            }
        }
        stage('Generate report') {
            steps {
                sh 'npx playwright show-report'
            }
        }
    }
    post {
        always {
            archiveArtifacts artifacts: 'playwright-report/**'
        }
    }
}
```

### GitHub Workflows

The framework includes pre-configured GitHub Actions workflows:

1. **Main Workflow** (`ci.yml`):
   - Triggered on push to main branch and pull requests
   - Runs linting, unit tests, and e2e tests
   - Generates and uploads test reports

2. **Scheduled Tests** (`test-workflow.yml`):
   - Runs daily at midnight
   - Executes full test suite
   - Sends notification on failures

3. **Documentation Deployment** (`deploy-docs.yml`):
   - Builds and deploys documentation to GitHub Pages
   - Triggered on changes to documentation files

4. **Framework Validation** (`framework-validation.yml`):
   - Validates framework integrity
   - Runs self-tests to ensure framework components work correctly

## Docker Setup

### Docker Compose

```yaml
# docker-compose.yml
services:
  playwright:
    build:
      context: .
      dockerfile: Dockerfile
    volumes:
      - ./test-results:/app/test-results
      - ./playwright-report:/app/playwright-report
      - ./reports:/app/reports
    environment:
      - BASE_URL=${BASE_URL:-https://demo.playwright.dev}
      - HEADLESS=${HEADLESS:-true}
```

### Dockerfile

```dockerfile
# Dockerfile
FROM mcr.microsoft.com/playwright:v1.40.0-focal

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy project files
COPY . .

# Set environment variables
ENV NODE_ENV=production
ENV CI=true
ENV HEADLESS=true

# Default command
CMD ["npm", "test"]
```

### Running with Docker

```bash
# Build and run with Docker Compose
docker-compose up

# Run with specific environment variables
BASE_URL=https://example.com HEADLESS=true docker-compose up

# Run specific test in Docker
docker-compose run playwright npx playwright test path/to/test.spec.js

# Run tests with environment variables
docker-compose run -e BASE_URL=https://example.com playwright npm test
```

## Helper Classes

### Page Object Base Class

```javascript
// src/pages/BasePage.js
class BasePage {
  constructor(page) {
    this.page = page;
  }

  async navigate(path = '') {
    await this.page.goto(`${process.env.BASE_URL}${path}`);
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  async getTitle() {
    return await this.page.title();
  }
}

module.exports = BasePage;
```

### Test Data Factory

```javascript
// src/utils/data/testDataFactory.js
class TestDataFactory {
  static createUser(overrides = {}) {
    return {
      name: `User ${Date.now()}`,
      email: `user${Date.now()}@example.com`,
      role: 'user',
      ...overrides,
    };
  }

  static createProduct(overrides = {}) {
    return {
      name: `Product ${Date.now()}`,
      price: Math.floor(Math.random() * 100) + 1,
      category: 'electronics',
      ...overrides,
    };
  }
}

module.exports = TestDataFactory;
```

### PlaywrightService

- Browser automation utilities
- Screenshot and PDF generation
- Network interception

### ApiClient

- REST and GraphQL API requests
- Response validation
- Authentication handling

### DataOrchestrator

- Test data management
- Data generation and transformation
- Multiple format support

### ReportingUtils

- Custom report generation
- Test result aggregation
- Visual report components

### SelfHealingLocator

- Resilient element selection
- Automatic locator healing
- Selector strategy management

## Out-of-the-Box Features

### Self-Healing Locators

```javascript
// src/utils/web/SelfHealingLocator.js
const { SelfHealingLocator } = require('../../utils/web');

// Create a self-healing locator
const loginButton = new SelfHealingLocator(page, [
  '#login-button',
  '.login-btn',
  'button:has-text("Login")',
  'button.btn-primary',
]);

// Use the locator
await loginButton.click();
```

### Test Data Management

```javascript
// src/utils/data/dataOrchestrator.js
const { DataOrchestrator } = require('../../utils/common');

// Create data orchestrator
const dataOrchestrator = new DataOrchestrator();

// Load test data
const users = await dataOrchestrator.loadData('users.json');

// Use test data in tests
for (const user of users) {
  await test.step(`Test with user ${user.name}`, async () => {
    // Test logic using user data
  });
}
```

### Error Handling

```javascript
// src/utils/common/errorHandler.js
const { errorHandler } = require('../../utils/common');

// Wrap test in error handler
await errorHandler(
  async () => {
    // Test logic that might throw errors
  },
  {
    retries: 3,
    onError: error => console.log(`Error occurred: ${error.message}`),
  }
);
```

### Cross-Browser Testing

- Chrome, Firefox, Safari, and Edge support
- Consistent behavior across browsers
- Parallel execution

### Visual Regression

- Automatic screenshot comparison
- Visual diff highlighting
- Baseline management

### Accessibility Compliance

- WCAG 2.1 compliance checking
- Detailed violation reporting
- Remediation suggestions

### Performance Metrics

- Core Web Vitals measurement
- Performance regression detection
- Detailed timing analysis

### Comprehensive Reporting

- HTML, Allure, and custom reports
- Test history tracking
- Failure analysis

### Test Data Management

- CSV, JSON, YAML, and XML support
- Data generation utilities
- External data source integration

## Useful Commands

### Test Execution

```bash
# Run all tests
npm test

# Run tests with specific browser
npx playwright test --project=firefox

# Run tests in parallel with 4 workers
npx playwright test --workers=4

# Run tests with UI mode
npx playwright test --ui

# Run tests with debug mode
npx playwright test --debug

# Run tests with headed browsers
npx playwright test --headed
```

### Test Generation

```bash
# Generate tests with Playwright Codegen
npx playwright codegen https://example.com

# Generate page objects
node bin/generate-page https://example.com LoginPage
```

### Reporting

```bash
# Show HTML report
npx playwright show-report

# Generate report in different formats
npx playwright test --reporter=html,json,dot

# Generate and open coverage report
npm run coverage
```

### Utility Scripts

```bash
# Consolidate documentation
node scripts/consolidate-docs.js

# Run test runner script
bash scripts/test-runner.sh

# Generate page objects
node bin/generate-page https://example.com LoginPage

# Generate selectors
node bin/generate-selectors https://example.com "#login-form"
```

## Advanced Features

### Multiple Browser Engines

```javascript
const { PlaywrightUtils } = require('../utils/common');

// Launch Chromium (default)
const chromiumBrowser = await PlaywrightUtils.launchBrowser('chromium');

// Launch Firefox
const firefoxBrowser = await PlaywrightUtils.launchBrowser('firefox');

// Launch WebKit (Safari)
const webkitBrowser = await PlaywrightUtils.launchBrowser('webkit');
```

### Device Emulation

```javascript
const { PlaywrightUtils } = require('../utils/common');

// Get available devices
const devices = PlaywrightUtils.getAvailableDevices();
console.log(devices); // ['iPhone 13', 'Pixel 5', 'Desktop Chrome', ...]

// Take screenshot with device emulation
await PlaywrightUtils.screenshotWithDevice(
  'https://example.com',
  'iPhone 13',
  { path: 'iphone-screenshot.png' }
);
```

### Video Recording

```javascript
const { PlaywrightUtils } = require('../utils/common');

const videoPath = await PlaywrightUtils.recordVideo(
  async (page) => {
    // Navigate to website
    await page.goto('https://example.com');
    
    // Perform interactions
    await page.click('#login-button');
    await page.fill('#username', 'testuser');
    await page.fill('#password', 'password');
    await page.click('#submit');
    
    // Wait for navigation
    await page.waitForNavigation();
  },
  {
    videoDir: './videos',
    videoPath: './videos/login-flow.webm'
  }
);
```

### Data Extraction

```javascript
const { PlaywrightUtils } = require('../utils/common');

const data = await PlaywrightUtils.extractData(
  'https://example.com/products',
  {
    title: 'h1',
    price: '.product-price',
    description: '.product-description',
    images: {
      selector: '.product-image',
      attribute: 'src',
      multiple: true
    },
    features: {
      selector: '.feature-item',
      multiple: true,
      transform: text => text.trim()
    }
  }
);
```

### Dashboard Interface

The framework includes a web-based dashboard for exploring and visualizing data:

```bash
# Start the dashboard on the default port (3000)
dashboard

# Start the dashboard on a specific port
dashboard --port 8080

# Start the dashboard and open it in your browser
dashboard --open
```

The dashboard provides:
- Data Explorer for browsing and analyzing scraped data files
- Visualization tools for creating charts from your data
- Report generation for comprehensive reporting
- Data analysis for patterns and statistics

## Standards and Best Practices

### File Organization

1. **File Naming**: Use kebab-case for test files with `.spec.js` extension:
   - `login-page.spec.js`
   - `api-integration.spec.js`

2. **Directory Structure**: Organize tests by type and functionality:
   ```
   tests/
   ├── api/              # API tests
   │   ├── rest/         # REST API tests
   │   └── graphql/      # GraphQL API tests
   ├── e2e/              # End-to-end tests
   ├── integration/      # Integration tests
   └── unit/             # Unit tests
   ```

### Test Structure

1. **Test Grouping**: Use `test.describe` to group related tests:
   ```javascript
   test.describe('Login Functionality', () => {
     // Tests related to login
   });
   ```

2. **Test Hooks**: Use hooks for common setup and teardown:
   ```javascript
   test.describe('User Management', () => {
     test.beforeEach(async ({ page }) => {
       // Common setup
     });
     
     test.afterEach(async ({ page }) => {
       // Common teardown
     });
     
     // Tests
   });
   ```

3. **Test Naming**: Use descriptive names that explain the test's purpose:
   ```javascript
   test('should display error message for invalid credentials', async ({ page }) => {
     // Test implementation
   });
   ```

### Best Practices

1. **Environment Variables**: Use environment variables for configurable values
2. **Page Objects**: Use page objects to encapsulate page interactions
3. **Assertions**: Include clear assertions in every test
4. **Waiting**: Use Playwright's built-in waiting mechanisms
5. **Data Management**: Use test data factories or fixtures for test data
6. **Error Handling**: Use try/catch for expected errors

### Code Style

1. **Indentation**: Use 2 spaces for indentation
2. **Line Length**: Keep lines under 100 characters
3. **Comments**: Add comments for complex logic
4. **Async/Await**: Use async/await for all asynchronous operations

## Additional Resources

- **Documentation**: Available in the `/docs` directory and via the documentation site
- **Examples**: Check the `/examples` directory for sample tests
- **Support**: File issues on the GitHub repository
- **Changelog**: See the [CHANGELOG.md](CHANGELOG.md) file for version history