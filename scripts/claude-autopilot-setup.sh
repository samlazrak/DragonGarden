#!/bin/bash

# Claude Autopilot Setup Script for RatGarden
# This script helps set up and test Claude Autopilot integration

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check Python version
check_python() {
    if command_exists python3; then
        PYTHON_VERSION=$(python3 --version 2>&1 | cut -d' ' -f2 | cut -d'.' -f1,2)
        if [[ $(echo "$PYTHON_VERSION >= 3.8" | bc -l) -eq 1 ]]; then
            print_success "Python $PYTHON_VERSION found"
            return 0
        else
            print_error "Python $PYTHON_VERSION found, but 3.8+ is required"
            return 1
        fi
    else
        print_error "Python 3.8+ not found"
        return 1
    fi
}

# Function to check Claude Code installation
check_claude_code() {
    if command_exists claude; then
        print_success "Claude Code found"
        return 0
    else
        print_warning "Claude Code not found in PATH"
        print_status "Install from: https://www.anthropic.com/claude-code"
        return 1
    fi
}

# Function to check VS Code installation
check_vscode() {
    if command_exists code; then
        print_success "VS Code CLI found"
        return 0
    else
        print_warning "VS Code CLI not found"
        print_status "Install VS Code and add to PATH"
        return 1
    fi
}

# Function to check Node.js and npm
check_node() {
    if command_exists node; then
        NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
        if [[ $NODE_VERSION -ge 22 ]]; then
            print_success "Node.js v$(node --version) found"
        else
            print_error "Node.js v$(node --version) found, but v22+ is required"
            return 1
        fi
    else
        print_error "Node.js not found"
        return 1
    fi

    if command_exists npm; then
        NPM_VERSION=$(npm --version)
        if [[ $(echo "$NPM_VERSION >= 10.9.2" | bc -l) -eq 1 ]]; then
            print_success "npm v$NPM_VERSION found"
        else
            print_error "npm v$NPM_VERSION found, but v10.9.2+ is required"
            return 1
        fi
    else
        print_error "npm not found"
        return 1
    fi
}

# Function to install project dependencies
install_dependencies() {
    print_status "Installing project dependencies..."
    npm install
    print_success "Dependencies installed"
}

# Function to setup Claude Code
setup_claude_code() {
    print_status "Setting up Claude Code..."
    if [[ -f "./scripts/claude/setup-claude-code.sh" ]]; then
        chmod +x ./scripts/claude/setup-claude-code.sh
        ./scripts/claude/setup-claude-code.sh
        print_success "Claude Code setup completed"
    else
        print_warning "Claude Code setup script not found"
    fi
}

# Function to generate initial queue
generate_initial_queue() {
    print_status "Generating initial Claude Autopilot queue..."
    
    cat > .claude-autopilot-queue.json << 'EOF'
{
  "queue": [
    {
      "id": "1",
      "title": "Setup Claude Autopilot Integration",
      "message": "Review the Claude Autopilot setup and ensure all dependencies are properly configured for the RatGarden project. Check that the extension is working correctly with the workspace settings.",
      "priority": "high",
      "created": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
    },
    {
      "id": "2", 
      "title": "Generate TypeScript Types",
      "message": "Convert any remaining JavaScript files to TypeScript in the quartz/components/ directory. Add proper type definitions and ensure strict type checking is enabled.",
      "priority": "medium",
      "created": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
    },
    {
      "id": "3",
      "title": "Create AI Component Tests",
      "message": "Generate comprehensive unit tests for the AI components (AISearch, AIRecommendations, AIWritingAssistant, InteractiveAIDemo) using Vitest and Testing Library.",
      "priority": "medium", 
      "created": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
    },
    {
      "id": "4",
      "title": "Update Documentation",
      "message": "Update the README.md and documentation to include information about Claude Autopilot integration and usage examples for the RatGarden project.",
      "priority": "low",
      "created": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
    }
  ]
}
EOF

    print_success "Initial queue generated at .claude-autopilot-queue.json"
}

