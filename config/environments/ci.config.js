/**
 * CI environment configuration
 */
module.exports = {
  // Base URL for the application
  baseURL: 'https://ci.example.com',
  
  // API configuration
  api: {
    baseURL: 'https://api.ci.example.com',
    timeout: 60000,
    retries: 3
  },
  
  // Salesforce configuration
  salesforce: {
    instanceURL: 'https://ci-ed.lightning.force.com',
    apiVersion: 'v62.0'
  },
  
  // Test data configuration
  testData: {
    useRealData: false,
    seedDatabase: true
  },
  
  // Browser configuration
  browser: {
    headless: true,
    slowMo: 0,
    defaultViewport: { width: 1280, height: 720 }
  },
  
  // Logging configuration
  logging: {
    level: 'verbose',
    captureConsole: true,
    captureNetwork: true
  },
  
  // Screenshot configuration
  screenshots: {
    takeOnFailure: true,
    fullPage: true
  },
  
  // Video configuration
  video: {
    record: 'on-first-retry',
    size: { width: 1280, height: 720 }
  },
  
  // Trace configuration
  trace: {
    mode: 'on-first-retry',
    screenshots: true,
    snapshots: true
  },
  
  // CI-specific configuration
  ci: {
    parallelExecutions: 4,
    timeoutMultiplier: 1.5,
    artifactPath: './artifacts'
  }
};