
#!/usr/bin/env node
const { program } = require('commander');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

program
  .version(require('../package.json').version)
  .description('Playwright Framework CLI');

program
  .command('init')
  .description('Initialize a new test project')
  .action(() => {
    console.log('Creating new test project...');
    const sampleDir = path.join(__dirname, '../sample');
    const targetDir = process.cwd();
    
    // Copy sample files
    fs.cpSync(sampleDir, targetDir, { recursive: true });
    console.log('Project initialized successfully!');
  });

program.parse(process.argv);
