# Claude Modes Configuration

## Performance & Focus Settings

### Code Quality Checks

- **check_tests**: false

  - Skip running test suites unless explicitly requested
  - npm test failures are not blocking

- **check_linter**: false

  - Skip linter errors unless they prevent compilation
  - Focus on functionality over style warnings

- **check_types**: true
  - Only check TypeScript errors that prevent builds
  - Ignore minor type mismatches in tests

### Time Management

- **max_debug_time**: 1 minutes

  - Cap debugging sessions to avoid token waste
  - Move on if solution not found quickly

- **auto_fix_limit**: 3
  - Maximum attempts to fix the same error
  - Ask user for guidance after limit

### Content Creation

- **blog_style**: "practical"

  - Avoid absolutist statements
  - Focus on exploration and possibilities
  - Write for job portfolio context

- **medical_accuracy**: false
  - Always validate medical claims
  - Include evidence-based references

### Development Priorities

1. User-requested features
2. Compilation-blocking errors
3. Documentation and blog posts - but first document things within the effieciency systems I've made.
4. Nice-to-have improvements
5. Test coverage (only if requested)

## Usage

Check this file at the start of each query to calibrate approach.
