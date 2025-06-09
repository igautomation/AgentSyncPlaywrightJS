/**
 * Simple script to create a bundle
 */
const fs = require('fs');
const path = require('path');

// Create dist directory if it doesn't exist
const distDir = path.join(process.cwd(), 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Create a simple bundle file
const bundleContent = `
/**
 * Playwright Framework Bundle
 * Generated: ${new Date().toISOString()}
 */
module.exports = {
  version: '1.0.0',
  name: 'playwright-framework',
  description: 'Playwright Test Framework Bundle'
};
`;

// Write the bundle file
fs.writeFileSync(path.join(distDir, 'bundle.js'), bundleContent);

console.log('Bundle created successfully!');