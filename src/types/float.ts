import { z } from 'zod';

// Base schemas - Float API uses different field names and types
// Note: This base schema is available for future use but isn't currently used
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const baseEntitySchema = z.object({
  // Many Float API responses don't have these standard fields
  id: z.union([z.string(), z.number()]).optional(), // ID can be number or missing
  created_at: z.string().optional(), // May not be present
  updated_at: z.string().optional(), // May not be present
});

// Float API schemas based on official documentation at https://developer.float.com/api_reference.html#People
// Modified to handle actual API responses which return null for many fields

// Department schema as defined in Float API - allowing nulls for reality
export const departmentSchema = z
  .object({
    department_id: z.number(),
    parent_id: z.number().nullable().optional(),
    name: z.string().nullable().optional(),
  })
  .nullable();

// PeopleTag schema as defined in Float API
export const peopleTagSchema = z.object({
  name: z.string(),
});

// Contract schema as defined in Float API - allowing nulls
export const contractSchema = z.object({
  effective_date: z.string(),
  role_id: z.number().nullable().optional(),
  role_name: z.string().nullable().optional(),
  cost_rate: z.string().nullable().optional(),
  cost_rate_from: z.string().nullable().optional(),
});

// Account schema as defined in Float API - allowing nulls
export const accountSchema = z
  .object({
    account_id: z.number().optional(),
    name: z.string(),
    email: z.string(),
    timezone: z.string().nullable().optional(),
    avatar: z.string().nullable().optional(),
    account_type: z.number().nullable().optional(),
    access: z.number().nullable().optional(),
    department_filter_id: z.number().nullable().optional(),
    view_rights: z.number().nullable().optional(),
    edit_rights: z.number().nullable().optional(),
    active: z.number().nullable().optional(),
    created: z.string().nullable().optional(),
    modified: z.string().nullable().optional(),
  })
  .nullable();

// Person schema based on official Float API documentation
// Modified to handle null values that the actual API returns
export const personSchema = z.object({
  people_id: z.number().optional(), // Official field name from Float API
  name: z.string(),
  email: z.string().nullable().optional(), // API returns null
  job_title: z.string().nullable().optional(), // API returns null
  role_id: z.number().nullable().optional(), // API returns null
  department: departmentSchema.optional(), // Can be null object
  notes: z.string().nullable().optional(), // API returns null
  avatar_file: z.string().nullable().optional(), // API returns null
  auto_email: z.number().nullable().optional(), // 1 = Yes, 0 = No
  employee_type: z.number().nullable().optional(), // 1 = Full-time, 0 = Part-time
  work_days_hours: z.array(z.number()).nullable().optional(), // API returns null
  active: z.number().nullable().optional(), // 1 = Active, 0 = Archived
  people_type_id: z.number().nullable().optional(), // 1 = Employee, 2 = Contractor, 3 = Placeholder
  tags: z.array(peopleTagSchema).nullable().optional(), // API may return null
  start_date: z.string().nullable().optional(), // API returns null
  end_date: z.string().nullable().optional(), // API returns null
  default_hourly_rate: z.string().nullable().optional(), // API returns null
  region_id: z.number().nullable().optional(),
  created: z.string().nullable().optional(), // API returns null
  modified: z.string().nullable().optional(), // API returns null
  contracts: z.array(contractSchema).nullable().optional(),
  account: accountSchema.optional(),
  managers: z.array(z.number()).nullable().optional(), // API may return null
});

// Project schema - updated to match Float API v3 structure
export const projectSchema = z.object({
  project_id: z.number().optional(), // Float API uses project_id, not id
  name: z.string(),
  notes: z.string().nullable().optional(),
  status: z.number().optional(), // Float API uses numeric status codes
  client_id: z.number().nullable().optional(),
  start_date: z.string().nullable().optional(),
  end_date: z.string().nullable().optional(),
  budget: z.number().nullable().optional(),
  hourly_rate: z.number().nullable().optional(),
  created: z.string().nullable().optional(), // Float API uses 'created', not 'created_at'
  modified: z.string().nullable().optional(), // Float API uses 'modified', not 'updated_at'
  color: z.string().nullable().optional(),
  project_manager: z.number().nullable().optional(),
  tags: z.array(z.string()).nullable().optional(),
  non_billable: z.number().nullable().optional(), // 0 = billable, 1 = non-billable
  tentative: z.number().nullable().optional(), // 0 = confirmed, 1 = tentative
  locked: z.number().nullable().optional(), // 0 = unlocked, 1 = locked
  active: z.number().nullable().optional(), // 0 = archived, 1 = active
});

