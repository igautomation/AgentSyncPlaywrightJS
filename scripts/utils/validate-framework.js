#!/usr/bin/env node

/**
 * Framework Validation Script
 * 
 * This script validates the framework structure and dependencies
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Starting Framework Validation');

// Define required directories and files
const requiredDirs = [
  'src',
  'src/tests',
  'src/tests/api',
  'src/tests/ui',
  'src/tests/salesforce',
  'src/utils',
  'src/utils/salesforce',
  'src/utils/testrail',
  'src/pages',
  'config',
  'scripts',
  'auth'
];

const requiredFiles = [
  'package.json',
  'playwright.config.js',
  'playwright.config.salesforce.js',
  '.env.unified',
  '.env.salesforce'
];

// Track validation results
const results = {
  directories: {
    passed: 0,
    failed: 0
  },
  files: {
    passed: 0,
    failed: 0
  },
  dependencies: {
    passed: 0,
    failed: 0
  }
};

// Check directories
console.log('\n📁 Checking required directories...');
for (const dir of requiredDirs) {
  const dirPath = path.join(process.cwd(), dir);
  if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
    console.log(`✅ ${dir} exists`);
    results.directories.passed++;
  } else {
    console.log(`❌ ${dir} is missing`);
    results.directories.failed++;
  }
}

// Check files
console.log('\n📄 Checking required files...');
for (const file of requiredFiles) {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    console.log(`✅ ${file} exists`);
    results.files.passed++;
  } else {
    console.log(`❌ ${file} is missing`);
    results.files.failed++;
  }
}

// Check package.json dependencies
console.log('\n📦 Checking package dependencies...');
const requiredDependencies = [
  '@playwright/test',
  'dotenv',
  'jsforce',
  'node-fetch'
];

try {
  const packageJson = require(path.join(process.cwd(), 'package.json'));
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  for (const dep of requiredDependencies) {
    if (dependencies[dep]) {
      console.log(`✅ ${dep} is installed (${dependencies[dep]})`);
      results.dependencies.passed++;
    } else {
      console.log(`❌ ${dep} is missing`);
      results.dependencies.failed++;
    }
  }
} catch (error) {
  console.error(`❌ Error reading package.json: ${error.message}`);
  results.dependencies.failed += requiredDependencies.length;
}

// Output summary
console.log('\n📊 Framework Validation Summary');
console.log('==============================');
console.log(`Directories: ${results.directories.passed} passed, ${results.directories.failed} failed`);
console.log(`Files: ${results.files.passed} passed, ${results.files.failed} failed`);
console.log(`Dependencies: ${results.dependencies.passed} passed, ${results.dependencies.failed} failed`);

const totalPassed = results.directories.passed + results.files.passed + results.dependencies.passed;
const totalFailed = results.directories.failed + results.files.failed + results.dependencies.failed;
const totalChecks = totalPassed + totalFailed;

console.log(`\nTotal: ${totalPassed}/${totalChecks} checks passed (${Math.round(totalPassed/totalChecks*100)}%)`);

// Exit with appropriate code
if (totalFailed > 0) {
  console.log('\n❌ Framework validation FAILED!');
  process.exit(1);
} else {
  console.log('\n✅ Framework validation PASSED!');
  process.exit(0);
}