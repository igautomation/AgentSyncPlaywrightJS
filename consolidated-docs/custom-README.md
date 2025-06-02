<!-- Source: /Users/mzahirudeen/playwright-framework-dev/custom/README.md -->

# Custom Extensions

This directory contains client-specific customizations for the Playwright Framework.

## Directory Structure

- `plugins/`: Custom plugins
- `fixtures/`: Custom fixtures
- `reporters/`: Custom reporters
- `pages/`: Custom page objects
- `utils/`: Custom utilities

## Adding Custom Extensions

### Custom Plugin

Create a file in `plugins/my-plugin.js`:

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

Register the plugin in `framework.config.js`:

```javascript
module.exports = {
  plugins: [
    { name: 'my-plugin', options: { key: 'value' } }
  ]
};
```

### Custom Fixture

Create a file in `fixtures/my-fixture.js`:

```javascript
const { test: baseTest } = require('@playwright/test');

const test = baseTest.extend({
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

### Custom Reporter

Create a file in `reporters/my-reporter.js`:

```javascript
class MyReporter {
  onBegin(config, suite) {
    console.log('Starting the run with config:', config);
  }

  onTestBegin(test) {
    console.log(`Starting test ${test.title}`);
  }

  onTestEnd(test, result) {
    console.log(`Finished test ${test.title}: ${result.status}`);
  }

  onEnd(result) {
    console.log(`Finished the run: ${result.status}`);
  }
}

module.exports = MyReporter;
```

Register the reporter in `playwright.config.js`:

```javascript
const MyReporter = require('./custom/reporters/my-reporter');

module.exports = defineConfig({
  reporter: [
    ['html'],
    ['list'],
    ['./custom/reporters/my-reporter.js']
  ],
});
```

### Custom Page Object

Create a file in `pages/my-page.js`:

```javascript
const { BasePage } = require('@your-org/playwright-framework').pages;

class MyPage extends BasePage {
  constructor(page) {
    super(page);
    
    // Define selectors
    this.selectors = {
      // Add your selectors here
    };
  }
  
  // Add page-specific methods
}

module.exports = MyPage;
```

### Custom Utility

Create a file in `utils/my-utility.js`:

```javascript
class MyUtility {
  constructor(options) {
    this.options = options;
  }
  
  // Add utility methods
}

module.exports = MyUtility;
```