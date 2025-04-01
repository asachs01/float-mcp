import { z } from 'zod';

// Base schemas
const baseEntitySchema = z.object({
  id: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

// Project schema
export const projectSchema = baseEntitySchema.extend({
  name: z.string(),
  notes: z.string().optional(),
  status: z.string(),
  client_id: z.string(),
  start_date: z.string(),
  end_date: z.string().optional(),
  budget: z.number().optional(),
  hourly_rate: z.number().optional(),
});

// Task schema
export const taskSchema = baseEntitySchema.extend({
  project_id: z.string(),
  name: z.string(),
  notes: z.string().optional(),
  status: z.string(),
  start_date: z.string(),
  end_date: z.string().optional(),
  estimated_hours: z.number().optional(),
  actual_hours: z.number().optional(),
  priority: z.number().optional(),
});

// Person schema
export const personSchema = baseEntitySchema.extend({
  name: z.string(),
  email: z.string().email(),
  role: z.string(),
  department: z.string().optional(),
  status: z.string(),
  hourly_rate: z.number().optional(),
});

// Allocation schema
export const allocationSchema = baseEntitySchema.extend({
  project_id: z.string(),
  person_id: z.string(),
  task_id: z.string(),
  start_date: z.string(),
  end_date: z.string().optional(),
  hours: z.number(),
  notes: z.string().optional(),
});

// Client schema
export const clientSchema = baseEntitySchema.extend({
  name: z.string(),
  notes: z.string().optional(),
});

// Response schemas
export const projectsResponseSchema = z.object({
  projects: z.array(projectSchema),
});

export const tasksResponseSchema = z.object({
  tasks: z.array(taskSchema),
});

export const peopleResponseSchema = z.object({
  people: z.array(personSchema),
});

export const allocationsResponseSchema = z.object({
  allocations: z.array(allocationSchema),
});

export const clientsResponseSchema = z.object({
  clients: z.array(clientSchema),
});

// Type exports
export type Project = z.infer<typeof projectSchema>;
export type Task = z.infer<typeof taskSchema>;
export type Person = z.infer<typeof personSchema>;
export type Allocation = z.infer<typeof allocationSchema>;
export type Client = z.infer<typeof clientSchema>;

export type ProjectsResponse = z.infer<typeof projectsResponseSchema>;
export type TasksResponse = z.infer<typeof tasksResponseSchema>;
export type PeopleResponse = z.infer<typeof peopleResponseSchema>;
export type AllocationsResponse = z.infer<typeof allocationsResponseSchema>;
export type ClientsResponse = z.infer<typeof clientsResponseSchema>; 