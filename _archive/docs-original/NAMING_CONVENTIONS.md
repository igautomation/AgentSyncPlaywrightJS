# Naming Conventions

This document outlines the naming conventions for the Playwright framework.

## Page Objects

Page objects should follow the naming convention:

```
EntityNamePage.js
```

Examples:
- `LoginPage.js`
- `DashboardPage.js`
- `UserProfilePage.js`

## Test Files

Test files should follow the naming convention:

```
feature-name.spec.js
```

Examples:
- `authentication.spec.js`
- `user-profile.spec.js`
- `data-driven.spec.js`

## Utility Files

Utility files should follow the naming convention:

```
utilityNameUtils.js
```

Examples:
- `apiUtils.js`
- `networkUtils.js`
- `reportingUtils.js`

## Component Files

Component files should follow the naming convention:

```
ComponentName.js
```

Examples:
- `LoginForm.js`
- `NavigationBar.js`
- `DataTable.js`

## Configuration Files

Configuration files should follow the naming convention:

```
name.config.js
```

Examples:
- `playwright.config.js`
- `api.config.js`
- `reporting.config.js`

## Checking Naming Conventions

You can check if your files follow the naming conventions by running:

```bash
node scripts/utils/naming-convention-check.js
```

To automatically fix naming convention violations:

```bash
node scripts/utils/naming-convention-check.js --fix
```

## Exceptions

Some files are exempt from these naming conventions:
- `BasePage.js`
- `index.js`
- `README.md`

## Benefits of Consistent Naming

- Improved code readability
- Easier navigation of the codebase
- Better IDE auto-completion
- Clearer separation of concerns
- Easier onboarding for new team members