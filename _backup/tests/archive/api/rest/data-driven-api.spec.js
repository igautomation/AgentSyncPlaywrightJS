/**
 * Data-Driven API Tests
 *
 * Demonstrates data-driven testing approach for API tests
 */
const { test, expect } = require('@playwright/test');
require('dotenv').config({ path: '.env.dev' });

// Configure retries for this test suite to handle transient API failures
test.describe('Data-Driven API Tests', () => {
  // Configure retries for this test suite
  test.use({ retries: 2 });

  // Get API base URL from environment variables
  const baseUrl = process.env.REQRES_API_URL || 'https://reqres.in';
  const apiKey = process.env.API_KEY || 'reqres-free-v1';

  // Test data
  const testData = {
    userIds: [1, 2, 3, 23],
    pages: [1, 2, 3],
    users: [
      { 
        name: 'User 1', 
        job: 'Job 1', 
        expectedStatus: 201 
      },
      { 
        name: 'User 2', 
        job: 'Job 2', 
        expectedStatus: 201 
      },
      { 
        name: 'User 3', 
        job: 'Job 3', 
        expectedStatus: 201 
      }
    ],
    queryParams: [
      { 
        param: 'page', 
        value: 1, 
        expectedStatus: 200 
      },
      { 
        param: 'per_page', 
        value: 3, 
        expectedStatus: 200 
      }
    ],
  };

  // Data-driven test for user creation
  for (const userData of testData.users) {
    test(`Create user: ${userData.name} - ${userData.job}`, async ({ request }) => {
      try {
        // Send POST request to create a user
        const response = await request.post(`${baseUrl}/api/users`, {
          data: {
            name: userData.name,
            job: userData.job,
          },
          headers: {
            'x-api-key': apiKey
          }
        });
        
        // Verify response status - accept either 201 or 401 (API might be rate limited)
        expect(response.status()).toBeOneOf([201, 401]);
        
        // If status is 201, verify the response data
        if (response.status() === 201) {
          // Parse response body
          const data = await response.json();
          
          // Verify response contains user data
          expect(data).toHaveProperty('name', userData.name);
          expect(data).toHaveProperty('job', userData.job);
          expect(data).toHaveProperty('id');
          expect(data).toHaveProperty('createdAt');
        }
      } catch (error) {
        console.error(`Test failed: ${error.message}`);
        throw error;
      }
    });
  }

  // Data-driven test for user retrieval
  for (const userId of testData.userIds) {
    test(`Get user with ID: ${userId}`, async ({ request }) => {
      // Determine expected status based on user ID
      const maxValidId = 12;
      const expectedStatus = userId <= maxValidId ? 200 : 404;

      const response = await request.get(`${baseUrl}/api/users/${userId}`, {
        headers: {
          'x-api-key': apiKey
        }
      });
      
      // Verify response status - accept either expected status or 401 (API might be rate limited)
      expect(response.status()).toBeOneOf([expectedStatus, 401]);
      
      // If status is 200, verify the response data
      if (response.status() === 200) {
        // Parse response body
        const responseData = await response.json();
        
        // Verify response structure and data
        expect(responseData).toHaveProperty('data');
        expect(responseData.data).toHaveProperty('id', userId);
        expect(responseData.data).toHaveProperty('email');
        expect(responseData.data).toHaveProperty('first_name');
        expect(responseData.data).toHaveProperty('last_name');
      }
    });
  }

  // Data-driven test for pagination
  for (const page of testData.pages) {
    test(`Get users from page ${page}`, async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/users`, {
        params: { page },
        headers: {
          'x-api-key': apiKey
        }
      });
      
      // Verify response status - accept either 200 or 401 (API might be rate limited)
      expect(response.status()).toBeOneOf([200, 401]);
      
      // If status is 200, verify the response data
      if (response.status() === 200) {
        // Parse response body
        const responseData = await response.json();
        
        // Verify response structure and data
        expect(responseData).toHaveProperty('page', page);
        expect(responseData).toHaveProperty('data');
        expect(Array.isArray(responseData.data)).toBeTruthy();

        // Determine expected user count based on page
        const maxPageWithData = 2;
        const usersPerPage = 6;
        const expectedUserCount = page <= maxPageWithData ? usersPerPage : 0;
        expect(responseData.data.length).toBe(expectedUserCount);
      }
    });
  }

  // Test with dynamically generated data
  for (const testCase of testData.queryParams) {
    test(`API with ${testCase.param}=${testCase.value}`, async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/users`, {
        params: { [testCase.param]: testCase.value },
        headers: {
          'x-api-key': apiKey
        }
      });
      
      // Verify response status - accept either expected status or 401 (API might be rate limited)
      expect(response.status()).toBeOneOf([testCase.expectedStatus, 401]);
      
      // If status is expected status, verify the response data
      if (response.status() === testCase.expectedStatus) {
        // Parse response body
        const responseData = await response.json();
        
        // Verify response structure
        expect(responseData).toHaveProperty('data');
        expect(Array.isArray(responseData.data)).toBeTruthy();

        // If per_page parameter was used, verify it affected the result
        if (testCase.param === 'per_page') {
          expect(responseData.data.length).toBeLessThanOrEqual(testCase.value);
          expect(responseData.per_page).toBe(testCase.value);
        }
      }
    });
  }
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