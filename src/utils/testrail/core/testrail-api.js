const fetch = require('node-fetch');

class TestRailAPI {
  constructor() {
    this.baseURL = process.env.TESTRAIL_URL;
    this.username = process.env.TESTRAIL_USERNAME;
    this.password = process.env.TESTRAIL_PASSWORD;
    this.apiKey = process.env.TESTRAIL_API_KEY;
    
    if (!this.baseURL || !this.username) {
      throw new Error('TestRail URL and username are required');
    }
    
    // Prefer API key over password for authentication
    this.authPassword = this.apiKey || this.password;
    
    if (!this.authPassword) {
      throw new Error('Either TESTRAIL_API_KEY or TESTRAIL_PASSWORD must be provided');
    }
    
    // Create auth header
    const authString = Buffer.from(`${this.username}:${this.authPassword}`).toString('base64');
    this.headers = {
      'Authorization': `Basic ${authString}`,
      'Content-Type': 'application/json'
    };
    
    console.log(`🔐 TestRail auth: ${this.apiKey ? 'API Key' : 'Username/Password'}`);
  }
  
  // Helper method for API requests
  async request(method, endpoint, data = null) {
    const url = `${this.baseURL}/index.php?/api/v2/${endpoint}`;
    
    const options = {
      method,
      headers: this.headers
    };
    
    if (data && method !== 'GET') {
      options.body = JSON.stringify(data);
    }
    
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`TestRail API error: ${response.status} - ${errorText}`);
    }
    
    return await response.json();
  }

  // Projects
  async getProjects() { return await this.request('GET', 'get_projects'); }
  async getProject(id) { return await this.request('GET', `get_project/${id}`); }

  // Suites
  async getSuites(projectId) { return await this.request('GET', `get_suites/${projectId}`); }
  async getSuite(id) { return await this.request('GET', `get_suite/${id}`); }
  async addSuite(projectId, data) { return await this.request('POST', `add_suite/${projectId}`, data); }
  async updateSuite(id, data) { return await this.request('POST', `update_suite/${id}`, data); }
  async deleteSuite(id) { return await this.request('POST', `delete_suite/${id}`, {}); }

  // Sections
  async getSections(projectId, suiteId) { return await this.request('GET', `get_sections/${projectId}&suite_id=${suiteId}`); }
  async getSection(id) { return await this.request('GET', `get_section/${id}`); }
  async addSection(projectId, data) { return await this.request('POST', `add_section/${projectId}`, data); }
  async updateSection(id, data) { return await this.request('POST', `update_section/${id}`, data); }
  async deleteSection(id) { return await this.request('POST', `delete_section/${id}`, {}); }

  // Cases
  async getCases(projectId, suiteId) { return await this.request('GET', `get_cases/${projectId}&suite_id=${suiteId}`); }
  async getCase(id) { return await this.request('GET', `get_case/${id}`); }
  async addCase(sectionId, data) { return await this.request('POST', `add_case/${sectionId}`, data); }
  async updateCase(id, data) { return await this.request('POST', `update_case/${id}`, data); }
  async deleteCase(id) { return await this.request('POST', `delete_case/${id}`, {}); }

  // Runs
  async getRuns(projectId) { return await this.request('GET', `get_runs/${projectId}`); }
  async getRun(id) { return await this.request('GET', `get_run/${id}`); }
  async addRun(projectId, data) { return await this.request('POST', `add_run/${projectId}`, data); }
  async updateRun(id, data) { return await this.request('POST', `update_run/${id}`, data); }
  async closeRun(id) { return await this.request('POST', `close_run/${id}`, {}); }
  async deleteRun(id) { return await this.request('POST', `delete_run/${id}`, {}); }

  // Tests
  async getTests(runId) { return await this.request('GET', `get_tests/${runId}`); }
  async getTest(id) { return await this.request('GET', `get_test/${id}`); }

  // Results
  async getResults(testId) { return await this.request('GET', `get_results/${testId}`); }
  async getResultsForCase(runId, caseId) { return await this.request('GET', `get_results_for_case/${runId}/${caseId}`); }
  async getResultsForRun(runId) { return await this.request('GET', `get_results_for_run/${runId}`); }
  async addResult(testId, data) { return await this.request('POST', `add_result/${testId}`, data); }
  async addResultForCase(runId, caseId, data) { return await this.request('POST', `add_result_for_case/${runId}/${caseId}`, data); }
  async addResults(runId, data) { return await this.request('POST', `add_results/${runId}`, data); }
  async addResultsForCases(runId, data) { return await this.request('POST', `add_results_for_cases/${runId}`, data); }

  // Plans
  async getPlans(projectId) { return await this.request('GET', `get_plans/${projectId}`); }
  async getPlan(id) { return await this.request('GET', `get_plan/${id}`); }
  async addPlan(projectId, data) { return await this.request('POST', `add_plan/${projectId}`, data); }
  async addPlanEntry(planId, data) { return await this.request('POST', `add_plan_entry/${planId}`, data); }
  async updatePlan(id, data) { return await this.request('POST', `update_plan/${id}`, data); }
  async updatePlanEntry(planId, entryId, data) { return await this.request('POST', `update_plan_entry/${planId}/${entryId}`, data); }
  async closePlan(id) { return await this.request('POST', `close_plan/${id}`, {}); }
  async deletePlan(id) { return await this.request('POST', `delete_plan/${id}`, {}); }
  async deletePlanEntry(planId, entryId) { return await this.request('POST', `delete_plan_entry/${planId}/${entryId}`, {}); }

  // Milestones
  async getMilestones(projectId) { return await this.request('GET', `get_milestones/${projectId}`); }
  async getMilestone(id) { return await this.request('GET', `get_milestone/${id}`); }
  async addMilestone(projectId, data) { return await this.request('POST', `add_milestone/${projectId}`, data); }
  async updateMilestone(id, data) { return await this.request('POST', `update_milestone/${id}`, data); }
  async deleteMilestone(id) { return await this.request('POST', `delete_milestone/${id}`, {}); }

  // Users
  async getUsers() { return await this.request('GET', 'get_users'); }
  async getUser(id) { return await this.request('GET', `get_user/${id}`); }
  async getUserByEmail(email) { return await this.request('GET', `get_user_by_email&email=${email}`); }

  // Configurations
  async getConfigs(projectId) { return await this.request('GET', `get_configs/${projectId}`); }
  async addConfigGroup(projectId, data) { return await this.request('POST', `add_config_group/${projectId}`, data); }
  async addConfig(configGroupId, data) { return await this.request('POST', `add_config/${configGroupId}`, data); }
  async updateConfigGroup(id, data) { return await this.request('POST', `update_config_group/${id}`, data); }
  async updateConfig(id, data) { return await this.request('POST', `update_config/${id}`, data); }
  async deleteConfigGroup(id) { return await this.request('POST', `delete_config_group/${id}`, {}); }
  async deleteConfig(id) { return await this.request('POST', `delete_config/${id}`, {}); }

  // Priorities
  async getPriorities() { return await this.request('GET', 'get_priorities'); }

  // Statuses
  async getStatuses() { return await this.request('GET', 'get_statuses'); }

  // Case Types
  async getCaseTypes() { return await this.request('GET', 'get_case_types'); }

  // Case Fields
  async getCaseFields() { return await this.request('GET', 'get_case_fields'); }

  // Result Fields
  async getResultFields() { return await this.request('GET', 'get_result_fields'); }

  // Templates
  async getTemplates(projectId) { return await this.request('GET', `get_templates/${projectId}`); }

  // Reports
  async getReports(projectId) { return await this.request('GET', `get_reports/${projectId}`); }
  async runReport(reportTemplateId) { return await this.request('GET', `run_report/${reportTemplateId}`); }

  // Attachments
  async addAttachmentToResult(resultId, filePath) {
    const FormData = require('form-data');
    const fs = require('fs');
    const form = new FormData();
    form.append('attachment', fs.createReadStream(filePath));
    
    // Create auth header
    const authString = Buffer.from(`${this.username}:${this.authPassword}`).toString('base64');
    
    const response = await fetch(
      `${this.baseURL}/index.php?/api/v2/add_attachment_to_result/${resultId}`,
      {
        method: 'POST',
        body: form,
        headers: {
          'Authorization': `Basic ${authString}`,
          ...form.getHeaders()
        }
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`TestRail API error: ${response.status} - ${errorText}`);
    }
    
    return await response.json();
  }

  async addAttachmentToPlan(planId, filePath) {
    const FormData = require('form-data');
    const fs = require('fs');
    const form = new FormData();
    form.append('attachment', fs.createReadStream(filePath));
    
    // Create auth header
    const authString = Buffer.from(`${this.username}:${this.authPassword}`).toString('base64');
    
    const response = await fetch(
      `${this.baseURL}/index.php?/api/v2/add_attachment_to_plan/${planId}`,
      {
        method: 'POST',
        body: form,
        headers: {
          'Authorization': `Basic ${authString}`,
          ...form.getHeaders()
        }
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`TestRail API error: ${response.status} - ${errorText}`);
    }
    
    return await response.json();
  }

  async addAttachmentToRun(runId, filePath) {
    const FormData = require('form-data');
    const fs = require('fs');
    const form = new FormData();
    form.append('attachment', fs.createReadStream(filePath));
    
    // Create auth header
    const authString = Buffer.from(`${this.username}:${this.authPassword}`).toString('base64');
    
    const response = await fetch(
      `${this.baseURL}/index.php?/api/v2/add_attachment_to_run/${runId}`,
      {
        method: 'POST',
        body: form,
        headers: {
          'Authorization': `Basic ${authString}`,
          ...form.getHeaders()
        }
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`TestRail API error: ${response.status} - ${errorText}`);
    }
    
    return await response.json();
  }
}

module.exports = TestRailAPI;