/**
 * Framework Assets Access
 * Provides access to all framework resources including scripts, data, configs, etc.
 */

const path = require('path');
const fs = require('fs');

class FrameworkAssets {
  constructor() {
    this.frameworkRoot = path.resolve(__dirname, '..');
  }

  /**
   * Get path to framework scripts
   * @param {string} scriptName - Script name or path
   * @returns {string} Full path to script
   */
  getScript(scriptName) {
    return path.join(this.frameworkRoot, 'scripts', scriptName);
  }

  /**
   * Get path to framework data files
   * @param {string} dataFile - Data file name or path
   * @returns {string} Full path to data file
   */
  getData(dataFile) {
    return path.join(this.frameworkRoot, 'data', dataFile);
  }

  /**
   * Get path to framework configs
   * @param {string} configFile - Config file name
   * @returns {string} Full path to config file
   */
  getConfig(configFile) {
    return path.join(this.frameworkRoot, 'config', configFile);
  }

  /**
   * Get path to framework templates
   * @param {string} templateName - Template name
   * @returns {string} Full path to template
   */
  getTemplate(templateName) {
    return path.join(this.frameworkRoot, 'templates', templateName);
  }

  /**
   * Get path to framework examples
   * @param {string} exampleName - Example name
   * @returns {string} Full path to example
   */
  getExample(exampleName) {
    return path.join(this.frameworkRoot, 'examples', exampleName);
  }

  /**
   * Get Docker configuration
   * @returns {Object} Docker config paths
   */
  getDockerConfig() {
    return {
      dockerfile: path.join(this.frameworkRoot, 'Dockerfile'),
      compose: path.join(this.frameworkRoot, 'docker-compose.yml')
    };
  }

  /**
   * Get GitHub workflows
   * @returns {string} Path to workflows directory
   */
  getWorkflows() {
    return path.join(this.frameworkRoot, '.github', 'workflows');
  }

  /**
   * Get Husky hooks
   * @returns {string} Path to husky directory
   */
  getHuskyHooks() {
    return path.join(this.frameworkRoot, '.husky');
  }

  /**
   * Copy framework asset to target location
   * @param {string} assetPath - Source asset path
   * @param {string} targetPath - Target path
   */
  copyAsset(assetPath, targetPath) {
    if (fs.existsSync(assetPath)) {
      fs.copyFileSync(assetPath, targetPath);
      return true;
    }
    return false;
  }

  /**
   * List available scripts
   * @returns {Array} List of available scripts
   */
  listScripts() {
    const scriptsDir = path.join(this.frameworkRoot, 'scripts');
    return this._listDirectory(scriptsDir);
  }

  /**
   * List available data files
   * @returns {Array} List of available data files
   */
  listData() {
    const dataDir = path.join(this.frameworkRoot, 'data');
    return this._listDirectory(dataDir);
  }

  /**
   * List available templates
   * @returns {Array} List of available templates
   */
  listTemplates() {
    const templatesDir = path.join(this.frameworkRoot, 'templates');
    return this._listDirectory(templatesDir);
  }

  /**
   * List available examples
   * @returns {Array} List of available examples
   */
  listExamples() {
    const examplesDir = path.join(this.frameworkRoot, 'examples');
    return this._listDirectory(examplesDir);
  }

  /**
   * Helper method to list directory contents
   * @private
   */
  _listDirectory(dirPath) {
    try {
      if (fs.existsSync(dirPath)) {
        return fs.readdirSync(dirPath, { withFileTypes: true })
          .map(dirent => ({
            name: dirent.name,
            isDirectory: dirent.isDirectory(),
            path: path.join(dirPath, dirent.name)
          }));
      }
      return [];
    } catch (error) {
      console.warn(`Warning: Could not list directory ${dirPath}:`, error.message);
      return [];
    }
  }
}

module.exports = FrameworkAssets;