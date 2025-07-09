#!/usr/bin/env node

/**
 * Run All Tests
 * 
 * This script runs all tests and generates a report
 */

const { execSync } = require('child_process');

console.log('🧪 Running all tests...');

try {
  // Run API tests
  console.log('\n📡 Running API tests...');
  execSync('npx playwright test src/tests/api', { stdio: 'inherit' });
  
  // Run UI tests
  console.log('\n🖥️ Running UI tests...');
  execSync('npx playwright test src/tests/ui --project=chromium', { stdio: 'inherit' });
  
  // Run Salesforce tests
  console.log('\n☁️ Running Salesforce tests...');
  execSync('npx playwright test src/tests/salesforce', { stdio: 'inherit' });
  
  // Generate report
  console.log('\n📊 Generating test report...');
  execSync('npx playwright show-report', { stdio: 'inherit' });
  
  console.log('\n✅ All tests completed successfully!');
} catch (error) {
  console.error(`\n❌ Error running tests: ${error.message}`);
  process.exit(1);
}