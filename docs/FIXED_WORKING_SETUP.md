# Fixed Working Salesforce Setup

## Issue Analysis
The package installs but the script path `node_modules/agentsyncprofessionalservicesdelivery/setup-salesforce-project.js` doesn't exist.

## Working Solutions

### Method 1: Find Correct Path
```bash
# After installing, find the actual package name
ls node_modules/ | grep -i agent
find node_modules/ -name "setup-salesforce-project.js"

# Use the correct path found
node [CORRECT_PATH]/setup-salesforce-project.js
```

### Method 2: Direct Script Creation (Recommended)
```bash
mkdir my-sf-tests && cd my-sf-tests
npm init -y
npm install @playwright/test dotenv axios

# Create setup script directly
cat > create-sf-project.js << 'EOF'
const fs = require('fs');
const path = require('path');

// Create directories
['tests', 'pages', 'data', 'auth', 'test-results'].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Created ${dir}/ directory`);
  }
});

// Create files
const files = {
  'playwright.config.salesforce.js': `const { defineConfig } = require('@playwright/test');
require('dotenv').config();

module.exports = defineConfig({
  testDir: './tests',
  timeout: 60000,
  use: {
    baseURL: process.env.SF_LOGIN_URL || 'https://login.salesforce.com',
    headless: process.env.HEADLESS !== 'false'
  },
  projects: [{ name: 'salesforce' }]
});`,

  '.env': \`SF_USERNAME=your-username@domain.com
SF_PASSWORD=your-password
SF_SECURITY_TOKEN=your-token
SF_LOGIN_URL=https://login.salesforce.com
SF_INSTANCE_URL=https://your-instance.lightning.force.com
HEADLESS=true\`,

  'tests/salesforce-login.spec.js': \`const { test, expect } = require('@playwright/test');
require('dotenv').config();

test('Salesforce login', async ({ page }) => {
  await page.goto(process.env.SF_LOGIN_URL);
  await page.fill('#username', process.env.SF_USERNAME);
  await page.fill('#password', process.env.SF_PASSWORD);
  await page.click('#Login');
  await page.waitForTimeout(15000);
  
  if (!page.url().includes('login.salesforce.com')) {
    await page.context().storageState({ path: './auth/salesforce-storage-state.json' });
    console.log('✅ Login successful');
  }
  
  expect(page.url()).not.toContain('login.salesforce.com');
});\`,

  'package.json': \`{
  "name": "salesforce-tests",
  "scripts": {
    "test:sf": "playwright test --config=playwright.config.salesforce.js",
    "test:sf:headed": "playwright test --config=playwright.config.salesforce.js --headed"
  },
  "dependencies": {
    "@playwright/test": "^1.40.0",
    "dotenv": "^16.3.1"
  }
}\`
};

Object.entries(files).forEach(([filename, content]) => {
  fs.writeFileSync(filename, content);
  console.log(\`✅ Created \${filename}\`);
});

console.log('\\n🎉 Salesforce project created!');
console.log('Next steps:');
console.log('1. Update .env with your credentials');
console.log('2. Run: npm run test:sf');
EOF

# Run the setup
node create-sf-project.js
```

### Method 3: One-Command Working Setup
```bash
mkdir my-sf-tests && cd my-sf-tests && npm init -y && npm install @playwright/test dotenv && curl -s https://raw.githubusercontent.com/igautomation/AgentSyncDelivery/main/setup-salesforce-project.js | node
```

## Recommended Command
```bash
mkdir my-sf-tests && cd my-sf-tests && npm init -y && npm install @playwright/test dotenv axios && node -e "
const fs = require('fs');
['tests', 'pages', 'data', 'auth'].forEach(d => fs.mkdirSync(d, {recursive: true}));
fs.writeFileSync('playwright.config.salesforce.js', \`const { defineConfig } = require('@playwright/test');
require('dotenv').config();
module.exports = defineConfig({
  testDir: './tests',
  timeout: 60000,
  use: { baseURL: 'https://login.salesforce.com' }
});\`);
fs.writeFileSync('.env', 'SF_USERNAME=your-username@domain.com\\nSF_PASSWORD=your-password\\nSF_LOGIN_URL=https://login.salesforce.com');
fs.writeFileSync('tests/login.spec.js', \`const { test } = require('@playwright/test');
require('dotenv').config();
test('login', async ({ page }) => {
  await page.goto(process.env.SF_LOGIN_URL);
});\`);
console.log('✅ Salesforce project created!');
"
```

This bypasses the package path issue entirely and creates a working Salesforce test project.