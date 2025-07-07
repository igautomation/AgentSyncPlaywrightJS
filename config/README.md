# Configuration Directory

Centralized configuration management for the test automation framework.

## Structure

```
config/
├── environments/          # Environment configurations
│   ├── .env.dev          # Development environment
│   ├── .env.qa           # QA environment
│   ├── .env.prod         # Production environment
│   ├── .env.clean        # Clean environment template
│   └── .env.template     # Environment template
├── playwright/           # Playwright configurations
│   ├── demo.config.js    # Demo test configuration
│   ├── salesforce.config.js # Salesforce test configuration
│   └── testrail.config.js   # TestRail configuration
├── build/               # Build configurations
│   ├── webpack.config.js # Webpack configuration
│   ├── jest.config.js    # Jest configuration
│   ├── postcss.config.js # PostCSS configuration
│   └── tailwind.config.js # Tailwind configuration
└── README.md            # This file
```

## Usage

### Environment Files
```bash
# Copy environment template
cp config/environments/.env.template .env.local

# Use specific environment
cp config/environments/.env.qa .env
```

### Playwright Configurations
```bash
# Run with specific config
npx playwright test --config=config/playwright/demo.config.js
npx playwright test --config=config/playwright/salesforce.config.js
```

### Build Configurations
Build configurations are automatically loaded by their respective tools.