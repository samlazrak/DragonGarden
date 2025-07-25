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
