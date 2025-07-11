const { test, expect } = require('../../fixtures/fixtures');
const Framework = require('agentsync-playwright-framework');
const { Logger, TestRailAPI } = Framework;

const logger = new Logger('CSE_107060');
const TEST_CASE_IDS = ['C24152', 'C24153', 'C24154', 'C24156'];
let testRail, testRunId;

let sessionIsFresh = false;

test.beforeAll(async ({ portalLoginPage, context }) => {
  if (process.env.TESTRAIL_URL) {
    testRail = new TestRailAPI();
    const run = await testRail.addRun(process.env.TESTRAIL_PROJECT_ID, {
      name: `Portal Validation Tests - ${new Date().toISOString()}`,
      case_ids: TEST_CASE_IDS.map(id => parseInt(id.replace('C', '')))
    });
    testRunId = run.id;
  }
  
  const fs = require('fs');
  const path = require('path');
  if (!fs.existsSync(path.resolve(__dirname, "../storageState.json"))) {
    await portalLoginPage.navigate(process.env.PORTAL_URL);
    await portalLoginPage.login(
      process.env.PORTAL_USERNAME,
      process.env.PORTAL_PASSWORD
    );
    await context.storageState({
      path: path.resolve(__dirname, "../storageState.json"),
    });
    sessionIsFresh = true;
  }
});

test.beforeEach(async ({ portalLoginPage, sessionLoaded }) => {
  test.setTimeout(60_000);
  if (!sessionLoaded) {
    await portalLoginPage.navigate(process.env.PORTAL_URL);
    await portalLoginPage.login(
      process.env.PORTAL_USERNAME,
      process.env.PORTAL_PASSWORD
    );
  }
});

test(`${TEST_CASE_IDS[0]} - Validate the list of fields in onboarding portal`, async ({
  portalHomePage,
}, testInfo) => {
  let testPassed = false;
  
  try {
    await portalHomePage.navigateUpdateProducerDetail();
    await portalHomePage.ssnField.waitFor({ state: "visible" });
    await portalHomePage.genderDropdown.waitFor({ state: "visible" });
    await portalHomePage.countryDropdown.waitFor({ state: "visible" });
    await portalHomePage.checkAgentTypes(["Producer", "Adjuster", "Travel", "Surplus"]);
    
    logger.info("Fields in onboarding portal are present and visible");
    testPassed = true;
  } finally {
    if (testRail && testRunId) {
      await testRail.addResultsForCases(testRunId, {
        results: [{
          case_id: parseInt(TEST_CASE_IDS[0].replace('C', '')),
          status_id: testPassed ? 1 : 5,
          comment: testPassed ? 'Test passed - All fields visible' : `Test failed: ${testInfo.error?.message || 'Unknown error'}`
        }]
      });
    }
  }
});

test("C24153 - Validate SSN field accepts only valid format of SSN in onboarding portal ", async ({
  portalHomePage,
}) => {
  await portalHomePage.navigateUpdateProducerDetail();
  await portalHomePage.ssnField.waitFor({ state: "visible" });
  await portalHomePage.fill(portalHomePage.ssnField, "A123-45-6789");
  await portalHomePage.waitForDelay(1000);  
  await portalHomePage.page.waitForTimeout(1000); // wait for possible validation
  await portalHomePage.ssnFieldError.waitFor({
    state: "visible",
    timeout: 10000,
  });
  const errorText = await portalHomePage.ssnFieldError.textContent();
  console.log(errorText.trim());
  expect(errorText).toContain(
    "Social Security Number must be 9 digits without dashes."
  );
  console.log("SSN field validation error is displayed as expected");
});

test("C24154 - Validate Gender dropdown values in onboarding portal", async ({
  portalHomePage, constants
}) => {
  await portalHomePage.navigateUpdateProducerDetail();
  await portalHomePage.ssnField.waitFor({ state: "visible" });
  const genderOptionsDisplayed = await portalHomePage.getGenderOption();
  expect(genderOptionsDisplayed).toEqual(expect.arrayContaining(constants.genderOptions));
  console.log("Gender dropdown values in onboarding portal displayed as expected");
});

test("C24156-Validate Agent Type dropdown values in onboarding portal ", async ({
  portalHomePage
}) => {
  await portalHomePage.navigateUpdateProducerDetail();
  await portalHomePage.ssnField.waitFor({ state: "visible" });
  await portalHomePage.checkAgentTypes([
    "Producer",
    "Adjuster",
    "Travel",
    "Surplus",
  ]);
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
