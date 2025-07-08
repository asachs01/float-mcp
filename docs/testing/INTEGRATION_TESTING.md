# Integration Testing Guide

This document provides comprehensive information about the integration testing suite for the Float MCP server.

## Overview

The integration testing suite provides comprehensive coverage for all 155+ Float API endpoints implemented in the MCP server. The tests are designed to validate:

- **API Integration**: All tools work correctly with the Float API
- **Schema Validation**: All responses match expected Zod schemas
- **Error Handling**: Proper handling of various error scenarios
- **Rate Limiting**: Compliance with Float API rate limits
- **Pagination & Filtering**: Correct implementation of query parameters
- **Performance**: Acceptable response times and resource usage

## Test Structure

```
tests/
├── integration/
│   ├── setup.ts                           # Test environment setup
│   ├── test-environment.ts               # Environment configuration
│   ├── utils/
│   │   ├── test-helpers.ts               # Test utilities and helpers
│   │   ├── schema-validator.ts           # Schema validation utilities
│   │   └── error-handling.ts             # Error testing utilities
│   ├── tools/
│   │   ├── projects.integration.test.ts   # Project tools tests
│   │   ├── people.integration.test.ts     # People tools tests
│   │   ├── tasks.integration.test.ts      # Task tools tests
│   │   └── [other tool categories]
│   ├── pagination-filtering.integration.test.ts
│   └── rate-limiting.integration.test.ts
├── setup.ts                              # Global test setup
└── .env.test                             # Test environment variables
```

## Test Categories

### 1. Core API Integration Tests

Tests for all tool categories covering CRUD operations:

#### Project Tools (5 tools)
- `list-projects` - List all projects with filtering
- `get-project` - Get project details
- `create-project` - Create new project
- `update-project` - Update existing project
- `delete-project` - Archive project

#### People Tools (5 tools)
- `list-people` - List all people with filtering
- `get-person` - Get person details
- `create-person` - Create new person
- `update-person` - Update existing person
- `delete-person` - Archive person

#### Task Tools (5 tools)
- `list-tasks` - List all tasks with filtering
- `get-task` - Get task details
- `create-task` - Create new task
- `update-task` - Update existing task
- `delete-task` - Delete task

#### Client Tools (5 tools)
- `list-clients` - List all clients
- `get-client` - Get client details
- `create-client` - Create new client
- `update-client` - Update existing client
- `delete-client` - Delete client

#### Allocation Tools (5 tools)
- `list-allocations` - List all allocations with filtering
- `get-allocation` - Get allocation details
- `create-allocation` - Create new allocation
- `update-allocation` - Update existing allocation
- `delete-allocation` - Delete allocation

#### Department Tools (5 tools)
- `list-departments` - List all departments
- `get-department` - Get department details
- `create-department` - Create new department
- `update-department` - Update existing department
- `delete-department` - Delete department

#### Status Tools (8 tools)
- `list-statuses` - List all statuses
- `get-status` - Get status details
- `create-status` - Create new status
- `update-status` - Update existing status
- `delete-status` - Delete status
- `get-default-status` - Get default status
- `set-default-status` - Set default status
- `get-statuses-by-type` - Get statuses by type

#### Report Tools (3 tools)
- `get-time-report` - Generate time reports
- `get-project-report` - Generate project reports
- `get-people-utilization-report` - Generate utilization reports

#### Phase Tools (8 tools)
- `list-phases` - List all phases
- `get-phase` - Get phase details
- `create-phase` - Create new phase
- `update-phase` - Update existing phase
- `delete-phase` - Delete phase
- `list-phases-by-project` - List phases by project
- `get-phases-by-date-range` - Get phases by date range
- `get-active-phases` - Get active phases
- `get-phase-schedule` - Get phase schedule

#### Holiday Tools (13 tools)
- Public holidays (5 tools)
- Team holidays (8 tools)

#### Account Tools (11 tools)
- Account management and permissions

#### Milestone Tools (9 tools)
- Milestone management and tracking

