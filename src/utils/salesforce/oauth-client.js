/**
 * Salesforce OAuth Client
 */
const axios = require('axios').default || require('axios');

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
      const response = await axios.post(`${this.loginUrl}/services/oauth2/token`, null, {
        params: {
          grant_type: 'password',
          client_id: this.clientId,
          client_secret: this.clientSecret,
          username: this.username,
          password: this.password + this.securityToken
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      return {
        access_token: response.data.access_token,
        instance_url: response.data.instance_url,
        success: true
      };
    } catch (error) {
      console.log('⚠️ OAuth failed:', error.response?.data?.error_description || error.message);
      return {
        access_token: null,
        instance_url: null,
        success: false,
        error: error.response?.data?.error_description || error.message
      };
    }
  }
}

module.exports = SalesforceOAuthClient;