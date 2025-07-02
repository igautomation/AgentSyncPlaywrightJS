const axios = require('axios').default || require('axios');

class TestRailAPI {
  constructor() {
    this.baseURL = process.env.TESTRAIL_URL;
    this.username = process.env.TESTRAIL_USERNAME;
    this.apiKey = process.env.TESTRAIL_API_KEY;
    
    if (!this.baseURL || !this.username || !this.apiKey) {
      throw new Error('TestRail credentials not found in environment variables');
    }
    
    this.client = axios.create({
      baseURL: `${this.baseURL}/index.php?/api/v2/`,
      auth: {
        username: this.username,
        password: this.apiKey
      },
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Projects
  async getProjects() { return (await this.client.get('get_projects')).data; }
  async getProject(id) { return (await this.client.get(`get_project/${id}`)).data; }

  // Suites
  async getSuites(projectId) { return (await this.client.get(`get_suites/${projectId}`)).data; }
  async getSuite(id) { return (await this.client.get(`get_suite/${id}`)).data; }
  async addSuite(projectId, data) { return (await this.client.post(`add_suite/${projectId}`, data)).data; }
  async updateSuite(id, data) { return (await this.client.post(`update_suite/${id}`, data)).data; }
  async deleteSuite(id) { return (await this.client.post(`delete_suite/${id}`, {})).data; }

  // Sections
  async getSections(projectId, suiteId) { return (await this.client.get(`get_sections/${projectId}&suite_id=${suiteId}`)).data; }
  async getSection(id) { return (await this.client.get(`get_section/${id}`)).data; }
  async addSection(projectId, data) { return (await this.client.post(`add_section/${projectId}`, data)).data; }
  async updateSection(id, data) { return (await this.client.post(`update_section/${id}`, data)).data; }
  async deleteSection(id) { return (await this.client.post(`delete_section/${id}`, {})).data; }

  // Cases
  async getCases(projectId, suiteId) { return (await this.client.get(`get_cases/${projectId}&suite_id=${suiteId}`)).data; }
  async getCase(id) { return (await this.client.get(`get_case/${id}`)).data; }
  async addCase(sectionId, data) { return (await this.client.post(`add_case/${sectionId}`, data)).data; }
  async updateCase(id, data) { return (await this.client.post(`update_case/${id}`, data)).data; }
  async deleteCase(id) { return (await this.client.post(`delete_case/${id}`, {})).data; }

  // Runs
  async getRuns(projectId) { return (await this.client.get(`get_runs/${projectId}`)).data; }
  async getRun(id) { return (await this.client.get(`get_run/${id}`)).data; }
  async addRun(projectId, data) { return (await this.client.post(`add_run/${projectId}`, data)).data; }
  async updateRun(id, data) { return (await this.client.post(`update_run/${id}`, data)).data; }
  async closeRun(id) { return (await this.client.post(`close_run/${id}`, {})).data; }
  async deleteRun(id) { return (await this.client.post(`delete_run/${id}`, {})).data; }

  // Tests
  async getTests(runId) { return (await this.client.get(`get_tests/${runId}`)).data; }
  async getTest(id) { return (await this.client.get(`get_test/${id}`)).data; }

  // Results
  async getResults(testId) { return (await this.client.get(`get_results/${testId}`)).data; }
  async getResultsForCase(runId, caseId) { return (await this.client.get(`get_results_for_case/${runId}/${caseId}`)).data; }
  async getResultsForRun(runId) { return (await this.client.get(`get_results_for_run/${runId}`)).data; }
  async addResult(testId, data) { return (await this.client.post(`add_result/${testId}`, data)).data; }
  async addResultForCase(runId, caseId, data) { return (await this.client.post(`add_result_for_case/${runId}/${caseId}`, data)).data; }
  async addResults(runId, data) { return (await this.client.post(`add_results/${runId}`, data)).data; }
  async addResultsForCases(runId, data) { return (await this.client.post(`add_results_for_cases/${runId}`, data)).data; }

  // Plans
  async getPlans(projectId) { return (await this.client.get(`get_plans/${projectId}`)).data; }
  async getPlan(id) { return (await this.client.get(`get_plan/${id}`)).data; }
  async addPlan(projectId, data) { return (await this.client.post(`add_plan/${projectId}`, data)).data; }
  async addPlanEntry(planId, data) { return (await this.client.post(`add_plan_entry/${planId}`, data)).data; }
  async updatePlan(id, data) { return (await this.client.post(`update_plan/${id}`, data)).data; }
  async updatePlanEntry(planId, entryId, data) { return (await this.client.post(`update_plan_entry/${planId}/${entryId}`, data)).data; }
  async closePlan(id) { return (await this.client.post(`close_plan/${id}`, {})).data; }
  async deletePlan(id) { return (await this.client.post(`delete_plan/${id}`, {})).data; }
  async deletePlanEntry(planId, entryId) { return (await this.client.post(`delete_plan_entry/${planId}/${entryId}`, {})).data; }

  // Milestones
  async getMilestones(projectId) { return (await this.client.get(`get_milestones/${projectId}`)).data; }
  async getMilestone(id) { return (await this.client.get(`get_milestone/${id}`)).data; }
  async addMilestone(projectId, data) { return (await this.client.post(`add_milestone/${projectId}`, data)).data; }
  async updateMilestone(id, data) { return (await this.client.post(`update_milestone/${id}`, data)).data; }
  async deleteMilestone(id) { return (await this.client.post(`delete_milestone/${id}`, {})).data; }

  // Users
  async getUsers() { return (await this.client.get('get_users')).data; }
  async getUser(id) { return (await this.client.get(`get_user/${id}`)).data; }
  async getUserByEmail(email) { return (await this.client.get(`get_user_by_email&email=${email}`)).data; }

  // Configurations
  async getConfigs(projectId) { return (await this.client.get(`get_configs/${projectId}`)).data; }
  async addConfigGroup(projectId, data) { return (await this.client.post(`add_config_group/${projectId}`, data)).data; }
  async addConfig(configGroupId, data) { return (await this.client.post(`add_config/${configGroupId}`, data)).data; }
  async updateConfigGroup(id, data) { return (await this.client.post(`update_config_group/${id}`, data)).data; }
  async updateConfig(id, data) { return (await this.client.post(`update_config/${id}`, data)).data; }
  async deleteConfigGroup(id) { return (await this.client.post(`delete_config_group/${id}`, {})).data; }
  async deleteConfig(id) { return (await this.client.post(`delete_config/${id}`, {})).data; }

  // Priorities
  async getPriorities() { return (await this.client.get('get_priorities')).data; }

  // Statuses
  async getStatuses() { return (await this.client.get('get_statuses')).data; }

  // Case Types
  async getCaseTypes() { return (await this.client.get('get_case_types')).data; }

  // Case Fields
  async getCaseFields() { return (await this.client.get('get_case_fields')).data; }

  // Result Fields
  async getResultFields() { return (await this.client.get('get_result_fields')).data; }

  // Templates
  async getTemplates(projectId) { return (await this.client.get(`get_templates/${projectId}`)).data; }

  // Reports
  async getReports(projectId) { return (await this.client.get(`get_reports/${projectId}`)).data; }
  async runReport(reportTemplateId) { return (await this.client.get(`run_report/${reportTemplateId}`)).data; }

  // Attachments
  async addAttachmentToResult(resultId, filePath) {
    const FormData = require('form-data');
    const fs = require('fs');
    const form = new FormData();
    form.append('attachment', fs.createReadStream(filePath));
    
    return await axios.post(
      `${this.baseURL}/index.php?/api/v2/add_attachment_to_result/${resultId}`,
      form,
      {
        auth: { username: this.username, password: this.apiKey },
        headers: form.getHeaders()
      }
    );
  }

  async addAttachmentToPlan(planId, filePath) {
    const FormData = require('form-data');
    const fs = require('fs');
    const form = new FormData();
    form.append('attachment', fs.createReadStream(filePath));
    
    return await axios.post(
      `${this.baseURL}/index.php?/api/v2/add_attachment_to_plan/${planId}`,
      form,
      {
        auth: { username: this.username, password: this.apiKey },
        headers: form.getHeaders()
      }
    );
  }

  async addAttachmentToRun(runId, filePath) {
    const FormData = require('form-data');
    const fs = require('fs');
    const form = new FormData();
    form.append('attachment', fs.createReadStream(filePath));
    
    return await axios.post(
      `${this.baseURL}/index.php?/api/v2/add_attachment_to_run/${runId}`,
      form,
      {
        auth: { username: this.username, password: this.apiKey },
        headers: form.getHeaders()
      }
    );
  }
}

module.exports = TestRailAPI;