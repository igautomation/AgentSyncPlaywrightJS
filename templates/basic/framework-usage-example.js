/**
 * Framework Usage Examples
 * Demonstrates how to use all framework features when installed as dependency
 */

const { 
  utils, 
  assets, 
  FrameworkAssets,
  apiClient, 
  webInteractions, 
  salesforceUtils 
} = require('@your-org/playwright-framework');

// Example 1: Using Framework Scripts
async function useFrameworkScripts() {
  console.log('📜 Available Scripts:');
  const scripts = assets.listScripts();
  scripts.forEach(script => {
    console.log(`  - ${script.name}: ${script.path}`);
  });
  
  // Execute a framework script
  const { execSync } = require('child_process');
  const healthCheckScript = assets.getScript('utils/framework-health-check.js');
  // execSync(`node ${healthCheckScript}`);
}

// Example 2: Using Framework Data
async function useFrameworkData() {
  console.log('📊 Available Data Files:');
  const dataFiles = assets.listData();
  dataFiles.forEach(file => {
    console.log(`  - ${file.name}: ${file.path}`);
  });
  
  // Load test data
  const testDataPath = assets.getData('testData.json');
  // const testData = require(testDataPath);
}

// Example 3: Using Docker Configuration
async function useDockerConfig() {
  const dockerConfig = assets.getDockerConfig();
  console.log('🐳 Docker Configuration:');
  console.log(`  Dockerfile: ${dockerConfig.dockerfile}`);
  console.log(`  Compose: ${dockerConfig.compose}`);
  
  // Copy Docker files to your project
  // assets.copyAsset(dockerConfig.dockerfile, './Dockerfile');
  // assets.copyAsset(dockerConfig.compose, './docker-compose.yml');
}

// Example 4: Using GitHub Workflows
async function useGitHubWorkflows() {
  const workflowsPath = assets.getWorkflows();
  console.log('⚙️ GitHub Workflows available at:', workflowsPath);
  
  // Copy workflows to your project
  const fs = require('fs');
  const path = require('path');
  
  if (fs.existsSync(workflowsPath)) {
    const workflows = fs.readdirSync(workflowsPath);
    console.log('  Available workflows:');
    workflows.forEach(workflow => {
      console.log(`    - ${workflow}`);
    });
  }
}

// Example 5: Using Husky Hooks
async function useHuskyHooks() {
  const huskyPath = assets.getHuskyHooks();
  console.log('🐕 Husky hooks available at:', huskyPath);
  
  // Setup husky in your project
  // const { execSync } = require('child_process');
  // execSync('npm run setup:husky');
}

// Example 6: Using Framework Templates
async function useTemplates() {
  console.log('📋 Available Templates:');
  const templates = assets.listTemplates();
  templates.forEach(template => {
    console.log(`  - ${template.name}: ${template.path}`);
  });
  
  // Use CLI to initialize with template
  // execSync('npx playwright-framework init --template basic');
}

// Example 7: Using Framework Examples
async function useExamples() {
  console.log('💡 Available Examples:');
  const examples = assets.listExamples();
  examples.forEach(example => {
    console.log(`  - ${example.name}: ${example.path}`);
  });
}

// Example 8: Using All Utilities
async function useAllUtilities() {
  console.log('🛠️ Available Utilities:');
  Object.keys(utils).forEach(utilName => {
    const util = utils[utilName];
    if (util && typeof util === 'object') {
      console.log(`  ${utilName}:`, Object.keys(util));
    }
  });
}

// Run examples
async function runExamples() {
  console.log('🚀 Framework Feature Access Examples\n');
  
  await useFrameworkScripts();
  console.log('');
  
  await useFrameworkData();
  console.log('');
  
  await useDockerConfig();
  console.log('');
  
  await useGitHubWorkflows();
  console.log('');
  
  await useHuskyHooks();
  console.log('');
  
  await useTemplates();
  console.log('');
  
  await useExamples();
  console.log('');
  
  await useAllUtilities();
  
  console.log('\n✅ All framework features are accessible!');
}

// Export for use in tests
module.exports = {
  useFrameworkScripts,
  useFrameworkData,
  useDockerConfig,
  useGitHubWorkflows,
  useHuskyHooks,
  useTemplates,
  useExamples,
  useAllUtilities,
  runExamples
};

// Run if called directly
if (require.main === module) {
  runExamples().catch(console.error);
}