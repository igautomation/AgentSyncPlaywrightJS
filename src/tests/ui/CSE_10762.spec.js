const { test } = require('../../fixtures/fixtures');
const Framework = require('agentsync-playwright-framework');
const { DataGenerator, Logger, TestRailAPI } = Framework;

const logger = new Logger('CSE_10762');
const TEST_CASE_ID = 'C24169';
let testRail, testRunId;

let sessionIsFresh = false;

test.beforeAll(async ({ loginPage, context }) => {
  if (process.env.TESTRAIL_URL) {
    testRail = new TestRailAPI();
    const run = await testRail.addRun(process.env.TESTRAIL_PROJECT_ID, {
      name: `Contact Onboarding Tests - ${new Date().toISOString()}`,
      case_ids: [parseInt(TEST_CASE_ID.replace('C', ''))]
    });
    testRunId = run.id;
  }
  
  const fs = require('fs');
  const path = require('path');
  if (!fs.existsSync(path.resolve(__dirname, "../storageState.json"))) {
    await loginPage.navigate(process.env.SF_LOGIN_URL);
    await loginPage.login(process.env.SF_USERNAME, process.env.SF_PASSWORD);
    await context.storageState({
      path: path.resolve(__dirname, "../storageState.json"),
    });
    sessionIsFresh = true;
  }
});

test.beforeEach(async ({ loginPage, sessionLoaded }) => {
  test.setTimeout(60_000);
  if (!sessionLoaded) {
    await loginPage.navigate(process.env.SF_LOGIN_URL);
    await loginPage.login(process.env.SF_USERNAME, process.env.SF_PASSWORD);
  }
});

test(`${TEST_CASE_ID} - Verify Onboarding Status bar component on Contact record page`, async ({
  contactPage,
  constants,
}, testInfo) => {
  let testPassed = false;
  
  try {
    const contact = DataGenerator.generateSalesforceContact();
    contact.salutation = constants.Salutations.MR;
    contact.accountName = "AccountRLI";
    
    await contactPage.navigateToContact();
    await contactPage.assertTitleContains("Contacts");
    await contactPage.createContact(contact);
    await contactPage.assertAllStatusesVisible();
    
    logger.info(`Contact created successfully: ${contact.firstName} ${contact.lastName}`);
    testPassed = true;
  } finally {
    if (testRail && testRunId) {
      await testRail.addResultsForCases(testRunId, {
        results: [{
          case_id: parseInt(TEST_CASE_ID.replace('C', '')),
          status_id: testPassed ? 1 : 5,
          comment: testPassed ? 'Test passed - Onboarding status bar verified' : `Test failed: ${testInfo.error?.message || 'Unknown error'}`
        }]
      });
    }
  }
});

test.afterEach(async ({ context, page }) => {
  if (page && !page.isClosed()) {
    await page.close();
  }
  if (context) {
    await context.close();
  }
});

test.afterAll(async ({ browser }) => {
  if (testRail && testRunId) {
    await testRail.closeRun(testRunId);
  }
  if (browser) {
    await browser.close();
  }
});
