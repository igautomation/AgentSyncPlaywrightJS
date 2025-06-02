# Playwright Framework Project

This project was created using [@your-org/playwright-framework](https://github.com/your-org/playwright-framework).

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Install Playwright browsers:
   ```bash
   npx playwright install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit the `.env` file with your configuration.

4. Run tests:
   ```bash
   npm test
   ```

## Available Scripts

- `npm test` - Run all tests
- `npm run test:ui` - Run tests with UI mode
- `npm run test:headed` - Run tests in headed mode
- `npm run report` - Show HTML report
- `npm run codegen` - Generate tests with Playwright Codegen

## Framework Configuration

You can customize the framework behavior by editing `framework.config.js`.

## Custom Extensions

Place your custom extensions in the `custom/` directory:

- `custom/plugins/` - Custom plugins
- `custom/fixtures/` - Custom fixtures
- `custom/reporters/` - Custom reporters

## Documentation

For more information, see the [Playwright Framework Documentation](https://your-org.github.io/playwright-framework).