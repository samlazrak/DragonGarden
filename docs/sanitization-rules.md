# Sanitization Rules for Public Repository

This document outlines all the rules and patterns used by the sanitization script (`scripts/sanitize.ts`) to ensure sensitive data, private content, and development artifacts are excluded from the public repository.

## Overview

The sanitization process creates a clean, public version of the RatGarden digital garden by:

1. **Excluding** sensitive files and directories
2. **Removing** sensitive content patterns from files
3. **Creating** an enhanced `.gitignore` for ongoing protection
4. **Pushing** the sanitized version to a separate public repository

## File and Directory Exclusions

### Environment & Secrets

```
api/ai-assistant.js          # AI assistant implementation
private/                     # Private content directory
.env*                        # All environment files
*.env                        # Any file ending with .env
secrets/                     # Secret directories
secret/
private-keys/
api-keys/
config.json                  # Configuration files with secrets
secrets.json
credentials.json
```

### Development & IDE Files

```
.vscode/                     # VS Code settings
.claude/                     # Claude AI conversation logs
.idea/                       # IntelliJ/WebStorm settings
debug_*.cjs                  # Debug files
test_*.cjs
debug_*.css
debug_*.js
homebrew.mxcl.quartz.plist   # Homebrew service configuration
setup-launchagent.sh         # Launch agent setup script
```

### Internal Documentation

```
CLAUDE.md                    # Claude conversation logs
CURSOR.md                    # Cursor IDE documentation
DRAFT_MANAGEMENT.md          # Draft management notes
```

### Build & Cache Files

```
package-lock.json            # NPM lock file
.npmrc                       # NPM configuration
.node-version                # Node version specification
vercel.json                  # Vercel deployment config
.env.example                 # Environment example file
public/                      # Build output directory
.quartz-cache/               # Quartz cache
node_modules/                # Dependencies
coverage/                    # Test coverage
.nyc_output/
*.log                        # Logs and build artifacts
*.tgz
tsconfig.tsbuildinfo
```

### Temporary Files

```
temp/                        # Temporary directories
tmp/
*.bak                        # Backup files
*.backup
*~
config.local.*               # Local configuration files
*.local.*
```

### Security Certificates & Keys

```
*.key                        # All certificate and key files
*.pem
*.p12
*.pfx
*.crt
*.cert
```

### Test Files

```
tests/                       # Test directory
quartz/components/__tests__/ # Component tests
test-secrets.*               # Test files with secrets
*secret*.test.*
```

### Content Exclusions

```
content/docs/ai-features-documentation.md    # AI features documentation
content/blog/ai-features-showcase.md         # AI features showcase
content/blog/nvidia-computer-vision-projects.md  # NVIDIA projects
content/demos/ai-interactive-demos.md        # AI interactive demos
content/art/Ritual - Essential Grimoire.md   # Private art content
```

## Content Patterns Removed

The sanitization script removes these patterns from file contents using regex:

### API Keys

```
api_key
apiKey
API_KEY
OPENAI_API_KEY
ANTHROPIC_API_KEY
sk-[a-zA-Z0-9]*              # OpenAI API keys
sk-ant-[a-zA-Z0-9]*          # Anthropic API keys
```

### General Secrets

```
secret
password
token
```

## Enhanced .gitignore Creation

The script creates an enhanced `.gitignore` for the public repository that includes:

```gitignore
# Enhanced exclusions for public repository
# Environment files and secrets
.env
.env.*
*.env
secrets/
secret/
private/
private-keys/
api-keys/

# IDE and development-specific directories
.vscode/
.claude/
.idea/

# Development and debug files
debug_*.cjs
test_*.cjs
debug_*.css
debug_*.js
homebrew.mxcl.quartz.plist
setup-launchagent.sh

# Internal documentation and conversation logs
CLAUDE.md
CURSOR.md
DRAFT_MANAGEMENT.md

# Sensitive configuration files
package-lock.json
.npmrc
.node-version
vercel.json
.env.example

# Temporary files
temp/
tmp/

# Cache directories
.cache/
cache/

# Local configuration files
config.local.*
*.local.*

# Backup files
*.bak
*.backup
*~

# Test files that might contain sensitive data
test-secrets.*
*secret*.test.*

# Additional security exclusions
*.key
*.pem
*.p12
*.pfx
*.crt
*.cert
config.json
secrets.json
credentials.json

# API and sensitive files
api/ai-assistant.js
api/

# Content that should not be public
content/docs/ai-features-documentation.md
content/blog/ai-features-showcase.md
content/blog/nvidia-computer-vision-projects.md
content/demos/ai-interactive-demos.md
content/art/Ritual - Essential Grimoire.md

# Test files
tests/
quartz/components/__tests__/

# Build and cache files
public/
.quartz-cache/
prof/
node_modules/
coverage/
.nyc_output/
*.log
*.tgz
tsconfig.tsbuildinfo
```

## Configuration

The sanitization rules are defined in `scripts/sanitize-config.json`:

```json
{
  "publicRepoUrl": "git@github.com:samlazrak/Digital-Garden.git",
  "branchName": "main",
  "filesToExclude": [...],
  "patternsToRemove": [...],
  "contentToSanitize": ["content/docs/ai-features-documentation.md"],
  "gitConfig": {
    "userName": "RatGarden Sanitizer",
    "userEmail": "sanitizer@ratgarden.local"
  }
}
```

## Usage

### Running the Sanitization

```bash
npm run sanitize
```

### Dry Run (Preview Changes)

```bash
npm run sanitize -- --dry-run
```

## Security Considerations

1. **API Keys**: All common API key patterns are removed from file contents
2. **Environment Files**: All `.env` files and environment-related configurations are excluded
3. **Private Content**: Specific content files marked as private are excluded
4. **Development Artifacts**: Debug files, test files, and build artifacts are excluded
5. **IDE Settings**: Editor-specific configurations that might contain sensitive data are excluded
6. **Certificate Files**: All certificate and key file types are excluded

## Maintenance

### Adding New Exclusions

1. Update `scripts/sanitize-config.json` with new patterns
2. Update this documentation
3. Test with `npm run sanitize -- --dry-run`

### Adding New Content Patterns

1. Add regex patterns to `patternsToRemove` in the config
2. Update this documentation
3. Test pattern matching on sample files

### Content Review

Regularly review the excluded content to ensure:

- No new sensitive files are being created
- Excluded patterns remain relevant
- Public content doesn't accidentally reference private resources

## Tooling Integration

This documentation serves as a reference for:

- **CI/CD pipelines** that need to validate sanitization
- **Development tools** that should respect these exclusions
- **Code review processes** that check for sensitive data
- **Automated security scanning** tools

## Related Files

- `scripts/sanitize.ts` - Main sanitization script
- `scripts/sanitize-config.json` - Configuration file
- `docs/` - Documentation directory
- `.gitignore` - Standard gitignore (enhanced version created during sanitization)
