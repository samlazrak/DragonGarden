# CURSOR.md

This file provides guidance to Cursor AI when working with code in this repository.

## Project Overview

This is a **Quartz 4** static site generator project for "The Rat's Garden" - a personal digital garden website. Quartz transforms Markdown content into a fully functional website with features like graph visualization, search, backlinks, and responsive design.

**Key Features**:

- AI-powered search with semantic embeddings using TensorFlow.js
- Interactive AI demos and writing assistants
- Medical citations and privacy analytics
- Canvas support for visual content with Pixi.js
- Semantic link discovery and optimization
- Comprehensive testing with Vitest
- Automated sanitization for public deployment

## Common Development Commands

### Build and Development

- `npm run dev` - Full development workflow: generates graph links, kills existing server, builds, and serves with hot reload
- `npm run build` - Build the static site
- `npm run serve` - Serve the built site locally
- `npm run kill` - Kill any process running on port 8080
- `npm run dev-with-drafts` - Development with draft content included
- `npm run serve-with-drafts` - Serve with drafts enabled

### Code Quality

- `npm run check` - Run TypeScript type checking and Prettier formatting check
- `npm run format` - Format code with Prettier
- `npm run test` - Run tests using Vitest
- `npm run test:ui` - Run tests with Vitest UI
- `npm run test:coverage` - Run tests with coverage reporting

### Utility Commands

- `npm run generate-graph-links` - Generate invisible graph links in index.md to improve graph visualization
- `npm run docs` - Build and serve documentation from docs folder
- `npm run clear-semantic-cache` - Clear the semantic link cache
- `npm run sanitize` - Run sanitization process for public repository
- `npm run push-with-sanitize` - Push changes with automatic sanitization

## Architecture Overview

### Core Structure

- **Content**: Markdown files in `content/` directory containing the actual website content
- **Configuration**: `quartz.config.ts` defines site settings, plugins, and theme
- **Layout**: `quartz.layout.ts` defines component placement and page layouts
- **Components**: Preact components in `quartz/components/` for UI elements
- **Plugins**: Modular system in `quartz/plugins/` for transformers, filters, and emitters

### Key Components

- **Build System**: `quartz/build.ts` - Main build orchestration with hot reload support
- **Plugin System**: Three types of plugins:
  - Transformers: Process markdown content (syntax highlighting, frontmatter, etc.)
  - Filters: Remove or modify content before processing
  - Emitters: Generate output files (HTML pages, assets, etc.)

### Custom Features

- **AI Components**: AISearch, AIWritingAssistant, InteractiveAIDemo, AIRecommendations, MedicalCitations, PrivacyAnalytics
- **Graph Link Generation**: `scripts/dev/generate-graph-links.ts` automatically adds invisible wikilinks to index.md
- **Custom Components**: TwoColumnNotes, HomePageLinks, ConditionalRender, CanvasViewer for enhanced layouts
- **Semantic Link Discovery**: Automatic semantic linking between related content with TensorFlow.js embeddings
- **Theme Customization**: Custom color schemes and typography in quartz.config.ts
- **Canvas Support**: Interactive canvas content with Pixi.js integration

## Technical Stack

- **Runtime**: Node.js v22+ with npm v10.9.2+
- **Language**: TypeScript with JSX (Preact)
- **Build Tool**: Custom build system with esbuild
- **Styling**: SCSS with CSS custom properties
- **Content**: Markdown with frontmatter, supports Obsidian/GitHub flavored markdown
- **Testing**: Vitest with happy-dom for component testing
- **AI/ML**: TensorFlow.js, Universal Sentence Encoder for semantic search
- **Graphics**: Pixi.js for canvas rendering, D3.js for data visualization
- **Analytics**: Plausible for privacy-focused analytics

## Plugin Configuration

The site uses carefully configured plugins for:

- **ObsidianFlavoredMarkdown**: Wikilinks and callouts
- **GitHubFlavoredMarkdown**: Tables, strikethrough, task lists
- **SyntaxHighlighting**: Code blocks with github-light/dark themes
- **Latex**: Mathematical expressions with KaTeX
- **TableOfContents**: Automatic TOC generation
- **Graph**: Interactive knowledge graph visualization
- **AI Search Index**: Enhanced search with AI capabilities using Universal Sentence Encoder
- **Semantic Link Config/Discovery**: Automated semantic relationships with TensorFlow.js
- **Canvas**: Interactive canvas content support
- **Custom OG Images**: Dynamic Open Graph image generation

