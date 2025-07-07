#!/usr/bin/env node

/**
 * Salesforce Page Object Generator
 * 
 * This script generates Playwright page objects for Salesforce Lightning pages
 */

const fs = require('fs');
const path = require('path');
const { program } = require('commander');

program
  .name('generate-salesforce-page')
  .description('Generate Playwright page objects for Salesforce Lightning pages')
  .version('1.0.0')
  .option('-n, --name <name>', 'Page object name (e.g., AccountPage)')
  .option('-o, --output <directory>', 'Output directory', './src/pages/salesforce')
  .option('-t, --type <type>', 'Page type (record, list, home)', 'record')
  .option('-f, --force', 'Overwrite existing files', false);

program.parse(process.argv);

const options = program.opts();

if (!options.name) {
  console.error('Error: Page name is required');
  program.help();
  process.exit(1);
}

// Ensure the output directory exists
const outputDir = path.resolve(process.cwd(), options.output);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const pageName = options.name.endsWith('Page') ? options.name : `${options.name}Page`;
const outputFile = path.join(outputDir, `${pageName}.js`);

// Check if file already exists
if (fs.existsSync(outputFile) && !options.force) {
  console.error(`Error: File ${outputFile} already exists. Use --force to overwrite.`);
  process.exit(1);
}

// Generate page object template based on type
let template = '';

switch (options.type) {
  case 'record':
    template = generateRecordPageTemplate(pageName);
    break;
  case 'list':
    template = generateListPageTemplate(pageName);
    break;
  case 'home':
    template = generateHomePageTemplate(pageName);
    break;
  default:
    console.error(`Error: Unknown page type: ${options.type}`);
    process.exit(1);
}

// Write the file
fs.writeFileSync(outputFile, template);
console.log(`Generated ${pageName} at ${outputFile}`);

/**
 * Generate a template for a Salesforce record page
 */
function generateRecordPageTemplate(pageName) {
  return `/**
 * ${pageName} - Salesforce Lightning Record Page Object
 */
const { BaseSalesforcePage } = require('./BaseSalesforcePage');

class ${pageName} extends BaseSalesforcePage {
  /**
   * @param {import('@playwright/test').Page} page 
   */
  constructor(page) {
    super(page);
    
    // Selectors
    this.headerTitle = '.slds-page-header__title';
    this.editButton = 'button[name="Edit"]';
    this.saveButton = 'button[name="SaveEdit"]';
    this.cancelButton = 'button[name="CancelEdit"]';
    this.deleteButton = 'button[name="Delete"]';
    this.confirmDeleteButton = 'button[title="Delete"]';
    this.tabsList = '.slds-tabs_default__nav';
    this.relatedTab = 'a.slds-tabs_default__link[title="Related"]';
    this.detailsTab = 'a.slds-tabs_default__link[title="Details"]';
  }

  /**
   * Navigate to a specific record
   * @param {string} recordId - The Salesforce record ID
   */
  async navigateToRecord(recordId) {
    await this.navigateTo(\`/lightning/r/\${this.objectName}/\${recordId}/view\`);
    await this.page.waitForSelector(this.headerTitle);
  }

  /**
   * Click the Edit button
   */
  async clickEdit() {
    await this.page.click(this.editButton);
    await this.page.waitForSelector(this.saveButton);
  }

  /**
   * Save the record
   */
  async save() {
    await this.page.click(this.saveButton);
    await this.page.waitForSelector(this.editButton);
  }

  /**
   * Cancel editing
   */
  async cancel() {
    await this.page.click(this.cancelButton);
    await this.page.waitForSelector(this.editButton);
  }

  /**
   * Delete the record
   */
  async deleteRecord() {
    await this.page.click(this.deleteButton);
    await this.page.waitForSelector(this.confirmDeleteButton);
    await this.page.click(this.confirmDeleteButton);
  }

  /**
   * Switch to the Related tab
   */
  async switchToRelatedTab() {
    await this.page.click(this.relatedTab);
  }

  /**
   * Switch to the Details tab
   */
  async switchToDetailsTab() {
    await this.page.click(this.detailsTab);
  }
}

module.exports = { ${pageName} };`;
}

/**
 * Generate a template for a Salesforce list page
 */
