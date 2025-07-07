# TestRail Case ID Mapping

## 🎯 **Unique TestRail Case IDs**

Each test has a **unique TestRail case ID** for precise tracking and reporting:

### **📋 Case ID Mapping**

```javascript
const CASE_IDS = {
  FRAMEWORK_VALIDATION: 24148,    // C24148: Framework Validation Test
  SALESFORCE_LOGIN: 24149,        // C24149: Salesforce Login Test
  SALESFORCE_NAVIGATION: 24150,   // C24150: Salesforce Navigation Test
  API_REQUEST: 24151,             // C24151: API Request Test
  CROSS_BROWSER: 24152            // C24152: Cross-Browser Compatibility Test
};
```

### **🎯 Test Case Details**

#### **C24148: Framework Validation Test**
- **Purpose**: Validates basic framework functionality
- **TestRail ID**: 24148
- **Test Type**: UI Validation
- **Browser Support**: Chrome, Firefox, Safari

#### **C24149: Salesforce Login Test**
- **Purpose**: Real application authentication testing
- **TestRail ID**: 24149
- **Test Type**: Authentication
- **Browser Support**: Chrome, Firefox, Safari

#### **C24150: Salesforce Navigation Test**
- **Purpose**: Complex UI navigation and interaction
- **TestRail ID**: 24150
- **Test Type**: Navigation
- **Browser Support**: Chrome, Firefox, Safari

#### **C24151: API Request Test**
- **Purpose**: API testing capabilities
- **TestRail ID**: 24151
- **Test Type**: API Testing
- **Browser Support**: Chrome, Firefox, Safari

#### **C24152: Cross-Browser Compatibility Test**
- **Purpose**: Multi-browser execution validation
- **TestRail ID**: 24152
- **Test Type**: Compatibility
- **Browser Support**: Chrome, Firefox, Safari

## 🔧 **Implementation**

### **Test Structure**
```javascript
test(`C${CASE_IDS.FRAMEWORK_VALIDATION}: Framework Validation Test`, async ({ page }) => {
  const testCaseId = CASE_IDS.FRAMEWORK_VALIDATION; // 24148
  
  // Test execution...
  
  testResults.push({
    case_id: testCaseId,     // Unique TestRail case ID
    status_id: testStatus,   // Pass/Fail status
    comment: testComment     // Test result details
  });
});
```

### **Result Upload**
```javascript
// All results uploaded with unique case IDs
await testRailClient.addResults(testRunId, testResults);

// Example results:
[
  { case_id: 24148, status_id: 1, comment: "Framework validation passed" },
  { case_id: 24149, status_id: 1, comment: "Salesforce login passed" },
  { case_id: 24150, status_id: 1, comment: "Navigation test passed" },
  { case_id: 24151, status_id: 1, comment: "API request passed" },
  { case_id: 24152, status_id: 1, comment: "Cross-browser passed" }
]
```

## 📊 **Benefits**

### **1. Unique Identification** ✅
- Each test has distinct TestRail case ID
- No confusion between test cases
- Clear traceability from code to TestRail

### **2. Precise Reporting** ✅
- Individual test results tracked separately
- Detailed status for each case ID
- Historical data maintained per case

### **3. Easy Maintenance** ✅
- Case IDs defined in constants
- Easy to update or modify
- Clear mapping documentation

### **4. Cross-Browser Tracking** ✅
- Same case ID across all browsers
- Consolidated results per test case
- Browser-specific comments included

## 🚀 **Usage**

```bash
# Run TestRail mapped tests
npm run test:testrail

# Results uploaded to TestRail with unique case IDs:
# C24148, C24149, C24150, C24151, C24152
```

**✅ Every test has a unique TestRail case ID for precise tracking and reporting!**