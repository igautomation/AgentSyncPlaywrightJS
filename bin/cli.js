#!/usr/bin/env node

const { program } = require('commander');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

// Get package version
const packageJson = require('../package.json');

program
  .version(packageJson.version)
  .description('Playwright Framework CLI');

program
  .command('init')
  .description('Initialize a new Playwright Framework project')
  .option('-t, --template <template>', 'Template to use (basic, full)', 'basic')
  .action(async (options) => {
    console.log('🎭 Initializing new Playwright Framework project...');
    
    const templateDir = path.join(__dirname, '../templates', options.template);
    const targetDir = process.cwd();
    
    if (!fs.existsSync(templateDir)) {
      console.error(`Template "${options.template}" not found.`);
      process.exit(1);
    }
    
    try {
      // Create project structure
      console.log('📁 Creating project structure...');
      
      // Copy template files
      copyDirectorySync(templateDir, targetDir);
      
      // Install dependencies
      console.log('📦 Installing dependencies...');
      execSync('npm install', { stdio: 'inherit', cwd: targetDir });
      
      console.log('✅ Project initialized successfully!');
      console.log('\nNext steps:');
      console.log('  1. Review the configuration in playwright.config.js');
      console.log('  2. Run your first test: npx playwright test');
      console.log('  3. Generate a report: npx playwright show-report');
    } catch (error) {
      console.error('❌ Error initializing project:', error.message);
      process.exit(1);
    }
  });

program
  .command('generate')
  .description('Generate framework components')
  .option('-p, --page <name>', 'Generate a page object')
  .option('-t, --test <name>', 'Generate a test file')
  .option('-c, --component <name>', 'Generate a component')
  .action((options) => {
    if (options.page) {
      generatePage(options.page);
    } else if (options.test) {
      generateTest(options.test);
    } else if (options.component) {
      generateComponent(options.component);
    } else {
      console.error('Please specify what to generate (--page, --test, or --component)');
    }
  });

program
  .command('docs')
  .description('Open framework documentation')
  .action(() => {
    console.log('Opening documentation...');
    const docsUrl = 'https://your-org.github.io/playwright-framework';
    
    const open = (process.platform === 'win32') ? 'start' : 
                (process.platform === 'darwin') ? 'open' : 'xdg-open';
    
    try {
      execSync(`${open} ${docsUrl}`);
    } catch (error) {
      console.log(`Documentation available at: ${docsUrl}`);
    }
  });

program.parse(process.argv);

// If no arguments provided, show help
if (!process.argv.slice(2).length) {
  program.outputHelp();
}

// Helper functions
function copyDirectorySync(source, target) {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }

  const entries = fs.readdirSync(source, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name);
    const targetPath = path.join(target, entry.name);

    if (entry.isDirectory()) {
      copyDirectorySync(sourcePath, targetPath);
    } else {
      fs.copyFileSync(sourcePath, targetPath);
    }
  }
}

function generatePage(name) {
  const pageName = name.charAt(0).toUpperCase() + name.slice(1) + 'Page';
  const targetDir = path.join(process.cwd(), 'src/pages');
  const targetFile = path.join(targetDir, `${pageName}.js`);
  
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  
  const template = `/**
 * ${pageName} - Page Object for ${name} page
 * @class
 */
class ${pageName} {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    
    // Define selectors
    this.selectors = {
      // Add your selectors here
    };
  }

  /**
   * Navigate to the page
   * @param {string} [path=''] - Additional path to append to base URL
   */
  async navigate(path = '') {
    await this.page.goto(\`\${process.env.BASE_URL || ''}\${path}\`);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Check if page is loaded
   * @returns {Promise<boolean>}
   */
  async isLoaded() {
    // Implement page-specific loading check
    return true;
  }
}

module.exports = ${pageName};
`;

  fs.writeFileSync(targetFile, template);
  console.log(`✅ Generated page object: ${targetFile}`);
}

function generateTest(name) {
  const testName = name.toLowerCase().replace(/\s+/g, '-');
  const targetDir = path.join(process.cwd(), 'src/tests');
  const targetFile = path.join(targetDir, `${testName}.spec.js`);
  
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  
  const template = `const { test, expect } = require('@playwright/test');

test.describe('${name} Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Setup for each test
    await page.goto(process.env.BASE_URL || 'https://example.com');
  });

  test('should load the page correctly', async ({ page }) => {
    // Test implementation
    const title = await page.title();
    expect(title).not.toBe('');
  });

  test('should perform basic functionality', async ({ page }) => {
    // Test implementation
    // Add your test steps here
  });
});
`;

  fs.writeFileSync(targetFile, template);
  console.log(`✅ Generated test file: ${targetFile}`);
}

function generateComponent(name) {
  const componentName = name.charAt(0).toUpperCase() + name.slice(1);
  const targetDir = path.join(process.cwd(), 'src/components');
  const targetFile = path.join(targetDir, `${componentName}.js`);
  
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  
  const template = `/**
 * ${componentName} - Reusable component
 * @class
 */
class ${componentName} {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    
    // Define selectors
    this.selectors = {
      // Add your selectors here
    };
  }

  /**
   * Check if component is visible
   * @returns {Promise<boolean>}
   */
  async isVisible() {
    // Implement component-specific visibility check
    return true;
  }
}

module.exports = ${componentName};
`;

  fs.writeFileSync(targetFile, template);
  console.log(`✅ Generated component: ${targetFile}`);
}