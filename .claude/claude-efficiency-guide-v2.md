# Claude Opus Max Subscription Efficiency Guide v2.0

## 🚀 New Claude Code Integration

### 1. **Claude Code CLI Setup**

```bash
# Install Claude Code CLI
npm install -g @anthropic-ai/claude-code

# Run setup script
./scripts/setup-claude-code.sh

# Usage examples
claude --sub-agent unit-test-engineer "Create tests for src/utils/"
claude --sub-agent code-reviewer "Review src/components/Auth.tsx"
claude --sub-agent software-architecture-expert "Design caching strategy"
```

### 2. **MCP Server Integration**

```bash
# Setup MCP servers for enhanced context
./scripts/setup-mcp-servers.sh

# MCP servers provide:
# - Project context loading
# - Code snippet retrieval
# - Medical content validation
# - Persistent memory across sessions
```

## 🎯 Optimal Usage Patterns for Max Subscription

### **Model Selection Strategy**

```javascript
// Use the right model for the right task
const modelSelection = {
  'claude-3-5-haiku-20241022': {
    use_for: ['simple tasks', 'quick edits', 'basic analysis'],
    cost_per_1k_tokens: '$0.25',
    max_tokens: 200000
  },
  'claude-3-5-sonnet-20241022': {
    use_for: ['complex reasoning', 'code review', 'architecture'],
    cost_per_1k_tokens: $3.00,
    max_tokens: 200000
  },
  'claude-3-opus-20240229': {
    use_for: ['medical content', 'critical analysis', 'research'],
    cost_per_1k_tokens: $15.00,
    max_tokens: 200000
  }
}
```

### **Token Optimization Techniques**

#### A. **Batch Operations**

```bash
# Instead of multiple queries:
# ❌ "Create component"
# ❌ "Add tests"
# ❌ "Add styles"

# ✅ Single efficient query:
claude --sub-agent unit-test-engineer "Create UserProfile component with tests and styles"
```

#### B. **Context Preservation**

```bash
# Use MCP servers to load context automatically
claude --mcp-server project-context "Implement new feature"

# Context includes:
# - Project conventions
# - Existing patterns
# - Recent changes
# - Efficiency settings
```

#### C. **Sub-Agent Chaining**

```bash
# Sequential workflow
claude --sub-agent software-architecture-expert "Design API structure"
# Then implement
claude "Implement the API based on architecture"
# Then test
claude --sub-agent unit-test-engineer "Create integration tests"
```

## 📊 Efficiency Tracking & Analytics

### **Token Usage Monitoring**

```bash
# Track usage automatically
node scripts/token-efficiency-tracker.js track "Feature implementation" 5000 2000 "sub-agent" "unit-test-engineer"

# Generate efficiency report
node scripts/token-efficiency-tracker.js report
```

### **Cost Analysis**

```javascript
// Monthly cost optimization
const monthlyBudget = 100 // $100/month
const tokenCosts = {
  haiku: 0.00025, // $0.25 per 1K tokens
  sonnet: 0.003, // $3.00 per 1K tokens
  opus: 0.015, // $15.00 per 1K tokens
}

// Target: 80% Haiku, 15% Sonnet, 5% Opus
const optimalDistribution = {
  haiku: 0.8,
  sonnet: 0.15,
  opus: 0.05,
}
```

## 🔧 Advanced Configuration

### **Claude Code Configuration**

```json
{
  "model": "claude-3-5-sonnet-20241022",
  "maxTokens": 4000,
  "temperature": 0.1,
  "systemPrompt": "You are an expert developer working on RatGarden. Focus on efficiency and use existing patterns.",
  "hooks": {
    "pre-command": "scripts/claude-hooks/pre-command.sh",
    "post-command": "scripts/claude-hooks/post-command.sh"
  },
  "mcpServers": [
    "~/.config/claude-code/mcp-servers/project-context",
    "~/.config/claude-code/mcp-servers/code-snippets"
  ]
}
```

### **Efficiency Modes**

