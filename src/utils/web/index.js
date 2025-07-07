// Core utilities (recommended)
const WebInteractions = require('./core/webInteractions');
const WebInteractionsExtended = require('./core/webInteractionsExtended');
const NetworkUtils = require('./core/networkUtils');

// Specialized utilities
const SelfHealingLocator = require('./specialized/SelfHealingLocator');
const FlakyLocatorDetector = require('./specialized/flakyLocatorDetector');
const DomComparisonUtils = require('./specialized/domComparisonUtils');
const WebScrapingUtils = require('./specialized/webScrapingUtils');

// Legacy utilities (backward compatibility)
const AccessibilityUtils = require('./accessibilityUtils');
const DataProvider = require('./dataProvider');
const PerformanceUtils = require('./performanceUtils');
const ScreenshotUtils = require('./screenshotUtils');

// Export all utilities
module.exports = {
  // Core
  WebInteractions,
  WebInteractionsExtended,
  NetworkUtils,
  
  // Specialized
  SelfHealingLocator,
  FlakyLocatorDetector,
  DomComparisonUtils,
  WebScrapingUtils,
  
  // Legacy
  AccessibilityUtils,
  DataProvider,
  PerformanceUtils,
  ScreenshotUtils
};