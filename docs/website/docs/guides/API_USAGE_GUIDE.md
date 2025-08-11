# Float API MCP Server - Usage Guide

## Quick Start

### 1. Basic Setup

```javascript
// First, authenticate and get current account info
const currentAccount = await use_mcp_tool('get-current-account', {});
console.log('Current user:', currentAccount.data.name);
```

### 2. Project Management Workflow

#### Create a Complete Project Setup

```javascript
// Step 1: Create or get a client
const client = await use_mcp_tool('create-client', {
  name: 'Acme Corporation',
  notes: 'Enterprise client - Fortune 500 company',
});

// Step 2: Create the project
const project = await use_mcp_tool('create-project', {
  name: 'Website Redesign Project',
  client_id: client.data.client_id,
  start_date: '2024-01-15',
  end_date: '2024-04-30',
  budget: 75000,
  hourly_rate: 150,
  notes: 'Complete website redesign with modern UI/UX',
  color: '#3498db',
  non_billable: 0, // Billable project
  tentative: 0, // Confirmed project
});

// Step 3: Create project phases
const phases = await Promise.all([
  use_mcp_tool('create-phase', {
    project_id: project.data.project_id,
    name: 'Discovery & Planning',
    start_date: '2024-01-15',
    end_date: '2024-02-01',
    budget_total: 15000,
    notes: 'Requirements gathering and project planning',
  }),
  use_mcp_tool('create-phase', {
    project_id: project.data.project_id,
    name: 'Design Phase',
    start_date: '2024-02-01',
    end_date: '2024-03-01',
    budget_total: 25000,
    notes: 'UI/UX design and prototyping',
  }),
  use_mcp_tool('create-phase', {
    project_id: project.data.project_id,
    name: 'Development Phase',
    start_date: '2024-03-01',
    end_date: '2024-04-15',
    budget_total: 30000,
    notes: 'Frontend and backend development',
  }),
  use_mcp_tool('create-phase', {
    project_id: project.data.project_id,
    name: 'Testing & Launch',
    start_date: '2024-04-15',
    end_date: '2024-04-30',
    budget_total: 5000,
    notes: 'QA testing and deployment',
  }),
]);
```

### 3. Team and Resource Management

#### Set Up Team Members

```javascript
// Create team members
const designer = await use_mcp_tool('create-person', {
  name: 'Sarah Johnson',
  email: 'sarah.johnson@company.com',
  job_title: 'Senior UI/UX Designer',
  employee_type: 1, // Full-time
  people_type_id: 1, // Employee
  start_date: '2024-01-01',
  active: 1,
});

const developer = await use_mcp_tool('create-person', {
  name: 'Mike Chen',
  email: 'mike.chen@company.com',
  job_title: 'Full-Stack Developer',
  employee_type: 1, // Full-time
  people_type_id: 1, // Employee
  start_date: '2024-01-01',
  active: 1,
});

// Create resource allocations
const allocations = await Promise.all([
  // Design phase allocation
  use_mcp_tool('create-allocation', {
    project_id: project.data.project_id,
    people_id: designer.data.people_id,
    start_date: '2024-02-01',
    end_date: '2024-03-01',
    hours: 160, // 4 weeks * 40 hours
    notes: 'UI/UX design work',
  }),
  // Development phase allocation
  use_mcp_tool('create-allocation', {
    project_id: project.data.project_id,
    people_id: developer.data.people_id,
    start_date: '2024-03-01',
    end_date: '2024-04-15',
    hours: 280, // 7 weeks * 40 hours
    notes: 'Frontend and backend development',
  }),
]);
```

### 4. Project Tracking and Milestones

#### Create Project Milestones

```javascript
const milestones = await Promise.all([
  use_mcp_tool('create-milestone', {
    project_id: project.data.project_id,
    name: 'Design Approval',
    date: '2024-03-01',
    notes: 'Client approval of all design mockups',
  }),
  use_mcp_tool('create-milestone', {
    project_id: project.data.project_id,
    name: 'Development Complete',
    date: '2024-04-15',
    notes: 'All development work completed and tested',
  }),
  use_mcp_tool('create-milestone', {
    project_id: project.data.project_id,
    name: 'Project Launch',
    date: '2024-04-30',
    notes: 'Website launched and live',
  }),
]);

// Check upcoming milestones
const upcomingMilestones = await use_mcp_tool('get-upcoming-milestones', {
  days_ahead: 30,
});
```

### 5. Time Off and Holiday Management

#### Manage Team Time Off

