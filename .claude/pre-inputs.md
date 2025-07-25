---
completed: false
last_checked: 2025-07-25
---

# Pre-Inputs Task Tracker

## Current Task Status

**completed: false** - Task is active and requires attention

## Claude Opus Prompt Template

### Task Request

{{TASK_REQUEST}}

### Generated Prompt for Claude Opus

```markdown
{{OPUS_PROMPT}}
```

### Context & Requirements

- **Project**: RatGarden (Quartz 4 static site)
- **Stack**: TypeScript, Preact, SCSS, Markdown
- **Focus**: AI/Healthcare positioning, privacy-first approach
- **Key Components**: PrivacyAnalytics, MedicalCitations, SemanticLinks

### Instructions for Claude

1. Check this file first in every session
2. If `completed: true`, ignore and proceed with user query
3. If `completed: false`, this task is TOP PRIORITY
4. Use the generated prompt above for Claude Opus
5. Wait for user to provide task details before proceeding

### Template Variables

- `{{TASK_REQUEST}}` - Your request for what you want done
- `{{OPUS_PROMPT}}` - The generated prompt for Claude Opus
