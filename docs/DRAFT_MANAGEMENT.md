# Draft Management

This document explains how to work with draft posts in your Quartz digital garden.

## Overview

By default, posts marked with `draft: true` in their frontmatter are excluded from the build. This prevents unfinished content from being published to your live site.

## Quick Start

### Normal Development (Drafts Excluded)
```bash
npm run dev
```

### Development with Drafts Included
```bash
npm run dev-with-drafts
```

### Quick Serve with Drafts (if already built)
```bash
npm run serve-with-drafts
```

### Using the Shell Script
```bash
./scripts/dev-with-drafts.sh
```

## Environment Variable

You can also set the environment variable manually:
```bash
export QUARTZ_INCLUDE_DRAFTS=true
npm run dev
```

## How It Works

The `RemoveDrafts` plugin in `quartz/plugins/filters/draft.ts` checks for the `QUARTZ_INCLUDE_DRAFTS` environment variable:

- **When `QUARTZ_INCLUDE_DRAFTS` is not set or not "true"**: Draft posts are filtered out
- **When `QUARTZ_INCLUDE_DRAFTS=true`**: All posts are included, including drafts

## Marking Posts as Drafts

To mark a post as a draft, add `draft: true` to the frontmatter:

```markdown
---
title: My Draft Post
draft: true
tags: [draft, example]
---

This post will only be visible when drafts are enabled.
```

## Current Draft Posts

The following posts are currently marked as drafts:

- `content/blog/ai-features-showcase.md`
- `content/blog/nvidia-computer-vision-projects.md`
- `content/demos/ai-interactive-demos.md`
- `content/docs/ai-features-documentation.md`
- `content/art/Ritual - Essential Grimoire.md`
- `docs/features/upcoming features.md`

## Production Deployment

When deploying to production, drafts are automatically excluded unless you explicitly set the environment variable. This ensures that only finished content is published.

## Troubleshooting

If drafts are not showing up:

1. Make sure you're using one of the draft-enabled commands
2. Check that the frontmatter contains `draft: true` (not `draft: "true"` as a string)
3. Verify the environment variable is set correctly: `echo $QUARTZ_INCLUDE_DRAFTS` 