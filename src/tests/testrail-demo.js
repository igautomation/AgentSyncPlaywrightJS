/**
 * TestRail API Demo Script
 * Demonstrates comprehensive TestRail integration capabilities
 */
require('dotenv').config({ path: '.env.unified' });
const { TestRailAPI, TestRailHelper } = require('../utils/testrail');

async function demoTestRailIntegration() {
  const api = new TestRailAPI();
  const helper = new TestRailHelper();
  
  console.log('🚀 TestRail API Integration Demo\n');
  
  try {
    // 1. Get Project Information
    console.log('📋 Project Information:');
    const project = await api.getProject(18);
    console.log(`- Name: ${project.name}`);
    console.log(`- ID: ${project.id}`);
    console.log(`- Users: ${project.users.length}\n`);
    
    // 2. Get Suites
    console.log('📁 Test Suites:');
    const suites = await api.getSuites(18);
    suites.forEach(suite => {
      console.log(`- ${suite.name} (ID: ${suite.id})`);
    });
    console.log();
    
    // 3. Get Test Cases
    console.log('📝 Test Cases (Sample):');
    const cases = await api.getCases(18, 403);
    if (Array.isArray(cases)) {
      cases.slice(0, 3).forEach(testCase => {
        console.log(`- ${testCase.title} (ID: ${testCase.id})`);
      });
      console.log(`Total Cases: ${cases.length}\n`);
    } else {
      console.log('- Cases data format:', typeof cases, '\n');
    }
    
    // 4. Get Recent Test Runs
    console.log('🏃 Recent Test Runs:');
    const runs = await api.getRuns(18);
    if (Array.isArray(runs)) {
      runs.slice(0, 3).forEach(run => {
        console.log(`- ${run.name} (ID: ${run.id}) - ${run.is_completed ? 'Completed' : 'Active'}`);
      });
    } else {
      console.log('- Runs data format:', typeof runs);
    }
    console.log();
    
    // 5. Get Users
    console.log('👥 Users:');
    const users = await api.getUsers();
    if (Array.isArray(users)) {
      users.slice(0, 3).forEach(user => {
        console.log(`- ${user.name} (${user.email})`);
      });
    } else {
      console.log('- Users data format:', typeof users);
    }
    console.log();
    
    // 6. Get Statuses
    console.log('📊 Test Statuses:');
    const statuses = await api.getStatuses();
    statuses.forEach(status => {
      console.log(`- ${status.name} (ID: ${status.id})`);
    });
    console.log();
    
    // 7. Get Priorities
    console.log('⚡ Priorities:');
    const priorities = await api.getPriorities();
    priorities.forEach(priority => {
      console.log(`- ${priority.name} (ID: ${priority.id})`);
    });
    console.log();
    
    // 8. Create Sample Test Run
    console.log('🆕 Creating Sample Test Run:');
    const testRun = await api.addRun(18, {
      name: `Demo Test Run - ${new Date().toISOString()}`,
      suite_id: 403,
      include_all: false,
      case_ids: [24148, 24149]
    });
    console.log(`- Created: ${testRun.name} (ID: ${testRun.id})\n`);
    
    // 9. Add Sample Results
    console.log('📈 Adding Sample Results:');
    await api.addResultsForCases(testRun.id, {
      results: [
        { case_id: 24148, status_id: 1, comment: 'Demo test passed' },
        { case_id: 24149, status_id: 1, comment: 'Demo test passed' }
      ]
    });
    console.log('- Results added successfully\n');
    
    // 10. Get Test Statistics
    console.log('📊 Test Statistics:');
    const stats = await helper.getTestStats(testRun.id);
    console.log(`- Total: ${stats.total}`);
    console.log(`- Passed: ${stats.passed}`);
    console.log(`- Failed: ${stats.failed}`);
    console.log(`- Untested: ${stats.untested}\n`);
    
    // 11. Close Test Run
    console.log('🔒 Closing Test Run:');
    await api.closeRun(testRun.id);
    console.log('- Test run closed successfully\n');
    
    console.log('✅ TestRail API Demo Completed Successfully!');
    
  } catch (error) {
    console.error('❌ Demo Error:', error.message);
  }
}

// Run demo if called directly
if (require.main === module) {
  demoTestRailIntegration();
}

module.exports = { demoTestRailIntegration };