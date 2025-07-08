#!/usr/bin/env node

/**
 * Page Object Generator CLI
 * Main entry point for page object generation with support for Salesforce pages
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { program } = require('commander');

// Import existing utilities
const config = require('./config');
const selectors = require('./specialized/selectors');

// Simple implementation for extractStandardElements since we're focusing on Salesforce
async function extractStandardElements(page) {
  return extractSalesforceElements(page);
}

// Configure command line options
program
  .name('generate-page')
  .description('Generate Playwright page objects for web applications')
  .version('1.0.0')
  .option('-u, --url <url>', 'URL to generate page object from')
  .option('-n, --name <name>', 'Page object name (e.g., LoginPage)')
  .option('-o, --output <directory>', 'Output directory', './src/pages')
  .option('-v, --visible', 'Run in visible browser mode', false)
  .option('--username <username>', 'Username for authentication')
  .option('--password <password>', 'Password for authentication')
  .option('-sf, --salesforce', 'Generate Salesforce-specific page object', false)
  .option('-t, --generate-tests', 'Generate test files', false)
  .option('--tests-output <directory>', 'Tests output directory', './src/tests/ui');

program.parse(process.argv);
const options = program.opts();

// Validate required options
if (!options.url) {
  console.error('Error: URL is required');
  program.help();
  process.exit(1);
}

if (!options.name) {
  // Generate name from URL
  const urlObj = new URL(options.url);
  const pathParts = urlObj.pathname.split('/').filter(Boolean);
  options.name = pathParts.length > 0 
    ? pathParts[pathParts.length - 1].charAt(0).toUpperCase() + pathParts[pathParts.length - 1].slice(1) + 'Page'
    : 'HomePage';
}

// Ensure output directories exist
const pagesOutputDir = path.resolve(process.cwd(), options.salesforce ? path.join(options.output, 'salesforce') : options.output);
if (!fs.existsSync(pagesOutputDir)) {
  fs.mkdirSync(pagesOutputDir, { recursive: true });
}

if (options.generateTests) {
  const testsOutputDir = path.resolve(process.cwd(), options.testsOutput);
  if (!fs.existsSync(testsOutputDir)) {
    fs.mkdirSync(testsOutputDir, { recursive: true });
  }
}

/**
 * Handle Salesforce authentication
 * @param {import('playwright').Page} page - Playwright page
 * @param {string} username - Salesforce username
 * @param {string} password - Salesforce password
 */
async function handleSalesforceAuth(page, username, password) {
  console.log('Authenticating to Salesforce...');
  
  // Navigate to the login page if not already on a Salesforce page
  if (!page.url().includes('salesforce.com') && !page.url().includes('force.com')) {
    await page.goto(config.salesforce.loginUrl || 'https://login.salesforce.com');
  }
  
  // Check if we're on the login page
  const usernameSelector = '#username';
  const isLoginPage = await page.$(usernameSelector).then(el => !!el);
  
  if (isLoginPage) {
    // Fill in login form
    await page.fill(usernameSelector, username);
    await page.fill('#password', password);
    await page.click('#Login');
    
    // Wait for login to complete with increased timeout
    try {
      await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 60000 });
    } catch (error) {
      console.log('Navigation timeout after login - continuing anyway');
      // Wait a bit more for the page to stabilize
      await page.waitForTimeout(5000);
    }
    
    // Check for verification code page and skip if possible
    const rememberMeSelector = 'input#rememberUn';
    const hasRememberMe = await page.$(rememberMeSelector).then(el => !!el);
    
    if (hasRememberMe) {
      await page.check(rememberMeSelector);
      await page.click('#Login');
      try {
        await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 60000 });
      } catch (error) {
        console.log('Navigation timeout after remember me - continuing anyway');
        // Wait a bit more for the page to stabilize
        await page.waitForTimeout(5000);
      }
    }
  }
  
  console.log('Authentication completed');
}

/**
 * Extract elements from a Salesforce page
 * @param {import('playwright').Page} page - Playwright page
 * @returns {Promise<Object>} Extracted elements
 */
