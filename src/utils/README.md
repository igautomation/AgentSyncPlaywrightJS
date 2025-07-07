# Utils Directory Structure

Clean and organized utility modules for test automation framework.

## 🏗️ Directory Structure

### Core Utilities (Essential)
```
├── common/           # Common utilities and abstractions
├── core/            # Core framework utilities
├── web/             # Web automation utilities
├── api/             # API testing utilities
├── data/            # Data generation and management
```

### Integration Utilities (External Services)
```
├── salesforce/      # Salesforce automation utilities
├── testrail/        # TestRail integration utilities
├── jira/            # JIRA integration utilities
├── xray/            # Xray test management utilities
```

### Specialized Utilities (Advanced Features)
```
├── accessibility/   # Accessibility testing utilities
├── performance/     # Performance testing utilities
├── security/        # Security testing utilities
├── visual/          # Visual testing utilities
├── mobile/          # Mobile testing utilities
```

### Development & CI/CD
```
├── ci/              # CI/CD utilities
├── git/             # Git integration utilities
├── cli/             # Command-line interface utilities
├── generators/      # Code generation utilities
├── setup/           # Setup and configuration utilities
```

### Reporting & Analysis
```
├── reporting/       # Test reporting utilities
├── visualization/   # Data visualization utilities
├── scheduler/       # Test scheduling utilities
```

### Support Utilities
```
├── database/        # Database utilities
├── localization/    # Localization utilities
├── testing/         # Testing utilities (quarantine, etc.)
├── helpers/         # General helper utilities
├── plugins/         # Plugin system utilities
├── test-data/       # Test data utilities
```

## 📋 Utility Categories

### 🎯 **Core & Essential**
- **common/** - Base abstractions, error handling, logging
- **core/** - Framework core utilities
- **web/** - Web automation, interactions, locators
- **api/** - REST/GraphQL API testing
- **data/** - Data generation and management

### 🔌 **Integrations**
- **salesforce/** - Salesforce automation (structured)
- **testrail/** - TestRail integration (structured)
- **jira/** - JIRA integration
- **xray/** - Xray test management

### 🧪 **Testing Specializations**
- **accessibility/** - A11y testing
- **performance/** - Performance monitoring
- **security/** - Security testing
- **visual/** - Visual regression testing
- **mobile/** - Mobile device testing

### 🛠️ **Development Tools**
- **ci/** - CI/CD integration
- **git/** - Git operations
- **cli/** - Command-line tools
- **generators/** - Code generation
- **setup/** - Environment setup

### 📊 **Reporting & Analytics**
- **reporting/** - Test reports
- **visualization/** - Charts and graphs
- **scheduler/** - Test scheduling

## 🎯 Recommended Structure for New Utilities

When adding new utilities, follow this structure:
```
src/utils/[utility-name]/
├── core/              # Core functionality
├── specialized/       # Specialized features
├── legacy/           # Backward compatibility (if needed)
├── documentation/    # README and guides
└── index.js          # Main exports
```

## 📦 Import Patterns

### Core Utilities
```javascript
const { CoreUtils } = require('../utils/core');
const { WebInteractions } = require('../utils/web');
const { ApiClient } = require('../utils/api');
```

### Integration Utilities
```javascript
const { SalesforceCore } = require('../utils/salesforce');
const { TestRailCore } = require('../utils/testrail');
```

### Specialized Utilities
```javascript
const { AccessibilityUtils } = require('../utils/accessibility');
const { PerformanceUtils } = require('../utils/performance');
```

## 🔄 Migration Strategy

### Phase 1: Core Utilities (✅ Complete)
- ✅ salesforce/ - Structured with core/legacy/specialized
- ✅ testrail/ - Structured with core/legacy/specialized

### Phase 2: High-Priority Utilities
- 🎯 web/ - Web automation utilities
- 🎯 api/ - API testing utilities
- 🎯 common/ - Common abstractions

### Phase 3: Specialized Utilities
- 🎯 accessibility/ - A11y testing
- 🎯 performance/ - Performance testing
- 🎯 security/ - Security testing

### Phase 4: Development Tools
- 🎯 ci/ - CI/CD utilities
- 🎯 generators/ - Code generation
- 🎯 reporting/ - Test reporting

## 🏆 Best Practices

1. **Consistent Structure**: Follow core/specialized/legacy pattern
2. **Clear Documentation**: README in each utility directory
3. **Proper Exports**: Clean index.js with organized exports
4. **Backward Compatibility**: Maintain legacy utilities during migration
5. **Modular Design**: Keep utilities focused and independent
6. **Error Handling**: Consistent error management across utilities
7. **Testing**: Unit tests for utility functions
8. **Dependencies**: Minimize external dependencies

## 📈 Current Status

- ✅ **Salesforce**: Fully structured (core/legacy/specialized)
- ✅ **TestRail**: Fully structured (core/legacy/specialized)
- 🔄 **Other Utilities**: Legacy structure (needs organization)

## 🎯 Next Steps

1. Structure high-priority utilities (web, api, common)
2. Create consistent documentation
3. Update import paths
4. Maintain backward compatibility
5. Add comprehensive testing