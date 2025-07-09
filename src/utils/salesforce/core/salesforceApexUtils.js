/**
 * Salesforce Apex Utilities
 * 
 * Provides functions for executing and testing Apex code
 */
const fetch = require('node-fetch');

class SalesforceApexUtils {
  constructor(config = {}) {
    this.instanceUrl = config.instanceUrl || process.env.SF_INSTANCE_URL;
    this.accessToken = config.accessToken || process.env.SF_ACCESS_TOKEN;
    this.apiVersion = config.apiVersion || process.env.SF_API_VERSION || 'v62.0';
  }

  /**
   * Execute anonymous Apex code
   * @param {string} apexCode - Apex code to execute
   * @returns {Promise<Object>} Execution result
   */
  async executeAnonymous(apexCode) {
    const url = `${this.instanceUrl}/services/data/${this.apiVersion}/tooling/executeAnonymous`;
    
    const response = await fetch(`${url}?anonymousBody=${encodeURIComponent(apexCode)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Apex execution error: ${response.status} - ${errorText}`);
    }
    
    return await response.json();
  }

  /**
   * Run Apex tests
   * @param {Array<string>} classNames - Apex test class names
   * @returns {Promise<Object>} Test results
   */
  async runApexTests(classNames) {
    const url = `${this.instanceUrl}/services/data/${this.apiVersion}/tooling/runTestsAsynchronous`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        classNames: classNames
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Run tests error: ${response.status} - ${errorText}`);
    }
    
    // Returns job ID
    return await response.text();
  }

  /**
   * Get Apex test results
   * @param {string} jobId - Test job ID
   * @returns {Promise<Object>} Test results
   */
  async getApexTestResults(jobId) {
    const url = `${this.instanceUrl}/services/data/${this.apiVersion}/tooling/query/?q=SELECT+Id,ApexClassId,TestTimestamp,MethodName,Outcome,Message,StackTrace,ApexClass.Name+FROM+ApexTestResult+WHERE+AsyncApexJobId='${jobId}'`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Get test results error: ${response.status} - ${errorText}`);
    }
    
    return await response.json();
  }

  /**
   * Get Apex code coverage
   * @param {string} className - Apex class name
   * @returns {Promise<Object>} Code coverage information
   */
  async getCodeCoverage(className) {
    const url = `${this.instanceUrl}/services/data/${this.apiVersion}/tooling/query/?q=SELECT+ApexClassOrTriggerId,ApexClassOrTrigger.Name,NumLinesCovered,NumLinesUncovered,Coverage+FROM+ApexCodeCoverageAggregate+WHERE+ApexClassOrTrigger.Name='${className}'`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Get code coverage error: ${response.status} - ${errorText}`);
    }
    
    return await response.json();
  }
}

module.exports = SalesforceApexUtils;