#### Time Off Tools (10 tools)
- Time off requests and management

#### Time Off Type Tools (5 tools)
- Time off type configuration

#### Role Tools (9 tools)
- Role management and permissions

#### Project Task Tools (11 tools)
- Project task management

### 2. Schema Validation Tests

Every API response is validated against its corresponding Zod schema:

```typescript
// Example schema validation
const result = await executeToolWithRetry('list-projects', {});
entitySchemaValidator.validateProjects(result);
```

### 3. Error Handling Tests

Comprehensive error scenario testing:

- **401 Authentication Errors**: Invalid API keys
- **403 Authorization Errors**: Insufficient permissions
- **404 Not Found Errors**: Non-existent resources
- **400 Validation Errors**: Invalid request data
- **429 Rate Limit Errors**: Too many requests
- **500 Server Errors**: Internal server errors

### 4. Pagination & Filtering Tests

Testing query parameter handling:

- **Pagination**: `page`, `per-page` parameters
- **Filtering**: Entity-specific filters
- **Sorting**: Order and direction parameters
- **Date Ranges**: Start and end date filtering
- **Status Filtering**: Active/inactive status

### 5. Rate Limiting Tests

Validating rate limit compliance:

- **Request Throttling**: Respect API rate limits
- **Burst Handling**: Handle rapid request bursts
- **Recovery**: Proper recovery after rate limit
- **Error Responses**: Correct 429 error handling

### 6. Performance Tests

Ensuring acceptable performance:

- **Response Times**: Individual request timing
- **Concurrent Requests**: Parallel request handling
- **Memory Usage**: Resource consumption monitoring
- **Timeout Handling**: Request timeout scenarios

## Test Modes

### Mock Mode (Default)
- Uses mocked API responses
- Fast execution
- No real API calls
- Safe for CI/CD

```bash
npm run test:integration:mock
```

### Real API Mode
- Makes actual Float API calls
- Requires valid API key
- Slower execution
- Tests real integration

```bash
npm run test:integration:real
```

### Performance Mode
- Includes slow-running tests
- Measures actual performance
- Rate limiting validation

```bash
npm run test:performance
```

## Configuration

### Environment Variables

```bash
# Test mode configuration
TEST_REAL_API=false                    # Enable real API calls
TEST_MOCK_MODE=true                    # Use mocked responses
TEST_SKIP_SLOW=true                    # Skip slow tests

# API configuration
FLOAT_API_KEY=your_api_key_here       # Float API key
FLOAT_API_BASE_URL=https://api.float.com/v3

# Test tuning
TEST_TIMEOUT=30000                     # Test timeout (ms)
TEST_RETRY_ATTEMPTS=3                  # Retry attempts
TEST_RETRY_DELAY=1000                  # Retry delay (ms)
```

### Test Data

The test suite uses a controlled test data approach:

- **Prefixed Names**: All test data uses `test_integration_` prefix
- **Timestamp-based**: Unique identifiers with timestamps
- **Cleanup**: Automatic cleanup after tests (when supported)
- **Isolation**: Tests don't depend on each other

## Running Tests

### Local Development

```bash
# Install dependencies
npm install

# Run mock integration tests
npm run test:integration:mock

# Run real API tests (requires FLOAT_API_KEY)
npm run test:integration:real

# Run all tests
npm run test:all

# Run with coverage
npm run test:coverage
```

### CI/CD Pipeline

The GitHub Actions workflow automatically runs:

1. **Mock Tests**: On every PR and push
2. **Real API Tests**: On schedule or manual trigger
3. **Performance Tests**: On schedule
4. **Coverage Reports**: Uploaded to Codecov

### Docker Testing

```bash
# Build and test in Docker
docker build -t float-mcp-test .
docker run -e FLOAT_API_KEY=your_key float-mcp-test npm run test:integration
```

## Test Coverage

### Current Coverage Targets

