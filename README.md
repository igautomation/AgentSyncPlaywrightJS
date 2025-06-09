# Playwright Test Framework

A comprehensive test automation framework built with Playwright.

## Features

- Cross-browser testing (Chromium, Firefox, WebKit)
- API testing
- Accessibility testing
- Visual testing
- Mobile testing
- Salesforce integration
- Reporting and analytics
- CI/CD integration

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/playwright-framework.git
cd playwright-framework

# Install dependencies
npm install

# Install browsers
npx playwright install
```

## Configuration

Copy the example environment file and update it with your settings:

```bash
cp .env.example .env
```

## Running Tests

```bash
# Run all tests
npm test

# Run specific tests
npm test -- src/tests/core

# Run with specific configuration
npm test -- --config=playwright.config.salesforce.js

# Run in headed mode
npm test -- --headed
```

## Project Structure

```
├── .github/workflows    # GitHub Actions workflows
├── auth/                # Authentication state storage
├── docs-site/           # Documentation site
├── src/
│   ├── config/          # Configuration files
│   ├── core/            # Core framework functionality
│   ├── fixtures/        # Test fixtures
│   ├── helpers/         # Helper utilities
│   ├── pages/           # Page objects
│   ├── tests/           # Test files
│   └── utils/           # Utility functions
├── temp/                # Temporary files
└── test-results/        # Test results and reports
```

## CI/CD Integration

This framework includes GitHub Actions workflows for:

- Running tests
- Linting code
- Building documentation
- Creating framework bundles

## License

MIT# playwright-framework
# Updated README