## Development Workflow

1. Edit content in `content/` directory
2. Run `npm run dev` to start development server
3. Changes to content trigger automatic rebuild and browser refresh
4. Configuration changes require server restart
5. Use `npm run dev-with-drafts` to include draft content during development

## Important Notes

- The site uses Preact instead of React for smaller bundle size
- Custom graph link generation script runs before each build to maintain graph connectivity
- Hot reload is implemented with WebSocket connections
- The site is configured for deployment at `garden.samlazrak.com`
- AI features use TensorFlow.js for client-side semantic search
- Canvas content is supported with Pixi.js integration

## Writing Guidelines

- When writing for blog posts, especially for the RatGarden website, make it less verbose and generic-blog sounding

## Cursor-Specific Guidelines

### Code Generation Best Practices

- **ALWAYS** use TypeScript with proper type annotations
- **ALWAYS** follow the existing code style and patterns in the codebase
- **ALWAYS** use Preact instead of React for new components
- **ALWAYS** implement proper error boundaries for Preact components
- **ALWAYS** use SCSS for styling with CSS custom properties
- **ALWAYS** follow the existing component structure in `quartz/components/`
- **ALWAYS** write comprehensive unit tests with Vitest

### File Organization

- **Components**: Place new components in `quartz/components/` with corresponding `.scss` files in `quartz/components/styles/`
- **Scripts**: Place inline scripts in `quartz/components/scripts/`
- **Content**: Add new content in appropriate subdirectories under `content/`
- **Tests**: Place tests in `tests/` directory or alongside components with `__tests__` folders
- **Utility Scripts**: Use `scripts/` directory for build and maintenance scripts

### Testing and Development Best Practices

- **ALWAYS** write unit tests first following Test-Driven Development (TDD) methodology
- **ALWAYS** include comprehensive error handling with try-catch blocks
- **ALWAYS** validate and sanitize all user inputs
- **ALWAYS** implement proper loading states and error boundaries for Preact components
- **ALWAYS** write tests that cover:
  - Happy path scenarios
  - Edge cases and error conditions
  - Input validation
  - Component rendering and state management
  - Async operations and API calls
- **ALWAYS** use Vitest with happy-dom for component testing
- **ALWAYS** mock external dependencies and API calls in tests
- **ALWAYS** ensure code has proper error recovery mechanisms
- **NEVER** assume code works without tests - verify functionality through unit/integration tests
- **AIM** for 80%+ test coverage

### AI Component Development

- **ALWAYS** implement proper loading states for AI features
- **ALWAYS** handle API rate limits and errors gracefully
- **ALWAYS** provide fallback functionality when AI services are unavailable
- **ALWAYS** implement proper privacy controls for user data
- **ALWAYS** test AI components with mocked responses

### Canvas and Graphics Development

- **ALWAYS** use Pixi.js for canvas rendering
- **ALWAYS** implement proper cleanup for graphics resources
- **ALWAYS** handle responsive design for canvas elements
- **ALWAYS** provide fallback content for non-canvas browsers

### Cursor AI Features

- **Use Chat**: Leverage Cursor's chat feature for complex refactoring and debugging
- **Code Actions**: Use Cursor's code actions for quick fixes and improvements
- **Multi-file Editing**: Take advantage of Cursor's ability to edit multiple files simultaneously
- **Context Awareness**: Cursor understands the full codebase context, use this for better suggestions
- **Terminal Integration**: Use Cursor's integrated terminal for running npm commands and tests

### Repository Management

- **NEVER** commit sensitive data or private content
- **ALWAYS** use the sanitization system before public pushes
- **ALWAYS** test changes locally before committing
- **ALWAYS** follow the established git workflow

### Performance Considerations

- **ALWAYS** optimize bundle size for AI components
- **ALWAYS** implement lazy loading for heavy dependencies
- **ALWAYS** use proper caching strategies for semantic search
- **ALWAYS** monitor and optimize rendering performance
