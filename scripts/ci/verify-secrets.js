#!/usr/bin/env node

/**
 * Verify Required Secrets
 * 
 * This script verifies that all required environment variables are set
 */

require('dotenv').config({ path: '.env.unified' });
require('dotenv').config({ path: '.env.salesforce' });

const requiredVars = [
  // Salesforce credentials
  'SF_USERNAME',
  'SF_PASSWORD',
  'SF_INSTANCE_URL',
  
  // TestRail credentials
  'TESTRAIL_URL',
  'TESTRAIL_USERNAME',
  'TESTRAIL_API_KEY',
  'TESTRAIL_PROJECT_ID',
  'TESTRAIL_SUITE_ID'
];

console.log('🔐 Verifying required secrets...');

const missing = [];
const present = [];

for (const varName of requiredVars) {
  if (!process.env[varName]) {
    missing.push(varName);
  } else {
    present.push(varName);
  }
}

// Output results
console.log(`\n✅ Found ${present.length} secrets:`);
present.forEach(varName => console.log(`  - ${varName}`));

if (missing.length > 0) {
  console.log(`\n❌ Missing ${missing.length} required secrets:`);
  missing.forEach(varName => console.log(`  - ${varName}`));
  process.exit(1);
} else {
  console.log('\n✅ All required secrets are present!');
  process.exit(0);
}