// Task schema - updated to match Float API v3 structure (tasks are actually allocations in Float)
export const taskSchema = z.object({
  task_id: z.number().optional(), // Float API uses task_id, not id
  project_id: z.number().optional(),
  people_id: z.number().optional(),
  name: z.string(),
  notes: z.string().nullable().optional(),
  status: z.number().optional(), // Float API uses numeric status codes
  start_date: z.string().nullable().optional(),
  end_date: z.string().nullable().optional(),
  estimated_hours: z.number().nullable().optional(),
  actual_hours: z.number().nullable().optional(),
  priority: z.number().nullable().optional(),
  created: z.string().nullable().optional(), // Float API uses 'created', not 'created_at'
  modified: z.string().nullable().optional(), // Float API uses 'modified', not 'updated_at'
  task_type: z.number().nullable().optional(),
  billable: z.number().nullable().optional(), // 0 = non-billable, 1 = billable
  repeat_state: z.number().nullable().optional(),
  repeat_end: z.string().nullable().optional(),
});

// Allocation schema - updated to match Float API v3 structure (tasks in Float API)
export const allocationSchema = z.object({
  task_id: z.number().optional(), // Float API uses task_id for allocations
  project_id: z.number().optional(),
  people_id: z.number().optional(), // Float API uses people_id, not person_id
  start_date: z.string().nullable().optional(),
  end_date: z.string().nullable().optional(),
  hours: z.number().nullable().optional(),
  notes: z.string().nullable().optional(),
  created: z.string().nullable().optional(), // Float API uses 'created', not 'created_at'
  modified: z.string().nullable().optional(), // Float API uses 'modified', not 'updated_at'
  billable: z.number().nullable().optional(), // 0 = non-billable, 1 = billable
  repeat_state: z.number().nullable().optional(),
  repeat_end: z.string().nullable().optional(),
  task_type: z.number().nullable().optional(),
  status: z.number().nullable().optional(),
});

// Client schema - updated to match Float API v3 structure
export const clientSchema = z.object({
  client_id: z.number().optional(), // Float API uses client_id, not id
  name: z.string(),
  notes: z.string().nullable().optional(),
  created: z.string().nullable().optional(), // Float API uses 'created', not 'created_at'
  modified: z.string().nullable().optional(), // Float API uses 'modified', not 'updated_at'
  active: z.number().nullable().optional(), // 0 = archived, 1 = active
});

// Status schema - updated to match Float API v3 structure
export const statusSchema = z.object({
  status_id: z.number().optional(), // Float API uses status_id
  name: z.string(),
  status_type: z.enum(['project', 'task']).optional(), // Type of status (project or task)
  color: z.string().nullable().optional(), // Color for status visualization
  position: z.number().nullable().optional(), // Position for ordering
  is_default: z.boolean().optional(), // Whether this is the default status
  active: z.number().nullable().optional(), // 0 = inactive, 1 = active
  created: z.string().nullable().optional(), // Float API uses 'created', not 'created_at'
  modified: z.string().nullable().optional(), // Float API uses 'modified', not 'updated_at'
});

// Phase schema - based on Float API v3 documentation
export const phaseSchema = z.object({
  phase_id: z.number().optional(), // Float API uses phase_id, not id
  project_id: z.number(),
  name: z.string(),
  start_date: z.string().nullable().optional(),
  end_date: z.string().nullable().optional(),
  status: z.number().optional(), // 0 = Draft, 1 = Tentative, 2 = Confirmed
  notes: z.string().nullable().optional(),
  non_billable: z.number().nullable().optional(), // 0 = billable, 1 = non-billable
  color: z.string().nullable().optional(),
  default_hourly_rate: z.string().nullable().optional(), // String per API docs
  budget_total: z.number().nullable().optional(),
  created: z.string().nullable().optional(), // Float API uses 'created', not 'created_at'
  modified: z.string().nullable().optional(), // Float API uses 'modified', not 'updated_at'
  active: z.number().nullable().optional(), // 0 = archived, 1 = active
});

