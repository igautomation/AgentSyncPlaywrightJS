/**
 * Configuration for page generators
 */
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

module.exports = {
  // Output paths
  output: {
    pagesDir: path.resolve(process.cwd(), './src/pages'),
    testsDir: path.resolve(process.cwd(), './src/tests/ui'),
    elementsFile: path.resolve(process.cwd(), './temp/sf_elements.json'),
    authStorageDir: path.resolve(process.cwd(), './auth')
  },
  
  // Extraction options
  extraction: {
    // Wait for these selectors to be present before extraction
    waitForSelectors: {
      standard: 'body',
      salesforce: 'force-record-layout-section, lightning-card, .slds-form, .slds-form-element'
    },
    
    // Timeout for waiting for elements (ms)
    timeout: 30000,
    
    // Whether to include hidden elements
    includeHidden: false,
    
    // Whether to extract DOM collections
    extractCollections: true,
    
    // Collection types to extract
    collectionTypes: ['tables', 'lists', 'grids', 'repeaters', 'dataTables']
  },
  
  // Salesforce specific options
  salesforce: {
    // Login URL
    loginUrl: process.env.SF_LOGIN_URL || 'https://login.salesforce.com',
    
    // Auth storage path
    authStoragePath: path.resolve(process.cwd(), './auth/salesforce-storage-state.json'),
    
    // Lightning components to extract
    components: [
      'lightning-input',
      'lightning-combobox',
      'lightning-textarea',
      'lightning-checkbox-group',
      'lightning-radio-group',
      'lightning-button',
      'lightning-datatable',
      'lightning-card',
      'force-record-layout-item',
      'force-record-layout-section',
      'lightning-input-field',
      'lightning-output-field'
    ]
  },
  
  // Browser configuration
  browser: {
    timeout: 45000
  }
};