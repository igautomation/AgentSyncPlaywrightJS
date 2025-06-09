# AgentSync Playwright Test Framework

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

# Set up credentials
npm run setup:credentials

# For Salesforce testing, run the Salesforce setup
npm run setup:salesforce
```

### Verify Installation

```bash
# Run a simple test to verify installation
npm run test:smoke
```

## 🧪 Running Tests

```bash
# Run all tests
npm test

# Run tests with UI mode
npm run test:ui

# Run specific test types
npm run test:api        # API tests
npm run test:e2e        # End-to-end tests
npm run test:visual     # Visual tests
npm run test:salesforce # Salesforce tests

# Run tests in headed mode
npm run test:headed

# View test reports
npm run report
```

## 🏗️ Framework Architecture

The framework follows a modular architecture with clear separation of concerns:

```
AgentSyncProfessionalServices/
├── src/                    # Source code
│   ├── config/             # Configuration files
│   ├── pages/              # Page objects
│   │   └── salesforce/     # Salesforce page objects
│   ├── tests/              # Test files
│   │   ├── api/            # API tests
│   │   ├── core/           # Core functionality tests
│   │   ├── e2e/            # End-to-end tests
│   │   └── salesforce/     # Salesforce tests
│   └── utils/              # Utility modules
│       ├── api/            # API testing utilities
│       ├── common/         # Common utilities
│       ├── data/           # Test data management
│       ├── generators/     # Page object generators
│       ├── salesforce/     # Salesforce utilities
│       └── web/            # Web testing utilities
├── auth/                   # Authentication state storage
├── docs/                   # Documentation
├── reports/                # Test reports
└── scripts/                # Helper scripts
```

## 🛠️ Key Features

- **Cross-browser Testing**: Chrome, Firefox, Safari, and Edge support
- **API Testing**: REST and GraphQL API testing capabilities
- **Visual Testing**: Screenshot comparison and visual regression testing
- **Accessibility Testing**: Automated accessibility audits
- **Performance Testing**: Core Web Vitals and performance metrics
- **Data-Driven Testing**: Support for multiple data formats
- **Self-Healing Locators**: Automatic recovery from broken selectors
- **Reporting**: Customizable HTML reports and dashboards
- **CI/CD Integration**: GitHub Actions workflows and Docker support
- **Salesforce Integration**: Specialized utilities for Salesforce testing
- **Mobile Testing**: Mobile browser emulation capabilities

## 🔌 Salesforce Testing

The framework includes specialized support for Salesforce testing:

```bash
# Set up Salesforce credentials
npm run setup:salesforce

# Run Salesforce tests
npm run test:salesforce

# Generate Salesforce page objects
npm run sf:generate-page
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