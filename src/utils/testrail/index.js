// Core utilities (recommended)
const TestRailCore = require('./core/testrailCore');
const TestRailAPI = require('./core/testrail-api-simple');

// Specialized utilities
const AutomatedTestRunner = require('./specialized/automated-test-runner');
const TestCaseIdManager = require('./specialized/test-case-id-manager');
const ReportUploader = require('./specialized/report-uploader');

// Legacy utilities (backward compatibility)
const TestRailHelper = require('./legacy/testrail-helper');
const TestRailUploader = require('./legacy/testrail-uploader');
const SimpleTestRailReporter = require('./legacy/simple-testrail-reporter');
const TestCaseFetcher = require('./legacy/test-case-fetcher');
const TestCaseManager = require('./legacy/test-case-manager');
const ResultUploader = require('./legacy/result-uploader');

module.exports = {
  // Core (recommended)
  TestRailCore,
  TestRailAPI,
  TestRailClient: TestRailAPI, // Alias for compatibility
  
  // Specialized
  AutomatedTestRunner,
  TestCaseIdManager,
  ReportUploader,
  
  // Legacy (backward compatibility)
  TestRailHelper,
  TestRailUploader,
  SimpleTestRailReporter,
  TestCaseFetcher,
  TestCaseManager,
  ResultUploader
};