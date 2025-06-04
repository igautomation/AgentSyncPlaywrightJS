# Core Tests

This directory contains the merged core tests from both the `core` and `core copy` directories.

## Test Files

- `authentication.spec.js` - Authentication tests using reliable test sites
- `form-validation.spec.js` - Form validation tests using reliable test sites
- `framework-validation.spec.js` - Simple framework validation test
- `navigation.spec.js` - Navigation tests using reliable test sites
- `orangehrm-tests.spec.js` - Tests specific to OrangeHRM (skipped by default)

## Test Structure

The tests are organized to maximize reliability:

1. **Basic Tests** - Use reliable public test sites (The Internet Herokuapp and Example.com)
2. **OrangeHRM Tests** - Specific to OrangeHRM but skipped by default due to site availability issues

## Running Tests

To run all tests:
```bash
npx playwright test src/tests/core-merged
```

To run only the reliable tests:
```bash
npx playwright test src/tests/core-merged --grep-invert "OrangeHRM"
```

## Test Sites Used

- **The Internet Herokuapp** (https://the-internet.herokuapp.com/) - A reliable test site with various UI elements and forms
- **Example.com** - A simple site used for basic framework validation
- **OrangeHRM Demo** (https://opensource-demo.orangehrmlive.com/) - Used for specific tests but skipped by default