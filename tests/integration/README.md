# Float MCP Integration Tests

This directory contains comprehensive integration tests for all Float API endpoints implemented in the MCP server.

## Quick Start

```bash
# Install dependencies
npm install

# Run mock tests (safe, no real API calls)
npm run test:integration:mock

# Run real API tests (requires FLOAT_API_KEY)
export FLOAT_API_KEY=your_api_key_here
npm run test:integration:real

# Run all tests with coverage
npm run test:coverage
```

## Test Structure

```
integration/
├── setup.ts                           # Test environment setup
├── test-environment.ts               # Environment configuration
├── utils/
│   ├── test-helpers.ts               # Test utilities and helpers
│   ├── schema-validator.ts           # Schema validation utilities
│   └── error-handling.ts             # Error testing utilities
├── tools/
│   ├── projects.integration.test.ts   # Project tools tests
│   ├── people.integration.test.ts     # People tools tests
│   ├── tasks.integration.test.ts      # Task tools tests
│   └── [other tool categories]
├── pagination-filtering.integration.test.ts
└── rate-limiting.integration.test.ts
```

## Test Categories

### 1. Core API Integration Tests (`tools/`)

Tests for all 155+ Float API endpoints covering:

- **CRUD Operations**: Create, Read, Update, Delete
- **Data Validation**: Schema validation for all responses
- **Error Handling**: Authentication, authorization, validation errors
- **Edge Cases**: Boundary conditions, null values, invalid data

#### Tool Categories Covered:

- Projects (5 tools)
- People (5 tools)
- Tasks (5 tools)
- Clients (5 tools)
- Allocations (5 tools)
- Departments (5 tools)
- Statuses (8 tools)
- Reports (3 tools)
- Phases (8 tools)
- Public Holidays (5 tools)
- Team Holidays (8 tools)
- Accounts (11 tools)
- Milestones (9 tools)
- Time Off (10 tools)
- Time Off Types (5 tools)
- Roles (9 tools)
- Project Tasks (11 tools)

### 2. Pagination & Filtering Tests

Tests for query parameter handling:

- **Pagination**: `page`, `per-page` parameters
- **Filtering**: Entity-specific filters (status, date ranges, etc.)
- **Sorting**: Order and direction parameters
- **Combined Operations**: Pagination with filtering

### 3. Rate Limiting Tests

Validation of Float API rate limit compliance:

- **Request Throttling**: Respect configured rate limits
- **Burst Handling**: Handle rapid request bursts gracefully
- **Recovery**: Proper recovery after rate limit periods
- **Error Responses**: Correct 429 error handling

## Test Modes

### Mock Mode (Default)

- Uses mocked API responses
- Fast execution (~2 minutes)
- No real API calls required
- Safe for CI/CD pipelines

### Real API Mode

- Makes actual Float API calls
- Requires valid `FLOAT_API_KEY`
- Slower execution (~15 minutes)
- Tests real integration scenarios

### Performance Mode

- Includes slow-running tests
- Measures actual performance metrics
- Rate limiting validation
- Resource usage monitoring

## Configuration

### Environment Variables

Copy `.env.test` and configure:

```bash
# Test mode
TEST_REAL_API=false                    # Enable real API calls
TEST_MOCK_MODE=true                    # Use mocked responses
TEST_SKIP_SLOW=true                    # Skip slow tests

# API configuration
FLOAT_API_KEY=your_api_key_here       # Float API key (required for real tests)
FLOAT_API_BASE_URL=https://api.float.com/v3

# Test tuning
TEST_TIMEOUT=30000                     # Test timeout (ms)
TEST_RETRY_ATTEMPTS=3                  # Retry attempts for failed requests
TEST_RETRY_DELAY=1000                  # Delay between retries (ms)
```

### Test Data

- **Prefixed Names**: All test data uses `test_integration_` prefix
- **Timestamp-based**: Unique identifiers to avoid conflicts
- **Cleanup**: Automatic cleanup after tests (when API supports it)
- **Isolation**: Tests don't depend on each other

## Running Tests

### Local Development

```bash
# Mock tests (recommended for development)
npm run test:integration:mock

# Real API tests (requires API key)
npm run test:integration:real

# Performance tests
npm run test:performance

# Specific test file
npm run test:integration -- --testNamePattern="projects"

# Watch mode for development
npm run test:integration:mock -- --watch
```

### CI/CD Pipeline

Tests run automatically on:

- **Pull Requests**: Mock tests only
- **Main Branch**: Mock tests + real API tests (scheduled)
- **Manual Trigger**: Choice of mock, real, or performance tests

## Test Utilities

### Test Helpers (`utils/test-helpers.ts`)

```typescript
// Execute tool with retry logic
const result = await executeToolWithRetry('list-projects', {});

// Generate test data
const projectData = generateTestProjectData();

// Batch operations
const results = await executeBatch(operations, batchSize);
```

### Schema Validation (`utils/schema-validator.ts`)

```typescript
// Validate single entity
entitySchemaValidator.validateProject(project);

// Validate array of entities
entitySchemaValidator.validateProjects(projects);

// Custom validation
const result = schemaValidator.validate(data, customSchema);
```

### Error Testing (`utils/error-handling.ts`)

```typescript
// Test authentication errors
await ErrorTestUtils.testAuthenticationError(toolName, params);

// Test validation errors
await ErrorTestUtils.testValidationError(toolName, invalidParams);

// Test not found errors
await ErrorTestUtils.testNotFoundError(toolName, params);
```

## Best Practices

### Writing Tests

1. **Use Real Scenarios**: Test realistic use cases
2. **Validate Schemas**: Always validate response schemas
3. **Test Error Cases**: Include negative test cases
4. **Clean Up**: Remove test data when possible
5. **Isolation**: Don't depend on other tests

### Test Data Management

1. **Unique Identifiers**: Use timestamps and random strings
2. **Prefixes**: Use consistent prefixes for identification
3. **Cleanup**: Remove test data after tests complete
4. **Isolation**: Each test should be independent

### Performance Considerations

1. **Rate Limiting**: Respect API rate limits
2. **Timeouts**: Set appropriate timeouts
3. **Concurrency**: Limit concurrent requests
4. **Retries**: Implement retry logic for flaky tests

## Troubleshooting

### Common Issues

#### Authentication Errors

```
Error: authentication failed
```

**Solution**: Verify `FLOAT_API_KEY` is set correctly

#### Rate Limiting

```
Error: rate limit exceeded
```

**Solution**: Increase delays between requests or reduce batch size

#### Timeout Errors

```
Error: timeout exceeded
```

**Solution**: Increase `TEST_TIMEOUT` or check network connection

#### Schema Validation Failures

```
Error: schema validation failed
```

**Solution**: Update schemas to match actual API response format

### Debugging

1. **Enable Debug Logging**: Set `LOG_LEVEL=debug`
2. **Run Single Test**: Use Jest's test filtering
3. **Check API Responses**: Enable response logging
4. **Validate Environment**: Check all environment variables

## Contributing

### Adding New Tests

1. Create test file in appropriate directory
2. Follow existing test patterns
3. Include schema validation
4. Add error handling tests
5. Update documentation

### Improving Coverage

1. Identify uncovered code paths
2. Add missing test scenarios
3. Improve error handling tests
4. Add performance benchmarks

For detailed information, see the [Integration Testing Guide](../../docs/INTEGRATION_TESTING.md).
