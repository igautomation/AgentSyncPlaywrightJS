/**
 * Salesforce Authentication Utilities
 * Handles OAuth2 token generation and management
 */
class SalesforceAuthUtils {
  constructor(config = {}) {
    this.loginUrl = config.loginUrl || process.env.SF_LOGIN_URL || 'https://login.salesforce.com';
    this.clientId = config.clientId || process.env.SF_CLIENT_ID;
    this.clientSecret = config.clientSecret || process.env.SF_CLIENT_SECRET;
    this.username = config.username || process.env.SF_USERNAME;
    this.password = config.password || process.env.SF_PASSWORD;
    this.securityToken = config.securityToken || process.env.SF_SECURITY_TOKEN || '';
    this.oauthUrl = `${this.loginUrl}/services/oauth2/token`;
    
    this.accessToken = null;
    this.instanceUrl = null;
    this.tokenExpiry = null;
  }

  /**
   * Generate OAuth2 access token using password flow with environment fallback
   * @returns {Promise<{access_token: string, instance_url: string}>}
   */
  async generateAccessToken() {
    // First try to use environment variable if available
    const envToken = process.env.SF_ACCESS_TOKEN;
    const envInstanceUrl = process.env.SF_INSTANCE_URL;
    
    if (envToken && envInstanceUrl) {
      console.log('✅ Using access token from environment variable');
      this.accessToken = envToken;
      this.instanceUrl = envInstanceUrl;
      this.tokenExpiry = Date.now() + 7200000; // Default 2 hours
      
      return {
        access_token: this.accessToken,
        instance_url: this.instanceUrl
      };
    }

    // If no environment token, try OAuth2 generation
    if (!this.clientId || !this.clientSecret || !this.username || !this.password) {
      throw new Error('Missing required OAuth credentials and no SF_ACCESS_TOKEN found in environment');
    }

    const formParams = new URLSearchParams({
      grant_type: 'password',
      client_id: this.clientId,
      client_secret: this.clientSecret,
      username: this.username,
      password: this.password + this.securityToken
    });

    try {
      const response = await fetch(this.oauthUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formParams.toString()
      });

      if (!response.ok) {
        const errorText = await response.text();
        
        // If OAuth fails, try environment token as fallback
        if (envToken && envInstanceUrl) {
          console.log('⚠️ OAuth failed, falling back to environment token');
          this.accessToken = envToken;
          this.instanceUrl = envInstanceUrl;
          this.tokenExpiry = Date.now() + 7200000;
          
          return {
            access_token: this.accessToken,
            instance_url: this.instanceUrl
          };
        }
        
        throw new Error(`OAuth2 authentication failed: ${response.status} ${response.statusText}\n${errorText}`);
      }

      const data = await response.json();
      
      if (!data.access_token || !data.instance_url) {
        // If OAuth response is invalid, try environment token as fallback
        if (envToken && envInstanceUrl) {
          console.log('⚠️ Invalid OAuth response, falling back to environment token');
          this.accessToken = envToken;
          this.instanceUrl = envInstanceUrl;
          this.tokenExpiry = Date.now() + 7200000;
          
          return {
            access_token: this.accessToken,
            instance_url: this.instanceUrl
          };
        }
        
        throw new Error('Invalid OAuth response: missing access_token or instance_url');
      }

      this.accessToken = data.access_token;
      this.instanceUrl = data.instance_url;
      this.tokenExpiry = Date.now() + (data.expires_in ? data.expires_in * 1000 : 7200000); // Default 2 hours

      console.log('✅ Salesforce access token generated via OAuth2');
      return {
        access_token: this.accessToken,
        instance_url: this.instanceUrl
      };
    } catch (error) {
      // Final fallback to environment token
      if (envToken && envInstanceUrl) {
        console.log('⚠️ OAuth error, falling back to environment token');
        this.accessToken = envToken;
        this.instanceUrl = envInstanceUrl;
        this.tokenExpiry = Date.now() + 7200000;
        
        return {
          access_token: this.accessToken,
          instance_url: this.instanceUrl
        };
      }
      
      console.error('❌ Failed to generate access token:', error.message);
      throw error;
    }
  }

  /**
   * Get current access token, generate new one if expired
   * @returns {Promise<string>}
   */
  async getAccessToken() {
    if (!this.accessToken || this.isTokenExpired()) {
      await this.generateAccessToken();
    }
    return this.accessToken;
  }

  /**
   * Get instance URL
   * @returns {Promise<string>}
   */
  async getInstanceUrl() {
    if (!this.instanceUrl) {
      await this.generateAccessToken();
    }
    return this.instanceUrl;
  }

  /**
   * Check if token is expired
   * @returns {boolean}
   */
  isTokenExpired() {
    if (!this.tokenExpiry) return true;
    return Date.now() >= this.tokenExpiry - 300000; // Refresh 5 minutes before expiry
  }

  /**
   * Refresh access token
   * @returns {Promise<{access_token: string, instance_url: string}>}
   */
  async refreshToken() {
    this.accessToken = null;
    this.instanceUrl = null;
    this.tokenExpiry = null;
    return await this.generateAccessToken();
  }

  /**
   * Get authorization headers
   * @returns {Promise<Object>}
   */
  async getAuthHeaders() {
    const token = await this.getAccessToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Validate current token
   * @returns {Promise<boolean>}
   */
  async validateToken() {
    if (!this.accessToken || !this.instanceUrl) {
      return false;
    }

    try {
      const response = await fetch(`${this.instanceUrl}/services/data/v62.0/`, {
        headers: await this.getAuthHeaders()
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Get token info
   * @returns {Object}
   */
  getTokenInfo() {
    return {
      hasToken: !!this.accessToken,
      instanceUrl: this.instanceUrl,
      isExpired: this.isTokenExpired(),
      expiresAt: this.tokenExpiry ? new Date(this.tokenExpiry).toISOString() : null,
      source: this.getTokenSource()
    };
  }

  /**
   * Get token source (environment or OAuth2)
   * @returns {string}
   */
  getTokenSource() {
    const envToken = process.env.SF_ACCESS_TOKEN;
    if (envToken && this.accessToken === envToken) {
      return 'environment';
    }
    return 'oauth2';
  }

  /**
   * Force use of environment token
   * @returns {Promise<{access_token: string, instance_url: string}>}
   */
  async useEnvironmentToken() {
    const envToken = process.env.SF_ACCESS_TOKEN;
    const envInstanceUrl = process.env.SF_INSTANCE_URL;
    
    if (!envToken || !envInstanceUrl) {
      throw new Error('SF_ACCESS_TOKEN and SF_INSTANCE_URL must be set in environment');
    }
    
    this.accessToken = envToken;
    this.instanceUrl = envInstanceUrl;
    this.tokenExpiry = Date.now() + 7200000; // Default 2 hours
    
    console.log('✅ Using access token from environment variable');
    return {
      access_token: this.accessToken,
      instance_url: this.instanceUrl
    };
  }
}

module.exports = SalesforceAuthUtils;