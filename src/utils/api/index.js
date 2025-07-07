// Core utilities (recommended)
const ApiClient = require('./core/apiClient');
const ApiUtils = require('./core/apiUtils');
const RestUtils = require('./core/restUtils');
const AuthUtils = require('./core/auth');

// Specialized utilities
const GraphQLUtils = require('./specialized/graphqlUtils');
const SchemaValidator = require('./specialized/schemaValidator');
const ApiHeaderProvider = require('./specialized/apiHeaderProvider');

// Models
const User = require('./models/User');
const Employee = require('./models/Employee');

module.exports = {
  // Core
  ApiClient,
  ApiUtils,
  RestUtils,
  AuthUtils,
  
  // Specialized
  GraphQLUtils,
  SchemaValidator,
  ApiHeaderProvider,
  
  // Models
  User,
  Employee
};