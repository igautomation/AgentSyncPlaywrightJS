# Framework Features Access Guide

This guide demonstrates how users can access and utilize all built-in features of the framework when using it as a dependency.

## Installation

```bash
npm install @your-org/playwright-framework
```

## Available Features

### 1. Scripts Access

Access all framework scripts for automation, setup, and utilities:

```javascript
const { assets } = require('@your-org/playwright-framework');

// List all available scripts
const scripts = assets.listScripts();

// Get specific script path
const healthCheck = assets.getScript('utils/framework-health-check.js');
const setupScript = assets.getScript('setup/setup.js');

// Execute framework scripts
const { execSync } = require('child_process');
execSync(`node ${healthCheck}`);
```

### 2. Data Files Access

Access test data, schemas, and configuration files:

```javascript
const { assets } = require('@your-org/playwright-framework');

// List all data files
const dataFiles = assets.listData();

// Access specific data files
const testData = assets.getData('testData.json');
const schemas = assets.getData('schemas/user.schema.json');
const locators = assets.getData('locators/login-page.json');

// Load and use data
const userData = require(testData);
```

### 3. Docker Configuration

Access Docker setup for containerized testing:

```javascript
const { assets } = require('@your-org/playwright-framework');

// Get Docker configuration paths
const dockerConfig = assets.getDockerConfig();

// Copy Docker files to your project
assets.copyAsset(dockerConfig.dockerfile, './Dockerfile');
assets.copyAsset(dockerConfig.compose, './docker-compose.yml');

// Use npm scripts for Docker
// npm run docker:build
// npm run docker:run
// npm run docker:test
```

### 4. GitHub Workflows

Access CI/CD workflows for automated testing:

```javascript
const { assets } = require('@your-org/playwright-framework');

// Get workflows directory
const workflowsPath = assets.getWorkflows();

// Copy workflows to your project
const fs = require('fs');
const path = require('path');

// Ensure .github/workflows directory exists
fs.mkdirSync('.github/workflows', { recursive: true });

// Copy specific workflows
const workflows = [
  'ci.yml',
  'accessibility-tests.yml',
  'salesforce-generators.yml',
  'docker-test.yml'
];

workflows.forEach(workflow => {
  const source = path.join(workflowsPath, workflow);
  const target = path.join('.github/workflows', workflow);
  assets.copyAsset(source, target);
});
```

### 5. Husky Git Hooks

Access pre-configured git hooks for code quality:

```javascript
const { assets } = require('@your-org/playwright-framework');

// Get Husky hooks path
const huskyPath = assets.getHuskyHooks();

// Setup Husky in your project
const { execSync } = require('child_process');
execSync('npm run setup:husky');

// Available hooks:
// - pre-commit: Runs linting and formatting
// - pre-push: Runs tests before push
```

### 6. Project Templates

Use framework templates to bootstrap new projects:

```bash
# Initialize with basic template
npx playwright-framework init --template basic

# Initialize with full template
npx playwright-framework init --template full
```

### 7. Examples and Samples

Access example implementations:

```javascript
const { assets } = require('@your-org/playwright-framework');

// List all examples
const examples = assets.listExamples();

// Access specific examples
const playwrightExamples = assets.getExample('playwright');
const schedulingExamples = assets.getExample('schedules');
const visualizationExamples = assets.getExample('visualization');
```

### 8. All Framework Utilities

Access comprehensive utility modules:

```javascript
const { utils } = require('@your-org/playwright-framework');

// API utilities
const { apiClient, apiUtils } = utils.api;

// Web utilities
const { webInteractions, screenshotUtils } = utils.web;

// Salesforce utilities
const { salesforceUtils, salesforceApiUtils } = utils.salesforce;

// Database utilities
const { dbUtils } = utils.database;

// Accessibility utilities
const { accessibilityUtils } = utils.accessibility;

// And many more...
```

## NPM Scripts Available

When you install the framework, these scripts become available:

```json
{
  "scripts": {
    "test": "playwright test",
    "test:api": "playwright test src/tests/api",
    "test:accessibility": "playwright test src/tests/accessibility",
    "test:salesforce": "playwright test src/tests/salesforce",
    "docker:build": "docker build -t playwright-framework .",
    "docker:run": "docker-compose up",
    "setup:husky": "husky install",
    "setup:project": "node scripts/setup/setup.js",
    "validate:framework": "node scripts/utils/validate-framework.js",
    "health:check": "node scripts/utils/framework-health-check.js"
  }
}
```

## CLI Commands

The framework provides CLI commands for project management:

```bash
# Initialize new project
npx playwright-framework init

# Generate page objects
npx playwright-framework generate --page LoginPage

# Generate test files
npx playwright-framework generate --test "User Authentication"

# Open documentation
npx playwright-framework docs
```

## Complete Usage Example

```javascript
const { 
  utils, 
  assets, 
  apiClient, 
  webInteractions, 
  salesforceUtils 
} = require('@your-org/playwright-framework');

// Use in your tests
const { test, expect } = require('@playwright/test');

test('Complete framework usage', async ({ page, request }) => {
  // Use web utilities
  const web = new webInteractions(page);
  await web.navigateAndWait('https://example.com');
  
  // Use API utilities
  const api = new apiClient({ request });
  const response = await api.get('/api/users');
  
  // Use Salesforce utilities
  const sf = new salesforceUtils();
  await sf.login();
  
  // Access framework data
  const testData = require(assets.getData('testData.json'));
  
  // Use framework scripts
  const { execSync } = require('child_process');
  execSync(`node ${assets.getScript('utils/validate-tests.js')}`);
});
```

## Summary

✅ **Scripts**: All automation and utility scripts accessible  
✅ **Data**: Test data, schemas, and configurations available  
✅ **Docker**: Complete containerization setup included  
✅ **Workflows**: CI/CD pipelines ready to use  
✅ **Husky**: Git hooks for code quality  
✅ **Templates**: Project bootstrapping templates  
✅ **Examples**: Implementation samples and guides  
✅ **Utilities**: Comprehensive testing utilities  
✅ **CLI**: Command-line tools for project management  

The framework is designed to provide complete access to all its features when used as a dependency, ensuring users can leverage the full power of the testing framework in their projects.