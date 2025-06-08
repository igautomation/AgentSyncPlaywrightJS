/**
 * Helper utilities for Playwright tests
 */

const fs = require('fs');
const path = require('path');

/**
 * Wait for a condition to be true
 * @param {Function} conditionFn - Function that returns a boolean
 * @param {Object} options - Options
 * @param {number} options.timeout - Timeout in milliseconds
 * @param {number} options.interval - Polling interval in milliseconds
 * @returns {Promise<boolean>} - True if condition was met, false if timed out
 */
async function waitForCondition(conditionFn, { timeout = 30000, interval = 500 } = {}) {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    if (await conditionFn()) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  
  return false;
}

/**
 * Generate a random string
 * @param {number} length - Length of the string
 * @returns {string} - Random string
 */
function randomString(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Create a directory if it doesn't exist
 * @param {string} dirPath - Directory path
 */
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Format a date as YYYY-MM-DD
 * @param {Date} date - Date to format
 * @returns {string} - Formatted date
 */
function formatDate(date = new Date()) {
  return date.toISOString().split('T')[0];
}

/**
 * Retry a function until it succeeds or times out
 * @param {Function} fn - Function to retry
 * @param {Object} options - Options
 * @param {number} options.retries - Number of retries
 * @param {number} options.delay - Delay between retries in milliseconds
 * @returns {Promise<any>} - Result of the function
 */
async function retry(fn, { retries = 3, delay = 1000 } = {}) {
  let lastError;
  
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

module.exports = {
  waitForCondition,
  randomString,
  ensureDirectoryExists,
  formatDate,
  retry
};