/**
 * Simple TestRail API without axios dependency
 */
const https = require('https');
const http = require('http');
const { URL } = require('url');

class TestRailAPI {
  constructor() {
    this.baseURL = process.env.TESTRAIL_URL;
    this.username = process.env.TESTRAIL_USERNAME;
    this.password = process.env.TESTRAIL_PASSWORD;
    this.apiKey = process.env.TESTRAIL_API_KEY;
    
    if (!this.baseURL || !this.username) {
      throw new Error('TestRail URL and username are required');
    }
    
    const authPassword = this.apiKey || this.password;
    if (!authPassword) {
      throw new Error('Either TESTRAIL_API_KEY or TESTRAIL_PASSWORD must be provided');
    }
    
    this.auth = Buffer.from(`${this.username}:${authPassword}`).toString('base64');
    console.log(`🔐 TestRail auth: ${this.apiKey ? 'API Key' : 'Username/Password'}`);
  }

  async request(method, endpoint, data = null) {
    return new Promise((resolve, reject) => {
      const url = new URL(`${this.baseURL}/index.php?/api/v2/${endpoint}`);
      const isHttps = url.protocol === 'https:';
      const client = isHttps ? https : http;
      
      const options = {
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname + url.search,
        method: method,
        headers: {
          'Authorization': `Basic ${this.auth}`,
          'Content-Type': 'application/json'
        }
      };

      if (data) {
        const jsonData = JSON.stringify(data);
        options.headers['Content-Length'] = Buffer.byteLength(jsonData);
      }

      const req = client.request(options, (res) => {
        let responseData = '';
        res.on('data', (chunk) => responseData += chunk);
        res.on('end', () => {
          try {
            const result = responseData ? JSON.parse(responseData) : {};
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(result);
            } else {
              reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
            }
          } catch (error) {
            reject(new Error(`Parse error: ${error.message}`));
          }
        });
      });

      req.on('error', reject);
      
      if (data) {
        req.write(JSON.stringify(data));
      }
      
      req.end();
    });
  }

  async addRun(projectId, data) {
    return this.request('POST', `add_run/${projectId}`, data);
  }

  async addResultsForCases(runId, data) {
    return this.request('POST', `add_results_for_cases/${runId}`, data);
  }

  async closeRun(id) {
    return this.request('POST', `close_run/${id}`, {});
  }
}

module.exports = TestRailAPI;