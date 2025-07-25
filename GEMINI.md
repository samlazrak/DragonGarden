# GEMINI.md - Gemini CLI Rules & Patterns

## Quick Commands

```bash
# Interactive mode
gemini

# Quick question
gemini -p "your question"

# Code review
gemini -p "review this code" < file.tsx

# Fast model for simple tasks
gemini -m gemini-1.5-flash -p "quick check"
```

## Project-Specific Patterns

### Quartz Components

```bash
# Review component
gemini -p "review this Quartz component for TypeScript best practices" < quartz/components/ComponentName.tsx

# Generate component
gemini -p "create a new Quartz component for [feature] with TypeScript and SCSS"

# Debug component
gemini -p "debug why this component isn't working" < quartz/components/ComponentName.tsx
```

### AI Features

```bash
# Review AI component
gemini -p "review this AI component for security and performance" < quartz/components/AISearch.tsx

# Test AI functionality
gemini -p "generate test cases for this AI feature" < quartz/components/InteractiveAIDemo.tsx

# API review
gemini -p "review this Netlify function for security" < netlify/functions/ai-assistant.ts
```

### Content Management

```bash
# Improve blog post
gemini -p "improve SEO and readability" < content/blog/post.md

# Generate content ideas
gemini -p "suggest 5 blog post ideas for AI and development"

# Update documentation
gemini -p "update README for new feature" < README.md < component.tsx
```

## Advanced Usage Patterns

### Git Integration

```bash
# Review last commit
git show --name-only HEAD | gemini -p "review these changed files"

# Review branch differences
git diff main...feature-branch | gemini -p "review changes for conflicts and issues"

# Generate commit message
git diff --cached | gemini -p "generate a conventional commit message"

# Review PR description
git log --oneline -10 | gemini -p "suggest PR description based on commits"
```

### Build & Deploy Automation

```bash
# Debug build errors
npm run build 2>&1 | gemini -p "analyze build errors and suggest fixes"

# Review package.json changes
git diff package.json | gemini -p "review dependency changes for security and compatibility"

# Optimize build config
gemini -p "optimize this build configuration for performance" < quartz.config.ts

# Review deployment config
gemini -p "review deployment configuration for best practices" < vercel.json
```

### Performance Analysis

```bash
# Analyze bundle size
npm run build 2>&1 | grep -A 20 "bundle size" | gemini -p "analyze bundle size and suggest optimizations"

# Review performance critical code
gemini -p "identify performance bottlenecks and suggest optimizations" < quartz/components/Graph.tsx

# Analyze memory usage
gemini -p "review for memory leaks and optimization opportunities" < quartz/components/InteractiveAIDemo.tsx
```

### Security Auditing

```bash
# Security review
gemini -p "security audit: check for vulnerabilities, XSS, CSRF, and injection attacks" < quartz/components/AISearch.tsx

# API security
gemini -p "review API endpoints for security best practices" < netlify/functions/ai-assistant.ts

# Dependency security
npm audit --json | gemini -p "analyze security vulnerabilities and suggest fixes"
```

### Code Quality & Standards

```bash
# Linting suggestions
npm run lint 2>&1 | gemini -p "explain linting errors and suggest fixes"

# TypeScript strictness
gemini -p "review for TypeScript strict mode compliance and type safety" < component.tsx

# Accessibility audit
gemini -p "audit for accessibility issues (ARIA, keyboard navigation, screen readers)" < component.tsx

# Code style consistency
gemini -p "check for consistency with project coding standards" < component.tsx
```

## Automation Scripts

### Pre-commit Hook

```bash
#!/bin/bash
# Add to .git/hooks/pre-commit
echo "Running Gemini pre-commit review..."
git diff --cached | gemini -p "review for code quality, security, and best practices" > /tmp/gemini-review.txt
if [ $? -eq 0 ]; then
    echo "✅ Gemini review passed"
    cat /tmp/gemini-review.txt
else
    echo "❌ Gemini review failed"
    exit 1
fi
```

### Automated Testing

```bash
#!/bin/bash
# test-generator.sh
echo "Generating tests for $1..."
gemini -p "generate comprehensive Vitest tests with good coverage" < "$1" > "${1%.*}.test.ts"
echo "Tests generated: ${1%.*}.test.ts"
```

### Documentation Generator

