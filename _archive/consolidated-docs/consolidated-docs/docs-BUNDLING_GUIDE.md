<!-- Source: /Users/mzahirudeen/playwright-framework-dev/docs/BUNDLING_GUIDE.md -->

# Bundling & Reusability Guide

This guide explains how to use the bundling and reusability features of the Playwright Framework.

## NPM Package

The framework is published as an NPM package `@your-org/playwright-framework` with a CLI entry point.

### Publishing

To publish the framework:

```bash
npm version [patch|minor|major]
npm publish
```

### Installation

Users can install the framework:

```bash
npm install @your-org/playwright-framework
```

## One-Command Setup

The framework provides a CLI command for scaffolding a new project:

```bash
npx playwright-framework init
```

This will create a new project with the basic structure and configuration.

Options:
- `--template basic` - Basic project template (default)
- `--template full` - Full-featured project template

## Configurability

The framework is highly configurable through two main configuration files:

### playwright.config.js

Standard Playwright configuration file with framework integration:

```javascript
const { defineConfig, devices } = require('@playwright/test');
const { loadFrameworkConfig } = require('@your-org/playwright-framework');

// Load framework configuration
const frameworkConfig = loadFrameworkConfig();

module.exports = defineConfig({
  // Playwright configuration
});
```

### framework.config.js

Framework-specific configuration:

```javascript
module.exports = {
  framework: {
    defaultTimeout: 30000,
    selfHealingLocators: true,
    // Other framework settings
  },
  reporting: {
    outputDir: './reports',
    formats: ['html', 'json'],
  },
  plugins: [
    // Plugin configurations
  ],
  custom: {
    // Custom settings
  }
};
```

## Extensibility

The framework provides a plugin system for custom reporters, locators, and utilities.

### Creating a Plugin

Create a plugin in `custom/plugins/my-plugin.js`:

```javascript
class MyPlugin {
  constructor(options) {
    this.options = options;
  }
  
  initialize() {
    // Plugin initialization
  }
  
  // Plugin methods
}

module.exports = MyPlugin;
```

### Registering a Plugin

Register the plugin in `framework.config.js`:

```javascript
module.exports = {
  plugins: [
    { name: 'my-plugin', options: { key: 'value' } }
  ]
};
```

### Using a Plugin

Use the plugin in your tests:

```javascript
const { getPlugin } = require('@your-org/playwright-framework');

test('should use plugin', async ({ page }) => {
  const myPlugin = getPlugin('my-plugin');
  await myPlugin.doSomething();
});
```

## Custom Fixtures

The framework provides reusable fixtures for common testing scenarios.

### Using Built-in Fixtures

```javascript
const { test } = require('@your-org/playwright-framework');

test('should use API client', async ({ apiClient }) => {
  const response = await apiClient.get('/users');
  expect(response.ok()).toBeTruthy();
});

test('should use authenticated page', async ({ authenticatedPage }) => {
  await authenticatedPage.goto('/dashboard');
  // Page is already authenticated
});
```

### Creating Custom Fixtures

```javascript
const { createFixtures } = require('@your-org/playwright-framework');

const test = createFixtures({
  myFixture: async ({}, use) => {
    // Setup fixture
    const fixture = { /* ... */ };
    
    // Use fixture
    await use(fixture);
    
    // Teardown fixture
  }
});

module.exports = { test };
```

## Documentation

The framework includes comprehensive documentation:

- **README.md**: Quick start and overview
- **JSDoc**: API documentation
- **Docusaurus Site**: Comprehensive documentation site
- **PDF User Guide**: Downloadable user guide

### Hosting Documentation

The documentation site is hosted on GitHub Pages for accessibility.

To deploy the documentation:

```bash
cd docs-site
npm run build
npm run deploy
```

## Licensing

The framework is open-source under the MIT license. The license is included in the `LICENSE.md` file.

## Community Support

- **GitHub Repository**: For issues, feature requests, and contributions
- **Discord/Slack**: For community discussions and support

## Versioning

The framework follows semantic versioning (SEMVER):

- **MAJOR**: Incompatible API changes
- **MINOR**: New functionality in a backward-compatible manner
- **PATCH**: Backward-compatible bug fixes

All changes are documented in `CHANGELOG.md`.

## Client Customization

The framework supports client-specific customizations through the `custom/` folder:

- `custom/plugins/`: Custom plugins
- `custom/fixtures/`: Custom fixtures
- `custom/reporters/`: Custom reporters
- `custom/pages/`: Custom page objects
- `custom/utils/`: Custom utilities

These customizations are automatically loaded by the framework.