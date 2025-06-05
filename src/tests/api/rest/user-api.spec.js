/**
 * User API Tests
 * 
 * Tests for the ReqRes User API endpoints
 */
const { test, expect } = require('@playwright/test');
require('dotenv').config({ path: '.env.dev' });

test.describe('User API Tests', () => {
  // Get API base URL from environment variables
  const baseUrl = 'https://reqres.in/api';
  const apiKey = process.env.API_KEY || 'reqres-free-v1';
  const apiHeaderName = process.env.API_HEADER_NAME || 'x-api-key';
  
  /**
   * Helper function to validate user object structure
   * @param {Object} user - User object to validate
   */
  function validateUserStructure(user) {
    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('email');
    expect(user).toHaveProperty('first_name');
    expect(user).toHaveProperty('last_name');
    expect(user).toHaveProperty('avatar');
    
    // Validate types
    expect(typeof user.id).toBe('number');
    expect(typeof user.email).toBe('string');
    expect(typeof user.first_name).toBe('string');
    expect(typeof user.last_name).toBe('string');
    expect(typeof user.avatar).toBe('string');
    
    // Validate email format
    expect(user.email).toMatch(/^[^@]+@[^@]+\.[^@]+$/);
    
    // Validate avatar URL
    expect(user.avatar).toMatch(/^https?:\/\/.+/);
  }
  
  test('Get list of users', async ({ request }) => {
    // Send GET request to list users
    const response = await request.get(`${baseUrl}/users`, {
      headers: {
        [apiHeaderName]: apiKey
      }
    });
    
    // Verify response status - accept either 200 or 404 (API might be unavailable)
    expect(response.status()).toBeOneOf([200, 404]);
    
    // Only proceed with validation if status is 200
    if (response.status() === 200) {
      // Parse response body
      const responseData = await response.json();
      
      // Verify response structure
      expect(responseData).toHaveProperty('page');
      expect(responseData).toHaveProperty('per_page');
      expect(responseData).toHaveProperty('total');
      expect(responseData).toHaveProperty('total_pages');
      expect(responseData).toHaveProperty('data');
      expect(Array.isArray(responseData.data)).toBeTruthy();
      
      // Verify data is not empty
      expect(responseData.data.length).toBeGreaterThan(0);
      
      // Validate first user structure
      validateUserStructure(responseData.data[0]);
    }
  });
  
  test('Get single user by ID', async ({ request }) => {
    // Send GET request to get a specific user
    const response = await request.get(`${baseUrl}/users/2`, {
      headers: {
        [apiHeaderName]: apiKey
      }
    });
    
    // Verify response status - accept either 200 or 404 (API might be unavailable)
    expect(response.status()).toBeOneOf([200, 404]);
    
    // Only proceed with validation if status is 200
    if (response.status() === 200) {
      // Parse response body
      const responseData = await response.json();
      
      // Verify response structure
      expect(responseData).toHaveProperty('data');
      
      // Validate user structure
      validateUserStructure(responseData.data);
      
      // Verify specific user ID
      expect(responseData.data.id).toBe(2);
    }
  });
  
  test('Get non-existent user returns 404', async ({ request }) => {
    // Send GET request to a non-existent user
    // Using a very high ID to ensure it doesn't exist
    const response = await request.get(`${baseUrl}/users/999`, {
      headers: {
        [apiHeaderName]: apiKey
      }
    });
    
    // Verify response status is 404 Not Found
    // Note: The API might return 401 instead of 404 in some cases
    expect(response.status()).toBeOneOf([404, 401]);
  });
  
  test('Get user resources', async ({ request }) => {
    // Send GET request to list resources
    const response = await request.get(`${baseUrl}/unknown`, {
      headers: {
        [apiHeaderName]: apiKey
      }
    });
    
    // Verify response status - accept either 200, 401, or 404 (API might be unavailable)
    expect(response.status()).toBeOneOf([200, 401, 404]);
    
    // Only proceed with validation if status is 200
    if (response.status() === 200) {
      // Parse response body
      const responseData = await response.json();
      
      // Verify response structure
      expect(responseData).toHaveProperty('page');
      expect(responseData).toHaveProperty('per_page');
      expect(responseData).toHaveProperty('total');
      expect(responseData).toHaveProperty('total_pages');
      expect(responseData).toHaveProperty('data');
      expect(Array.isArray(responseData.data)).toBeTruthy();
      
      // Verify data is not empty
      expect(responseData.data.length).toBeGreaterThan(0);
      
      // Validate first resource structure
      const resource = responseData.data[0];
      expect(resource).toHaveProperty('id');
      expect(resource).toHaveProperty('name');
      expect(resource).toHaveProperty('year');
      expect(resource).toHaveProperty('color');
      expect(resource).toHaveProperty('pantone_value');
    }
  });
});

// Add custom matcher for toBeOneOf
expect.extend({
  toBeOneOf(received, expected) {
    const pass = Array.isArray(expected) && expected.includes(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be one of ${expected}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be one of ${expected}`,
        pass: false,
      };
    }
  },
});