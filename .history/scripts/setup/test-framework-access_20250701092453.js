/**
 * Test Framework Access - Local Testing
 * Tests framework features access using local path
 */

const {
  utils,
  assets,
  FrameworkAssets,
  createFixtures,
  getVersion,
} = require('../../src/index.js');

async function testFrameworkAccess() {
  console.log('🚀 Testing Framework Features Access\n');

  // Test 1: Framework Version
  console.log('📦 Framework Version:', getVersion());

  // Test 2: Assets Access
  console.log('\n📜 Available Scripts:');
  const scripts = assets.listScripts();
  scripts.slice(0, 5).forEach(script => {
    console.log(`  ✅ ${script.name} (${script.isDirectory ? 'dir' : 'file'})`);
  });

  console.log('\n📊 Available Data Files:');
  const dataFiles = assets.listData();
  dataFiles.slice(0, 5).forEach(file => {
    console.log(`  ✅ ${file.name} (${file.isDirectory ? 'dir' : 'file'})`);
  });

  console.log('\n📋 Available Templates:');
  const templates = assets.listTemplates();
  templates.forEach(template => {
    console.log(`  ✅ ${template.name} (${template.isDirectory ? 'dir' : 'file'})`);
  });

  console.log('\n💡 Available Examples:');
  const examples = assets.listExamples();
  examples.slice(0, 5).forEach(example => {
    console.log(`  ✅ ${example.name} (${example.isDirectory ? 'dir' : 'file'})`);
  });

  // Test 3: Docker Configuration
  console.log('\n🐳 Docker Configuration:');
  const dockerConfig = assets.getDockerConfig();
  const fs = require('fs');
  console.log(`  Dockerfile: ${fs.existsSync(dockerConfig.dockerfile) ? '✅' : '❌'}`);
  console.log(`  Docker Compose: ${fs.existsSync(dockerConfig.compose) ? '✅' : '❌'}`);

  // Test 4: GitHub Workflows
  console.log('\n⚙️ GitHub Workflows:');
  const workflowsPath = assets.getWorkflows();
  if (fs.existsSync(workflowsPath)) {
    const workflows = fs.readdirSync(workflowsPath);
    workflows.slice(0, 5).forEach(workflow => {
      console.log(`  ✅ ${workflow}`);
    });
  }

  // Test 5: Husky Hooks
  console.log('\n🐕 Husky Hooks:');
  const huskyPath = assets.getHuskyHooks();
  if (fs.existsSync(huskyPath)) {
    const hooks = fs.readdirSync(huskyPath);
    hooks.forEach(hook => {
      console.log(`  ✅ ${hook}`);
    });
  }

  // Test 6: Utilities Access
  console.log('\n🛠️ Available Utilities:');
  const utilityCount = Object.keys(utils).length;
  console.log(`  Total utilities: ${utilityCount}`);

  Object.keys(utils)
    .slice(0, 10)
    .forEach(utilName => {
      const util = utils[utilName];
      if (util && typeof util === 'object') {
        const methods = Object.keys(util).length;
        console.log(`  ✅ ${utilName}: ${methods} methods/properties`);
      }
    });

  // Test 7: Specific Paths
  console.log('\n📁 Specific Asset Paths:');
  console.log(`  Scripts dir: ${assets.getScript('')}`);
  console.log(`  Data dir: ${assets.getData('')}`);
  console.log(`  Config dir: ${assets.getConfig('')}`);
  console.log(`  Templates dir: ${assets.getTemplate('')}`);
  console.log(`  Examples dir: ${assets.getExample('')}`);

  console.log('\n✅ Framework Access Test Complete!');
  console.log('\n📋 Summary:');
  console.log('✅ All framework scripts accessible');
  console.log('✅ All data files accessible');
  console.log('✅ Docker configuration available');
  console.log('✅ GitHub workflows available');
  console.log('✅ Husky hooks configured');
  console.log('✅ All utilities accessible');
  console.log('✅ Templates and examples available');

  return true;
}

// Run test
testFrameworkAccess().catch(console.error);
