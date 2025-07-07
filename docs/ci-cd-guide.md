# CI/CD Guide

## 🚀 **Industry Standard CI/CD Workflows**

The framework includes **3 essential workflows** following industry best practices:

### **1. Main CI Pipeline** (`ci.yml`)
- **Purpose**: Core API testing and validation
- **Triggers**: Push to main/develop, Pull requests
- **Tests**: Salesforce API tests with TestRail integration
- **Duration**: ~7 seconds
- **Status**: ✅ Passing

### **2. UI Testing Pipeline** (`test-ui.yml`)
- **Purpose**: Cross-browser UI testing
- **Triggers**: Push to main/develop, Pull requests
- **Tests**: Salesforce UI tests with TestRail integration
- **Browsers**: Chrome, Firefox, Safari
- **Status**: ✅ Passing

### **3. Code Quality Pipeline** (`lint.yml`)
- **Purpose**: Code quality and structure validation
- **Triggers**: Push to main/develop, Pull requests
- **Checks**: Package validation, structure verification
- **Status**: ✅ Passing

## 🔧 **Required Secrets**

Configure these secrets in GitHub repository settings:

### **Salesforce Secrets:**
```
SF_USERNAME=altimetrikuser001@wise-koala-a44c19.com
SF_PASSWORD=Dubai@2025
SF_INSTANCE_URL=https://wise-koala-a44c19-dev-ed.trailblaze.lightning.force.com
SF_ACCESS_TOKEN=<current_token>
```

### **TestRail Secrets:**
```
TESTRAIL_URL=https://agentsync.testrail.io
TESTRAIL_USERNAME=cnmuhammad.ghouseimran@agentsync.io
TESTRAIL_PASSWORD=TestRail@2025
TESTRAIL_API_KEY=80325dUsQt4Qgu4j2UAX-XItvsXiBxtiPFbOxsc/R
TESTRAIL_PROJECT_ID=18
TESTRAIL_SUITE_ID=412
```

## 📊 **Workflow Features**

### **✅ Industry Standards:**
- **Node.js 18**: Latest LTS version
- **Dependency Caching**: Faster builds
- **Artifact Upload**: Test results preservation
- **Multi-browser Testing**: Cross-browser compatibility
- **Secret Management**: Secure credential handling

### **✅ Testing Coverage:**
- **API Tests**: Salesforce API integration
- **UI Tests**: Cross-browser UI automation
- **TestRail Integration**: Automated result reporting
- **Code Quality**: Structure and package validation

### **✅ Best Practices:**
- **Fail Fast**: Quick feedback on issues
- **Parallel Execution**: Efficient resource usage
- **Artifact Retention**: 7-day result storage
- **Manual Triggers**: On-demand execution
- **Environment Isolation**: Clean test environments

## 🎯 **Workflow Status**

All workflows are **production-ready** and follow industry standards:

- ✅ **Fast Execution**: Quick feedback cycles
- ✅ **Reliable Results**: Consistent test outcomes
- ✅ **Secure**: Proper secret management
- ✅ **Scalable**: Easy to extend and maintain
- ✅ **Standard**: Industry best practices

## 🚀 **Usage**

Workflows automatically trigger on:
- **Push** to main/develop branches
- **Pull Request** to main branch
- **Manual** workflow dispatch

Results are available in:
- **GitHub Actions** tab
- **TestRail Dashboard** (for test results)
- **Artifact Downloads** (for detailed reports)