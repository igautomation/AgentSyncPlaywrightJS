/**
 * Framework configuration
 * This file can be overridden in the project root to customize framework behavior
 */

module.exports = {
  /**
   * Framework settings
   */
  framework: {
    // Default timeout for all operations (in milliseconds)
    defaultTimeout: 30000,
    
    // Whether to enable self-healing locators
    selfHealingLocators: true,
    
    // Whether to capture screenshots on failure
    screenshotsOnFailure: true,
    
    // Whether to capture traces on failure
    tracesOnFailure: true,
    
    // Whether to generate HTML reports
    htmlReports: true,
    
    // Whether to enable accessibility testing
    accessibilityTesting: false,
    
    // Whether to enable visual testing
    visualTesting: false,
    
    // Whether to enable performance testing
    performanceTesting: false,
    
    // Whether to enable API testing
    apiTesting: true,
    
    // Whether to enable mobile testing
    mobileTesting: false,
    
    // Whether to enable Salesforce testing
    salesforceTesting: false,
  },
  
  /**
   * Reporting settings
   */
  reporting: {
    // Output directory for reports
    outputDir: './reports',
    
    // Report formats to generate
    formats: ['html', 'json'],
    
    // Whether to include screenshots in reports
    includeScreenshots: true,
    
    // Whether to include videos in reports
    includeVideos: false,
    
    // Whether to include traces in reports
    includeTraces: true,
    
    // Custom reporter options
    customReporters: [],
  },
  
  /**
   * Plugin settings
   */
  plugins: [
    // Add your plugins here
    // Example: { name: 'my-plugin', options: {} }
  ],
  
  /**
   * Custom settings
   * These can be used by your custom extensions
   */
  custom: {
    // Add your custom settings here
  }
};