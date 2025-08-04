# Task Completion Checklist

## Required Steps When Task is Complete

### 1. Code Quality Verification
```bash
npm run lint        # Check ESLint compliance
npm run typecheck   # Verify TypeScript types
npm run format      # Apply Prettier formatting
```

### 2. Testing Requirements
```bash
npm test                      # All unit tests must pass
npm run test:integration:mock # Integration tests with mocked API
npm run test:schemas         # Schema validation tests
```

### 3. Build Verification
```bash
npm run clean    # Clean previous build
npm run build    # Ensure clean TypeScript compilation
npm start        # Verify the server starts correctly
```

### 4. Documentation Updates (if applicable)
- Update README.md with new tool descriptions
- Update API documentation in docs/
- Update changelog if version changes

### 5. Environment Testing
- Test with sample .env configuration
- Verify Docker build works: `docker build -t float-mcp .`
- Check that all required environment variables are documented

## Pre-Commit Hooks
The project uses husky + lint-staged to automatically:
- Run ESLint with auto-fix on staged .ts files
- Apply Prettier formatting on staged .ts files

## Integration Testing Notes
- **Mock mode** (`npm run test:integration:mock`): Safe for CI/CD, no real API calls
- **Real API mode** (`npm run test:integration:real`): Requires valid FLOAT_API_KEY, use sparingly
- Performance tests may be skipped unless `TEST_SKIP_SLOW=false`

## Release Process (if applicable)
```bash
npm run changeset  # Create changeset entry
npm run version    # Bump version from changesets
npm run release    # Build and publish
```

## Critical Success Criteria
- ✅ Zero linting errors
- ✅ Zero TypeScript compilation errors  
- ✅ All tests pass (unit + integration mock)
- ✅ Clean build output in dist/
- ✅ Server starts without errors
- ✅ No loss of existing functionality