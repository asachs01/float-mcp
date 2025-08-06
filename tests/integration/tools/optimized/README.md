# Optimized Float MCP Tools - Integration Tests

This directory contains comprehensive integration tests for the 4 optimized MCP tools that replace the 246+ granular tools in the Float.com MCP server.

## Overview

The optimized tools provide consolidated functionality through decision-tree routing:

1. **manage-entity** - CRUD operations for core entities (people, projects, tasks, clients, departments, roles, accounts, statuses)
2. **manage-project-workflow** - Project-specific operations (phases, milestones, project-tasks, allocations)
3. **manage-time-tracking** - Time operations (logged-time, timeoff, holidays)
4. **generate-report** - Reporting and analytics

## Test Files

### 1. manage-entity.integration.test.ts
Comprehensive tests for entity management covering:

**Entity Types:**
- People (with all operations: list, get, create, update, delete)
- Projects (with filtering, budget/rate management)
- Tasks (with project association)
- Clients (basic CRUD operations)
- Departments (organizational structure)
- Roles (with permission management)
- Accounts (with specialized operations like get-current-account)
- Statuses (with type-based filtering)

**Test Categories:**
- Basic CRUD operations for each entity type
- Filtering and pagination
- Specialized operations (e.g., get-current-account, bulk-updates)
- Parameter validation and error handling
- Performance testing with concurrent requests
- Data structure validation

### 2. manage-project-workflow.integration.test.ts
Tests for project workflow management covering:

**Workflow Types:**
- Phases (with date ranges, colors, project association)
- Milestones (with completion tracking, upcoming/overdue queries)
- Project Tasks (with bulk operations, reordering, dependencies)
- Allocations (with person/project/hours management)

**Test Categories:**
- List operations with filtering (by project, date range, status)
- CRUD operations for all workflow types
- Specialized operations (complete milestones, reorder tasks, bulk-create)
- Complex queries (dependencies, upcoming items, active items)
- Error handling for workflow-specific constraints
- Performance testing across workflow types

### 3. manage-time-tracking.integration.test.ts
Tests for time tracking operations covering:

**Tracking Types:**
- Logged Time (with person/project/task association, billable analysis)
- Time Off (with approval workflow, bulk operations)
- Public Holidays (with country/year filtering)
- Team Holidays (with department association, recurring holidays)

**Test Categories:**
- Basic CRUD operations for all tracking types
- Filtering (by person, project, date ranges, status)
- Bulk operations (bulk-create, bulk-approve)
- Approval workflows (approve/reject time off)
- Reporting operations (summaries, timesheets, calendars)
- Specialized queries (upcoming holidays, recurring patterns)
- Error handling for time-specific constraints

### 4. generate-report.integration.test.ts
Tests for comprehensive reporting covering:

**Report Types:**
- Time Reports (with grouping, filtering, billable analysis)
- Project Reports (with budget analysis, status tracking)
- People Utilization Reports (with capacity analysis, thresholds)
- Financial Reports (revenue, profitability)
- Custom Reports (dashboard summaries, forecasts)

**Test Categories:**
- Basic report generation for all report types
- Advanced filtering and grouping options
- Report-specific parameters and configurations
- Data validation (numeric fields, dates, percentages)
- Export formats and download capabilities
- Performance testing for large date ranges
- Complex multi-parameter reports

## Test Patterns

All test files follow consistent patterns established in the existing integration tests:

### Structure
- Organized by tool/operation with nested describe blocks
- Clear separation of functionality areas
- Comprehensive error handling sections
- Performance and data validation sections

### Error Testing
- Parameter validation (required fields, data types)
- Business logic validation (date ranges, constraints)
- Not found errors for invalid IDs
- Authentication and authorization errors
- Error recovery testing

### Performance Testing
- Concurrent operation handling
- Large dataset processing
- Complex multi-parameter operations
- Response time validation

### Data Validation
- Response structure consistency
- Numeric field validation (ranges, types)
- Date format validation
- Entity relationship validation

## Configuration

Tests respect the existing test configuration in `../setup.ts`:

- **Mock Mode**: Uses simulated responses when `TEST_CONFIG.enableRealApiCalls = false`
- **Real API Mode**: Makes actual API calls when enabled
- **Performance**: Skips slow tests when `TEST_CONFIG.skipSlowTests = true`
- **Rate Limiting**: Includes delays between calls to respect API limits

## Usage

Run all optimized tool tests:
```bash
npm test tests/integration/tools/optimized/
```

Run specific tool tests:
```bash
npm test tests/integration/tools/optimized/manage-entity.integration.test.ts
npm test tests/integration/tools/optimized/manage-project-workflow.integration.test.ts
npm test tests/integration/tools/optimized/manage-time-tracking.integration.test.ts
npm test tests/integration/tools/optimized/generate-report.integration.test.ts
```

Run specific test categories:
```bash
npm test -- --testNamePattern="Error Handling"
npm test -- --testNamePattern="Performance Tests"
npm test -- --testNamePattern="Data Validation"
```

## Coverage

The test suite provides comprehensive coverage ensuring:

1. **Functional Equivalence**: All functionality from the 246+ legacy tools is preserved
2. **Parameter Compatibility**: All parameter combinations are tested
3. **Error Scenarios**: Edge cases and error conditions are handled
4. **Performance**: Tools handle concurrent usage and large datasets
5. **Data Integrity**: Response structures and data types are validated

## Maintenance

When adding new functionality to the optimized tools:

1. Add corresponding test cases following the established patterns
2. Include both positive and negative test scenarios
3. Update data generators in `../../utils/test-helpers.ts` if needed
4. Ensure performance tests cover new operations
5. Validate response structures match expectations

## Integration

These tests integrate with the existing test infrastructure:

- Uses the same test helpers and utilities
- Shares configuration and setup with other integration tests
- Follows the same patterns for cleanup and data management
- Maintains compatibility with CI/CD pipelines