| Category | Target | Status |
|----------|--------|--------|
| Core API Tools | 100% | ✅ |
| Schema Validation | 100% | ✅ |
| Error Handling | 95% | ✅ |
| Pagination/Filtering | 90% | ✅ |
| Rate Limiting | 80% | ✅ |
| Performance | 70% | ✅ |

### Coverage Reports

Coverage reports are generated for:

- **Line Coverage**: Percentage of code lines executed
- **Branch Coverage**: Percentage of code branches tested
- **Function Coverage**: Percentage of functions called
- **Statement Coverage**: Percentage of statements executed

### Tool Coverage Matrix

| Tool Category | List | Get | Create | Update | Delete | Special |
|---------------|------|-----|--------|--------|--------|---------|
| Projects | ✅ | ✅ | ✅ | ✅ | ✅ | - |
| People | ✅ | ✅ | ✅ | ✅ | ✅ | - |
| Tasks | ✅ | ✅ | ✅ | ✅ | ✅ | - |
| Clients | ✅ | ✅ | ✅ | ✅ | ✅ | - |
| Allocations | ✅ | ✅ | ✅ | ✅ | ✅ | - |
| Departments | ✅ | ✅ | ✅ | ✅ | ✅ | - |
| Statuses | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Reports | - | ✅ | - | - | - | ✅ |
| Phases | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Public Holidays | ✅ | ✅ | ✅ | ✅ | ✅ | - |
| Team Holidays | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Accounts | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Milestones | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Time Off | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Time Off Types | ✅ | ✅ | ✅ | ✅ | ✅ | - |
| Roles | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Project Tasks | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

## Best Practices

### Writing Integration Tests

1. **Use Real Scenarios**: Test realistic use cases
2. **Validate Schemas**: Always validate response schemas
3. **Test Error Cases**: Include negative test cases
4. **Clean Up**: Remove test data when possible
5. **Isolation**: Don't depend on other tests
6. **Documentation**: Document complex test scenarios

### Test Data Management

1. **Unique Identifiers**: Use timestamps and random strings
2. **Cleanup**: Remove test data after tests
3. **Prefixes**: Use consistent prefixes for test data
4. **Isolation**: Don't share data between tests

### Performance Considerations

1. **Rate Limiting**: Respect API rate limits
2. **Timeouts**: Set appropriate timeouts
3. **Concurrency**: Limit concurrent requests
4. **Caching**: Don't cache between tests

## Troubleshooting

### Common Issues

#### Authentication Errors
```
Error: authentication failed
```
**Solution**: Verify FLOAT_API_KEY is set correctly

#### Rate Limiting
```
Error: rate limit exceeded
```
**Solution**: Increase delays between requests or reduce batch size

#### Timeout Errors
```
Error: timeout exceeded
```
**Solution**: Increase TEST_TIMEOUT or improve network connection

#### Schema Validation Failures
```
Error: schema validation failed
```
**Solution**: Update schemas to match API response format

### Debugging Tests

1. **Enable Debug Logging**: Set LOG_LEVEL=debug
2. **Run Single Test**: Use Jest's test filtering
3. **Check API Responses**: Log actual API responses
4. **Validate Environment**: Check environment variables

### Getting Help

1. **Check Logs**: Review test output and logs
2. **API Documentation**: Consult Float API documentation
3. **Issue Tracker**: Report bugs in GitHub issues
4. **Team Support**: Contact development team

## Maintenance

### Regular Updates

1. **Schema Updates**: Update schemas when API changes
2. **Test Data**: Refresh test data periodically
3. **Dependencies**: Keep test dependencies updated
4. **CI/CD**: Monitor and update CI pipeline

### Performance Monitoring

1. **Response Times**: Monitor API response times
2. **Error Rates**: Track error frequencies
3. **Coverage**: Maintain test coverage levels
4. **Resource Usage**: Monitor memory and CPU usage

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

### Code Review

1. All tests must pass
2. Code coverage must not decrease
3. Performance must not degrade
4. Documentation must be updated