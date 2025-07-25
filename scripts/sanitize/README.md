# Sanitization Scripts

Scripts for cleaning and sanitizing the repository for public deployment.

## Files

### Core Sanitization

- **`sanitize.ts`** - Main sanitization script
- **`sanitize-config.json`** - Sanitization configuration
- **`push-with-sanitize.ts`** - Push sanitized version to public repo
- **`test-sanitization.ts`** - Test sanitization process

## Usage

```bash
# Sanitize repository
npm run sanitize

# Test sanitization
npm run test-sanitization

# Push sanitized version
npm run push-with-sanitize
```

## Configuration

### `sanitize-config.json`

Contains configuration for:

- Public repository URL
- Files to exclude
- Patterns to remove
- Content to sanitize
- Git configuration

### What Gets Sanitized

#### Excluded Files

- Environment files (`.env*`)
- Private content (`content/`, `api/`)
- Development files (`.vscode/`, `.claude/`)
- Build artifacts (`public/`, `.quartz-cache/`)
- Sensitive configuration files

#### Removed Patterns

- API keys (`sk-*`, `sk-ant-*`)
- Secrets and passwords
- Personal information
- Internal documentation

## Process

1. **Copy** private repository to temporary location
2. **Remove** excluded files and directories
3. **Sanhize** content patterns from remaining files
4. **Create** enhanced `.gitignore`
5. **Push** to public repository

## Safety

- Original repository is never modified
- Sanitization is performed on a copy
- All sensitive data is preserved in private repo
- Public repo contains only safe, showcase content