function generateListPageTemplate(pageName) {
  return `/**
 * ${pageName} - Salesforce Lightning List Page Object
 */
const { BaseSalesforcePage } = require('./BaseSalesforcePage');

class ${pageName} extends BaseSalesforcePage {
  /**
   * @param {import('@playwright/test').Page} page 
   */
  constructor(page) {
    super(page);
    
    // Selectors
    this.newButton = 'a[title="New"]';
    this.searchInput = 'input.slds-input';
    this.tableRows = 'table tbody tr';
    this.listViewControls = '.slds-grid.listViewControls';
    this.refreshButton = 'button[name="refreshButton"]';
  }

  /**
   * Navigate to the list view
   */
  async navigateToListView() {
    await this.navigateTo(\`/lightning/o/\${this.objectName}/list\`);
    await this.page.waitForSelector(this.listViewControls);
  }

  /**
   * Click the New button
   */
  async clickNew() {
    await this.page.click(this.newButton);
  }

  /**
   * Search for a record
   * @param {string} searchText - Text to search for
   */
  async search(searchText) {
    await this.page.fill(this.searchInput, searchText);
    await this.page.keyboard.press('Enter');
    // Wait for search results
    await this.page.waitForTimeout(1000);
  }

  /**
   * Get the number of rows in the list
   * @returns {Promise<number>} The number of rows
   */
  async getRowCount() {
    const rows = await this.page.$$(this.tableRows);
    return rows.length;
  }

  /**
   * Click on a record by row index
   * @param {number} rowIndex - The row index (0-based)
   */
  async clickRecordByIndex(rowIndex) {
    const rows = await this.page.$$(this.tableRows);
    if (rowIndex >= 0 && rowIndex < rows.length) {
      await rows[rowIndex].click();
    } else {
      throw new Error(\`Row index \${rowIndex} is out of bounds\`);
    }
  }

  /**
   * Refresh the list view
   */
  async refresh() {
    await this.page.click(this.refreshButton);
    await this.page.waitForSelector(this.listViewControls);
  }
}

module.exports = { ${pageName} };`;
}

/**
 * Generate a template for a Salesforce home page
 */
function generateHomePageTemplate(pageName) {
  return `/**
 * ${pageName} - Salesforce Lightning Home Page Object
 */
const { BaseSalesforcePage } = require('./BaseSalesforcePage');

class ${pageName} extends BaseSalesforcePage {
  /**
   * @param {import('@playwright/test').Page} page 
   */
  constructor(page) {
    super(page);
    
    // Selectors
    this.appLauncherButton = 'button[aria-label="App Launcher"]';
    this.appLauncherSearch = 'input.slds-input';
    this.appTiles = '.slds-app-launcher__tile';
    this.homeTab = 'a[title="Home"]';
    this.globalSearchBox = 'input.slds-input[placeholder="Search..."]';
    this.userMenuButton = 'button.slds-button_icon-container[aria-label="View profile"]';
    this.logoutMenuItem = 'a[role="menuitem"][href*="logout"]';
  }

  /**
   * Navigate to the Salesforce home page
   */
  async navigateToHome() {
    await this.navigateTo('/lightning/page/home');
    await this.page.waitForSelector(this.homeTab);
  }

  /**
   * Open the App Launcher
   */
  async openAppLauncher() {
    await this.page.click(this.appLauncherButton);
    await this.page.waitForSelector(this.appLauncherSearch);
  }

  /**
   * Search for and open an app
   * @param {string} appName - The name of the app to open
   */
  async openApp(appName) {
    await this.openAppLauncher();
    await this.page.fill(this.appLauncherSearch, appName);
    
    // Wait for search results
    await this.page.waitForTimeout(1000);
    
    // Find and click the app tile
    const appTiles = await this.page.$$(this.appTiles);
    for (const tile of appTiles) {
      const tileText = await tile.textContent();
      if (tileText.includes(appName)) {
        await tile.click();
        break;
      }
    }
  }

  /**
   * Perform a global search
   * @param {string} searchText - Text to search for
   */
  async globalSearch(searchText) {
    await this.page.fill(this.globalSearchBox, searchText);
    await this.page.keyboard.press('Enter');
  }

  /**
   * Log out of Salesforce
   */
  async logout() {
    await this.page.click(this.userMenuButton);
    await this.page.waitForSelector(this.logoutMenuItem);
    await this.page.click(this.logoutMenuItem);
  }
}

module.exports = { ${pageName} };`;
}