async function extractSalesforceElements(page) {
  console.log('Extracting elements from Salesforce page...');
  
  // Wait for the page to be fully loaded
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000); // Additional wait for dynamic content
  
  // Wait for Salesforce-specific selectors
  await page.waitForSelector(
    config.extraction.waitForSelectors.salesforce, 
    { timeout: config.extraction.timeout }
  ).catch(() => {
    console.log('Salesforce elements timeout - continuing anyway');
  });
  
  // Get Salesforce-specific selectors
  const sfSelectors = selectors.getSelectors({ mode: 'salesforce' });
  
  // Extract elements using page.evaluate
  const elements = await page.evaluate(() => {
    const result = {
      inputs: [],
      buttons: [],
      links: [],
      selects: [],
      checkboxes: [],
      labels: [],
      other: []
    };
    
    // Helper function to get attributes
    const getAttributes = (element) => {
      const attributes = {};
      for (const attr of element.attributes) {
        attributes[attr.name] = attr.value;
      }
      return attributes;
    };
    
    // Helper function to get best selector
    function getBestSelector(element) {
      // Try data attributes first
      const dataTestId = element.getAttribute('data-testid');
      if (dataTestId) return `[data-testid="${dataTestId}"]`;
      
      const dataTest = element.getAttribute('data-test');
      if (dataTest) return `[data-test="${dataTest}"]`;
      
      const dataQa = element.getAttribute('data-qa');
      if (dataQa) return `[data-qa="${dataQa}"]`;
      
      // Try ARIA attributes
      const ariaLabel = element.getAttribute('aria-label');
      if (ariaLabel) return `[aria-label="${ariaLabel}"]`;
      
      // Try ID
      const id = element.id;
      if (id) return `#${id}`;
      
      // Try name
      const name = element.getAttribute('name');
      if (name) return `[name="${name}"]`;
      
      // Fallback to tag + attributes
      const tag = element.tagName.toLowerCase();
      const type = element.getAttribute('type');
      return type ? `${tag}[type="${type}"]` : tag;
    }
    
    // Extract Lightning inputs
    document.querySelectorAll('lightning-input, lightning-textarea, lightning-combobox').forEach(el => {
      const label = el.label || el.getAttribute('label') || '';
      const fieldName = el.fieldName || el.getAttribute('field-name') || '';
      const id = el.id || '';
      
      result.inputs.push({
        type: el.tagName.toLowerCase(),
        label,
        fieldName,
        id,
        attributes: getAttributes(el),
        selector: fieldName ? `[data-field-name="${fieldName}"]` : getBestSelector(el)
      });
    });
    
    // Extract standard inputs
    document.querySelectorAll('input, textarea, select').forEach(el => {
      const id = el.id || '';
      const name = el.name || '';
      const type = el.type || 'text';
      
      if (!id && !name) return; // Skip elements without id or name
      
      const item = {
        type: el.tagName.toLowerCase(),
        inputType: type,
        id,
        name,
        attributes: getAttributes(el),
        selector: getBestSelector(el)
      };
      
      if (type === 'checkbox' || type === 'radio') {
        result.checkboxes.push(item);
      } else if (el.tagName.toLowerCase() === 'select') {
        result.selects.push(item);
      } else {
        result.inputs.push(item);
      }
    });
    
    // Extract buttons
    document.querySelectorAll('button, lightning-button, lightning-button-icon').forEach(el => {
      const label = el.label || el.getAttribute('label') || el.textContent.trim();
      const id = el.id || '';
      const name = el.name || el.getAttribute('name') || '';
      
      result.buttons.push({
        type: el.tagName.toLowerCase(),
        label,
        id,
        name,
        attributes: getAttributes(el),
        selector: getBestSelector(el)
      });
    });
    
    // Extract links
    document.querySelectorAll('a').forEach(el => {
      const text = el.textContent.trim();
      const href = el.href || '';
      const id = el.id || '';
      
      if (!text && !id) return; // Skip empty links
      
      result.links.push({
        type: 'a',
        text,
        href,
        id,
        attributes: getAttributes(el),
        selector: getBestSelector(el)
      });
    });
    
    // Extract labels
    document.querySelectorAll('label, span.slds-form-element__label').forEach(el => {
      const text = el.textContent.trim();
      const forAttr = el.getAttribute('for') || '';
      
      if (!text) return; // Skip empty labels
      
      result.labels.push({
        type: el.tagName.toLowerCase(),
        text,
        forAttr,
        attributes: getAttributes(el),
        selector: getBestSelector(el)
      });
    });
    
    return result;
  });
  
  console.log('Element extraction completed');
  return elements;
}

/**
 * Format element name to camelCase
 * @param {string} name - Element name
 * @returns {string} Formatted name
 */
function formatName(name) {
  if (!name) return '';
  return name.trim()
    .replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .replace(/^(.)/, c => c.toLowerCase());
}

/**
 * Generate a Salesforce page object
 * @param {Object} elements - Extracted elements
 * @param {string} className - Class name
 * @param {string} url - Page URL
 * @returns {string} Generated page object code
 */