```javascript
// Create time off types if needed
const vacationTimeOff = await use_mcp_tool('create-timeoff-type', {
  name: 'Vacation',
  color: '#e74c3c',
  is_default: 1,
});

// Create time off request
const timeOffRequest = await use_mcp_tool('create-timeoff', {
  people_id: designer.data.people_id,
  timeoff_type_id: vacationTimeOff.data.timeoff_type_id,
  start_date: '2024-02-12',
  end_date: '2024-02-16',
  hours: 40,
  notes: 'Family vacation - planned in advance',
});

// Approve time off
const approvedTimeOff = await use_mcp_tool('approve-timeoff', {
  timeoff_id: timeOffRequest.data.timeoff_id,
  approver_id: currentAccount.data.account_id,
});

// Create team holidays
const teamHoliday = await use_mcp_tool('create-team-holiday', {
  name: 'Company Retreat',
  start_date: '2024-03-15',
  end_date: '2024-03-15',
  notes: 'Annual company retreat day',
});
```

### 6. Reporting and Analytics

#### Generate Project Reports

```javascript
// Get project performance report
const projectReport = await use_mcp_tool('get-project-report', {
  project_id: project.data.project_id,
  start_date: '2024-01-01',
  end_date: '2024-04-30',
});

// Get team utilization report
const utilizationReport = await use_mcp_tool('get-people-utilization-report', {
  start_date: '2024-01-01',
  end_date: '2024-04-30',
});

// Get time tracking report for specific person
const timeReport = await use_mcp_tool('get-time-report', {
  people_id: developer.data.people_id,
  start_date: '2024-03-01',
  end_date: '2024-03-31',
});
```

### 7. Advanced Task Management

#### Create Detailed Project Tasks

```javascript
// Create individual project tasks
const projectTasks = await use_mcp_tool('bulk-create-project-tasks', {
  project_id: project.data.project_id,
  tasks: [
    {
      name: 'Create user personas',
      estimated_hours: 16,
      priority: 1,
      notes: 'Research and create detailed user personas',
    },
    {
      name: 'Design wireframes',
      estimated_hours: 24,
      priority: 1,
      notes: 'Create wireframes for all key pages',
    },
    {
      name: 'Develop homepage',
      estimated_hours: 32,
      priority: 1,
      notes: 'Build responsive homepage with modern design',
    },
    {
      name: 'Implement user authentication',
      estimated_hours: 40,
      priority: 2,
      notes: 'JWT-based authentication system',
    },
  ],
});

// Get tasks by project
const allProjectTasks = await use_mcp_tool('get-project-tasks-by-project', {
  project_id: project.data.project_id,
});
```

## Common Use Cases

### 1. Daily Team Management

```javascript
// Morning standup: Check team allocation for today
const today = new Date().toISOString().split('T')[0];
const todayAllocations = await use_mcp_tool('list-allocations', {
  start_date: today,
  end_date: today,
});

// Check who's out of office
const todayTimeOff = await use_mcp_tool('list-timeoff', {
  start_date: today,
  end_date: today,
});

// Review upcoming milestones
const upcomingMilestones = await use_mcp_tool('get-upcoming-milestones', {
  days_ahead: 7,
});
```

### 2. Resource Planning

```javascript
// Find available team members for new project
const availablePeople = await use_mcp_tool('list-people', {
  active: 1,
});

// Check current allocations to see availability
const currentAllocations = await use_mcp_tool('list-allocations', {
  start_date: '2024-02-01',
  end_date: '2024-02-29',
});

// Get utilization report to understand capacity
const utilization = await use_mcp_tool('get-people-utilization-report', {
  start_date: '2024-01-01',
  end_date: '2024-01-31',
});
```

### 3. Project Health Monitoring

```javascript
// Get all active projects
const activeProjects = await use_mcp_tool('list-projects', {
  active: 1,
});

// Check for overdue milestones
const overdueMilestones = await use_mcp_tool('get-overdue-milestones', {});

// Review project budgets and spending
for (const project of activeProjects.data.items) {
  const projectDetails = await use_mcp_tool('get-project', {
    project_id: project.project_id,
  });

  const projectReport = await use_mcp_tool('get-project-report', {
    project_id: project.project_id,
    start_date: project.start_date,
    end_date: project.end_date || today,
  });

  console.log(`Project: ${project.name}`);
  console.log(`Budget: ${projectDetails.data.budget}`);
  console.log(`Spent: ${projectReport.data.total_cost}`);
}
```

### 4. HR and Time Management

```javascript
// Process time off requests
const pendingTimeOff = await use_mcp_tool('list-timeoff', {
  status: 'pending',
});

// Approve or reject based on business rules
for (const request of pendingTimeOff.data.items) {
  // Check team availability during requested dates
  const conflictingAllocations = await use_mcp_tool('list-allocations', {
    people_id: request.people_id,
    start_date: request.start_date,
    end_date: request.end_date,
  });

  if (conflictingAllocations.data.items.length > 0) {
    // Might need to reject or discuss
    console.log(`Potential conflict for ${request.people_id}`);
  } else {
    // Auto-approve if no conflicts
    await use_mcp_tool('approve-timeoff', {
      timeoff_id: request.timeoff_id,
      approver_id: currentAccount.data.account_id,
    });
  }
}
```

