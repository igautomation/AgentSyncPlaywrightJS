/**
 * Salesforce Locators Handler Utility
 * Centralized locator management with self-healing capabilities
 */
class SalesforceLocators {
  constructor(page) {
    this.page = page;
    this.locators = this.initializeLocators();
  }

  initializeLocators() {
    return {
      // Login Page
      login: {
        username: '#username',
        password: '#password',
        loginButton: '#Login',
        errorMessage: '.loginError'
      },

      // Navigation & App Launcher
      navigation: {
        appLauncher: '.slds-icon-waffle, //div[@class="slds-icon-waffle"]',
        searchApps: 'input[placeholder*="Search apps"], //input[@placeholder="Search apps and items..."]',
        viewAll: 'button:has-text("View All")',
        agentSyncApp: '//span[@title="AgentSync"]',
        appOption: 'a[role="option"][data-label="{appName}"]',
        appTitle: '//span[@class="slds-truncate" and @title="{appName}"]'
      },

      // Common Elements
      common: {
        spinner: '.slds-spinner_container, .slds-spinner, //lightning-spinner',
        toast: '.slds-notify__content',
        modal: '.slds-modal',
        dropdown: '.slds-dropdown',
        button: 'button',
        input: 'input',
        textarea: 'textarea',
        saveEditButton: '//button[@name="SaveEdit"]',
        iframe: 'iframe'
      },

      // Object Pages
      objects: {
        newButton: 'a[title="New"]',
        saveButton: 'button[name="SaveEdit"]',
        editButton: 'button[name="Edit"]',
        deleteButton: 'button[name="Delete"]',
        listView: '.slds-table'
      },

      // Contact Page
      contact: {
        firstName: 'input[name="firstName"]',
        lastName: 'input[name="lastName"], //input[@name="lastName"]',
        email: 'input[name="email"]',
        phone: 'input[name="phone"]',
        account: 'input[placeholder*="Search Accounts"], //input[@class="slds-combobox__input slds-input" and @placeholder="Search Accounts..."]',
        npn: '//input[@name="agentsync__NPN__c"]',
        newContactButton: '//li[@data-target-selection-name="sfdc:StandardButton.Contact.NewContact"]',
        contactsList: '/lightning/o/Contact/list?filterName=__Recent'
      },

      // Account Page
      account: {
        name: 'input[name="Name"], //input[@name="Name"]',
        type: 'button[aria-label*="Type"]',
        industry: 'button[aria-label*="Industry"]',
        website: 'input[name="Website"]',
        newAccountButton: '//li[@data-target-selection-name="sfdc:StandardButton.Account.New"]'
      },

      // User Management
      user: {
        manageUsersUrl: '/lightning/setup/ManageUsers/home',
        targetUserLink: 'iframe >>> //a[normalize-space()="{lastName}, {firstName}"]',
        editButton: 'iframe >>> //td[@id="topButtonRow"]//input[@title="Edit"]',
        activeCheckbox: 'iframe >>> //input[@id="active"]',
        npnField: 'iframe >>> //label[text()="NPN"]/parent::td/following-sibling::td/input',
        usernameField: 'iframe >>> //input[@id="Username"]',
        saveButton: 'iframe >>> //div[@class="pbHeader"]//input[@name="save"]',
        firstNameField: 'iframe >>> //input[@id="name_firstName"]',
        lastNameField: 'iframe >>> //input[@id="name_lastName"]',
        emailField: 'iframe >>> //input[@id="Email"]',
        newButton: 'iframe >>> //div[@class="pbHeader"]//input[@name="new"]',
        licenseField: 'iframe >>> (//select[@name="user_license_id"])',
        profileField: 'iframe >>> (//label[@for="Profile"])',
        profileSelection: 'iframe >>> //select[@name="Profile"]',
        deactivationOkButton: 'iframe >>> //input[@id="simpleDialog0button0"]'
      },

      // AgentSync Specific
      agentSync: {
        metadataImportExportPage: '/lightning/n/agentsync__Metadata_Import_Export',
        csvImport: '/lightning/n/agentsync__Agent_CSV_Import',
        gwbrCombobox: '//agentsync-metadata-import-export//lightning-combobox//button[@name="metadata"]',
        gwbrComboboxDataValue: '//agentsync-metadata-import-export//lightning-base-combobox-item[@data-value="{dataValue}"]'
      },

      // Advanced Selectors
      advanced: {
        // Dynamic selectors with placeholders
        dynamicUserLink: '//a[normalize-space()="{lastName}, {firstName}"]',
        dynamicAppOption: 'a[role="option"][data-label="{appName}"]',
        dynamicDataValue: '//lightning-base-combobox-item[@data-value="{value}"]',
        
        // Complex compound selectors
        searchAccountsCombobox: '//input[@class="slds-combobox__input slds-input" and @placeholder="Search Accounts..."]',
        saveEditButtonComplex: '//button[@name="SaveEdit"] | //div[@class="pbHeader"]//input[@name="save"]',
        
        // Iframe selectors
        iframeUserEdit: 'iframe >>> //td[@id="topButtonRow"]//input[@title="Edit"]',
        iframeUserSave: 'iframe >>> //div[@class="pbHeader"]//input[@name="save"]',
        
        // Lightning component selectors
        lightningSpinner: '//lightning-spinner',
        lightningCombobox: '//lightning-combobox//button[@name="{name}"]',
        lightningBaseComboboxItem: '//lightning-base-combobox-item[@data-value="{value}"]'
      }
    };
  }

