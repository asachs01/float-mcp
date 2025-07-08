# Float API MCP Server - Comprehensive Documentation

## Overview

This MCP (Model Context Protocol) server provides comprehensive access to the Float API v3, enabling project management, resource allocation, and team coordination through 122 specialized tools across 17 endpoint categories.

## Table of Contents

1. [Authentication & Setup](#authentication--setup)
2. [Tool Categories](#tool-categories)
3. [Common Patterns](#common-patterns)
4. [Error Handling](#error-handling)
5. [Response Formats](#response-formats)
6. [Tool Reference](#tool-reference)
7. [Usage Examples](#usage-examples)
8. [Best Practices](#best-practices)

## Authentication & Setup

### Environment Variables

The server requires the following environment variables:

```bash
FLOAT_API_KEY=your_float_api_key_here
FLOAT_API_URL=https://api.float.com/v3  # Optional, defaults to v3 API
```

### MCP Client Configuration

Add to your MCP client configuration:

```json
{
  "mcpServers": {
    "float-mcp": {
      "command": "node",
      "args": ["path/to/float-mcp/build/index.js"],
      "env": {
        "FLOAT_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

## Tool Categories

### 1. Accounts Management (11 tools)
- **Purpose**: User account management, permissions, and authentication
- **Key Tools**: `list-accounts`, `get-account`, `update-account`, `manage-account-permissions`
- **Use Cases**: User administration, permission management, timezone settings

### 2. Allocations Management (5 tools)
- **Purpose**: Resource allocation and scheduling
- **Key Tools**: `list-allocations`, `create-allocation`, `update-allocation`
- **Use Cases**: Resource planning, workload distribution, capacity management

### 3. Clients Management (5 tools)
- **Purpose**: Client information and relationship management
- **Key Tools**: `list-clients`, `get-client`, `create-client`, `update-client`
- **Use Cases**: Client database management, project assignment

### 4. Departments Management (5 tools)
- **Purpose**: Organizational structure and department hierarchy
- **Key Tools**: `list-departments`, `get-department`, `create-department`
- **Use Cases**: Organizational management, access control, reporting

### 5. Milestones Management (10 tools)
- **Purpose**: Project milestone tracking and management
- **Key Tools**: `list-milestones`, `create-milestone`, `get-upcoming-milestones`
- **Use Cases**: Project tracking, deadline management, progress monitoring

### 6. People Management (5 tools)
- **Purpose**: Team member information and management
- **Key Tools**: `list-people`, `get-person`, `create-person`, `update-person`
- **Use Cases**: Team management, skill tracking, contact information

### 7. Phases Management (9 tools)
- **Purpose**: Project phase planning and execution
- **Key Tools**: `list-phases`, `create-phase`, `get-active-phases`
- **Use Cases**: Project planning, phase tracking, resource allocation

### 8. Project Tasks Management (11 tools)
- **Purpose**: Detailed task management within projects
- **Key Tools**: `list-project-tasks`, `create-project-task`, `bulk-create-project-tasks`
- **Use Cases**: Task breakdown, dependency management, progress tracking

### 9. Projects Management (5 tools)
- **Purpose**: Core project management functionality
- **Key Tools**: `list-projects`, `get-project`, `create-project`, `update-project`
- **Use Cases**: Project creation, status tracking, budget management

### 10. Public Holidays Management (5 tools)
- **Purpose**: Holiday calendar management
- **Key Tools**: `list-public-holidays`, `create-public-holiday`
- **Use Cases**: Calendar management, resource planning, scheduling

### 11. Reports Management (3 tools)
- **Purpose**: Business intelligence and reporting
- **Key Tools**: `get-time-report`, `get-project-report`, `get-people-utilization-report`
- **Use Cases**: Analytics, performance tracking, resource optimization

### 12. Roles Management (10 tools)
- **Purpose**: Role-based access control and permissions
- **Key Tools**: `list-roles`, `create-role`, `update-role-permissions`
- **Use Cases**: Access control, permission management, role hierarchy

### 13. Statuses Management (8 tools)
- **Purpose**: Status tracking for projects and tasks
- **Key Tools**: `list-statuses`, `create-status`, `set-default-status`
- **Use Cases**: Workflow management, status tracking, project states

### 14. Tasks Management (5 tools)
- **Purpose**: General task management
- **Key Tools**: `list-tasks`, `get-task`, `create-task`, `update-task`
- **Use Cases**: Task tracking, assignment, progress monitoring

### 15. Team Holidays Management (9 tools)
- **Purpose**: Team-specific holiday management
- **Key Tools**: `list-team-holidays`, `create-team-holiday`, `get-upcoming-team-holidays`
- **Use Cases**: Team calendar management, resource planning

### 16. Time Off Types Management (5 tools)
- **Purpose**: Time off category configuration
- **Key Tools**: `list-timeoff-types`, `create-timeoff-type`
- **Use Cases**: HR configuration, leave management

### 17. Time Off Management (11 tools)
- **Purpose**: Employee time off requests and management
- **Key Tools**: `list-timeoff`, `create-timeoff`, `approve-timeoff`, `bulk-create-timeoff`
- **Use Cases**: Leave management, approval workflows, calendar integration

## Common Patterns

### Pagination
Most list endpoints support pagination:
```typescript
{
  page: number,        // Page number (starts from 1)
  "per-page": number  // Items per page (max 200)
}
```

### ID Parameters
All entity-specific operations use consistent ID patterns:
- `account_id` for accounts
- `project_id` for projects
- `people_id` for people
- `client_id` for clients
- etc.

### Date Formats
All date fields use ISO 8601 format: `YYYY-MM-DD`

### Boolean Fields
Float API uses numeric booleans: `0` = false, `1` = true

### Status Codes
Common status codes across entities:
- `0` = Inactive/Archived
- `1` = Active
- `2` = Tentative (projects)

## Error Handling

### Common Error Scenarios

1. **Authentication Errors**
   - Missing or invalid API key
   - Insufficient permissions for operation

2. **Validation Errors**
   - Invalid date formats
   - Missing required fields
   - Invalid enum values

3. **Rate Limiting**
   - API rate limits exceeded
   - Concurrent request limitations

4. **Resource Errors**
   - Resource not found (404)
   - Resource conflicts (409)
   - Insufficient permissions (403)

### Error Response Format

```typescript
{
  success: false,
  error: string  // Human-readable error message
}
```

## Response Formats

### Success Response
```typescript
{
  success: true,
  data: T  // Typed response data
}
```

### Paginated Response
```typescript
{
  success: true,
  data: {
    items: T[],
    pagination: {
      page: number,
      per_page: number,
      total: number,
      total_pages: number
    }
  }
}
```

### Entity Schemas

#### Account Schema
```typescript
{
  account_id: number,
  name: string,
  email: string,
  timezone: string | null,
  avatar: string | null,
  account_type: number | null,  // 1=admin, 2=member, 3=view-only
  access: number | null,
  department_filter_id: number | null,
  view_rights: number | null,   // 0=none, 1=limited, 2=full
  edit_rights: number | null,   // 0=none, 1=limited, 2=full
  active: number | null,        // 0=inactive, 1=active
  created: string | null,
  modified: string | null
}
```

#### Project Schema
```typescript
{
  project_id: number,
  name: string,
  notes: string | null,
  status: number,
  client_id: number | null,
  start_date: string | null,
  end_date: string | null,
  budget: number | null,
  hourly_rate: number | null,
  color: string | null,
  non_billable: number | null,  // 0=billable, 1=non-billable
  tentative: number | null,     // 0=confirmed, 1=tentative
  active: number | null,        // 0=archived, 1=active
  created: string | null,
  modified: string | null
}
```

#### Person Schema
```typescript
{
  people_id: number,
  name: string,
  email: string | null,
  job_title: string | null,
  role_id: number | null,
  department: {
    department_id: number,
    name: string,
    parent_id: number | null
  } | null,
  notes: string | null,
  avatar_file: string | null,
  auto_email: number | null,    // 1=Yes, 0=No
  employee_type: number | null, // 1=Full-time, 0=Part-time
  active: number | null,        // 1=Active, 0=Archived
  people_type_id: number | null, // 1=Employee, 2=Contractor, 3=Placeholder
  start_date: string | null,
  end_date: string | null,
  created: string | null,
  modified: string | null
}
```

## Tool Reference

### Accounts Tools

#### `list-accounts`
**Purpose**: List all accounts with optional filtering
**Parameters**:
- `active` (optional): Filter by active status (0=inactive, 1=active)
- `account_type` (optional): Filter by account type (1=admin, 2=member, 3=view-only)
- `department_filter_id` (optional): Filter by department access
- `page` (optional): Page number for pagination
- `per-page` (optional): Items per page (max 200)

#### `get-account`
**Purpose**: Get detailed information about a specific account
**Parameters**:
- `account_id`: The account ID

#### `update-account`
**Purpose**: Update an existing account
**Parameters**:
- `account_id`: The account ID
- `name` (optional): Account holder name
- `email` (optional): Email address
- `timezone` (optional): Account timezone
- `account_type` (optional): Account type (1=admin, 2=member, 3=view-only)
- `active` (optional): Active status (1=active, 0=inactive)

#### `manage-account-permissions`
**Purpose**: Update account permissions and access rights
**Parameters**:
- `account_id`: The account ID
- `access` (optional): Account access level
- `department_filter_id` (optional): Department filter ID
- `view_rights` (optional): View permissions (0=none, 1=limited, 2=full)
- `edit_rights` (optional): Edit permissions (0=none, 1=limited, 2=full)

### Projects Tools

#### `list-projects`
**Purpose**: List all projects with optional filtering
**Parameters**:
- `status` (optional): Filter by project status
- `client_id` (optional): Filter by client ID
- `active` (optional): Filter by active status (0=archived, 1=active)
- `page` (optional): Page number for pagination
- `per-page` (optional): Items per page (max 200)

#### `get-project`
**Purpose**: Get detailed information about a specific project
**Parameters**:
- `project_id`: The project ID

#### `create-project`
**Purpose**: Create a new project
**Parameters**:
- `name`: Project name
- `client_id`: Client ID
- `start_date`: Project start date (YYYY-MM-DD)
- `end_date` (optional): Project end date (YYYY-MM-DD)
- `notes` (optional): Project notes
- `budget` (optional): Project budget
- `hourly_rate` (optional): Hourly rate
- `color` (optional): Project color
- `non_billable` (optional): Non-billable flag (0=billable, 1=non-billable)
- `tentative` (optional): Tentative flag (0=confirmed, 1=tentative)
- `active` (optional): Active status (1=active, 0=archived)

#### `update-project`
**Purpose**: Update an existing project
**Parameters**:
- `project_id`: The project ID
- All optional parameters from `create-project`

#### `delete-project`
**Purpose**: Delete a project (archives it in Float)
**Parameters**:
- `project_id`: The project ID

### People Tools

#### `list-people`
**Purpose**: List all people with optional filtering
**Parameters**:
- `active` (optional): Filter by active status (0=archived, 1=active)
- `department_id` (optional): Filter by department ID
- `role_id` (optional): Filter by role ID
- `page` (optional): Page number for pagination
- `per-page` (optional): Items per page (max 200)

#### `get-person`
**Purpose**: Get detailed information about a specific person
**Parameters**:
- `people_id`: The person ID

#### `create-person`
**Purpose**: Create a new person
**Parameters**:
- `name`: Person name
- `email` (optional): Email address
- `job_title` (optional): Job title
- `role_id` (optional): Role ID
- `department_id` (optional): Department ID
- `notes` (optional): Notes
- `employee_type` (optional): Employee type (1=Full-time, 0=Part-time)
- `people_type_id` (optional): People type (1=Employee, 2=Contractor, 3=Placeholder)
- `start_date` (optional): Start date (YYYY-MM-DD)
- `end_date` (optional): End date (YYYY-MM-DD)
- `active` (optional): Active status (1=active, 0=archived)

## Usage Examples

### 1. Project Management Workflow

```typescript
// Create a new client
const client = await use_mcp_tool('create-client', {
  name: 'Acme Corporation',
  notes: 'Enterprise client for Q1 2024'
});

// Create a new project
const project = await use_mcp_tool('create-project', {
  name: 'Website Redesign',
  client_id: client.data.client_id,
  start_date: '2024-01-15',
  end_date: '2024-03-31',
  budget: 50000,
  hourly_rate: 150
});

// Create project phases
const designPhase = await use_mcp_tool('create-phase', {
  project_id: project.data.project_id,
  name: 'Design Phase',
  start_date: '2024-01-15',
  end_date: '2024-02-15',
  budget_total: 20000
});

const developmentPhase = await use_mcp_tool('create-phase', {
  project_id: project.data.project_id,
  name: 'Development Phase',
  start_date: '2024-02-16',
  end_date: '2024-03-31',
  budget_total: 30000
});
```

### 2. Resource Allocation

```typescript
// Get available team members
const designers = await use_mcp_tool('list-people', {
  role_id: 1,  // Designer role
  active: 1
});

// Create allocations for the design phase
for (const designer of designers.data.items) {
  await use_mcp_tool('create-allocation', {
    project_id: project.data.project_id,
    people_id: designer.people_id,
    start_date: '2024-01-15',
    end_date: '2024-02-15',
    hours: 160  // 4 weeks * 40 hours
  });
}
```

### 3. Time Off Management

```typescript
// Create time off request
const timeOffRequest = await use_mcp_tool('create-timeoff', {
  people_id: 123,
  timeoff_type_id: 1,  // Vacation
  start_date: '2024-02-05',
  end_date: '2024-02-09',
  hours: 40,
  notes: 'Family vacation'
});

// Approve time off request
await use_mcp_tool('approve-timeoff', {
  timeoff_id: timeOffRequest.data.timeoff_id,
  approver_id: 456
});
```

### 4. Reporting and Analytics

```typescript
// Get project utilization report
const projectReport = await use_mcp_tool('get-project-report', {
  project_id: project.data.project_id,
  start_date: '2024-01-01',
  end_date: '2024-03-31'
});

// Get people utilization report
const utilizationReport = await use_mcp_tool('get-people-utilization-report', {
  start_date: '2024-01-01',
  end_date: '2024-03-31',
  department_id: 2
});

// Get time tracking report
const timeReport = await use_mcp_tool('get-time-report', {
  start_date: '2024-01-01',
  end_date: '2024-01-31',
  people_id: 123
});
```

### 5. Milestone and Task Management

```typescript
// Create project milestones
const milestone = await use_mcp_tool('create-milestone', {
  project_id: project.data.project_id,
  name: 'Design Review Complete',
  date: '2024-02-15',
  notes: 'All design mockups approved by client'
});

// Create project tasks
const tasks = await use_mcp_tool('bulk-create-project-tasks', {
  project_id: project.data.project_id,
  tasks: [
    {
      name: 'Create wireframes',
      estimated_hours: 20,
      phase_id: designPhase.data.phase_id
    },
    {
      name: 'Design mockups',
      estimated_hours: 30,
      phase_id: designPhase.data.phase_id
    }
  ]
});
```

## Best Practices

### 1. Data Validation
- Always validate required fields before making API calls
- Use proper date formats (YYYY-MM-DD)
- Check for valid enum values (status codes, types)

### 2. Error Handling
- Implement proper error handling for all API calls
- Check the `success` field in responses
- Handle rate limiting with exponential backoff

### 3. Performance Optimization
- Use pagination for large datasets
- Implement caching for frequently accessed data
- Use bulk operations when available

### 4. Security
- Keep API keys secure and never commit them to version control
- Use environment variables for configuration
- Implement proper access controls

### 5. Data Consistency
- Always check for existing resources before creating duplicates
- Use transactions when performing multiple related operations
- Implement proper validation for cross-referenced data

### 6. Monitoring and Logging
- Log API calls for debugging and monitoring
- Track API usage and performance metrics
- Implement alerts for error rates and downtime

## Advanced Features

### Bulk Operations
Several endpoints support bulk operations for efficiency:
- `bulk-create-project-tasks`: Create multiple project tasks at once
- `bulk-create-timeoff`: Create multiple time off requests
- `bulk-update-account-permissions`: Update permissions for multiple accounts

### Recurring Items
Support for recurring allocations and time off:
- `repeat_state`: Defines recurrence pattern
- `repeat_end`: End date for recurring items

### Filtering and Search
Advanced filtering capabilities:
- Date range filtering
- Status-based filtering
- Department and role filtering
- Active/inactive filtering

### Relationship Management
Tools support complex relationships:
- Projects → Phases → Tasks hierarchy
- People → Departments → Roles structure
- Allocations → Projects → People connections

## API Limits and Considerations

### Rate Limiting
- Float API has rate limits (check current documentation)
- Implement exponential backoff for rate limit handling
- Consider caching for frequently accessed data

### Data Limits
- Maximum 200 items per page for paginated endpoints
- Some fields have character limits (check schema definitions)
- File upload limits for avatars and attachments

### API Versioning
- Currently using Float API v3
- Monitor for API version updates
- Test compatibility with new versions

## Troubleshooting

### Common Issues

1. **Invalid Date Formats**
   - Use YYYY-MM-DD format for all dates
   - Validate date ranges (start_date <= end_date)

2. **Permission Errors**
   - Check API key permissions
   - Verify account access rights
   - Confirm department filters

3. **Missing Dependencies**
   - Ensure referenced entities exist (clients, projects, people)
   - Check for circular dependencies in hierarchical data

4. **Validation Failures**
   - Review required vs optional fields
   - Check enum value constraints
   - Validate numeric ranges

### Debug Tips

1. Enable detailed logging for API calls
2. Check the Float API documentation for updates
3. Use the `get-current-account` tool to verify authentication
4. Test with minimal data sets first

This comprehensive documentation provides a complete reference for using the Float API MCP server effectively across all 122 tools and 17 categories.