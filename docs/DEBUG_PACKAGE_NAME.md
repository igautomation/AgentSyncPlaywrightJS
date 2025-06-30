# Debug Package Installation

## Check What's Actually Installed

```bash
# After running: npm install git+https://github.com/igautomation/AgentSyncDelivery.git
# Check what's in node_modules
ls node_modules/ | grep -i agent
ls node_modules/ | grep -i playwright
ls node_modules/ | grep -i igautomation

# Check package.json to see actual name
cat node_modules/*/package.json | grep -A2 -B2 "name"
```

## Working Solutions

### Method 1: Use Direct Path
```bash
node node_modules/agentsyncprofessionalservicesdelivery/setup-salesforce-project.js
```

### Method 2: Use Package Name from package.json
```bash
# Check the actual name first
cat package.json
# Then use the correct require path
node -e "require('agentsyncprofessionalservicesdelivery').createSalesforceProject()"
```

### Method 3: Manual File Creation
```bash
# Create files manually
cat > playwright.config.salesforce.js << 'EOF'
const { defineConfig } = require('@playwright/test');
module.exports = defineConfig({
  testDir: './tests',
  timeout: 60000,
  use: { baseURL: 'https://login.salesforce.com' }
});
EOF

mkdir -p tests pages data auth
echo '{"dependencies":{"@playwright/test":"^1.40.0"}}' > package.json
```

Try Method 1 first - it should work regardless of package name issues.