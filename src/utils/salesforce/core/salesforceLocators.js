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
        gwbrComboboxDataValue: '//agentsync-metadata-import-export//lightning-base-combobox-item[@data-value="{dataValue}"]
      },

      // Lightning Components
      lightning: {
        recordForm: 'lightning-record-form',
        recordEditForm: 'lightning-record-edit-form',
        inputField: 'lightning-input-field',
        combobox: 'lightning-combobox',
        datatable: 'lightning-datatable',
        card: 'lightning-card',
        tab: 'lightning-tab',
        tabset: 'lightning-tabset',
        progressIndicator: 'lightning-progress-indicator',
        breadcrumb: 'lightning-breadcrumb',
        button: 'lightning-button',
        buttonIcon: 'lightning-button-icon'
      },

      // Record Pages
      record: {
        pageHeader: '.slds-page-header',
        recordTitle: '.slds-page-header__title',
        recordType: '.slds-page-header__meta-text',
        detailsTab: 'a[data-tab-value="details"]',
        relatedTab: 'a[data-tab-value="related"]',
        activityTab: 'a[data-tab-value="activity"]',
        editButton: 'button[name="Edit"]',
        deleteButton: 'button[name="Delete"]',
        followButton: 'button[name="Follow"]',
        shareButton: 'button[name="Share"]'
      },

      // List Views
      listView: {
        table: 'table[role="grid"]',
        tableRow: 'tr[data-row-key-value]',
        tableCell: 'td[data-label]',
        newButton: 'a[title="New"]',
        importButton: 'button[title="Import"]',
        listViewSelector: 'button[title="Select List View"]',
        refreshButton: 'button[title="Refresh"]',
        displayAsSelector: 'button[title="Display as"]',
        searchBox: 'input[name="search"]',
        filterButton: 'button[title="Filters"]'
      },

      // Setup and Admin
      setup: {
        setupHome: '/lightning/setup/SetupOneHome/home',
        objectManager: '/lightning/setup/ObjectManager/home',
        userManagement: '/lightning/setup/ManageUsers/home',
        profileManagement: '/lightning/setup/Profiles/home',
        permissionSets: '/lightning/setup/PermSets/home',
        customSettings: '/lightning/setup/CustomSettings/home',
        apexClasses: '/lightning/setup/ApexClasses/home',
        flows: '/lightning/setup/Flows/home'
      },

      // Forms and Fields
      forms: {
        requiredField: '.slds-required',
        fieldError: '.slds-has-error',
        fieldHelp: '.slds-form-element__help',
        fieldLabel: '.slds-form-element__label',
        checkbox: 'input[type="checkbox"]',
        radio: 'input[type="radio"]',
        picklist: 'lightning-combobox',
        lookupField: 'input[role="combobox"]',
        dateField: 'input[type="date"]',
        datetimeField: 'input[type="datetime-local"]',
        numberField: 'input[type="number"]',
        emailField: 'input[type="email"]',
        phoneField: 'input[type="tel"]',
        urlField: 'input[type="url"]'
      }

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
      locatorString = locatorString.replace(new RegExp(`{${key}}`, 'g'), value);
    }

    return this.page.locator(locatorString);
  }

  // Enhanced Salesforce-specific methods
  async navigateToObject(objectName) {
    const url = `/lightning/o/${objectName}/list`;
    await this.page.goto(url);
    await this.waitForSpinnerToDisappear();
  }

  async openAppLauncher() {
    await this.clickElement('navigation', 'appLauncher');
    await this.page.waitForTimeout(1000);
  }

  async searchAndOpenApp(appName) {
    await this.openAppLauncher();
    await this.fillElement('navigation', 'searchApps', appName);
    const appLocator = await this.getDynamicLocator('navigation', 'appOption', { appName });
    await appLocator.click();
  }

  // Lightning-specific helpers
  async waitForLightningPageLoad() {
    await this.page.waitForLoadState('networkidle');
    await this.waitForSpinnerToDisappear();
    await this.page.waitForTimeout(2000);
  }

  async handleLightningModal(action = 'close') {
    const modal = await this.getLocator('common', 'modal');
    if (await modal.isVisible()) {
      if (action === 'close') {
        await this.page.keyboard.press('Escape');
      }
    }
  }

  // Record-specific methods
  async createNewRecord(objectName, fieldData = {}) {
    await this.navigateToObject(objectName);
    await this.clickElement('listView', 'newButton');
    await this.waitForLightningPageLoad();
    
    for (const [fieldName, value] of Object.entries(fieldData)) {
      await this.fillField(fieldName, value);
    }
  }

  async fillField(fieldName, value) {
    const selectors = this.generateFieldLocator(fieldName);
    const field = await this.findElementByMultipleSelectors(selectors);
    await field.fill(value);
  }

  async selectPicklistValue(fieldName, value) {
    const combobox = this.page.locator(`lightning-combobox[data-field="${fieldName}"] button`);
    await combobox.click();
    const option = this.page.locator(`lightning-base-combobox-item[data-value="${value}"]`);
    await option.click();
  }

  async searchLookupField(fieldName, searchText, selectText) {
    const lookupInput = this.page.locator(`input[data-field="${fieldName}"]`);
    await lookupInput.fill(searchText);
    await this.page.waitForTimeout(2000);
    const option = this.page.locator(`text="${selectText}"`);
    await option.click();
  }

  // List view methods
  async selectListView(viewName) {
    await this.clickElement('listView', 'listViewSelector');
    const view = this.page.locator(`text="${viewName}"`);
    await view.click();
    await this.waitForLightningPageLoad();
  }

  async searchInListView(searchText) {
    await this.fillElement('listView', 'searchBox', searchText);
    await this.page.keyboard.press('Enter');
    await this.waitForLightningPageLoad();
  }

  async clickRecordInList(recordName) {
    const recordLink = this.page.locator(`a[title="${recordName}"]`);
    await recordLink.click();
    await this.waitForLightningPageLoad();
  }

  // Utility methods for common Salesforce patterns
  async waitForRecordSave() {
    await this.waitForSpinnerToDisappear();
    const toast = await this.getToastMessage();
    return toast && (toast.includes('saved') || toast.includes('created') || toast.includes('updated'));
  }

  async verifyRecordCreated(recordName) {
    const toast = await this.getToastMessage();
    return toast && toast.includes(recordName) && toast.includes('created');
  }
}

module.exports = SalesforceLocators;ors[category]?.[element];
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