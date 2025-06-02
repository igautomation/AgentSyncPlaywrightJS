/**
 * Plugin loader for the framework
 * Loads and initializes plugins defined in framework.config.js
 */

const path = require('path');
const fs = require('fs');
const logger = require('../common/logger');

class PluginLoader {
  constructor() {
    this.plugins = [];
    this.pluginInstances = {};
    this.frameworkConfig = null;
  }

  /**
   * Load framework configuration
   * @returns {Object} Framework configuration
   */
  loadConfig() {
    // Try to load user config from project root
    const userConfigPath = path.join(process.cwd(), 'framework.config.js');
    
    // Load default config
    const defaultConfigPath = path.join(__dirname, '../../config/framework.config.js');
    const defaultConfig = require(defaultConfigPath);
    
    // If user config exists, merge it with default config
    if (fs.existsSync(userConfigPath)) {
      try {
        const userConfig = require(userConfigPath);
        this.frameworkConfig = this.mergeConfigs(defaultConfig, userConfig);
        logger.info('Loaded custom framework configuration');
      } catch (error) {
        logger.error(`Error loading custom framework configuration: ${error.message}`);
        this.frameworkConfig = defaultConfig;
      }
    } else {
      this.frameworkConfig = defaultConfig;
    }
    
    return this.frameworkConfig;
  }

  /**
   * Merge default and user configs
   * @param {Object} defaultConfig - Default configuration
   * @param {Object} userConfig - User configuration
   * @returns {Object} Merged configuration
   */
  mergeConfigs(defaultConfig, userConfig) {
    const merged = { ...defaultConfig };
    
    // Merge top-level properties
    for (const key in userConfig) {
      if (typeof userConfig[key] === 'object' && !Array.isArray(userConfig[key]) && 
          typeof merged[key] === 'object' && !Array.isArray(merged[key])) {
        merged[key] = { ...merged[key], ...userConfig[key] };
      } else {
        merged[key] = userConfig[key];
      }
    }
    
    return merged;
  }

  /**
   * Load plugins from configuration
   */
  loadPlugins() {
    if (!this.frameworkConfig) {
      this.loadConfig();
    }
    
    const { plugins = [] } = this.frameworkConfig;
    
    for (const plugin of plugins) {
      try {
        this.loadPlugin(plugin);
      } catch (error) {
        logger.error(`Error loading plugin ${plugin.name}: ${error.message}`);
      }
    }
    
    return this.pluginInstances;
  }

  /**
   * Load a single plugin
   * @param {Object} pluginConfig - Plugin configuration
   */
  loadPlugin(pluginConfig) {
    const { name, options = {} } = pluginConfig;
    
    // Try to load from node_modules first
    try {
      const Plugin = require(name);
      const instance = new Plugin(options);
      this.pluginInstances[name] = instance;
      logger.info(`Loaded plugin: ${name}`);
      return instance;
    } catch (error) {
      // If not found in node_modules, try to load from custom plugins directory
      try {
        const customPluginPath = path.join(process.cwd(), 'custom/plugins', `${name}.js`);
        if (fs.existsSync(customPluginPath)) {
          const Plugin = require(customPluginPath);
          const instance = new Plugin(options);
          this.pluginInstances[name] = instance;
          logger.info(`Loaded custom plugin: ${name}`);
          return instance;
        } else {
          throw new Error(`Plugin ${name} not found`);
        }
      } catch (innerError) {
        throw innerError;
      }
    }
  }

  /**
   * Get a loaded plugin by name
   * @param {string} name - Plugin name
   * @returns {Object} Plugin instance
   */
  getPlugin(name) {
    return this.pluginInstances[name];
  }

  /**
   * Get all loaded plugins
   * @returns {Object} All plugin instances
   */
  getPlugins() {
    return this.pluginInstances;
  }
}

module.exports = new PluginLoader();