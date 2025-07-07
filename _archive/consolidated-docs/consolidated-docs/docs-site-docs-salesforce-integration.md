<!-- Source: /Users/mzahirudeen/playwright-framework-dev/docs-site/docs/salesforce-integration.md -->

---
sidebar_position: 4
title: Salesforce Integration
description: Guide to Salesforce integration with the Playwright framework
---

# Salesforce Integration

This guide covers how to use our framework for Salesforce testing, including authentication, UI testing, and API integration.

## Authentication

Our framework provides robust Salesforce authentication handling:

```javascript
const { SalesforceSessionManager } = require('../../utils/salesforce');

// Create session manager
const sessionManager = new SalesforceSessionManager({
  loginUrl: 'https://login.salesforce.com',
  username: process.env.SF_USERNAME,
  password: process.env.SF_PASSWORD
});

// Check if session is valid
const isValid = await sessionManager.hasValidSession();

// Create new session if needed
if (!isValid) {
  await sessionManager.createSession();
}

// Or use the convenience method
await sessionManager.ensureValidSession();
```

## Test Fixtures

Our framework provides Salesforce-specific test fixtures:

```javascript
// In your test file
const { test, expect } = require('../../fixtures/salesforce-fixtures');

// Use the salesforcePage fixture which ensures a valid session
test('should create a new contact', async ({ salesforcePage }) => {
  // Test with authenticated page
  await salesforcePage.goto('/lightning/o/Contact/new');
  
  // Fill form fields
  await salesforcePage.fill('[name="lastName"]', 'Test Contact');
  await salesforcePage.fill('[name="firstName"]', 'Test');
  await salesforcePage.fill('[name="Email"]', 'test@example.com');
  
  // Save the contact
  await salesforcePage.click('button[name="SaveEdit"]');
  
  // Verify success
  await expect(salesforcePage).not.toHaveURL(/\/new/);
});
```

## Page Objects

Our framework includes Salesforce-specific page objects:

```javascript
// src/pages/salesforce/ContactPage.js
class ContactPage {
  constructor(page) {
    this.page = page;
    this.lastNameInput = page.locator('[name="lastName"]');
    this.firstNameInput = page.locator('[name="firstName"]');
    this.emailInput = page.locator('[name="Email"]');
    this.phoneInput = page.locator('[name="Phone"]');
    this.saveButton = page.locator('button[name="SaveEdit"]');
  }

  async goto() {
    await this.page.goto('/lightning/o/Contact/new');
    await this.page.waitForSelector('[name="lastName"]');
  }

  async createContact(contactData) {
    await this.lastNameInput.fill(contactData.lastName);
    
    if (contactData.firstName) {
      await this.firstNameInput.fill(contactData.firstName);
    }
    
    if (contactData.email) {
      await this.emailInput.fill(contactData.email);
    }
    
    if (contactData.phone) {
      await this.phoneInput.fill(contactData.phone);
    }
    
    await this.saveButton.click();
    await this.page.waitForSelector('lightning-spinner', { state: 'detached' });
  }
}

module.exports = ContactPage;
```

## Salesforce API Integration

Our framework includes a `SalesforceApiUtils` class for interacting with Salesforce REST APIs:

```javascript
const { SalesforceApiUtils } = require('../../utils/salesforce');

// Create API utils instance
const apiUtils = new SalesforceApiUtils({
  instanceUrl: process.env.SF_INSTANCE_URL,
  accessToken: accessToken
});

// Get API limits
const limits = await apiUtils.getLimits();

// Describe objects
const globalObjects = await apiUtils.describeGlobal();
const contactObject = await apiUtils.describeObject('Contact');

// Query records
const contacts = await apiUtils.query('SELECT Id, Name, Email FROM Contact LIMIT 10');

// Create record
const newContact = await apiUtils.createRecord('Contact', {
  LastName: 'Test Contact',
  FirstName: 'Test',
  Email: 'test@example.com'
});

// Update record
await apiUtils.updateRecord('Contact', contactId, {
  Title: 'Updated Title'
});

// Delete record
await apiUtils.deleteRecord('Contact', contactId);

// Extract metadata to file
await apiUtils.extractObjectMetadata('Contact', './temp/contact-metadata.json');
```

## SOQL Queries

Our framework supports SOQL queries for Salesforce data:

```javascript
const { SalesforceApiUtils } = require('../../utils/salesforce');

// Create API utils instance
const apiUtils = new SalesforceApiUtils({
  instanceUrl: process.env.SF_INSTANCE_URL,
  accessToken: accessToken
});

// Simple query
const contacts = await apiUtils.query('SELECT Id, Name, Email FROM Contact LIMIT 10');

// Query with WHERE clause
const filteredContacts = await apiUtils.query(
  "SELECT Id, Name, Email FROM Contact WHERE Email LIKE '%@example.com' LIMIT 10"
);

// Query with relationship
const contactsWithAccounts = await apiUtils.query(
  'SELECT Id, Name, Account.Name FROM Contact WHERE Account.Industry = \'Technology\' LIMIT 10'
);

// Query with ORDER BY
const sortedContacts = await apiUtils.query(
  'SELECT Id, Name, CreatedDate FROM Contact ORDER BY CreatedDate DESC LIMIT 10'
);

// Query with aggregate functions
const contactCounts = await apiUtils.query(
  'SELECT Account.Name, COUNT(Id) totalContacts FROM Contact GROUP BY Account.Name'
);
```

## File Operations

Our framework supports file operations with Salesforce:

```javascript
const { SalesforceApiUtils } = require('../../utils/salesforce');

// Create API utils instance
const apiUtils = new SalesforceApiUtils({
  instanceUrl: process.env.SF_INSTANCE_URL,
  accessToken: accessToken
});

// Upload file
const contentVersion = await apiUtils.uploadFile(
  './uploads/document.pdf',
  'Test Document',
  { Description: 'Test document description' }
);

// Download file
await apiUtils.downloadFile(
  contentVersion.id,
  './downloads/document.pdf'
);

// Query files
const files = await apiUtils.query(
  'SELECT Id, Title, FileType, ContentSize FROM ContentVersion ORDER BY CreatedDate DESC LIMIT 10'
);
```

## Metadata Operations

Our framework supports Salesforce metadata operations:

```javascript
const { SalesforceApiUtils } = require('../../utils/salesforce');

// Create API utils instance
const apiUtils = new SalesforceApiUtils({
  instanceUrl: process.env.SF_INSTANCE_URL,
  accessToken: accessToken
});

// Extract object metadata
await apiUtils.extractObjectMetadata('Contact', './temp/contact-metadata.json');

// Extract field metadata
const contactObject = await apiUtils.describeObject('Contact');
const emailField = contactObject.fields.find(field => field.name === 'Email');

// Extract picklist values
const industryField = await apiUtils.describeObject('Account')
  .then(obj => obj.fields.find(field => field.name === 'Industry'));

const picklistValues = industryField.picklistValues.map(value => value.label);
```

## Example Salesforce Test

```javascript
const { test, expect } = require('../../fixtures/salesforce-fixtures');
const ContactPage = require('../../pages/salesforce/ContactPage');

test.describe('Salesforce Contact Tests', () => {
  test('should create a new contact', async ({ salesforcePage }) => {
    // Create page object
    const contactPage = new ContactPage(salesforcePage);
    
    // Navigate to new contact page
    await contactPage.goto();
    
    // Generate unique contact data
    const uniqueId = Date.now().toString().slice(-6);
    const contactData = {
      lastName: `Test Contact ${uniqueId}`,
      firstName: 'Test',
      email: `test${uniqueId}@example.com`,
      phone: '555-123-4567'
    };
    
    // Create contact
    await contactPage.createContact(contactData);
    
    // Verify we're no longer on the new contact page
    await expect(salesforcePage).not.toHaveURL(/\/new/);
    
    // Verify success toast message
    await expect(salesforcePage.locator('.toastMessage')).toContainText('created');
  });
});
```

## Salesforce Testing Best Practices

1. **Reuse Authentication**: Store and reuse authentication state to avoid repeated logins
2. **Use Page Objects**: Create page objects for Salesforce pages and components
3. **Handle Lightning Components**: Add proper waits for Lightning components to load
4. **Use Data Cleanup**: Clean up test data after tests to avoid accumulation
5. **Handle Timeouts**: Salesforce can be slow, so use appropriate timeouts
6. **Use API for Setup**: Use the API for test data setup instead of UI when possible
7. **Handle Stale Elements**: Lightning UI can cause stale elements, so handle them properly
8. **Test in Sandbox**: Always test in a sandbox environment, not production