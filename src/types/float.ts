import { z } from 'zod';

// Base schemas - Float API uses different field names and types
const baseEntitySchema = z.object({
  // Many Float API responses don't have these standard fields
  id: z.union([z.string(), z.number()]).optional(), // ID can be number or missing
  created_at: z.string().optional(), // May not be present
  updated_at: z.string().optional(), // May not be present
});

// Float API schemas based on official documentation at https://developer.float.com/api_reference.html#People
// Modified to handle actual API responses which return null for many fields

// Department schema as defined in Float API - allowing nulls for reality
export const departmentSchema = z.object({
  department_id: z.number(),
  parent_id: z.number().nullable().optional(),
  name: z.string().nullable().optional(),
}).nullable();

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
export const accountSchema = z.object({
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
}).nullable();

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

// Project schema - keeping flexible for now but should be updated to match official docs
export const projectSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  name: z.string(),
  notes: z.string().nullable().optional(),
  status: z.union([z.string(), z.number()]),
  client_id: z.union([z.string(), z.number()]).nullable().optional(),
  start_date: z.string().nullable().optional(),
  end_date: z.string().nullable().optional(),
  budget: z.number().optional(),
  hourly_rate: z.number().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

// Task schema - keeping flexible for now
export const taskSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  project_id: z.union([z.string(), z.number()]).optional(),
  name: z.string(),
  notes: z.string().nullable().optional(),
  status: z.union([z.string(), z.number()]),
  start_date: z.string().nullable().optional(),
  end_date: z.string().nullable().optional(),
  estimated_hours: z.number().optional(),
  actual_hours: z.number().optional(),
  priority: z.number().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

// Allocation schema - keeping flexible for now
export const allocationSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  project_id: z.union([z.string(), z.number()]).optional(),
  person_id: z.union([z.string(), z.number()]).optional(),
  task_id: z.union([z.string(), z.number()]).optional(),
  start_date: z.string().nullable().optional(),
  end_date: z.string().nullable().optional(),
  hours: z.number().optional(),
  notes: z.string().nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

// Client schema - keeping flexible for now
export const clientSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  name: z.string(),
  notes: z.string().nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

// Response schemas - Float API returns arrays directly
export const projectsResponseSchema = z.array(projectSchema);
export const tasksResponseSchema = z.array(taskSchema);
export const peopleResponseSchema = z.array(personSchema);
export const allocationsResponseSchema = z.array(allocationSchema);
export const clientsResponseSchema = z.array(clientSchema);

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

export type ProjectsResponse = z.infer<typeof projectsResponseSchema>;
export type TasksResponse = z.infer<typeof tasksResponseSchema>;
export type PeopleResponse = z.infer<typeof peopleResponseSchema>;
export type AllocationsResponse = z.infer<typeof allocationsResponseSchema>;
export type ClientsResponse = z.infer<typeof clientsResponseSchema>;
