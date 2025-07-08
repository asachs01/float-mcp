# Float API MCP Server - Complete Tool Reference

## Overview
This document provides a comprehensive reference for all 122 tools available in the Float API MCP server, organized by category and functionality.

## Tool Categories Summary

| Category | Tools | Description |
|----------|-------|-------------|
| [Accounts](#accounts-tools) | 11 | User account management, permissions, and authentication |
| [Allocations](#allocations-tools) | 5 | Resource allocation and scheduling |
| [Clients](#clients-tools) | 5 | Client information and relationship management |
| [Departments](#departments-tools) | 5 | Organizational structure and department hierarchy |
| [Milestones](#milestones-tools) | 10 | Project milestone tracking and management |
| [People](#people-tools) | 5 | Team member information and management |
| [Phases](#phases-tools) | 9 | Project phase planning and execution |
| [Project Tasks](#project-tasks-tools) | 11 | Detailed task management within projects |
| [Projects](#projects-tools) | 5 | Core project management functionality |
| [Public Holidays](#public-holidays-tools) | 5 | Holiday calendar management |
| [Reports](#reports-tools) | 3 | Business intelligence and reporting |
| [Roles](#roles-tools) | 10 | Role-based access control and permissions |
| [Statuses](#statuses-tools) | 8 | Status tracking for projects and tasks |
| [Tasks](#tasks-tools) | 5 | General task management |
| [Team Holidays](#team-holidays-tools) | 9 | Team-specific holiday management |
| [Time Off Types](#time-off-types-tools) | 5 | Time off category configuration |
| [Time Off](#time-off-tools) | 11 | Employee time off requests and management |

## Accounts Tools

### Core Account Management
- **`list-accounts`** - Retrieve paginated list of user accounts with filtering
- **`get-account`** - Get comprehensive account details
- **`get-current-account`** - Get current authenticated user information
- **`update-account`** - Update account information and settings
- **`create-account`** - Create new user accounts (if supported by plan)

### Account Status Management
- **`deactivate-account`** - Deactivate user accounts (sets active=0)
- **`reactivate-account`** - Reactivate user accounts (sets active=1)

### Permission Management
- **`manage-account-permissions`** - Update account permissions and access rights
- **`bulk-update-account-permissions`** - Update permissions for multiple accounts

### Account Configuration
- **`update-account-timezone`** - Update timezone for specific accounts
- **`set-account-department-filter`** - Set department access restrictions

## Allocations Tools

### Basic Allocation Management
- **`list-allocations`** - List resource allocations with filtering
- **`get-allocation`** - Get detailed allocation information
- **`create-allocation`** - Create new resource allocations
- **`update-allocation`** - Update existing allocations
- **`delete-allocation`** - Remove allocations

## Clients Tools

### Client Management
- **`list-clients`** - List all clients with filtering options
- **`get-client`** - Get detailed client information
- **`create-client`** - Create new client records
- **`update-client`** - Update client information
- **`delete-client`** - Archive client records

## Departments Tools

### Department Management
- **`list-departments`** - List organizational departments
- **`get-department`** - Get department details
- **`create-department`** - Create new departments
- **`update-department`** - Update department information
- **`delete-department`** - Remove departments

## Milestones Tools

### Basic Milestone Management
- **`list-milestones`** - List project milestones
- **`get-milestone`** - Get milestone details
- **`create-milestone`** - Create new milestones
- **`update-milestone`** - Update milestone information
- **`delete-milestone`** - Remove milestones

### Project-Specific Milestones
- **`get-project-milestones`** - Get all milestones for a project

### Milestone Tracking
- **`get-upcoming-milestones`** - Get milestones approaching deadline
- **`get-overdue-milestones`** - Get overdue milestones
- **`complete-milestone`** - Mark milestones as complete
- **`get-milestone-reminders`** - Get milestone reminder notifications

## People Tools

### People Management
- **`list-people`** - List team members with filtering
- **`get-person`** - Get detailed person information
- **`create-person`** - Create new team member records
- **`update-person`** - Update person information
- **`delete-person`** - Archive person records

## Phases Tools

### Basic Phase Management
- **`list-phases`** - List project phases
- **`get-phase`** - Get phase details
- **`create-phase`** - Create new project phases
- **`update-phase`** - Update phase information
- **`delete-phase`** - Remove phases

### Phase Queries
- **`list-phases-by-project`** - Get all phases for a project
- **`get-phases-by-date-range`** - Get phases within date range
- **`get-active-phases`** - Get currently active phases
- **`get-phase-schedule`** - Get phase scheduling information

## Project Tasks Tools

### Basic Task Management
- **`list-project-tasks`** - List project tasks with filtering
- **`get-project-task`** - Get detailed task information
- **`create-project-task`** - Create new project tasks
- **`update-project-task`** - Update task information
- **`delete-project-task`** - Remove tasks

### Task Organization
- **`get-project-tasks-by-project`** - Get all tasks for a project
- **`get-project-tasks-by-phase`** - Get tasks for a specific phase
- **`reorder-project-tasks`** - Change task order/priority

### Bulk Operations
- **`bulk-create-project-tasks`** - Create multiple tasks at once
- **`archive-project-task`** - Archive completed tasks

### Task Dependencies
- **`get-project-task-dependencies`** - Get task dependency information

## Projects Tools

### Project Management
- **`list-projects`** - List projects with filtering and pagination
- **`get-project`** - Get comprehensive project details
- **`create-project`** - Create new projects with full configuration
- **`update-project`** - Update project information and settings
- **`delete-project`** - Archive projects

## Public Holidays Tools

### Holiday Management
- **`list-public-holidays`** - List public holidays
- **`get-public-holiday`** - Get holiday details
- **`create-public-holiday`** - Create new public holidays
- **`update-public-holiday`** - Update holiday information
- **`delete-public-holiday`** - Remove holidays

## Reports Tools

### Reporting and Analytics
- **`get-time-report`** - Generate time tracking reports
- **`get-project-report`** - Generate project performance reports
- **`get-people-utilization-report`** - Generate team utilization reports

## Roles Tools

### Basic Role Management
- **`list-roles`** - List available roles
- **`get-role`** - Get role details
- **`create-role`** - Create new roles
- **`update-role`** - Update role information
- **`delete-role`** - Remove roles

### Role Permissions
- **`get-role-permissions`** - Get role permission details
- **`update-role-permissions`** - Update role permissions

### Role Queries
- **`get-roles-by-permission`** - Find roles with specific permissions
- **`get-role-hierarchy`** - Get role hierarchy structure
- **`check-role-access`** - Verify role access permissions

## Statuses Tools

### Basic Status Management
- **`list-statuses`** - List available statuses
- **`get-status`** - Get status details
- **`create-status`** - Create new statuses
- **`update-status`** - Update status information
- **`delete-status`** - Remove statuses

### Status Configuration
- **`get-default-status`** - Get default status settings
- **`set-default-status`** - Set default status for projects/tasks
- **`get-statuses-by-type`** - Get statuses by type (project/task)

## Tasks Tools

### Task Management
- **`list-tasks`** - List tasks with filtering
- **`get-task`** - Get task details
- **`create-task`** - Create new tasks
- **`update-task`** - Update task information
- **`delete-task`** - Remove tasks

## Team Holidays Tools

### Basic Holiday Management
- **`list-team-holidays`** - List team holidays
- **`get-team-holiday`** - Get holiday details
- **`create-team-holiday`** - Create new team holidays
- **`update-team-holiday`** - Update holiday information
- **`delete-team-holiday`** - Remove holidays

### Holiday Queries
- **`list-team-holidays-by-department`** - Get holidays by department
- **`list-team-holidays-by-date-range`** - Get holidays in date range
- **`list-recurring-team-holidays`** - Get recurring holidays
- **`get-upcoming-team-holidays`** - Get upcoming holidays

## Time Off Types Tools

### Time Off Configuration
- **`list-timeoff-types`** - List available time off types
- **`get-timeoff-type`** - Get time off type details
- **`create-timeoff-type`** - Create new time off types
- **`update-timeoff-type`** - Update time off type settings
- **`delete-timeoff-type`** - Remove time off types

## Time Off Tools

### Basic Time Off Management
- **`list-timeoff`** - List time off requests with filtering
- **`get-timeoff`** - Get time off request details
- **`create-timeoff`** - Create new time off requests
- **`update-timeoff`** - Update time off requests
- **`delete-timeoff`** - Remove time off requests

### Time Off Processing
- **`approve-timeoff`** - Approve time off requests
- **`reject-timeoff`** - Reject time off requests

### Bulk Operations
- **`bulk-create-timeoff`** - Create multiple time off requests

### Time Off Queries
- **`list-timeoff-types`** - List available time off types
- **`get-timeoff-calendar`** - Get time off calendar view
- **`get-person-timeoff-summary`** - Get person's time off summary

## Common Parameters

### Pagination Parameters
All list endpoints support these parameters:
- `page` - Page number (starts from 1)
- `per-page` - Items per page (max 200)

### Common Filters
- `active` - Filter by active status (0=inactive, 1=active)
- `start_date` - Filter by start date (YYYY-MM-DD)
- `end_date` - Filter by end date (YYYY-MM-DD)

### ID Parameters
- Entity IDs use consistent naming: `project_id`, `people_id`, `client_id`, etc.
- All accept string or number format
- Required for get/update/delete operations

## Response Format

All tools return responses in this format:

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data here
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message here"
}
```

### Paginated Response
```json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "per_page": 50,
      "total": 100,
      "total_pages": 2
    }
  }
}
```

## Tool Naming Conventions

### Prefixes
- `list-` - Get multiple items with pagination
- `get-` - Get single item by ID
- `create-` - Create new item
- `update-` - Update existing item
- `delete-` - Remove/archive item
- `bulk-` - Bulk operations

### Suffixes
- `-by-project` - Filter by project
- `-by-department` - Filter by department
- `-by-date-range` - Filter by date range
- `-permissions` - Permission-related operations
- `-calendar` - Calendar view operations
- `-summary` - Summary/aggregated data

## Error Handling

### Common Error Types
1. **Validation Errors** - Invalid parameters or data format
2. **Authentication Errors** - Invalid or missing API key
3. **Authorization Errors** - Insufficient permissions
4. **Not Found Errors** - Requested resource doesn't exist
5. **Conflict Errors** - Resource conflicts (e.g., duplicate names)
6. **Rate Limit Errors** - API rate limits exceeded

### Error Response Patterns
- All errors return `success: false`
- Error messages are human-readable
- Specific error codes may be included in error messages
- Validation errors often include field-specific details

## Best Practices

### 1. Always Check Success Status
```javascript
const result = await use_mcp_tool('tool-name', params);
if (!result.success) {
  console.error('Tool failed:', result.error);
  return;
}
// Use result.data
```

### 2. Handle Pagination Properly
```javascript
let allItems = [];
let page = 1;
let hasMore = true;

while (hasMore) {
  const result = await use_mcp_tool('list-items', { page, 'per-page': 50 });
  if (!result.success) break;
  
  allItems.push(...result.data.items);
  hasMore = result.data.pagination.page < result.data.pagination.total_pages;
  page++;
}
```

### 3. Use Appropriate Tool for Task
- Use `list-` tools for browsing and discovery
- Use `get-` tools for detailed information
- Use `bulk-` tools for efficiency when possible
- Use specific query tools (e.g., `get-upcoming-milestones`) for targeted data

### 4. Validate Required Parameters
- Check required vs optional parameters in tool descriptions
- Validate date formats (YYYY-MM-DD)
- Ensure referenced IDs exist (e.g., client_id for projects)

### 5. Consider Rate Limits
- Implement appropriate delays between requests
- Use bulk operations when available
- Cache frequently accessed data

This comprehensive tool reference provides detailed information about all 122 tools available in the Float API MCP server, ensuring you can effectively use each tool for your specific needs.