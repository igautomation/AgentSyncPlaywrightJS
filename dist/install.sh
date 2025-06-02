
#!/bin/bash

echo "Installing Playwright Framework..."

# Install the framework
npm install --global ./framework

# Create a new project if requested
if [ "$1" == "--create-project" ]; then
  PROJECT_NAME=${2:-"playwright-project"}
  echo "Creating new project: $PROJECT_NAME"
  
  mkdir -p "$PROJECT_NAME"
  cd "$PROJECT_NAME"
  
  # Initialize project
  npx pw-framework init
  
  echo "Project created successfully!"
  echo "To get started:"
  echo "  cd $PROJECT_NAME"
  echo "  npm install"
  echo "  npx playwright install"
else
  echo "Framework installed successfully!"
  echo "To create a new project, run: npx pw-framework init"
fi
