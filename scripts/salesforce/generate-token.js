#!/usr/bin/env node

/**
 * Generate Salesforce OAuth Token
 * 
 * This script generates a Salesforce OAuth token and saves it to .env.salesforce
 */
const axios = require('axios');
require('dotenv').config({ path: '.env.salesforce' });

async function generateSalesforceOAuthToken() {
  // Salesforce OAuth 2.0 token endpoint
  const tokenUrl = 'https://login.salesforce.com/services/oauth2/token';
  
  // Salesforce credentials from environment
  const clientId = process.env.SF_CLIENT_ID;
  const clientSecret = process.env.SF_CLIENT_SECRET;
  const username = process.env.SF_USERNAME;
  const password = process.env.SF_PASSWORD;
  
  try {
    console.log('🔑 Generating Salesforce OAuth token...');
    
    // Make POST request to Salesforce OAuth token endpoint
    const response = await axios.post(tokenUrl, null, {
      params: {
        grant_type: 'password',
        client_id: clientId,
        client_secret: clientSecret,
        username: username,
        password: password
      }
    });

    // Extract token details from response
    const { access_token, instance_url, token_type } = response.data;
    
    console.log('✅ Access token generated successfully!');
    console.log('Access Token:', access_token);
    console.log('Instance URL:', instance_url);
    console.log('Token Type:', token_type);

    // Save to environment file
    const fs = require('fs');
    const envContent = `\nSF_ACCESS_TOKEN=${access_token}\nSF_INSTANCE_URL=${instance_url}\n`;
    fs.appendFileSync('.env.salesforce', envContent);
    console.log('✅ Token saved to .env.salesforce');

    return {
      accessToken: access_token,
      instanceUrl: instance_url,
      tokenType: token_type
    };
  } catch (error) {
    console.error('❌ Error generating OAuth token:', error.response ? error.response.data : error.message);
    throw error;
  }
}

// Execute the function
if (require.main === module) {
  (async () => {
    try {
      const tokenData = await generateSalesforceOAuthToken();
      console.log('🎉 Token generation completed!');
    } catch (error) {
      console.error('❌ Failed to generate token:', error);
    }
  })();
}

module.exports = { generateSalesforceOAuthToken };