# Sub-Agent Usage Patterns for Maximum Efficiency

## Available Sub-Agents and Their Optimal Use Cases

### 1. unit-test-engineer
**When to use:**
- After implementing any new function/component
- Batch testing multiple files
- Creating comprehensive test suites
- Validating refactored code

**Token-saving example:**
```markdown
# Instead of: "Write tests for getUserData, processPayment, and validateInput functions"
# Use: "Launch unit-test-engineer to create tests for all functions in src/utils/"
```

### 2. code-reviewer
**When to use:**
- After completing feature implementation
- Before commits
- Checking security/performance issues
- Reviewing architectural decisions

**Token-saving example:**
```markdown
# Instead of: "Review this code for best practices, security issues, and performance"
# Use: "Launch code-reviewer for src/components/Authentication.tsx"
```

### 3. software-architecture-expert
**When to use:**
- Starting new projects
- Major refactoring decisions
- Technology stack selection
- System design questions

**Token-saving example:**
```markdown
# Instead of: "How should I structure a real-time collaboration system?"
# Use: "Launch architecture expert to design real-time collab architecture"
```

### 4. ai-ml-engineer-mentor
**When to use:**
- Implementing AI features
- ML model integration
- Performance optimization for AI
- Understanding AI/ML concepts

**Token-saving example:**
```markdown
# Instead of: "How do I add semantic search to my app?"
# Use: "Launch AI mentor for semantic search implementation guidance"
```

### 5. professional-writer-career-advisor
**When to use:**
- Writing technical blog posts
- Creating documentation
- Resume/LinkedIn updates
- Career planning

**Token-saving example:**
```markdown
# Instead of: "Help me write a blog post about my project"
# Use: "Launch writer agent for blog post about distributed systems project"
```

### 6. natural-writing-humanizer
**When to use:**
- Making content sound more personal
- Rewriting AI-generated text
- Creating engaging user communications

**Token-saving example:**
```markdown
# Instead of: "Rewrite this to sound more human"
# Use: "Launch humanizer agent for README personalization"
```

## Efficient Sub-Agent Workflows

### Pattern 1: Sequential Specialization
```markdown
1. Architecture expert → Design system
2. Main Claude → Implement core
3. Unit test engineer → Create tests
4. Code reviewer → Final review
```

### Pattern 2: Parallel Processing
```markdown
Launch simultaneously:
- Test engineer for existing code
- Code reviewer for completed modules
- Architecture expert for next phase
```

### Pattern 3: Batch Operations
```markdown
# Collect similar tasks, then:
"Launch unit-test-engineer to test all new components:
- UserProfile.tsx
- Dashboard.tsx  
- Settings.tsx"
```

## Sub-Agent Prompting Best Practices

### 1. Be Specific with Context
```markdown
Good: "Launch code-reviewer to check AuthService.ts for security vulnerabilities, focusing on JWT handling"
Bad: "Review my code"
```

### 2. Provide Clear Boundaries
```markdown
Good: "Launch test engineer for all functions in src/utils/ except deprecated ones"
Bad: "Write some tests"
```

### 3. Chain Outputs Efficiently
```markdown
"Launch architecture expert to design caching strategy. 
Then I'll implement it and have code-reviewer verify the implementation."
```

## Token Optimization Strategies

### 1. Let Sub-Agents Handle Research
```markdown
# Don't ask main Claude to explore options
# Use: "Launch architecture expert to research and recommend state management solutions"
```

### 2. Batch Similar Tasks
```markdown
# Collect all test-writing needs
# Single launch: "Test engineer: Create tests for modules A, B, C"
```

### 3. Use Sub-Agents for Iterations
```markdown
# Instead of multiple main Claude iterations
# Use: "Code reviewer: Iterate until no linting errors"
```

## Common Patterns by Project Type

### Web Development
```markdown
1. Architecture expert: Component structure
2. Main Claude: Implementation
3. Test engineer: Component tests
4. Code reviewer: Accessibility/performance
```

### API Development
```markdown
1. Architecture expert: Endpoint design
2. Main Claude: Implementation  
3. Test engineer: Integration tests
4. Code reviewer: Security audit
```

### Data Processing
```markdown
1. AI/ML mentor: Algorithm selection
2. Main Claude: Implementation
3. Test engineer: Edge case tests
4. Code reviewer: Performance optimization
```

## Measuring Efficiency

### Track Token Savings
```bash
# Before: 5000 tokens for full implementation
# After: 
#   - Main Claude: 2000 tokens
#   - Sub-agents: 1500 tokens (don't count against limit)
# Savings: 30% of token budget
```

### Success Metrics
- Fewer clarification requests
- Completed tasks in single session
- Reusable patterns identified
- Less context switching