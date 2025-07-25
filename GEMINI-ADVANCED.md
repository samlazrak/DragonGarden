# GEMINI Advanced Patterns

## Power User Workflows

### 🚀 One-Liner Magic

```bash
# Review all staged changes and generate commit message
git diff --cached | gemini -p "review changes and generate conventional commit message"

# Analyze build output and suggest fixes
npm run build 2>&1 | gemini -p "analyze errors and provide specific fixes"

# Security audit entire project
find . -name "*.tsx" -o -name "*.ts" | xargs -I {} gemini -p "security audit: check for vulnerabilities" < {}

# Generate tests for all components
find quartz/components -name "*.tsx" | xargs -I {} gemini -p "generate Vitest tests" < {} > {}.test.ts
```

### 🔄 Pipeline Patterns

```bash
# Code review → Generate tests → Update docs
gemini -p "review and suggest improvements" < component.tsx | \
gemini -p "generate tests based on review" | \
gemini -p "create documentation from tests" > component.doc.md

# Build → Analyze → Optimize
npm run build 2>&1 | \
gemini -p "analyze bundle size and performance" | \
gemini -p "suggest specific optimizations"
```

### 🎯 Context-Aware Analysis

```bash
# Include related files for better analysis
gemini -p "refactor to match existing patterns" < new-component.tsx < existing-component.tsx < styles.scss

# Cross-file dependency analysis
gemini -p "analyze dependencies and suggest improvements" < component.tsx < types.ts < utils.ts

# Configuration consistency check
gemini -p "ensure consistency across configs" < tsconfig.json < quartz.config.ts < vitest.config.ts
```

## Advanced Automation

### 🔧 Custom Functions

```bash
# Add to your shell config
gemini-full-audit() {
    local file="$1"
    echo "=== CODE REVIEW ==="
    gemini -p "comprehensive code review" < "$file"
    echo "=== SECURITY AUDIT ==="
    gemini -p "security vulnerability scan" < "$file"
    echo "=== PERFORMANCE ANALYSIS ==="
    gemini -p "performance optimization suggestions" < "$file"
    echo "=== ACCESSIBILITY AUDIT ==="
    gemini -p "accessibility compliance check" < "$file"
}

gemini-component-generator() {
    local name="$1"
    local feature="$2"
    gemini -p "create a new Quartz component named $name for $feature with TypeScript, SCSS, and tests" > "quartz/components/$name.tsx"
    gemini -p "generate SCSS styles for $name component" > "quartz/components/styles/$name.scss"
    gemini -p "generate comprehensive tests for $name component" > "quartz/components/__tests__/$name.test.tsx"
}
```

### 🎛️ Model-Specific Workflows

```bash
# Fast feedback loop
gemini -m gemini-1.5-flash -p "quick syntax check" < file.tsx

# Deep analysis
gemini -m gemini-2.5-pro -p "comprehensive architectural review" < file.tsx

# Creative solutions
gemini -m gemini-1.5-pro -p "suggest innovative approaches" < file.tsx
```

## Project-Specific Patterns

### 🏗️ Quartz Development

```bash
# Component lifecycle
gemini -p "create new Quartz component with proper TypeScript types" > component.tsx
gemini -p "add SCSS styling following project patterns" < component.tsx > component.scss
gemini -p "generate comprehensive tests" < component.tsx > component.test.tsx
gemini -p "update component index" < quartz/components/index.ts

# Plugin development
gemini -p "create new Quartz plugin with proper structure" > quartz/plugins/myPlugin.ts
gemini -p "add plugin to configuration" < quartz.config.ts

# Content optimization
gemini -p "optimize markdown for SEO and readability" < content/blog/post.md
gemini -p "generate frontmatter with proper metadata" < content/blog/post.md
```

### 🤖 AI Features Integration

```bash
# API endpoint review
gemini -p "review Netlify function for security and performance" < netlify/functions/ai-assistant.ts

# Component integration
gemini -p "integrate AI features with existing components" < quartz/components/AISearch.tsx < quartz/components/Search.tsx

# Error handling
gemini -p "implement robust error handling for AI features" < quartz/components/InteractiveAIDemo.tsx

# Testing AI components
gemini -p "generate tests for AI component interactions" < quartz/components/AIWritingAssistant.tsx
```

## Debugging & Troubleshooting

### 🔍 Advanced Debugging

```bash
# Debug with context
gemini -d -p "debug this issue with full context" < error.log < component.tsx < config.ts

# Performance profiling
gemini -p "analyze performance bottlenecks" < component.tsx < performance-profile.json

# Memory leak detection
gemini -p "identify potential memory leaks" < component.tsx < memory-usage.log
```

### 🛠️ Build System Debugging

```bash
# TypeScript errors
npx tsc --noEmit 2>&1 | gemini -p "explain TypeScript errors and suggest fixes"

# Webpack analysis
npm run build 2>&1 | grep -A 50 "webpack" | gemini -p "analyze webpack configuration and suggest optimizations"

# Dependency conflicts
npm ls 2>&1 | gemini -p "analyze dependency conflicts and suggest resolutions"
```

## Quality Assurance

### 🧪 Comprehensive Testing

```bash
# Test strategy generation
gemini -p "create comprehensive testing strategy" < component.tsx > test-strategy.md

# Test case generation
gemini -p "generate edge case tests" < component.tsx > edge-cases.test.ts

# Integration test planning
gemini -p "plan integration tests for component interactions" < component1.tsx < component2.tsx
```

### 📊 Code Quality Metrics

```bash
# Complexity analysis
gemini -p "analyze code complexity and suggest simplifications" < component.tsx

# Maintainability review
gemini -p "assess maintainability and suggest improvements" < component.tsx

# Technical debt identification
gemini -p "identify technical debt and suggest refactoring" < component.tsx
```

## Deployment & DevOps

### 🚀 Deployment Optimization

```bash
# Build optimization
gemini -p "optimize build configuration for production" < quartz.config.ts

# Deployment strategy
gemini -p "review deployment configuration for best practices" < vercel.json < netlify.toml

# Environment configuration
gemini -p "review environment variables and security" < .env.example
```

### 📈 Monitoring & Analytics

```bash
# Performance monitoring
gemini -p "implement performance monitoring for AI features" < quartz/components/AISearch.tsx

# Error tracking
gemini -p "add comprehensive error tracking" < quartz/components/InteractiveAIDemo.tsx

# Analytics integration
gemini -p "integrate privacy-focused analytics" < quartz/components/PrivacyAnalytics.tsx
```

## Creative Applications

### 🎨 Content Generation

```bash
# Blog post ideas
gemini -p "generate 10 blog post ideas for AI and development" > content-ideas.md

# Documentation improvement
gemini -p "improve documentation with examples and tutorials" < README.md

# Code examples
gemini -p "create comprehensive code examples" < component.tsx > examples.md
```

### 🔮 Future Planning

```bash
# Feature roadmap
gemini -p "suggest feature roadmap based on current codebase" < quartz.config.ts < package.json

# Technology migration
gemini -p "plan migration strategy for new technologies" < package.json < tsconfig.json

# Architecture evolution
gemini -p "suggest architecture improvements for scalability" < quartz.config.ts
```

---

_Advanced patterns for power users - use responsibly!_
