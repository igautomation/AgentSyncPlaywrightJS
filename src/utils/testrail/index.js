const TestRailClient = require('./testrail-client');
const TestRailIntegration = require('./testrail-integration');
const TestRailRunner = require('./testrail-runner');

module.exports = {
  TestRailClient,
  TestRailIntegration,
  TestRailRunner,
  STATUS: TestRailIntegration.STATUS
};