# Function to create quick start guide
create_quick_start() {
    print_status "Creating quick start guide..."
    
    cat > CLAUDE-AUTOPILOT-QUICKSTART.md << 'EOF'
# Claude Autopilot Quick Start

## Prerequisites Check
Run the setup script to verify all requirements:
```bash
./scripts/claude-autopilot-setup.sh
```

## Installation
1. Install Claude Autopilot extension in VS Code/Cursor
2. Install Claude Code from https://www.anthropic.com/claude-code
3. Ensure Python 3.8+ is installed

## Quick Start
1. Open Command Palette (`Cmd/Ctrl+Shift+P`)
2. Run `Claude: Start Claude Autopilot`
3. Add tasks to the queue using the webview interface
4. Click "Start Processing" to begin automated work

## Useful Commands
- `Claude: Start Claude Autopilot` - Start the interface
- `Claude: Stop Claude Autopilot` - Stop processing
- `Claude: Add Message to Queue` - Add new task

## Integration with RatGarden
- Use existing npm scripts: `npm run claude-setup`
- Generate graph links: `npm run generate-graph-links`
- Clear semantic cache: `npm run clear-semantic-cache`

## Example Tasks
- Convert JavaScript to TypeScript
- Generate unit tests for components
- Update documentation
- Refactor SCSS files
- Create accessibility improvements

## Monitoring
- Check VS Code Output panel: "Claude Autopilot"
- Review processing history in the webview
- Monitor logs for detailed information

## Troubleshooting
- Ensure Claude Code is in PATH
- Check Python 3.8+ installation
- Verify VS Code extension is installed
- Review logs for error details
EOF

    print_success "Quick start guide created: CLAUDE-AUTOPILOT-QUICKSTART.md"
}

# Main setup function
main() {
    echo "🚀 Claude Autopilot Setup for RatGarden"
    echo "========================================"
    echo

    # Check prerequisites
    print_status "Checking prerequisites..."
    
    local all_good=true
    
    if ! check_node; then
        all_good=false
    fi
    
    if ! check_python; then
        all_good=false
    fi
    
    if ! check_claude_code; then
        all_good=false
    fi
    
    if ! check_vscode; then
        all_good=false
    fi
    
    echo
    
    if [[ "$all_good" == true ]]; then
        print_success "All prerequisites met!"
    else
        print_warning "Some prerequisites are missing. Please install them before proceeding."
        echo
        print_status "Required installations:"
        echo "  - Node.js v22+ and npm v10.9.2+"
        echo "  - Python 3.8+"
        echo "  - Claude Code (https://www.anthropic.com/claude-code)"
        echo "  - VS Code with CLI access"
        echo
        read -p "Continue with setup anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
    
    # Install dependencies
    echo
    install_dependencies
    
    # Setup Claude Code
    echo
    setup_claude_code
    
    # Generate initial queue
    echo
    generate_initial_queue
    
    # Create quick start guide
    echo
    create_quick_start
    
    echo
    echo "🎉 Claude Autopilot setup completed!"
    echo
    print_status "Next steps:"
    echo "  1. Install Claude Autopilot extension in VS Code/Cursor"
    echo "  2. Open Command Palette and run 'Claude: Start Claude Autopilot'"
    echo "  3. Review the generated queue and start processing"
    echo "  4. Check CLAUDE-AUTOPILOT-QUICKSTART.md for detailed instructions"
    echo
    print_status "Configuration files updated:"
    echo "  - .vscode/extensions.json (added extension recommendation)"
    echo "  - .vscode/settings.json (added Claude Autopilot settings)"
    echo "  - .vscode/tasks.json (added Claude Autopilot tasks)"
    echo "  - docs/claude-autopilot-setup.md (comprehensive setup guide)"
    echo
}

# Run main function
main "$@" 