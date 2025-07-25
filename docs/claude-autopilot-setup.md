# Claude Autopilot Setup for RatGarden

## Overview

Claude Autopilot is a VS Code/Cursor extension that automates Claude Code tasks with intelligent queuing, batch processing, and auto-resume functionality. This guide covers the setup and configuration for the RatGarden digital garden project.

## Installation

### Prerequisites

1. **Claude Code**: Install Claude Code from [https://www.anthropic.com/claude-code](https://www.anthropic.com/claude-code)
2. **Python 3.8+**: Required for process management
3. **VS Code 1.74.0+** or **Cursor**: Compatible with VS Code and Cursor

### Extension Installation

The extension is already added to the workspace recommendations in `.vscode/extensions.json`. To install:

1. **Automatic**: VS Code will prompt to install recommended extensions
2. **Manual**: Open Command Palette (`Cmd/Ctrl+Shift+P`) → `Extensions: Install Extensions` → Search "Claude Autopilot"
3. **CLI**: `code --install-extension benbasha.claude-autopilot`

## Configuration

### Workspace Settings

The following settings are configured in `.vscode/settings.json`:

```json
{
  "claudeAutopilot.queue.autoMaintenance": true,
  "claudeAutopilot.session.autoStart": false,
  "claudeAutopilot.session.skipPermissions": true,
  "claudeAutopilot.session.healthCheckInterval": 30000,
  "claudeAutopilot.sleepPrevention.enabled": true,
  "claudeAutopilot.sleepPrevention.method": "auto",
  "claudeAutopilot.history.maxRuns": 20,
  "claudeAutopilot.history.autoSave": true,
  "claudeAutopilot.logging.enabled": true,
  "claudeAutopilot.logging.level": "info",
  "claudeAutopilot.developmentMode": true
}
```

### Setting Descriptions

- **`queue.autoMaintenance`**: Automatically maintain queue health
- **`session.autoStart`**: Disabled for manual control
- **`session.skipPermissions`**: Skip permission checks for automation
- **`session.healthCheckInterval`**: Health check every 30 seconds
- **`sleepPrevention.enabled`**: Keep computer awake during processing
- **`sleepPrevention.method`**: Automatic sleep prevention method
- **`history.maxRuns`**: Keep last 20 processing runs
- **`history.autoSave`**: Automatically save processing history
- **`logging.enabled`**: Enable detailed logging
- **`logging.level`**: Log level set to info
- **`developmentMode`**: Enable development features for debugging

## Usage

### Basic Workflow

1. **Start Claude Autopilot**:

   - Command Palette → `Claude: Start Claude Autopilot`
   - Or use the status bar icon

2. **Add Tasks to Queue**:

   - Use the webview interface to add messages
   - Or use Command Palette → `Claude: Add Message to Queue`

3. **Start Processing**:

   - Click "Start Processing" in the interface
   - Claude Autopilot will handle everything automatically

4. **Monitor Progress**:
   - Real-time updates in the webview
   - History browser for past runs
   - Logs for detailed information

### Commands

| Command                          | Description                     |
| -------------------------------- | ------------------------------- |
| `Claude: Start Claude Autopilot` | Start the interface and session |
| `Claude: Stop Claude Autopilot`  | Stop and close the session      |
| `Claude: Add Message to Queue`   | Add a new message to the queue  |

## RatGarden-Specific Use Cases

### Content Generation

- Generate blog posts from research notes
- Create AI feature documentation
- Convert drafts to published content
- Generate semantic links between content

### Code Maintenance

- TypeScript conversion and type checking
- Component refactoring and optimization
- Test generation for new components
- Documentation updates

### Batch Operations

- Process multiple content files overnight
- Generate graph links for new content
- Update semantic links across the site
- Sanitize content for public repository

### Example Queue Setup

```javascript
// Example queue for weekend processing
;[
  "Generate TypeScript types for all JavaScript components in quartz/components/",
  "Create unit tests for AI features (AISearch, AIRecommendations, AIWritingAssistant)",
  "Update documentation for all AI components",
  "Generate semantic links for new content in content/blog/",
  "Refactor SCSS files to use CSS custom properties consistently",
  "Create accessibility improvements for interactive components",
  "Generate API documentation for Netlify functions",
  "Update README with latest AI features",
]
```

## Integration with Existing Scripts

### Development Workflow

Claude Autopilot can be integrated with existing RatGarden scripts:

```bash
# Queue up development tasks
npm run claude-setup  # Setup Claude Code
npm run generate-graph-links  # Generate graph links
npm run clear-semantic-cache  # Clear semantic cache
```

### Automation Scripts

The extension can work alongside existing automation:

- **`scripts/claude/`**: Claude-specific automation scripts
- **`scripts/dev/`**: Development automation
- **`scripts/sanitize/`**: Content sanitization
- **`scripts/utils/`**: Utility functions

## Troubleshooting

### Common Issues

**Claude Code Not Found**

- Ensure Claude Code is installed and in PATH
- Restart VS Code after installation
- Check dependency status in Claude Autopilot panel

**Python Not Found**

- Install Python 3.8+ and add to PATH
- On Windows, check "Add Python to PATH" during installation

**Permission Errors**

- Claude Autopilot uses `--dangerously-skip-permissions`
- Only use in trusted development environments
- Disable if working with sensitive data

### Debug Mode

Development mode is enabled for additional debugging:

- Debug logging and diagnostics
- Configuration validation tools
- Advanced queue operations
- Detailed error reporting

### Logs

Logs are saved to:

- VS Code Output panel: "Claude Autopilot"
- File system logs (if enabled)
- Processing history with detailed information

## Best Practices

### Queue Management

- Group related tasks together
- Use descriptive message titles
- Include context and requirements
- Set appropriate priorities

### Processing Strategy

- Use overnight/weekend processing for large tasks
- Monitor progress through the webview
- Review results in the history browser
- Keep queue size manageable

### Security

- Only use in trusted development environments
- Review generated code before committing
- Test changes in development environment
- Use sanitization scripts for public content

## Resources

- [Claude Autopilot Repository](https://github.com/benbasha/Claude-Autopilot)
- [Claude Code Documentation](https://www.anthropic.com/claude-code)
- [VS Code Extension Development](https://code.visualstudio.com/api)
- [RatGarden Project Documentation](./README.md)

## Support

For issues with Claude Autopilot:

- Check the [GitHub repository](https://github.com/benbasha/Claude-Autopilot)
- Review logs in VS Code Output panel
- Enable development mode for detailed debugging
- Check Claude Code installation and configuration

For RatGarden-specific issues:

- Review project documentation
- Check existing scripts and automation
- Use development tools and testing
- Consult project maintainers
