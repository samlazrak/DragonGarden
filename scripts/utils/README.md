# Utility Scripts

General utility scripts and CLI tools for the RatGarden project.

## Files

### CLI Tools

- **`cli.ts`** - Main CLI interface for scripts
- **`clear-semantic-cache.ts`** - Clear semantic search cache

## Usage

```bash
# Run CLI
npm run cli

# Clear semantic cache
npm run clear-semantic-cache
```

## Script Details

### `cli.ts`

Main CLI interface that provides access to various project utilities and scripts.

### `clear-semantic-cache.ts`

Clears the semantic search cache to force regeneration of search indices.

## Integration

These utilities are integrated into the main npm scripts:

- `npm run cli` - Run CLI interface
- `npm run clear-semantic-cache` - Clear semantic cache

## Extending

To add new utilities:

1. Create the script in this directory
2. Add npm script entry in `package.json`
3. Update this README with documentation
