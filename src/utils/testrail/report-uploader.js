const TestRailAPI = require('./testrail-api');
const fs = require('fs');
const path = require('path');

class ReportUploader {
  constructor() {
    this.api = new TestRailAPI();
  }

  async uploadPlaywrightReport(runId) {
    try {
      const reportPath = './playwright-report/index.html';
      
      if (fs.existsSync(reportPath)) {
        await this.api.addAttachmentToRun(runId, reportPath);
        console.log('📊 Uploaded Playwright HTML report to TestRail run');
        return true;
      } else {
        console.log('⚠️ Playwright report not found at:', reportPath);
        return false;
      }
    } catch (error) {
      console.error('Failed to upload Playwright report:', error.message);
      return false;
    }
  }

  async uploadTestArtifacts(runId, testResultsDir = './test-results') {
    try {
      if (!fs.existsSync(testResultsDir)) {
        console.log('⚠️ Test results directory not found:', testResultsDir);
        return false;
      }

      const files = fs.readdirSync(testResultsDir, { recursive: true });
      let uploadCount = 0;

      for (const file of files) {
        const filePath = path.join(testResultsDir, file);
        
        if (fs.statSync(filePath).isFile() && 
            (file.endsWith('.png') || file.endsWith('.webm') || file.endsWith('.zip'))) {
          
          try {
            await this.api.addAttachmentToRun(runId, filePath);
            uploadCount++;
            console.log(`📎 Uploaded: ${path.basename(file)}`);
          } catch (error) {
            console.error(`Failed to upload ${file}:`, error.message);
          }
        }
      }

      console.log(`📁 Uploaded ${uploadCount} test artifacts to TestRail run`);
      return uploadCount > 0;
    } catch (error) {
      console.error('Failed to upload test artifacts:', error.message);
      return false;
    }
  }
}

module.exports = ReportUploader;