/**
 * Framework configuration
 * Override default settings for the framework
 */
module.exports = {
  framework: {
    // Default timeout for all operations (in milliseconds)
    defaultTimeout: 30000,
    
    // Whether to enable self-healing locators
    selfHealingLocators: true,
    
    // Whether to capture screenshots on failure
    screenshotsOnFailure: true,
    
    // Whether to capture traces on failure
    tracesOnFailure: true,
  },
  
  reporting: {
    // Output directory for reports
    outputDir: './reports',
    
    // Report formats to generate
    formats: ['html', 'json'],
  },
  
  // Add your custom plugins here
  plugins: [
    // Example: { name: 'my-custom-plugin', options: { key: 'value' } }
  ],
  
  // Add your custom settings here
  custom: {
    // Example: projectName: 'My Test Project'
  }
};