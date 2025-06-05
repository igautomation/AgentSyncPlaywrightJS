/**
 * Logger utility
 * 
 * Provides consistent logging with appropriate formatting and levels
 */
const fs = require('fs');
const path = require('path');
const { maskSensitiveData } = require('../security/dataProtection');

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log file path
const logFile = path.join(logsDir, `test-run-${new Date().toISOString().replace(/:/g, '-')}.log`);

// Log levels
const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

// Current log level (can be set via environment variable)
const currentLogLevel = process.env.LOG_LEVEL || LOG_LEVELS.INFO;

// Log level priority
const LOG_LEVEL_PRIORITY = {
  [LOG_LEVELS.ERROR]: 0,
  [LOG_LEVELS.WARN]: 1,
  [LOG_LEVELS.INFO]: 2,
  [LOG_LEVELS.DEBUG]: 3
};

/**
 * Write log entry to console and file
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {Object} [data] - Additional data to log
 */
function log(level, message, data) {
  // Check if we should log this level
  if (LOG_LEVEL_PRIORITY[level] > LOG_LEVEL_PRIORITY[currentLogLevel]) {
    return;
  }
  
  // Format timestamp
  const timestamp = new Date().toISOString();
  
  // Format message
  let formattedMessage = `${timestamp} [${level}]: ${message}`;
  
  // Add data if provided
  if (data) {
    try {
      formattedMessage += `\n${JSON.stringify(data, null, 2)}`;
    } catch (error) {
      formattedMessage += `\n[Data could not be stringified: ${error.message}]`;
    }
  }
  
  // Mask sensitive data
  const maskedMessage = maskSensitiveData(formattedMessage);
  
  // Log to console with color
  const consoleMessage = getColoredMessage(level, maskedMessage);
  console.log(consoleMessage);
  
  // Log to file
  fs.appendFileSync(logFile, maskedMessage + '\n');
}

/**
 * Add color to console messages
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @returns {string} - Colored message
 */
function getColoredMessage(level, message) {
  const colors = {
    [LOG_LEVELS.ERROR]: '\x1b[31m', // Red
    [LOG_LEVELS.WARN]: '\x1b[33m',  // Yellow
    [LOG_LEVELS.INFO]: '\x1b[32m',  // Green
    [LOG_LEVELS.DEBUG]: '\x1b[36m', // Cyan
    RESET: '\x1b[0m'
  };
  
  // Replace the level in the message with a colored version
  return message.replace(`[${level}]`, `${colors[level]}[${level}]${colors.RESET}`);
}

// Export logger functions
module.exports = {
  error: (message, data) => log(LOG_LEVELS.ERROR, message, data),
  warn: (message, data) => log(LOG_LEVELS.WARN, message, data),
  info: (message, data) => log(LOG_LEVELS.INFO, message, data),
  debug: (message, data) => log(LOG_LEVELS.DEBUG, message, data)
};