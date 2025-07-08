#!/usr/bin/env node

/**
 * GitHub Actions Secrets Verification Script
 * 
 * This script checks if all required environment variables for GitHub Actions
 * are properly set. It's meant to be run locally to verify your setup before
 * pushing to GitHub.
 */

const chalk = require('chalk');
require('dotenv').config();

// Define required secrets
const requiredSecrets = [
  { name: 'SF_USERNAME', description: 'Salesforce username' },
  { name: 'SF_PASSWORD', description: 'Salesforce password' },
  { name: 'SF_INSTANCE_URL', description: 'Salesforce instance URL' },
  { name: 'TESTRAIL_URL', description: 'TestRail URL' },
  { name: 'TESTRAIL_USERNAME', description: 'TestRail username' },
  { name: 'TESTRAIL_API_KEY', description: 'TestRail API key' },
  { name: 'TESTRAIL_PROJECT_ID', description: 'TestRail project ID' },
  { name: 'TESTRAIL_SUITE_ID', description: 'TestRail suite ID' }
];

console.log(chalk.blue('🔍 Checking GitHub Actions required secrets...'));
console.log(chalk.gray('This script checks if your .env file contains all the secrets needed for GitHub Actions.'));
console.log(chalk.gray('Make sure to add these secrets to your GitHub repository settings as well.\n'));

let missingSecrets = 0;

// Check each required secret
requiredSecrets.forEach(secret => {
  if (!process.env[secret.name]) {
    console.log(chalk.red(`❌ Missing: ${secret.name} - ${secret.description}`));
    missingSecrets++;
  } else {
    // Don't show the actual value for security reasons
    console.log(chalk.green(`✅ Found: ${secret.name}`));
  }
});

// Summary
console.log('\n' + chalk.blue('📊 Summary:'));
if (missingSecrets === 0) {
  console.log(chalk.green('✅ All required secrets are set in your .env file!'));
  console.log(chalk.yellow('⚠️  Remember to add these secrets to your GitHub repository settings as well.'));
} else {
  console.log(chalk.red(`❌ Missing ${missingSecrets} required secret(s).`));
  console.log(chalk.yellow('⚠️  Please update your .env file with the missing secrets.'));
}

// Instructions for GitHub
console.log('\n' + chalk.blue('📝 How to add secrets to GitHub:'));
console.log(chalk.gray('1. Go to your GitHub repository'));
console.log(chalk.gray('2. Click on "Settings" tab'));
console.log(chalk.gray('3. Click on "Secrets and variables" > "Actions" in the sidebar'));
console.log(chalk.gray('4. Click on "New repository secret"'));
console.log(chalk.gray('5. Add each missing secret with its name and value'));

// Exit with error code if secrets are missing
if (missingSecrets > 0) {
  process.exit(1);
}