function generateSalesforcePageObject(elements, className, url) {
  console.log('Generating Salesforce page object...');
  
  // Generate selectors for inputs
  const inputSelectors = elements.inputs.map(input => {
    const name = formatName(input.label || input.fieldName || input.id || input.name);
    if (!name) return null;
    
    return `this.${name}Input = '${input.selector}';`;
  }).filter(Boolean);
  
  // Generate selectors for buttons
  const buttonSelectors = elements.buttons.map(button => {
    const name = formatName(button.label || button.name || button.id);
    if (!name) return null;
    
    return `this.${name}Button = '${button.selector}';`;
  }).filter(Boolean);
  
  // Generate selectors for selects
  const selectSelectors = elements.selects.map(select => {
    const name = formatName(select.id || select.name);
    if (!name) return null;
    
    return `this.${name}Select = '${select.selector}';`;
  }).filter(Boolean);
  
  // Generate methods for inputs
  const inputMethods = elements.inputs.map(input => {
    const name = formatName(input.label || input.fieldName || input.id || input.name);
    if (!name) return null;
    
    const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
    return `
  /**
   * Fill ${name} field
   * @param {string} value - Value to fill
   */
  async fill${capitalizedName}(value) {
    await this.fill(this.${name}Input, value);
  }`;
  }).filter(Boolean);
  
  // Generate methods for buttons
  const buttonMethods = elements.buttons.map(button => {
    const name = formatName(button.label || button.name || button.id);
    if (!name) return null;
    
    const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
    return `
  /**
   * Click ${name} button
   */
  async click${capitalizedName}() {
    await this.click(this.${name}Button);
  }`;
  }).filter(Boolean);
  
  // Generate methods for selects
  const selectMethods = elements.selects.map(select => {
    const name = formatName(select.id || select.name);
    if (!name) return null;
    
    const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
    return `
  /**
   * Select option in ${name} dropdown
   * @param {string} value - Value to select
   */
  async select${capitalizedName}(value) {
    await this.select(this.${name}Select, value);
  }`;
  }).filter(Boolean);
  
  // Generate the page object class
  return `/**
 * ${className} - Salesforce Lightning Page Object
 * Generated from ${url}
 * @generated
 */
const { BaseSalesforcePage } = require('./BaseSalesforcePage');

class ${className} extends BaseSalesforcePage {
  /**
   * @param {import('@playwright/test').Page} page 
   */
  constructor(page) {
    super(page);
    
    // Page URL
    this.url = '${url}';
    
    // Selectors
    ${inputSelectors.length > 0 ? '// Inputs\n    ' + inputSelectors.join('\n    ') : ''}
    
    ${buttonSelectors.length > 0 ? '// Buttons\n    ' + buttonSelectors.join('\n    ') : ''}
    
    ${selectSelectors.length > 0 ? '// Selects\n    ' + selectSelectors.join('\n    ') : ''}
  }

  /**
   * Navigate to the page
   */
  async goto() {
    await this.page.goto(this.url);
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForSelector('force-record-layout-section', { timeout: 30000 }).catch(() => {});
  }
  ${inputMethods.join('')}
  ${buttonMethods.join('')}
  ${selectMethods.join('')}
}

module.exports = ${className};`;
}

/**
 * Generate test file for a page object
 * @param {string} className - Page object class name
 * @param {string} pageObjectPath - Path to the page object file
 * @returns {string} Generated test code
 */
function generateTestFile(className, pageObjectPath) {
  const relativePath = path.relative(
    path.resolve(process.cwd(), options.testsOutput),
    pageObjectPath
  ).replace(/\\/g, '/');
  
  return `/**
 * Tests for ${className}
 * @generated
 */
const { test, expect } = require('@playwright/test');
const ${className} = require('${relativePath.startsWith('.') ? relativePath : './' + relativePath}');

test.describe('${className} Tests', () => {
  test('should load the page successfully', async ({ page }) => {
    const pageObject = new ${className}(page);
    await pageObject.goto();
    
    // Add assertions here
    await expect(page).toHaveURL(pageObject.url);
  });
  
  // Add more test cases here
});
`;
}

// Main execution
(async () => {
  console.log(`Generating page object for ${options.url}`);
  
  const browser = await chromium.launch({ 
    headless: !options.visible 
  });
  
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Handle authentication if credentials provided
    if (options.username && options.password) {
      if (options.salesforce) {
        await handleSalesforceAuth(page, options.username, options.password);
      } else {
        // Generic authentication (can be expanded for other sites)
        await page.goto(options.url);
        console.log('Basic authentication not implemented for non-Salesforce sites');
      }
    }
    
    // Navigate to the target URL
    await page.goto(options.url, { timeout: 60000 }).catch(error => {
      console.log(`Navigation to ${options.url} timed out - continuing anyway`);
    });
    
    try {
      await page.waitForLoadState('networkidle', { timeout: 60000 });
    } catch (error) {
      console.log('Network idle timeout - continuing anyway');
    }
    
    await page.waitForTimeout(5000); // Increased wait for dynamic content
    
    // Extract elements based on page type
    let elements;
    if (options.salesforce) {
      elements = await extractSalesforceElements(page);
    } else {
      // Use standard element extraction for non-Salesforce pages
      elements = await extractStandardElements(page);
    }
    
    // Generate page object
    let pageObjectCode;
    if (options.salesforce) {
      pageObjectCode = generateSalesforcePageObject(elements, options.name, options.url);
    } else {
      // Use Salesforce generator for now, can be replaced with generic one
      pageObjectCode = generateSalesforcePageObject(elements, options.name, options.url);
    }
    
    // Write page object file
    const pageObjectPath = path.join(pagesOutputDir, `${options.name}.js`);
    fs.writeFileSync(pageObjectPath, pageObjectCode);
    console.log(`Generated page object: ${pageObjectPath}`);
    
    // Generate test file if requested
    if (options.generateTests) {
      const testFilePath = path.join(
        path.resolve(process.cwd(), options.testsOutput),
        `${options.name}.spec.js`
      );
      
      const testCode = generateTestFile(options.name, pageObjectPath);
      fs.writeFileSync(testFilePath, testCode);
      console.log(`Generated test file: ${testFilePath}`);
    }
    
  } catch (error) {
    console.error('Error generating page object:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();