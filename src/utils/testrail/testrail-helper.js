const TestRailAPI = require('./testrail-api');

class TestRailHelper {
  constructor() {
    this.api = new TestRailAPI();
    this.projectId = process.env.TESTRAIL_PROJECT_ID;
    this.suiteId = process.env.TESTRAIL_SUITE_ID;
  }

  // Quick test run creation with results
  async createTestRunWithResults(name, testResults) {
    const caseIds = testResults.map(r => r.case_id);
    const run = await this.api.addRun(this.projectId, {
      name: name,
      suite_id: parseInt(this.suiteId),
      include_all: false,
      case_ids: caseIds
    });
    
    await this.api.addResultsForCases(run.id, { results: testResults });
    return run;
  }

  // Get project summary
  async getProjectSummary() {
    const project = await this.api.getProject(this.projectId);
    const suites = await this.api.getSuites(this.projectId);
    const runs = await this.api.getRuns(this.projectId);
    const milestones = await this.api.getMilestones(this.projectId);
    
    return { project, suites, runs, milestones };
  }

  // Get test case details with steps
  async getTestCaseDetails(caseId) {
    const testCase = await this.api.getCase(caseId);
    return {
      id: testCase.id,
      title: testCase.title,
      priority: testCase.priority_id,
      type: testCase.type_id,
      estimate: testCase.estimate,
      steps: testCase.custom_steps_separated || []
    };
  }

  // Create test suite with sections and cases
  async createTestSuite(suiteName, sections) {
    const suite = await this.api.addSuite(this.projectId, { name: suiteName });
    
    for (const section of sections) {
      const sectionObj = await this.api.addSection(this.projectId, {
        name: section.name,
        suite_id: suite.id
      });
      
      for (const testCase of section.cases) {
        await this.api.addCase(sectionObj.id, testCase);
      }
    }
    
    return suite;
  }

  // Get test execution statistics
  async getTestStats(runId) {
    const tests = await this.api.getTests(runId);
    const stats = {
      total: tests.length,
      passed: 0,
      failed: 0,
      blocked: 0,
      untested: 0,
      retest: 0
    };
    
    tests.forEach(test => {
      switch (test.status_id) {
        case 1: stats.passed++; break;
        case 2: stats.blocked++; break;
        case 3: stats.untested++; break;
        case 4: stats.retest++; break;
        case 5: stats.failed++; break;
      }
    });
    
    return stats;
  }

  // Bulk update test cases
  async bulkUpdateCases(caseIds, updates) {
    const results = [];
    for (const caseId of caseIds) {
      try {
        const result = await this.api.updateCase(caseId, updates);
        results.push({ caseId, success: true, result });
      } catch (error) {
        results.push({ caseId, success: false, error: error.message });
      }
    }
    return results;
  }

  // Create test plan with multiple runs
  async createTestPlan(planName, entries) {
    const plan = await this.api.addPlan(this.projectId, { name: planName });
    
    for (const entry of entries) {
      await this.api.addPlanEntry(plan.id, {
        suite_id: entry.suite_id,
        name: entry.name,
        case_ids: entry.case_ids,
        config_ids: entry.config_ids || []
      });
    }
    
    return plan;
  }

  // Get user activity summary
  async getUserActivity(userId) {
    const user = await this.api.getUser(userId);
    const runs = await this.api.getRuns(this.projectId);
    
    const userRuns = runs.filter(run => 
      run.created_by === userId || run.assignedto_id === userId
    );
    
    return { user, runs: userRuns };
  }

  // Export test results to JSON
  async exportTestResults(runId) {
    const run = await this.api.getRun(runId);
    const tests = await this.api.getTests(runId);
    const results = [];
    
    for (const test of tests) {
      const testResults = await this.api.getResults(test.id);
      results.push({
        test_id: test.id,
        case_id: test.case_id,
        title: test.title,
        status: test.status_id,
        results: testResults
      });
    }
    
    return { run, results };
  }

  // Validate test run before execution
  async validateTestRun(caseIds) {
    const validation = {
      valid: true,
      errors: [],
      warnings: [],
      cases: []
    };
    
    for (const caseId of caseIds) {
      try {
        const testCase = await this.api.getCase(caseId);
        validation.cases.push(testCase);
        
        if (!testCase.title) {
          validation.warnings.push(`Case ${caseId}: Missing title`);
        }
        
        if (testCase.type_id === 0) {
          validation.warnings.push(`Case ${caseId}: No test type specified`);
        }
      } catch (error) {
        validation.valid = false;
        validation.errors.push(`Case ${caseId}: ${error.message}`);
      }
    }
    
    return validation;
  }
}

module.exports = TestRailHelper;