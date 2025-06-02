/**
 * Development environment configuration
 */
module.exports = {
  // Base URL for the application
  baseURL: 'https://dev.example.com',
  
  // API configuration
  api: {
    baseURL: 'https://api.dev.example.com',
    timeout: 30000,
    retries: 2
  },
  
  // Salesforce configuration
  salesforce: {
    instanceURL: 'https://dev-ed.lightning.force.com',
    apiVersion: 'v62.0'
  },
  
  // Test data configuration
  testData: {
    useRealData: true,
    seedDatabase: false
  },
  
  // Browser configuration
  browser: {
    headless: false,
    slowMo: 0,
    defaultViewport: { width: 1280, height: 720 }
  },
  
  // Logging configuration
  logging: {
    level: 'info',
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
  }
};