// Time Off Type schema - updated to match Float API v3 structure
export const timeOffTypeSchema = z.object({
  timeoff_type_id: z.number().optional(), // Float API uses timeoff_type_id, not id
  name: z.string(),
  active: z.number().nullable().optional(), // 0 = archived, 1 = active
  is_default: z.number().nullable().optional(), // 0 = not default, 1 = default
  color: z.string().nullable().optional(), // Hex color code for UI display
  created: z.string().nullable().optional(), // Float API uses 'created', not 'created_at'
  modified: z.string().nullable().optional(), // Float API uses 'modified', not 'updated_at'
});

// Team Holiday schema - updated to match Float API v3 structure
export const teamHolidaySchema = z.object({
  holiday_id: z.number().optional(), // Float API uses holiday_id
  name: z.string(),
  description: z.string().nullable().optional(),
  start_date: z.string(), // ISO date format (YYYY-MM-DD)
  end_date: z.string(), // ISO date format (YYYY-MM-DD)
  holiday_type: z.number().nullable().optional(), // 0 = full day, 1 = partial day
  department_id: z.number().nullable().optional(), // Department-specific holiday
  region_id: z.number().nullable().optional(), // Region-specific holiday
  recurring: z.number().nullable().optional(), // 0 = one-time, 1 = recurring
  recurrence_pattern: z.string().nullable().optional(), // For recurring holidays
  active: z.number().nullable().optional(), // 0 = inactive, 1 = active
  created: z.string().nullable().optional(), // Float API uses 'created', not 'created_at'
  modified: z.string().nullable().optional(), // Float API uses 'modified', not 'updated_at'
  created_by: z.number().nullable().optional(), // User ID who created the holiday
  notes: z.string().nullable().optional(),
  color: z.string().nullable().optional(), // Hex color code for calendar display
  all_day: z.number().nullable().optional(), // 0 = not all day, 1 = all day
  timezone: z.string().nullable().optional(), // Timezone for the holiday
});

// Role schema based on Float API v3 specification
export const roleSchema = z.object({
  role_id: z.number().optional(),
  name: z.string(),
  description: z.string().nullable().optional(),
  default_hourly_rate: z.string().nullable().optional(),
  permissions: z.array(z.string()).nullable().optional(),
  active: z.number().nullable().optional(), // 1 = Active, 0 = Archived
  created: z.string().nullable().optional(),
  modified: z.string().nullable().optional(),
  department_id: z.number().nullable().optional(),
  level: z.number().nullable().optional(),
  is_system_role: z.number().nullable().optional(), // 1 = System, 0 = Custom
});

// Milestone schema - updated to match Float API v3 structure
export const milestoneSchema = z.object({
  milestone_id: z.number().optional(), // Float API uses milestone_id, not id
  project_id: z.number().optional(),
  phase_id: z.number().nullable().optional(),
  name: z.string(),
  description: z.string().nullable().optional(),
  date: z.string().nullable().optional(), // ISO date format (YYYY-MM-DD)
  start_date: z.string().nullable().optional(),
  end_date: z.string().nullable().optional(),
  status: z.number().nullable().optional(), // Float API uses numeric status codes
  created: z.string().nullable().optional(), // Float API uses 'created', not 'created_at'
  modified: z.string().nullable().optional(), // Float API uses 'modified', not 'updated_at'
  created_by: z.number().nullable().optional(),
  modified_by: z.number().nullable().optional(),
  active: z.number().nullable().optional(), // 0 = archived, 1 = active
  priority: z.number().nullable().optional(), // Priority level (1-5)
  completed: z.number().nullable().optional(), // 0 = not completed, 1 = completed
  completed_date: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  reminder_date: z.string().nullable().optional(),
  reminder_sent: z.number().nullable().optional(), // 0 = not sent, 1 = sent
});

// Time Off Type schema for reference (duplicate removed)

