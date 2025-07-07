// Core utilities (recommended)
const CiUtils = require('./core/ciUtils');
const TestQualityDashboard = require('./core/testQualityDashboard');

// Specialized utilities
const FlakyTestTracker = require('./specialized/flakyTestTracker');
const FlakyTestTrackerUtils = require('./specialized/flakyTestTrackerUtils');
const TestCoverageAnalyzer = require('./specialized/testCoverageAnalyzer');
const TestSelector = require('./specialized/testSelector');

// Export all utilities
module.exports = {
  // Core
  CiUtils,
  TestQualityDashboard,
  
  // Specialized
  FlakyTestTracker,
  FlakyTestTrackerUtils,
  TestCoverageAnalyzer,
  TestSelector
};