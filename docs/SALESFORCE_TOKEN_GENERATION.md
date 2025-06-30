# Salesforce Access Token Generation

## Methods to Generate Access Token

### Method 1: Using Script (Recommended)
```bash
# Generate token and save to .env.salesforce
npm run sf:token

# Run API tests with generated token
npm run test:salesforce
```

### Method 2: Manual OAuth Flow
```bash
# Set up Connected App in Salesforce:
# 1. Setup → App Manager → New Connected App
# 2. Enable OAuth Settings
# 3. Add scopes: api, refresh_token
# 4. Set callback URL: http://localhost:3000/callback

# Use credentials in .env.salesforce:
SF_CLIENT_ID=your_consumer_key
SF_CLIENT_SECRET=your_consumer_secret
SF_USERNAME=your_username
SF_PASSWORD=your_password
SF_SECURITY_TOKEN=your_security_token
```

### Method 3: Postman Token
```bash
# Copy token from Postman Authorization tab
# Add to .env.salesforce:
SF_ACCESS_TOKEN=00DdL00000OHE3z!AQEAQOnpUqkIvGkEQnDfz3nHgqssxpTQMybhHu1nxO2RQm0UnESNLtLiMG3EpKD9Q3kUg.U3qMapOKvuC6CunIGbOlyZymSE
SF_INSTANCE_URL=https://wise-koala-a44c19-dev-ed.trailblaze.my.salesforce.com
```

## Token Usage in Tests

The API tests automatically:
1. **Check environment** - Uses `SF_ACCESS_TOKEN` if available
2. **Generate dynamically** - Creates new token via OAuth if needed
3. **Handle expiration** - Regenerates token when expired

## Required Environment Variables

```bash
# OAuth Credentials (for token generation)
SF_CLIENT_ID=3MVG98_Psg5cppyYCmk1gZNC25o00SXpgpodlS29IZ6pXiHkt3xuPa5qIjBTtEgdsiMuIWVN_8F0jnwEtbDh4
SF_CLIENT_SECRET=your_client_secret
SF_USERNAME=your_username@domain.com
SF_PASSWORD=your_password
SF_SECURITY_TOKEN=your_security_token
SF_LOGIN_URL=https://login.salesforce.com

# Generated Token (optional - auto-generated if missing)
SF_ACCESS_TOKEN=your_access_token
SF_INSTANCE_URL=https://your-instance.lightning.force.com
```

## Commands

```bash
# Generate token only
npm run sf:token

# Run API tests (auto-generates token if needed)
npm run test:salesforce -- --grep "API"

# Run specific API test
npm run test:salesforce -- --grep "record counts"
```

The framework handles token generation and management automatically for seamless API testing.