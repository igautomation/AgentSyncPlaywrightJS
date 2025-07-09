/**
 * Salesforce OAuth Client
 */
const fetch = require('node-fetch');

class SalesforceOAuthClient {
  constructor() {
    this.clientId = process.env.SF_CLIENT_ID;
    this.clientSecret = process.env.SF_CLIENT_SECRET;
    this.username = process.env.SF_USERNAME;
    this.password = process.env.SF_PASSWORD;
    this.securityToken = process.env.SF_SECURITY_TOKEN || '';
    this.loginUrl = process.env.SF_LOGIN_URL || 'https://login.salesforce.com';
  }

  async getAccessToken() {
    try {
      // Create URL search params for the request body
      const params = new URLSearchParams();
      params.append('grant_type', 'password');
      params.append('client_id', this.clientId);
      params.append('client_secret', this.clientSecret);
      params.append('username', this.username);
      params.append('password', this.password + this.securityToken);
      
      const response = await fetch(`${this.loginUrl}/services/oauth2/token`, {
        method: 'POST',
        body: params,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error_description || `HTTP error ${response.status}`);
      }
      
      const data = await response.json();

      return {
        access_token: data.access_token,
        instance_url: data.instance_url,
        success: true
      };
    } catch (error) {
      console.log('⚠️ OAuth failed:', error.message);
      return {
        access_token: null,
        instance_url: null,
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = SalesforceOAuthClient;