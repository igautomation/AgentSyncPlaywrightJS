/**
 * Global teardown for Playwright tests
 * 
 * This file runs once after all tests complete
 */
const fs = require('fs').promises;
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

/**
 * Global teardown function
 */
async function globalTeardown(config) {
  console.log('Starting global teardown...');
  
  // Clean up temporary files if needed
  if (process.env.CLEANUP_TEMP === 'true') {
    await cleanupTempFiles();
  }
  
  // Generate consolidated reports if needed
  if (process.env.GENERATE_REPORTS === 'true') {
    await generateReports();
  }
  
  console.log('Global teardown completed successfully');
}

/**
 * Clean up temporary files
 */
async function cleanupTempFiles() {
  console.log('Cleaning up temporary files...');
  
  try {
    // List all files in temp directory
    const tempDir = path.resolve('./temp');
    const files = await fs.readdir(tempDir);
    
    // Delete each file
    for (const file of files) {
      await fs.unlink(path.join(tempDir, file));
    }
    
    console.log(`Cleaned up ${files.length} temporary files`);
  } catch (error) {
    console.error('Error cleaning up temporary files:', error);
  }
}

/**
 * Generate consolidated reports
 */
async function generateReports() {
  console.log('Generating consolidated reports...');
  
  try {
    // Check if reporting utilities are available
    const reportingUtils = require('../reporting/reportingUtils');
    
    // Generate HTML report
    await reportingUtils.generateHtmlReport(
      './reports/test-results.json',
      './reports/consolidated-report.html'
    );
    
    // Generate Markdown report
    await reportingUtils.generateMarkdownReport(
      './reports/test-results.json',
      './reports/test-summary.md'
    );
    
    console.log('Reports generated successfully');
  } catch (error) {
    console.error('Error generating reports:', error);
  }
}

module.exports = globalTeardown;