# Float MCP Server - Essential Commands

## Development Workflow Commands

### Build & Development
```bash
npm run build          # Compile TypeScript to dist/
npm start              # Run compiled server (requires build first)
npm run dev            # Development mode with ts-node and auto-reload
npm run clean          # Remove dist/ directory
```

### Code Quality & Standards
```bash
npm run lint           # ESLint on src/ and tests/ (.ts files)
npm run typecheck      # TypeScript type checking without emit
npm run format         # Prettier formatting on src/ and tests/
```

### Testing Suite
```bash
npm test               # Run all unit tests
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Run tests with coverage report
npm run test:all       # Run unit tests + mock integration tests

# Integration Testing (requires FLOAT_API_KEY)
npm run test:integration        # All integration tests
npm run test:integration:mock   # Mock API responses (safe)
npm run test:integration:real   # Real API calls (use with caution)

# Specialized Test Suites
npm run test:performance        # Performance tests
npm run test:compatibility      # Compatibility tests
npm run test:schemas           # Schema validation tests
```

### Release Management
```bash
npm run changeset      # Create changeset for release
npm run version        # Update version from changesets
npm run release        # Build and publish (changeset publish)
```

### Docker Commands
```bash
docker build -t float-mcp .    # Build Docker image
docker run --rm -i \           # Run with environment variables
  -e FLOAT_API_KEY=flt_xxx \
  -e LOG_LEVEL=debug \
  float-mcp
```

## System Utilities (Linux)
- `ls` - List directory contents
- `cd` - Change directory
- `grep` - Search text patterns
- `find` - Find files/directories
- `git` - Version control operations

## Environment Setup
1. Copy `.env.example` to `.env`
2. Set `FLOAT_API_KEY=flt_your_api_key_here`
3. Optionally set `LOG_LEVEL=debug` for verbose logging

## Essential Task Completion Workflow
1. `npm run lint` - Check code standards
2. `npm run typecheck` - Verify TypeScript types
3. `npm run format` - Apply consistent formatting
4. `npm test` - Ensure all tests pass
5. `npm run test:integration:mock` - Verify integration works