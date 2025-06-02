/**
 * Test script to verify the framework bundling and reusability
 */

// This would normally be:
// const framework = require('@your-org/playwright-framework');
// But for local testing, we'll use a relative path
const framework = require('../');

console.log('Testing Playwright Framework bundling and reusability...');

// Test framework configuration loading
const config = framework.loadFrameworkConfig();
console.log('Framework configuration loaded:', config ? '✅' : '❌');

// Test plugin system
const plugins = framework.loadPlugins();
console.log('Plugin system working:', plugins ? '✅' : '❌');

// Test utilities availability
console.log('API utilities available:', framework.utils.api ? '✅' : '❌');
console.log('Web utilities available:', framework.utils.web ? '✅' : '❌');
console.log('Common utilities available:', framework.utils.common ? '✅' : '❌');
console.log('Reporting utilities available:', framework.utils.reporting ? '✅' : '❌');

// Test fixtures availability
console.log('Custom fixtures available:', framework.apiClient ? '✅' : '❌');

// Test page objects availability
console.log('Page objects available:', framework.pages.BasePage ? '✅' : '❌');

console.log('\nFramework bundling test complete!');