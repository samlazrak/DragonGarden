# GitHub Workflows Setup for Sanitization

This document explains how to set up the GitHub workflows that automatically sanitize and push your private repository to a public repository.

## Overview

The workflows provide two main functions:

1. **Manual sanitization** - Triggered manually with options for dry-run and fast mode
2. **Automatic sanitization** - Triggered by pushes to main branch (only for source code changes)
3. **Scheduled sanitization** - Runs weekly to keep the public repo in sync

## Required GitHub Secrets

You need to set up the following secrets in your private repository's GitHub settings:

### 1. `PUBLIC_REPO_SSH_KEY`

This is the SSH private key that allows the workflow to push to your public repository.

**To generate and set up:**

1. Generate a new SSH key pair (if you don't have one for the public repo):

   ```bash
   ssh-keygen -t ed25519 -C "github-actions@ratgarden.local" -f ~/.ssh/github_actions_key
   ```

2. Add the **public key** to your public repository:

   - Go to your public repository on GitHub
   - Navigate to Settings → Deploy keys
   - Click "Add deploy key"
   - Title: `GitHub Actions Sanitizer`
   - Key: Copy the content of `~/.ssh/github_actions_key.pub`
   - Check "Allow write access"
   - Click "Add key"

3. Add the **private key** to your private repository:
   - Go to your private repository on GitHub
   - Navigate to Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `PUBLIC_REPO_SSH_KEY`
   - Value: Copy the content of `~/.ssh/github_actions_key` (the private key)
   - Click "Add secret"

### 2. `PUBLIC_REPO_URL` (Optional)

If your public repository URL is different from the default in `sanitize-config.json`, set this secret.

- Name: `PUBLIC_REPO_URL`
- Value: `git@github.com:yourusername/your-public-repo.git`

## Workflow Files

### 1. `sanitize-and-push.yml`

- **Manual trigger**: Go to Actions → "Sanitize and Push to Public Repo" → "Run workflow"
- **Automatic trigger**: Pushes to main branch (only for source code changes)
- **Options**:
  - `dry_run`: Run without actually pushing (for testing)
  - `fast_mode`: Skip confirmation and use optimized git operations

### 2. `scheduled-sanitize.yml`

- **Scheduled**: Runs every Sunday at 2 AM UTC
- **Manual trigger**: Can be forced to run even if no changes detected
- **Smart**: Only runs if there are relevant changes in source code

## Security Considerations

1. **SSH Key Security**: The SSH key should only have access to the public repository
2. **Workflow Isolation**: Workflow files are excluded from the public repository
3. **Content Filtering**: Only source code is pushed, no content or sensitive files
4. **Automatic Sanitization**: API keys and sensitive data are automatically removed

## Troubleshooting

### Workflow Fails with SSH Error

- Verify the SSH key is correctly added to both repositories
- Check that the public key has write access to the public repository
- Ensure the private key secret is correctly set in the private repository

### Workflow Runs but No Changes Pushed

- Check if there are actual changes in source code files
- Verify the public repository URL is correct
- Check the workflow logs for specific error messages

### Manual Workflow Not Appearing

- Ensure the workflow files are committed to the main branch
- Check that the workflow files are in the `.github/workflows/` directory
- Verify the YAML syntax is correct

## Monitoring

- Check the Actions tab in your private repository to monitor workflow runs
- Workflow logs will show what files were included/excluded
- Successful runs will show the public repository URL and branch

## Customization

You can customize the sanitization behavior by editing:

- `scripts/sanitize-config.json` - Configuration for what to exclude/include
- `scripts/sanitize.ts` - The sanitization logic itself
- Workflow files - Trigger conditions and execution steps

Remember: The workflow files themselves are excluded from the public repository to maintain security.
