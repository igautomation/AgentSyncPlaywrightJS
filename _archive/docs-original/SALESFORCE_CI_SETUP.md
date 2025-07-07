# Salesforce CI/CD Setup

## GitHub Secrets Required

Add these secrets to your GitHub repository:

```
SF_USERNAME=your-salesforce-username@domain.com
SF_PASSWORD=your-salesforce-password
SF_SECURITY_TOKEN=your-security-token
SF_LOGIN_URL=https://login.salesforce.com
SF_INSTANCE_URL=https://your-instance.lightning.force.com
SF_CLIENT_ID=your-consumer-key
SF_CLIENT_SECRET=your-consumer-secret
```

## Workflow Features

✅ **Runs only Salesforce tests** - Excludes all other test suites  
✅ **Triggered on push/PR** - Automatic execution  
✅ **Manual trigger** - workflow_dispatch for on-demand runs  
✅ **Artifact upload** - Test results, reports, and screenshots  
✅ **Headless execution** - Optimized for CI environment  

## Commands

```bash
# Run Salesforce tests only (local)
npm run test:salesforce

# Run with specific config
npm run test:salesforce:config
```

## Manual Trigger

1. Go to Actions tab in GitHub
2. Select "Salesforce Tests Only" workflow
3. Click "Run workflow"
4. Choose branch and run

The workflow will execute only Salesforce tests, ignoring all other test suites in the framework.