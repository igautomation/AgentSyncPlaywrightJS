#!/usr/bin/env node

/**
 * Run Salesforce Apex Tests
 * 
 * This script runs Apex tests in Salesforce and reports results
 */
const { SalesforceApexUtils } = require('../../src/utils/salesforce');
const authManager = require('../../src/utils/salesforce/auth-manager');
require('dotenv').config({ path: '.env.unified' });

// Parse command line arguments
const args = process.argv.slice(2);
const classNames = args.length > 0 ? args : null;

async function runTests() {
  try {
    console.log('Authenticating with Salesforce...');
    const auth = await authManager.authenticate();
    
    console.log('Initializing Apex utilities...');
    const apexUtils = new SalesforceApexUtils({
      accessToken: auth.accessToken,
      instanceUrl: auth.instanceUrl
    });
    
    // If no class names provided, find test classes
    let testClasses = classNames;
    if (!testClasses) {
      console.log('No test classes specified, finding test classes...');
      const SalesforceDbUtils = require('../../src/utils/salesforce/core/salesforceDbUtils');
      const dbUtils = new SalesforceDbUtils({
        accessToken: auth.accessToken,
        instanceUrl: auth.instanceUrl
      });
      
      const query = "SELECT Name FROM ApexClass WHERE Name LIKE '%Test%' LIMIT 10";
      const result = await dbUtils.query(query);
      testClasses = result.records.map(record => record.Name);
      
      if (testClasses.length === 0) {
        console.log('No test classes found');
        return;
      }
      
      console.log(`Found ${testClasses.length} test classes: ${testClasses.join(', ')}`);
    }
    
    console.log(`Running Apex tests: ${testClasses.join(', ')}...`);
    const jobId = await apexUtils.runApexTests(testClasses);
    console.log(`Test job started with ID: ${jobId}`);
    
    // Poll for test completion
    console.log('Waiting for tests to complete...');
    let testResults;
    let attempts = 0;
    const maxAttempts = 30;
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      attempts++;
      
      try {
        testResults = await apexUtils.getApexTestResults(jobId);
        if (testResults.records && testResults.records.length > 0) {
          break;
        }
      } catch (error) {
        console.log(`Attempt ${attempts}/${maxAttempts}: Tests still running...`);
      }
    }
    
    if (!testResults || !testResults.records) {
      console.log('Tests did not complete within the timeout period');
      return;
    }
    
    // Process results
    console.log('\n=== TEST RESULTS ===');
    console.log(`Total tests: ${testResults.records.length}`);
    
    const passed = testResults.records.filter(r => r.Outcome === 'Pass').length;
    const failed = testResults.records.filter(r => r.Outcome === 'Fail').length;
    
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    
    // Show failures
    if (failed > 0) {
      console.log('\n=== FAILURES ===');
      testResults.records
        .filter(r => r.Outcome === 'Fail')
        .forEach(r => {
          console.log(`${r.ApexClass.Name}.${r.MethodName}: ${r.Message}`);
          if (r.StackTrace) {
            console.log(`Stack trace: ${r.StackTrace}`);
          }
        });
    }
    
    // Get code coverage
    console.log('\n=== CODE COVERAGE ===');
    for (const testClass of testClasses.slice(0, 3)) {
      try {
        const coverage = await apexUtils.getCodeCoverage(testClass);
        if (coverage.records && coverage.records.length > 0) {
          const record = coverage.records[0];
          const covered = record.NumLinesCovered || 0;
          const uncovered = record.NumLinesUncovered || 0;
          const total = covered + uncovered;
          const percentage = total > 0 ? Math.round((covered / total) * 100) : 0;
          
          console.log(`${record.ApexClassOrTrigger.Name}: ${percentage}% (${covered}/${total} lines)`);
        } else {
          console.log(`${testClass}: No coverage data available`);
        }
      } catch (error) {
        console.log(`${testClass}: Error getting coverage - ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('Error running tests:', error.message);
    process.exit(1);
  }
}

runTests().catch(console.error);