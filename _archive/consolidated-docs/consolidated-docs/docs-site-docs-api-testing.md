<!-- Source: /Users/mzahirudeen/playwright-framework-dev/docs-site/docs/api-testing.md -->

---
sidebar_position: 3
title: API Testing
description: Guide to API testing with the Playwright framework
---

# API Testing

This guide covers how to use our framework for API testing, including REST, GraphQL, and schema validation.

## API Client

Our framework includes a robust API client for testing REST APIs:

```javascript
const { ApiClient } = require('../../utils/api');

// Create API client
const apiClient = new ApiClient({
  baseUrl: 'https://api.example.com',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Make GET request
const users = await apiClient.get('/users');

// Make POST request
const newUser = await apiClient.post('/users', {
  name: 'John Doe',
  email: 'john@example.com'
});

// Make PUT request
await apiClient.put(`/users/${userId}`, {
  name: 'John Updated'
});

// Make PATCH request
await apiClient.patch(`/users/${userId}`, {
  status: 'active'
});

// Make DELETE request
await apiClient.delete(`/users/${userId}`);
```

## Schema Validation

Our framework includes JSON schema validation for API responses:

```javascript
const { SchemaValidator } = require('../../utils/api');

// Create schema validator
const validator = new SchemaValidator();

// Define schema
const userSchema = {
  type: 'object',
  required: ['id', 'name', 'email'],
  properties: {
    id: { type: 'integer' },
    name: { type: 'string' },
    email: { type: 'string', format: 'email' },
    status: { type: 'string', enum: ['active', 'inactive'] }
  }
};

// Validate response
const response = await apiClient.get('/users/1');
const result = validator.validate(userSchema, response);

if (!result.valid) {
  console.error('Validation errors:', result.errors);
}
```

## Data-Driven API Tests

Our framework supports data-driven API testing:

```javascript
const { test, expect } = require('@playwright/test');
const { ApiClient } = require('../../utils/api');

// Test data
const testUsers = [
  { name: 'User 1', job: 'Job 1' },
  { name: 'User 2', job: 'Job 2' },
  { name: 'User 3', job: 'Job 3' }
];

test.describe('Data-Driven API Tests', () => {
  let apiClient;

  test.beforeEach(() => {
    apiClient = new ApiClient({
      baseUrl: 'https://reqres.in/api'
    });
  });

  for (const userData of testUsers) {
    test(`Create user: ${userData.name} - ${userData.job}`, async () => {
      const response = await apiClient.post('/users', userData);
      
      expect(response).toBeDefined();
      expect(response.name).toBe(userData.name);
      expect(response.job).toBe(userData.job);
      expect(response.id).toBeDefined();
      expect(response.createdAt).toBeDefined();
    });
  }
});
```

## GraphQL Testing

Our framework supports GraphQL API testing:

```javascript
const { GraphQLClient } = require('../../utils/api');

// Create GraphQL client
const graphqlClient = new GraphQLClient({
  endpoint: 'https://api.example.com/graphql',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Define query
const query = `
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      name
      email
      posts {
        id
        title
      }
    }
  }
`;

// Execute query
const result = await graphqlClient.request(query, { id: '123' });

// Define mutation
const mutation = `
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      name
      email
    }
  }
`;

// Execute mutation
const newUser = await graphqlClient.request(mutation, {
  input: {
    name: 'John Doe',
    email: 'john@example.com'
  }
});
```

## API Authentication

Our framework supports various authentication methods:

### Bearer Token

```javascript
const apiClient = new ApiClient({
  baseUrl: 'https://api.example.com',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### Basic Auth

```javascript
const apiClient = new ApiClient({
  baseUrl: 'https://api.example.com',
  auth: {
    username: 'user',
    password: 'pass'
  }
});
```

### API Key

```javascript
const apiClient = new ApiClient({
  baseUrl: 'https://api.example.com',
  headers: {
    'X-API-Key': apiKey
  }
});
```

### OAuth 2.0

```javascript
const { OAuthClient } = require('../../utils/api/auth');

// Create OAuth client
const oauthClient = new OAuthClient({
  tokenUrl: 'https://auth.example.com/oauth/token',
  clientId: 'client_id',
  clientSecret: 'client_secret'
});

// Get access token
const token = await oauthClient.getAccessToken({
  grant_type: 'password',
  username: 'user',
  password: 'pass'
});

// Create API client with token
const apiClient = new ApiClient({
  baseUrl: 'https://api.example.com',
  headers: {
    'Authorization': `Bearer ${token.access_token}`
  }
});
```

## API Testing Best Practices

1. **Isolate Tests**: Each API test should be independent and not rely on other tests
2. **Validate Schemas**: Use schema validation to ensure API responses match expected structure
3. **Test Error Cases**: Test both successful and error responses
4. **Use Meaningful Assertions**: Make assertions specific and meaningful
5. **Clean Up Test Data**: Clean up any data created during tests
6. **Use Environment Variables**: Store API endpoints and credentials in environment variables
7. **Mock External Dependencies**: Use mocks for external services when appropriate
8. **Test Performance**: Include performance tests for critical endpoints

## Example API Test

```javascript
const { test, expect } = require('@playwright/test');
const { ApiClient, SchemaValidator } = require('../../utils/api');

test.describe('User API Tests', () => {
  let apiClient;
  let validator;

  test.beforeEach(() => {
    apiClient = new ApiClient({
      baseUrl: 'https://reqres.in/api'
    });
    validator = new SchemaValidator();
  });

  test('Get list of users', async () => {
    // Make API request
    const response = await apiClient.get('/users?page=1');
    
    // Verify response structure
    expect(response).toBeDefined();
    expect(response.page).toBe(1);
    expect(response.data).toBeInstanceOf(Array);
    expect(response.data.length).toBeGreaterThan(0);
    
    // Validate schema
    const userListSchema = {
      type: 'object',
      required: ['page', 'per_page', 'total', 'total_pages', 'data'],
      properties: {
        page: { type: 'integer' },
        per_page: { type: 'integer' },
        total: { type: 'integer' },
        total_pages: { type: 'integer' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            required: ['id', 'email', 'first_name', 'last_name', 'avatar'],
            properties: {
              id: { type: 'integer' },
              email: { type: 'string', format: 'email' },
              first_name: { type: 'string' },
              last_name: { type: 'string' },
              avatar: { type: 'string', format: 'uri' }
            }
          }
        }
      }
    };
    
    const result = validator.validate(userListSchema, response);
    expect(result.valid).toBe(true);
  });

  test('Create new user', async () => {
    // Test data
    const userData = {
      name: 'John Doe',
      job: 'Software Engineer'
    };
    
    // Make API request
    const response = await apiClient.post('/users', userData);
    
    // Verify response
    expect(response).toBeDefined();
    expect(response.name).toBe(userData.name);
    expect(response.job).toBe(userData.job);
    expect(response.id).toBeDefined();
    expect(response.createdAt).toBeDefined();
  });
});
```