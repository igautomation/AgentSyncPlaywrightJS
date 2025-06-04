#!/usr/bin/env node
/**
 * Naming Convention Checker
 * 
 * This script checks and enforces naming conventions across the codebase
 */
const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

// Define naming conventions
const NAMING_CONVENTIONS = {
  pages: {
    pattern: /^[A-Z][a-zA-Z0-9]*Page\.js$/,
    description: 'Page objects should be named like EntityNamePage.js'
  },
  tests: {
    pattern: /^[a-z][a-zA-Z0-9]*\.spec\.js$/,
    description: 'Test files should be named like feature-name.spec.js'
  },
  utils: {
    pattern: /^[a-z][a-zA-Z0-9]*Utils\.js$/,
    description: 'Utility files should be named like utilityNameUtils.js'
  }
};

// Directories to check
const DIRECTORIES = {
  pages: path.resolve(process.cwd(), 'src/pages'),
  tests: path.resolve(process.cwd(), 'src/tests'),
  utils: path.resolve(process.cwd(), 'src/utils')
};

// Files to ignore (redirects, etc.)
const IGNORED_FILES = [
  'BasePage.js',
  'index.js',
  'README.md'
];

async function main() {
  console.log('🔍 Checking naming conventions...\n');
  
  let violations = [];
  
  // Check page objects
  violations = violations.concat(await checkDirectory(
    DIRECTORIES.pages,
    NAMING_CONVENTIONS.pages.pattern,
    NAMING_CONVENTIONS.pages.description,
    ['components', 'locators']
  ));
  
  // Check test files
  violations = violations.concat(await checkDirectory(
    DIRECTORIES.tests,
    NAMING_CONVENTIONS.tests.pattern,
    NAMING_CONVENTIONS.tests.description,
    []
  ));
  
  // Check utility files
  violations = violations.concat(await checkDirectory(
    DIRECTORIES.utils,
    NAMING_CONVENTIONS.utils.pattern,
    NAMING_CONVENTIONS.utils.description,
    ['common', 'api', 'web', 'setup']
  ));
  
  // Print results
  if (violations.length === 0) {
    console.log('✅ All files follow naming conventions!');
  } else {
    console.log(`❌ Found ${violations.length} naming convention violations:\n`);
    
    violations.forEach((violation, index) => {
      console.log(`${index + 1}. ${violation.file}`);
      console.log(`   Expected: ${violation.convention}`);
      console.log(`   Suggested: ${violation.suggestion || 'N/A'}\n`);
    });
    
    console.log('Run this script with --fix to automatically rename files.');
  }
  
  // Fix violations if requested
  if (process.argv.includes('--fix')) {
    await fixViolations(violations);
  }
}

/**
 * Check a directory for naming convention violations
 */
async function checkDirectory(directory, pattern, convention, ignoredSubdirs) {
  const violations = [];
  
  try {
    const entries = await fs.readdir(directory, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);
      
      if (entry.isDirectory()) {
        // Skip ignored subdirectories
        if (!ignoredSubdirs.includes(entry.name)) {
          // Recursively check subdirectories
          const subViolations = await checkDirectory(fullPath, pattern, convention, ignoredSubdirs);
          violations.push(...subViolations);
        }
      } else if (entry.isFile()) {
        // Skip ignored files
        if (!IGNORED_FILES.includes(entry.name) && entry.name.endsWith('.js')) {
          // Check if file name matches the pattern
          if (!pattern.test(entry.name)) {
            // Generate a suggested name
            const suggestion = generateSuggestion(entry.name, pattern);
            
            violations.push({
              file: fullPath,
              convention,
              suggestion
            });
          }
        }
      }
    }
  } catch (error) {
    console.error(`Error checking directory ${directory}:`, error);
  }
  
  return violations;
}

/**
 * Generate a suggested name based on the pattern
 */
function generateSuggestion(fileName, pattern) {
  // Extract base name without extension
  const baseName = path.basename(fileName, '.js');
  
  if (pattern.toString().includes('Page.js')) {
    // For page objects
    if (baseName.endsWith('Page')) {
      return fileName; // Already has Page suffix
    }
    return baseName.charAt(0).toUpperCase() + baseName.slice(1) + 'Page.js';
  } else if (pattern.toString().includes('.spec.js')) {
    // For test files
    if (baseName.endsWith('.spec')) {
      return fileName; // Already has .spec suffix
    }
    return baseName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '.spec.js';
  } else if (pattern.toString().includes('Utils.js')) {
    // For utility files
    if (baseName.endsWith('Utils')) {
      return fileName; // Already has Utils suffix
    }
    return baseName.charAt(0).toLowerCase() + baseName.slice(1) + 'Utils.js';
  }
  
  return null;
}

/**
 * Fix naming convention violations
 */
async function fixViolations(violations) {
  console.log('🔧 Fixing naming convention violations...\n');
  
  let fixed = 0;
  
  for (const violation of violations) {
    if (violation.suggestion) {
      const directory = path.dirname(violation.file);
      const oldName = path.basename(violation.file);
      const newName = violation.suggestion;
      const newPath = path.join(directory, newName);
      
      try {
        // Rename the file
        await fs.rename(violation.file, newPath);
        
        // Update imports in other files
        updateImports(oldName, newName);
        
        console.log(`✅ Renamed: ${oldName} -> ${newName}`);
        fixed++;
      } catch (error) {
        console.error(`❌ Failed to rename ${oldName}:`, error);
      }
    }
  }
  
  console.log(`\n✅ Fixed ${fixed} out of ${violations.length} violations.`);
}

/**
 * Update imports in other files
 */
function updateImports(oldName, newName) {
  try {
    // Use grep to find files that import the renamed file
    const grepCommand = `grep -r "require.*${oldName.replace('.js', '')}" --include="*.js" src`;
    const files = execSync(grepCommand, { encoding: 'utf8' }).split('\n');
    
    for (const line of files) {
      if (!line) continue;
      
      // Extract file path
      const filePath = line.split(':')[0];
      
      // Replace the import in the file
      const sedCommand = `sed -i '' 's/require.*${oldName.replace('.js', '')}/require('.\\/${newName.replace('.js', '')}')/g' ${filePath}`;
      execSync(sedCommand);
    }
  } catch (error) {
    // Grep returns non-zero exit code if no matches found, which is fine
    if (!error.message.includes('grep')) {
      console.error('Error updating imports:', error);
    }
  }
}

// Run the script
main().catch(console.error);