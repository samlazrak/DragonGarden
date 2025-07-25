# Claude AI Scripts

Scripts for Claude Code CLI integration, MCP servers, token tracking, and efficiency optimization.

## Files

### Core Scripts

- **`daily-efficiency.sh`** - Daily efficiency report and optimization tips
- **`token-efficiency-tracker.cjs`** - Token usage tracking and analytics
- **`init-knowledge-base.sh`** - Initialize SQLite knowledge base
- **`claude-token-monitor.py`** - Python token monitoring script

### Setup Scripts

- **`setup-claude-code.sh`** - Setup Claude Code CLI configuration
- **`setup-mcp-servers.sh`** - Setup MCP servers for enhanced context

### Hooks

- **`claude-hooks/`** - Pre/post command hooks for Claude Code

## Usage

```bash
# Daily efficiency report
./scripts/claude/daily-efficiency.sh

# Track token usage
node scripts/claude/token-efficiency-tracker.cjs track "Task description" tokens_used tokens_saved method sub_agent

# Generate efficiency report
node scripts/claude/token-efficiency-tracker.cjs report

# Initialize knowledge base
./scripts/claude/init-knowledge-base.sh

# Setup Claude Code
./scripts/claude/setup-claude-code.sh

# Setup MCP servers
./scripts/claude/setup-mcp-servers.sh
```

## Configuration

The scripts use the following configuration:

- Knowledge base: `~/.claude-knowledge/db/claude-knowledge.db`
- Claude Code config: `~/.config/claude-code/config.json`
- MCP servers: `~/.config/claude-code/mcp-servers/`

## Efficiency Targets

- **Token Efficiency**: 30-40% savings through optimization
- **Model Distribution**: 80% Haiku, 15% Sonnet, 5% Opus
- **Cost per Task**: <$0.50 average
- **Sub-agent Usage**: >80% of specialized tasks