```bash
# Development mode (fast, efficient)
claude --mode development "Quick bug fix"

# Research mode (thorough, uses Opus)
claude --mode research "Analyze medical literature"

# Writing mode (creative, balanced)
claude --mode writing "Write technical blog post"
```

## 🎯 Task-Specific Optimization

### **Code Development**

```bash
# 1. Architecture planning (Sonnet)
claude --sub-agent software-architecture-expert "Design component architecture"

# 2. Implementation (Haiku for simple, Sonnet for complex)
claude "Implement the component"

# 3. Testing (Haiku)
claude --sub-agent unit-test-engineer "Create comprehensive tests"

# 4. Review (Sonnet)
claude --sub-agent code-reviewer "Review for security and performance"
```

### **Content Creation**

```bash
# 1. Research (Opus for medical, Sonnet for technical)
claude --sub-agent medical-content-assistant "Validate medical claims"

# 2. Writing (Sonnet)
claude --sub-agent professional-writer-career-advisor "Write technical blog post"

# 3. Optimization (Haiku)
claude --sub-agent semantic-link-optimizer "Optimize content links"
```

### **Debugging & Problem Solving**

```bash
# 1. Analysis (Sonnet)
claude "Analyze this error and provide solution"

# 2. Implementation (Haiku)
claude "Implement the fix"

# 3. Validation (Haiku)
claude --sub-agent unit-test-engineer "Test the fix"
```

## 📈 Performance Metrics

### **Efficiency Targets**

- **Token Efficiency**: >30% savings through optimization
- **Sub-agent Usage**: >80% of specialized tasks
- **Model Optimization**: 80% Haiku, 15% Sonnet, 5% Opus
- **Context Reuse**: >90% of common patterns
- **Cost per Task**: <$0.50 average

### **Success Indicators**

- Fewer clarification requests
- Completed tasks in single session
- Reusable patterns identified
- Consistent quality output
- Reduced token waste

## 🔄 Workflow Optimization

### **Daily Routine**

```bash
# Morning: Load context and plan
claude --mcp-server project-context "Review today's tasks"

# Development: Use appropriate sub-agents
claude --sub-agent software-architecture-expert "Design today's features"

# Implementation: Efficient coding
claude "Implement features using existing patterns"

# Testing: Automated test generation
claude --sub-agent unit-test-engineer "Create tests for new features"

# Review: Code quality check
claude --sub-agent code-reviewer "Review completed work"

# Evening: Track and optimize
node scripts/token-efficiency-tracker.js report
```

### **Weekly Optimization**

```bash
# Analyze efficiency patterns
node scripts/token-efficiency-tracker.js report

# Update templates and patterns
claude "Update efficiency patterns based on usage data"

# Plan next week's optimization
claude "Plan efficiency improvements for next week"
```

## 🚨 Efficiency Warnings

### **Red Flags**

- Using Opus for simple tasks
- Not using sub-agents for specialized work
- Repeating context instead of using MCP servers
- Not tracking usage patterns
- Ignoring efficiency recommendations

### **Best Practices**

- Always start with planning phase
- Use sub-agents for specialized tasks
- Batch related operations
- Track and analyze usage patterns
- Continuously optimize based on data

## 💡 Pro Tips

1. **Context Loading**: Use MCP servers to automatically load project context
2. **Model Selection**: Choose the right model for the task complexity
3. **Sub-agent Chaining**: Chain sub-agents for complex workflows
4. **Pattern Reuse**: Store and reuse successful patterns
5. **Usage Tracking**: Monitor and optimize based on usage data
6. **Batch Operations**: Combine related tasks into single queries
7. **Template Usage**: Use existing templates instead of creating new ones

## 📚 Resources

- [Claude Code Documentation](https://docs.anthropic.com/en/docs/claude-code/overview)
- [MCP Protocol](https://modelcontextprotocol.io/)
- [Anthropic Cookbook](https://github.com/anthropics/anthropic-cookbook)
- [Token Efficiency Tracker](./scripts/token-efficiency-tracker.js)
- [Claude Code Setup](./scripts/setup-claude-code.sh)
