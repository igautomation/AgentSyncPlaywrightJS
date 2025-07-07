/**
 * Salesforce Authentication Manager - Single Authentication
 */
const SalesforceOAuthClient = require('./oauth-client');

class AuthManager {
  constructor() {
    this.accessToken = null;
    this.instanceUrl = null;
    this.authenticated = false;
  }

  async authenticate() {
    if (this.authenticated) {
      return { accessToken: this.accessToken, instanceUrl: this.instanceUrl };
    }

    // Try OAuth first
    const oauthClient = new SalesforceOAuthClient();
    const oauthResult = await oauthClient.getAccessToken();
    
    if (oauthResult.success) {
      this.accessToken = oauthResult.access_token;
      this.instanceUrl = oauthResult.instance_url;
      this.authenticated = true;
      console.log('✅ OAuth authentication successful - cached for reuse');
    } else {
      // Fallback to token
      this.accessToken = process.env.SF_ACCESS_TOKEN;
      this.instanceUrl = process.env.SF_INSTANCE_URL;
      this.authenticated = true;
      console.log('⚠️ OAuth failed, using fallback token - cached for reuse');
    }

    return { accessToken: this.accessToken, instanceUrl: this.instanceUrl };
  }
}

// Singleton instance
const authManager = new AuthManager();
module.exports = authManager;