  async getLocator(category, element, options = {}) {
    const locatorString = this.locators[category]?.[element];
    if (!locatorString) {
      throw new Error(`Locator not found: ${category}.${element}`);
    }

    const locator = this.page.locator(locatorString);
    
    if (options.waitFor) {
      await locator.waitFor({ state: 'visible', timeout: 30000 });
    }

    return locator;
  }

  async clickElement(category, element, options = {}) {
    const locator = await this.getLocator(category, element, { waitFor: true });
    await locator.click(options);
  }

  async fillElement(category, element, value, options = {}) {
    const locator = await this.getLocator(category, element, { waitFor: true });
    await locator.fill(value, options);
  }

  async getText(category, element) {
    const locator = await this.getLocator(category, element, { waitFor: true });
    return await locator.textContent();
  }

  async isVisible(category, element, timeout = 5000) {
    try {
      const locator = await this.getLocator(category, element);
      return await locator.isVisible({ timeout });
    } catch {
      return false;
    }
  }

  async waitForElement(category, element, state = 'visible', timeout = 30000) {
    const locator = await this.getLocator(category, element);
    await locator.waitFor({ state, timeout });
  }

  async waitForSpinnerToDisappear(timeout = 30000) {
    try {
      const spinner = await this.getLocator('common', 'spinner');
      await spinner.waitFor({ state: 'hidden', timeout });
    } catch {
      // Spinner not found or already hidden
    }
  }

  async getToastMessage() {
    try {
      const toast = await this.getLocator('common', 'toast', { waitFor: true });
      return await toast.textContent();
    } catch {
      return null;
    }
  }

  async selectDropdownOption(category, element, optionText) {
    await this.clickElement(category, element);
    const option = this.page.locator(`text="${optionText}"`);
    await option.click();
  }

  async searchAndSelect(searchInput, searchText, resultText) {
    const input = this.page.locator(searchInput);
    await input.fill(searchText);
    await this.page.waitForTimeout(2000);
    
    const result = this.page.locator(`text="${resultText}"`);
    await result.click();
  }

  // Self-healing locator methods
  async findElementByMultipleSelectors(selectors, timeout = 10000) {
    for (const selector of selectors) {
      try {
        const element = this.page.locator(selector);
        await element.waitFor({ state: 'visible', timeout: timeout / selectors.length });
        return element;
      } catch {
        continue;
      }
    }
    throw new Error(`None of the selectors found: ${selectors.join(', ')}`);
  }

  async findByTextContent(text, tag = '*') {
    return this.page.locator(`${tag}:has-text("${text}")`);
  }

  async findByAriaLabel(label) {
    return this.page.locator(`[aria-label*="${label}"]`);
  }

  async findByPlaceholder(placeholder) {
    return this.page.locator(`[placeholder*="${placeholder}"]`);
  }

  async findByTitle(title) {
    return this.page.locator(`[title*="${title}"]`);
  }

  // Dynamic locator generation
  generateFieldLocator(fieldName) {
    return [
      `input[name="${fieldName}"]`,
      `textarea[name="${fieldName}"]`,
      `select[name="${fieldName}"]`,
      `[data-field="${fieldName}"]`,
      `[aria-label*="${fieldName}"]`
    ];
  }

  generateButtonLocator(buttonText) {
    return [
      `button:has-text("${buttonText}")`,
      `input[value="${buttonText}"]`,
      `a:has-text("${buttonText}")`,
      `[title="${buttonText}"]`,
      `[aria-label*="${buttonText}"]`
    ];
  }

  // Advanced locator methods
  async getDynamicLocator(category, element, replacements = {}) {
    let locatorString = this.locators[category]?.[element];
    if (!locatorString) {
      throw new Error(`Locator not found: ${category}.${element}`);
    }

    // Replace placeholders with actual values
    for (const [key, value] of Object.entries(replacements)) {
      locatorString = locatorString.replace(new RegExp(`\{${key}\}`, 'g'), value);
    }

    return this.page.locator(locatorString);
  }

  async clickDynamicElement(category, element, replacements = {}, options = {}) {
    const locator = await this.getDynamicLocator(category, element, replacements);
    await locator.waitFor({ state: 'visible', timeout: 30000 });
    await locator.click(options);
  }

  async navigateToAgentSyncApp() {
    await this.clickElement('navigation', 'appLauncher');
    await this.page.waitForTimeout(2000);
    await this.clickElement('navigation', 'agentSyncApp');
    await this.waitForSpinnerToDisappear();
  }

  async createNewContact(contactData) {
    await this.clickElement('contact', 'newContactButton');
    await this.waitForSpinnerToDisappear();
    
    if (contactData.lastName) {
      await this.fillElement('contact', 'lastName', contactData.lastName);
    }
    if (contactData.npn) {
      await this.fillElement('contact', 'npn', contactData.npn);
    }
    
    await this.clickElement('common', 'saveEditButton');
    await this.waitForSpinnerToDisappear();
  }

  async editUser(firstName, lastName, userData) {
    await this.clickDynamicElement('user', 'targetUserLink', { firstName, lastName });
    await this.clickElement('user', 'editButton');
    
    if (userData.npn) {
      await this.fillElement('user', 'npnField', userData.npn);
    }
    
    await this.clickElement('user', 'saveButton');
  }

  // Validation methods
  async validateLocator(category, element) {
    try {
      await this.getLocator(category, element);
      return true;
    } catch {
      return false;
    }
  }

  async validateAllLocators() {
    const results = {};
    
    for (const [category, elements] of Object.entries(this.locators)) {
      results[category] = {};
      for (const element of Object.keys(elements)) {
        results[category][element] = await this.validateLocator(category, element);
      }
    }
    
    return results;
  }
}

module.exports = SalesforceLocators;