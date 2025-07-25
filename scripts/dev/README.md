# Development Scripts

Scripts for development workflow, graph generation, and environment setup.

## Files

### Development Workflow

- **`dev-with-drafts.ts`** - Development server with draft content enabled
- **`generate-graph-links.ts`** - Generate graph links for content visualization
- **`setup-launchagent.ts`** - Setup launch agent for development

## Usage

```bash
# Development with drafts
npm run dev-with-drafts

# Generate graph links
npm run generate-graph-links

# Setup launch agent
npm run setup-launchagent
```

## Script Details

### `dev-with-drafts.ts`

Runs the development server with draft content enabled for testing unpublished content.

### `generate-graph-links.ts`

Generates graph links for the content visualization system, connecting related content.

### `setup-launchagent.ts`

Sets up the launch agent for automatic development environment startup.

## Integration

These scripts are integrated into the main npm scripts:

- `npm run dev-with-drafts` - Development with drafts
- `npm run generate-graph-links` - Generate graph links
- `npm run setup-launchagent` - Setup launch agent