## Error Handling Best Practices

### 1. Always Check for Success

```javascript
const result = await use_mcp_tool('create-project', {
  name: 'New Project',
  client_id: 123,
  start_date: '2024-01-01',
});

if (!result.success) {
  console.error('Failed to create project:', result.error);
  return;
}

// Proceed with successful result
const projectId = result.data.project_id;
```

### 2. Handle Common Validation Errors

```javascript
try {
  const project = await use_mcp_tool('create-project', {
    name: 'Test Project',
    client_id: 999, // May not exist
    start_date: '2024-01-01',
  });
} catch (error) {
  if (error.message.includes('client_id')) {
    console.error('Invalid client ID provided');
    // Handle client not found
  } else if (error.message.includes('date')) {
    console.error('Invalid date format');
    // Handle date validation
  }
}
```

### 3. Bulk Operations Error Handling

```javascript
const bulkResult = await use_mcp_tool('bulk-create-project-tasks', {
  project_id: 123,
  tasks: [
    { name: 'Task 1', estimated_hours: 8 },
    { name: 'Task 2', estimated_hours: 'invalid' }, // Will fail
    { name: 'Task 3', estimated_hours: 16 },
  ],
});

if (bulkResult.success) {
  console.log(`Successfully created: ${bulkResult.data.successful.length} tasks`);
  console.log(`Failed: ${bulkResult.data.failed.length} tasks`);

  // Handle failed items
  bulkResult.data.failed.forEach((failure) => {
    console.error('Failed task:', failure);
  });
}
```

## Performance Tips

### 1. Use Pagination for Large Datasets

```javascript
// Instead of loading all projects at once
const allProjects = [];
let page = 1;
let hasMore = true;

while (hasMore) {
  const response = await use_mcp_tool('list-projects', {
    page: page,
    'per-page': 50,
  });

  allProjects.push(...response.data.items);
  hasMore = response.data.pagination.page < response.data.pagination.total_pages;
  page++;
}
```

### 2. Cache Frequently Used Data

```javascript
// Cache client data for project creation
const clientCache = new Map();

async function getClientCached(clientId) {
  if (clientCache.has(clientId)) {
    return clientCache.get(clientId);
  }

  const client = await use_mcp_tool('get-client', { client_id: clientId });
  clientCache.set(clientId, client.data);
  return client.data;
}
```

### 3. Batch Related Operations

```javascript
// Instead of multiple individual calls
const projectData = await Promise.all([
  use_mcp_tool('get-project', { project_id: 123 }),
  use_mcp_tool('get-project-milestones', { project_id: 123 }),
  use_mcp_tool('get-project-tasks-by-project', { project_id: 123 }),
  use_mcp_tool('list-allocations', { project_id: 123 }),
]);

const [project, milestones, tasks, allocations] = projectData;
```

## Integration Examples

### 1. Calendar Integration

```javascript
// Get all events for calendar display
async function getCalendarEvents(startDate, endDate) {
  const [allocations, timeOff, milestones, holidays] = await Promise.all([
    use_mcp_tool('list-allocations', { start_date: startDate, end_date: endDate }),
    use_mcp_tool('list-timeoff', { start_date: startDate, end_date: endDate }),
    use_mcp_tool('list-milestones', { start_date: startDate, end_date: endDate }),
    use_mcp_tool('list-team-holidays', { start_date: startDate, end_date: endDate }),
  ]);

  return {
    allocations: allocations.data.items,
    timeOff: timeOff.data.items,
    milestones: milestones.data.items,
    holidays: holidays.data.items,
  };
}
```

### 2. Budget Tracking Dashboard

```javascript
async function getBudgetSummary() {
  const activeProjects = await use_mcp_tool('list-projects', { active: 1 });
  const summary = [];

  for (const project of activeProjects.data.items) {
    const projectReport = await use_mcp_tool('get-project-report', {
      project_id: project.project_id,
      start_date: project.start_date,
      end_date: project.end_date || new Date().toISOString().split('T')[0],
    });

    summary.push({
      name: project.name,
      budget: project.budget,
      spent: projectReport.data.total_cost,
      remaining: project.budget - projectReport.data.total_cost,
      utilization: (projectReport.data.total_cost / project.budget) * 100,
    });
  }

  return summary;
}
```

This usage guide provides practical examples and patterns for effectively using the Float API MCP server across all major functionality areas.
