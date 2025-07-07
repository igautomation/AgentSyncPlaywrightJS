// Core utilities (recommended)
const DataOrchestrator = require('./core/dataOrchestrator');
const DataUtils = require('./core/dataUtils');
const ErrorHandler = require('./core/errorHandler');
const Logger = require('./core/logger');
const PlaywrightService = require('./core/playwrightService');
const PlaywrightUtils = require('./core/playwrightUtils');
const RetryWithBackoff = require('./core/retryWithBackoff');
const TestDataFactory = require('./core/testDataFactory');

module.exports = {
  // Core
  DataOrchestrator,
  DataUtils,
  ErrorHandler,
  Logger,
  PlaywrightService,
  PlaywrightUtils,
  RetryWithBackoff,
  TestDataFactory
};