// Time Off schema based on Float API v3 structure
export const timeOffSchema = z.object({
  timeoff_id: z.number().optional(), // Float API uses timeoff_id
  people_id: z.number().optional(), // Float API uses people_id, not person_id
  people_ids: z.array(z.number()).optional(), // Array of people IDs (returned by API)
  timeoff_type_id: z.number().optional(), // Reference to time off type
  timeoff_type_name: z.string().optional(), // Time off type name (returned by API)
  start_date: z.string().nullable().optional(), // ISO date format (YYYY-MM-DD)
  end_date: z.string().nullable().optional(), // ISO date format (YYYY-MM-DD)
  start_time: z.string().nullable().optional(), // Start time (returned by API)
  hours: z.number().nullable().optional(), // Hours of time off (null for full day)
  timeoff_notes: z.string().nullable().optional(), // Notes field (returned by API)
  full_day: z.number().nullable().optional(), // 1 for full day, 0 for partial day
  status: z.number().nullable().optional(), // Numeric status: 1=pending, 2=approved, 3=rejected
  status_note: z.string().nullable().optional(), // Status note (returned by API)
  status_creator_id: z.number().nullable().optional(), // Who set the status (returned by API)
  notes: z.string().nullable().optional(), // Optional notes
  created: z.string().nullable().optional(), // Float API uses 'created', not 'created_at'
  created_by: z.number().nullable().optional(), // User ID who created (returned by API)
  modified: z.string().nullable().optional(), // Float API uses 'modified', not 'updated_at'
  modified_by: z.number().nullable().optional(), // User ID who modified (returned by API)
  approved_by: z.number().nullable().optional(), // User ID who approved
  approved_at: z.string().nullable().optional(), // Approval timestamp
  rejected_by: z.number().nullable().optional(), // User ID who rejected
  rejected_at: z.string().nullable().optional(), // Rejection timestamp
  repeat_state: z.number().nullable().optional(), // Repeat configuration
  repeat_end: z.string().nullable().optional(), // End date for repeating time off
});

// Project Task schema - template tasks that can be assigned to projects and phases
export const projectTaskSchema = z.object({
  project_task_id: z.number().optional(), // Float API uses project_task_id
  project_id: z.number().optional(),
  phase_id: z.number().nullable().optional(), // Tasks can be assigned to phases
  task_names: z.string().describe('Task name/title'),
  notes: z.string().nullable().optional(),
  budget: z.number().nullable().optional(), // Budget can be set at task level
  budget_type: z.number().nullable().optional(), // Budget type (hours, amount, etc.)
  color: z.string().nullable().optional(),
  billable: z.number().nullable().optional(), // 0 = non-billable, 1 = billable
  active: z.number().nullable().optional(), // 0 = archived, 1 = active
  priority: z.number().nullable().optional(),
  created: z.string().nullable().optional(), // Float API uses 'created', not 'created_at'
  modified: z.string().nullable().optional(), // Float API uses 'modified', not 'updated_at'
  sort_order: z.number().nullable().optional(), // For ordering tasks within projects
  dependencies: z.array(z.number()).nullable().optional(), // Task dependencies
  estimated_hours: z.number().nullable().optional(), // Estimated hours for completion
  status: z.number().nullable().optional(), // Task status (numeric codes)
});

// Logged Time schema based on Float API v3 documentation
export const loggedTimeSchema = z.object({
  logged_time_id: z.string().optional(), // Hexadecimal ID from Float API
  people_id: z.number().optional(), // Person who logged the time
  project_id: z.number().optional(), // Project the time was logged against
  task_id: z.string().nullable().optional(), // Task the time was logged against
  date: z.string().nullable().optional(), // Date the time was logged (YYYY-MM-DD)
  hours: z.number().nullable().optional(), // Hours logged
  billable: z.number().nullable().optional(), // 1 = billable, 0 = non-billable
  notes: z.string().nullable().optional(), // Optional notes describing the work
  reference_date: z.string().nullable().optional(), // Reference date for UI suggestions
  locked: z.number().nullable().optional(), // 1 = locked, 0 = unlocked
  created: z.string().nullable().optional(), // Float API uses 'created', not 'created_at'
  modified: z.string().nullable().optional(), // Float API uses 'modified', not 'updated_at'
  created_by: z.number().nullable().optional(), // User ID who created the entry
  modified_by: z.number().nullable().optional(), // User ID who last modified the entry
});