```bash
#!/bin/bash
# doc-generator.sh
echo "Generating documentation for $1..."
gemini -p "generate comprehensive JSDoc documentation with examples" < "$1" > "${1%.*}.doc.md"
echo "Documentation generated: ${1%.*}.doc.md"
```

## IDE Integration

### VS Code Tasks

```json
// .vscode/tasks.json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Gemini: Review Current File",
      "type": "shell",
      "command": "gemini",
      "args": ["-p", "review this code for best practices", "<", "${file}"],
      "group": "build"
    },
    {
      "label": "Gemini: Generate Tests",
      "type": "shell",
      "command": "gemini",
      "args": ["-p", "generate Vitest tests", "<", "${file}"],
      "group": "test"
    }
  ]
}
```

### Shell Functions

```bash
# Add to your shell config
gemini-review() {
    gemini -p "review for best practices, security, and performance" < "$1"
}

gemini-test() {
    gemini -p "generate comprehensive Vitest tests" < "$1" > "${1%.*}.test.ts"
}

gemini-doc() {
    gemini -p "generate JSDoc documentation" < "$1" > "${1%.*}.doc.md"
}

gemini-refactor() {
    gemini -p "suggest refactoring improvements" < "$1"
}
```

## Batch Processing

### Multi-file Analysis

```bash
# Review all TypeScript files
find . -name "*.tsx" -o -name "*.ts" | xargs -I {} gemini -p "review for TypeScript best practices" < {}

# Generate tests for all components
find quartz/components -name "*.tsx" | xargs -I {} gemini -p "generate tests" < {} > {}.test.ts

# Security audit all files
find . -name "*.tsx" -o -name "*.ts" | xargs -I {} gemini -p "security audit" < {}
```

### Project-wide Analysis

```bash
# Architecture review
find . -name "*.tsx" -o -name "*.ts" | head -20 | xargs gemini -p "analyze overall architecture and suggest improvements"

# Dependency analysis
cat package.json | gemini -p "analyze dependencies for security, performance, and maintenance"

# Configuration review
gemini -p "review all configuration files for best practices" < quartz.config.ts < tsconfig.json < vitest.config.ts
```

## Best Practices

### Be Specific

```bash
# ❌ Bad
gemini -p "fix this"

# ✅ Good
gemini -p "fix TypeScript errors focusing on proper types and null safety"
```

### Include Context

```bash
# Include related files
gemini -p "refactor to match existing patterns" < new.tsx < existing.tsx

# Include styles
gemini -p "review component and styling" < component.tsx < component.scss
```

### Use Right Model

- `gemini-1.5-flash`: Quick questions, syntax checks
- `gemini-2.5-pro`: Complex analysis, creative tasks
- `gemini-1.5-pro`: Balanced performance

## Common Workflows

### Code Review

```bash
# Pre-commit review
git diff --cached | gemini -p "review changes for quality and issues"

# Component review
gemini -p "review for accessibility, performance, and best practices" < component.tsx
```

### Testing

```bash
# Generate tests
gemini -p "generate Vitest unit tests" < component.tsx

# Debug tests
gemini -p "analyze test failure and suggest fixes" < test-output.log
```

### Documentation

```bash
# Generate JSDoc
gemini -p "generate comprehensive JSDoc" < component.tsx

# Create examples
gemini -p "create usage examples" < component.tsx
```

## Useful Aliases

Add to your shell config:

```bash
alias review="gemini -p 'review for best practices and issues'"
alias testgen="gemini -p 'generate comprehensive tests'"
alias docgen="gemini -p 'generate documentation'"
alias ask="gemini -m gemini-1.5-flash -p"
alias security="gemini -p 'security audit for vulnerabilities'"
alias perf="gemini -p 'analyze for performance optimizations'"
alias a11y="gemini -p 'audit for accessibility issues'"
```

## Troubleshooting

```bash
# Debug mode
gemini -d -p "your prompt"

# Sandbox mode (safe execution)
gemini -s -p "execute safely"

# Include all files (use sparingly)
gemini -a -p "analyze entire codebase"
```

## Security Notes

- Always review AI-generated code before committing
- Don't share sensitive info in prompts
- Use environment variables for API keys
- Use sandbox mode for code execution

---

_Tailored for RatGarden: Quartz 4 + TypeScript + Preact + AI Features_
