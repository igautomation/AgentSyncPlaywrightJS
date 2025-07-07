// Core utilities (recommended)
const GeneratePage = require('./core/generate-page');
const PageGenerator = require('./core/page-generator');

// Specialized utilities
const ElementExtractor = require('./specialized/element-extractor');
const Selectors = require('./specialized/selectors');
const DomCollections = require('./specialized/domCollections');
const SfPageGenerator = require('./specialized/sf-page-generator');
const Config = require('./specialized/config');

module.exports = {
  // Core
  GeneratePage,
  PageGenerator,
  
  // Specialized
  ElementExtractor,
  Selectors,
  DomCollections,
  SfPageGenerator,
  Config
};