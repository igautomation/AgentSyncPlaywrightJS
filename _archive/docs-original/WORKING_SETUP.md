# Working Salesforce Setup

## Check What's Installed
```bash
# Check all packages
ls node_modules/ | head -20

# Look for the framework
find node_modules/ -name "setup-salesforce-project.js"

# Check package names
ls node_modules/ | grep -E "(playwright|framework|igautomation)"
```

## Direct Working Solution
```bash
# Create project structure manually
mkdir -p tests pages data auth test-results

# Create package.json
cat > package.json << 'EOF'
{
  "name": "salesforce-tests",
  "version": "1.0.0",
  "scripts": {
    "test:sf": "playwright test --config=playwright.config.salesforce.js",
    "test:sf:headed": "playwright test --config=playwright.config.salesforce.js --headed",
    "setup:auth": "mkdir -p auth"
  },
  "dependencies": {
    "@playwright/test": "^1.40.0",
    "dotenv": "^16.3.1"
  }
}
EOF

# Create Playwright config
cat > playwright.config.salesforce.js << 'EOF'
const { defineConfig } = require('@playwright/test');
require('dotenv').config();

module.exports = defineConfig({
  testDir: './tests',
  timeout: 60000,
  use: {
    baseURL: process.env.SF_LOGIN_URL || 'https://login.salesforce.com',
    headless: process.env.HEADLESS !== 'false'
  }
});
EOF

# Create .env file
cat > .env << 'EOF'
SF_USERNAME=your-username@domain.com
SF_PASSWORD=your-password
SF_LOGIN_URL=https://login.salesforce.com
HEADLESS=true
EOF

# Create login test
cat > tests/login.spec.js << 'EOF'
const { test, expect } = require('@playwright/test');

test('Salesforce login', async ({ page }) => {
  await page.goto(process.env.SF_LOGIN_URL);
  await page.fill('#username', process.env.SF_USERNAME);
  await page.fill('#password', process.env.SF_PASSWORD);
  await page.click('#Login');
  await expect(page).toHaveTitle(/Salesforce/);
});
EOF

echo "✅ Salesforce project created successfully!"
echo "Next steps:"
echo "1. Update .env with your credentials"
echo "2. Run: npm install"
echo "3. Run: npm run test:sf"
```

This creates the complete project structure without relying on the framework package name.