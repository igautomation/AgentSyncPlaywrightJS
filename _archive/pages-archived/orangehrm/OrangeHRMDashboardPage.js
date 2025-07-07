/**
 * OrangeHRM Dashboard Page Object
 * Renamed to follow naming conventions
 */
const BasePage = require('../BasePage');

class OrangeHRMDashboardPage extends BasePage {
  /**
   * Constructor for the OrangeHRMDashboardPage class
   * @param {import('@playwright/test').Page} page - Playwright page object
   */
  constructor(page) {
    super(page);
    
    // Define page URL
    this.url = 'https://opensource-demo.orangehrmlive.com/web/index.php/dashboard/index';
    
    // Define page locators
    this.locators = {
      // Header elements
      header: '.oxd-topbar-header',
      pageTitle: '.oxd-topbar-header-breadcrumb',
      userDropdown: '.oxd-userdropdown-tab',
      logoutLink: 'a:has-text("Logout")',
      
      // Dashboard widgets
      timeAtWorkWidget: '.oxd-grid-item:has-text("Time at Work")',
      myActionsWidget: '.oxd-grid-item:has-text("My Actions")',
      quickLaunchWidget: '.oxd-grid-item:has-text("Quick Launch")',
      buzzLatestPostsWidget: '.oxd-grid-item:has-text("Buzz Latest Posts")',
      employeesOnLeaveWidget: '.oxd-grid-item:has-text("Employees on Leave Today")',
      employeeDistributionWidget: '.oxd-grid-item:has-text("Employee Distribution by Sub Unit")',
      
      // Navigation menu
      adminMenu: 'a:has-text("Admin")',
      pimMenu: 'a:has-text("PIM")',
      leaveMenu: 'a:has-text("Leave")',
      timeMenu: 'a:has-text("Time")',
      recruitmentMenu: 'a:has-text("Recruitment")',
      myInfoMenu: 'a:has-text("My Info")',
      performanceMenu: 'a:has-text("Performance")',
      dashboardMenu: 'a:has-text("Dashboard")',
      directoryMenu: 'a:has-text("Directory")',
      maintenanceMenu: 'a:has-text("Maintenance")',
      buzzMenu: 'a:has-text("Buzz")'
    };
  }
  
  /**
   * Navigate to the dashboard page
   * @returns {Promise<OrangeHRMDashboardPage>} This page object for chaining
   */
  async navigate() {
    await this.page.goto(this.url);
    await this.page.waitForSelector(this.locators.header);
    return this;
  }
  
  /**
   * Get the page title text
   * @returns {Promise<string>} The page title text
   */
  async getPageTitle() {
    const titleElement = this.page.locator(this.locators.pageTitle);
    return await titleElement.textContent();
  }
  
  /**
   * Check if user is logged in
   * @returns {Promise<boolean>} True if user is logged in
   */
  async isLoggedIn() {
    return await this.isVisible(this.locators.userDropdown);
  }
  
  /**
   * Logout from the application
   * @returns {Promise<void>}
   */
  async logout() {
    await this.click(this.locators.userDropdown);
    await this.click(this.locators.logoutLink);
    await this.page.waitForURL('**/auth/login');
  }
  
  /**
   * Navigate to Admin page
   * @returns {Promise<void>}
   */
  async navigateToAdmin() {
    await this.click(this.locators.adminMenu);
    await this.page.waitForURL('**/admin/viewSystemUsers');
  }
  
  /**
   * Navigate to PIM page
   * @returns {Promise<void>}
   */
  async navigateToPIM() {
    await this.click(this.locators.pimMenu);
    await this.page.waitForURL('**/pim/viewEmployeeList');
  }
  
  /**
   * Navigate to Leave page
   * @returns {Promise<void>}
   */
  async navigateToLeave() {
    await this.click(this.locators.leaveMenu);
    await this.page.waitForURL('**/leave/viewLeaveList');
  }
  
  /**
   * Navigate to Time page
   * @returns {Promise<void>}
   */
  async navigateToTime() {
    await this.click(this.locators.timeMenu);
    await this.page.waitForURL('**/time/viewEmployeeTimesheet');
  }
  
  /**
   * Navigate to Recruitment page
   * @returns {Promise<void>}
   */
  async navigateToRecruitment() {
    await this.click(this.locators.recruitmentMenu);
    await this.page.waitForURL('**/recruitment/viewCandidates');
  }
  
  /**
   * Check if a specific widget is visible
   * @param {string} widgetName - Name of the widget (e.g., 'timeAtWork', 'myActions')
   * @returns {Promise<boolean>} True if the widget is visible
   */
  async isWidgetVisible(widgetName) {
    const locator = this.locators[`${widgetName}Widget`];
    if (!locator) {
      throw new Error(`Widget "${widgetName}" is not defined`);
    }
    return await this.isVisible(locator);
  }
}

module.exports = OrangeHRMDashboardPage;