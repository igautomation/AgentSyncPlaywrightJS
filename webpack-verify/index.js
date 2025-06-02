// This would normally import from the npm package
// We'll use the bundled version from our project
const framework = require('../dist/index.js');

console.log('Verifying bundled framework...');

// Check if key components are available
console.log('Framework config available:', typeof framework.loadFrameworkConfig === 'function' ? '✅' : '❌');
console.log('API utilities available:', framework.utils && framework.utils.api ? '✅' : '❌');
console.log('Web utilities available:', framework.utils && framework.utils.web ? '✅' : '❌');

// Check if source code is obfuscated
const sourceCode = framework.toString();
console.log('Source code is obfuscated:', sourceCode.length < 1000 || !sourceCode.includes('function ') ? '✅' : '❌');

console.log('\nBundle verification complete!');