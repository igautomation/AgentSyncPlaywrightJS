const { test, expect } = require('../../fixtures/fixtures');
const Framework = require('agentsync-playwright-framework');
const { DataGenerator, Logger, TestRailAPI } = Framework;

const logger = new Logger('CSE_10847');
const TEST_CASE_IDS = ['C24205', 'C24206', 'C24207'];
let testRail, testRunId;

let sessionIsFresh = false;

test.beforeAll(async ({ loginPage, context }) => {
  if (process.env.TESTRAIL_URL) {
    testRail = new TestRailAPI();
    const run = await testRail.addRun(process.env.TESTRAIL_PROJECT_ID, {
      name: `Contact Status Tests - ${new Date().toISOString()}`,
      case_ids: TEST_CASE_IDS.map(id => parseInt(id.replace('C', '')))
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
    //await loginPage.assertTitleContains("Recent | Dashboards | Salesforce");
  }
});

test(`${TEST_CASE_IDS[0]} - Validate that when a Contact record is created the Onboarding Status Bar is set to Not Started`, async ({
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
    contactPage.checkOnboardingStatusAs(constants.OnboardingStatuses.NOT_STARTED);
    
    logger.info(`Contact created with Not Started status: ${contact.firstName} ${contact.lastName}`);
    testPassed = true;
  } finally {
    if (testRail && testRunId) {
      await testRail.addResultsForCases(testRunId, {
        results: [{
          case_id: parseInt(TEST_CASE_IDS[0].replace('C', '')),
          status_id: testPassed ? 1 : 5,
          comment: testPassed ? 'Test passed - Status set to Not Started' : `Test failed: ${testInfo.error?.message || 'Unknown error'}`
        }]
      });
    }
  }
});

test.skip("C24206-Validate that Onboarding Status Bar is updated to 'Portal Invite Sent' when a Contact is Enabled as Portal User", async ({
  contactPage,
  constants,
}) => {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const email = faker.internet.email({ firstName, lastName });

  // Need to Implement the all the contact fields avilable in the UI
  // For now, we will use a simple contact object
  const contact = {
    salutation: constants.Salutations.MR,
    firstName,
    lastName,
    email,
    phone: "123-456-7890",
    accountName: "AccountRLI",
  };

  await contactPage.navigateToContact();
  await contactPage.retryWaitForTitle("Contacts");
  await contactPage.createContact(contact);
  await contactPage.enableCustomerUser();
  await contactPage.pause(); // Optional for debugging due to SF Limit in License Assignment
  contactPage.checkOnboardingStatusAs(
    constants.OnboardingStatuses.PORTAL_INVITE_SENT
  );
});

test.skip("C24207-Validate that Onboarding Status bar is set to 'Portal Started' when a User logs into the Portal for the first time", async ({
  contactPage,
  constants,
}) => {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const email = faker.internet.email({ firstName, lastName });

  // Need to Implement the all the contact fields avilable in the UI
  // For now, we will use a simple contact object
  const contact = {
    salutation: constants.Salutations.MR,
    firstName,
    lastName,
    email,
    phone: "123-456-7890",
    accountName: "AccountRLI",
  };

  await contactPage.navigateToContact();
  await contactPage.retryWaitForTitle("Contacts");
  await contactPage.createContact(contact);
  await contactPage.enableCustomerUser();
  await contactPage.pause();
  // Login to the Portal
  // Login to the Portal and verify the onboarding status
  contactPage.checkOnboardingStatusAs(
    constants.OnboardingStatuses.PORTAL_STARTED
  );
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