// Response schemas - Float API returns arrays directly
export const projectsResponseSchema = z.array(projectSchema);
export const tasksResponseSchema = z.array(taskSchema);
export const peopleResponseSchema = z.array(personSchema);
export const allocationsResponseSchema = z.array(allocationSchema);
export const clientsResponseSchema = z.array(clientSchema);
export const projectTasksResponseSchema = z.array(projectTaskSchema);
export const statusesResponseSchema = z.array(statusSchema);
export const timeOffResponseSchema = z.array(timeOffSchema);
export const timeOffTypesResponseSchema = z.array(timeOffTypeSchema);
export const phasesResponseSchema = z.array(phaseSchema);
export const teamHolidaysResponseSchema = z.array(teamHolidaySchema);
export const accountsResponseSchema = z.array(accountSchema);
export const milestonesResponseSchema = z.array(milestoneSchema);
export const rolesResponseSchema = z.array(roleSchema);
export const loggedTimeResponseSchema = z.array(loggedTimeSchema);

// Type exports
export type Department = z.infer<typeof departmentSchema>;
export type PeopleTag = z.infer<typeof peopleTagSchema>;
export type Contract = z.infer<typeof contractSchema>;
export type Account = z.infer<typeof accountSchema>;
export type Person = z.infer<typeof personSchema>;
export type Project = z.infer<typeof projectSchema>;
export type Task = z.infer<typeof taskSchema>;
export type Allocation = z.infer<typeof allocationSchema>;
export type Client = z.infer<typeof clientSchema>;
export type ProjectTask = z.infer<typeof projectTaskSchema>;
export type Status = z.infer<typeof statusSchema>;
export type TimeOff = z.infer<typeof timeOffSchema>;
export type TimeOffType = z.infer<typeof timeOffTypeSchema>;
export type Role = z.infer<typeof roleSchema>;
export type Phase = z.infer<typeof phaseSchema>;
export type Milestone = z.infer<typeof milestoneSchema>;
export type TeamHoliday = z.infer<typeof teamHolidaySchema>;
export type LoggedTime = z.infer<typeof loggedTimeSchema>;

// Public Holiday schema - based on Float API v3 structure
export const publicHolidaySchema = z.object({
  holiday_id: z.union([z.string(), z.number()]).optional(), // Float API uses holiday_id
  name: z.string(),
  date: z.string(), // ISO date format (YYYY-MM-DD)
  region: z.string().nullable().optional(), // Region or country code
  country: z.string().nullable().optional(), // Country name
  type: z.string().nullable().optional(), // Holiday type (bank_holiday, observed, etc.)
  active: z.number().nullable().optional(), // 0 = archived, 1 = active
  created: z.string().nullable().optional(), // Float API uses 'created', not 'created_at'
  modified: z.string().nullable().optional(), // Float API uses 'modified', not 'updated_at'
  moveable: z.number().nullable().optional(), // 0 = fixed date, 1 = moveable
  year: z.number().nullable().optional(), // Year for the holiday
  recurring: z.number().nullable().optional(), // 0 = one-time, 1 = recurring
  notes: z.string().nullable().optional(), // Additional notes
});

export const publicHolidaysResponseSchema = z.array(publicHolidaySchema);

export type ProjectsResponse = z.infer<typeof projectsResponseSchema>;
export type TasksResponse = z.infer<typeof tasksResponseSchema>;
export type PeopleResponse = z.infer<typeof peopleResponseSchema>;
export type AllocationsResponse = z.infer<typeof allocationsResponseSchema>;
export type ClientsResponse = z.infer<typeof clientsResponseSchema>;
export type ProjectTasksResponse = z.infer<typeof projectTasksResponseSchema>;
export type StatusesResponse = z.infer<typeof statusesResponseSchema>;
export type TimeOffTypesResponse = z.infer<typeof timeOffTypesResponseSchema>;
export type PhasesResponse = z.infer<typeof phasesResponseSchema>;
export type TeamHolidaysResponse = z.infer<typeof teamHolidaysResponseSchema>;
export type AccountsResponse = z.infer<typeof accountsResponseSchema>;
export type MilestonesResponse = z.infer<typeof milestonesResponseSchema>;
export type PublicHoliday = z.infer<typeof publicHolidaySchema>;
export type PublicHolidaysResponse = z.infer<typeof publicHolidaysResponseSchema>;
export type RolesResponse = z.infer<typeof rolesResponseSchema>;
export type LoggedTimeResponse = z.infer<typeof loggedTimeResponseSchema>;
