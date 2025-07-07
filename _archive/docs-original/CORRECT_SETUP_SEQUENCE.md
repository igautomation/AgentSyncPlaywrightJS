# Correct Salesforce Setup Sequence

## Step-by-Step Commands

```bash
# 1. Create project directory
mkdir my-sf-tests && cd my-sf-tests

# 2. Initialize npm project
npm init -y

# 3. Install the framework
npm install git+https://github.com/igautomation/AgentSyncDelivery.git

# 4. Create Salesforce project files
node -e "require('@igautomation/playwright-framework').createSalesforceProject()"

# 5. Install project dependencies
npm install

# 6. Setup authentication directory
npm run setup:auth

# 7. Update .env with your Salesforce credentials
# Edit .env file with your actual credentials

# 8. Run tests
npm run test:sf
```

## Alternative One-Liner After Install

```bash
mkdir my-sf-tests && cd my-sf-tests && npm init -y && npm install git+https://github.com/igautomation/AgentSyncDelivery.git && node -e "require('@igautomation/playwright-framework').createSalesforceProject()" && npm install
```

## What You Get

Complete project structure with:
- Salesforce tests (login, contact)
- Page objects
- Test data
- Configuration files
- Environment setup

The key is installing the framework BEFORE trying to require it.