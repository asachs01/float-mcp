import { z } from 'zod';
import { createTool } from '../base.js';
import { floatApi } from '../../services/float-api.js';
import { taskSchema, tasksResponseSchema } from '../../types/float.js';

// List tasks (allocations in Float API)
export const listTasks = createTool(
  'list-tasks',
  'List all tasks/allocations with optional filtering by project, person, or date range',
  z.object({
    project_id: z.number().optional().describe('Filter by project ID'),
    people_id: z.number().optional().describe('Filter by person ID'),
    start_date: z.string().optional().describe('Filter by start date (YYYY-MM-DD)'),
    end_date: z.string().optional().describe('Filter by end date (YYYY-MM-DD)'),
    status: z.number().optional().describe('Filter by task status (numeric)'),
    page: z.number().optional().describe('Page number for pagination'),
    'per-page': z.number().optional().describe('Number of items per page (max 200)'),
  }),
  async (params) => {
    const response = await floatApi.getPaginated('/tasks', params, tasksResponseSchema);
    return response;
  }
);

// Get task details
export const getTask = createTool(
  'get-task',
  'Get detailed information about a specific task/allocation',
  z.object({
    task_id: z.union([z.string(), z.number()]).describe('The task ID (task_id)'),
  }),
  async (params) => {
    const task = await floatApi.get(`/tasks/${params.task_id}`, taskSchema);
    return task;
  }
);

// Create task (allocation in Float API)
export const createTask = createTool(
  'create-task',
  'Create a new task/allocation',
  z.object({
    project_id: z.number().describe('Project ID'),
    people_id: z.number().describe('Person ID'),
    name: z.string().describe('Task name'),
    start_date: z.string().describe('Task start date (YYYY-MM-DD)'),
    end_date: z.string().optional().describe('Task end date (YYYY-MM-DD)'),
    notes: z.string().optional().describe('Task notes'),
    estimated_hours: z.number().optional().describe('Estimated hours'),
    priority: z.number().optional().describe('Task priority'),
    billable: z.number().optional().describe('Billable flag (0=non-billable, 1=billable)'),
    task_type: z.number().optional().describe('Task type'),
  }),
  async (params) => {
    const task = await floatApi.post('/tasks', params, taskSchema);
    return task;
  }
);

// Update task
export const updateTask = createTool(
  'update-task',
  'Update an existing task/allocation',
  z.object({
    task_id: z.union([z.string(), z.number()]).describe('The task ID (task_id)'),
    name: z.string().optional().describe('Task name'),
    project_id: z.number().optional().describe('Project ID'),
    people_id: z.number().optional().describe('Person ID'),
    start_date: z.string().optional().describe('Task start date (YYYY-MM-DD)'),
    end_date: z.string().optional().describe('Task end date (YYYY-MM-DD)'),
    notes: z.string().optional().describe('Task notes'),
    estimated_hours: z.number().optional().describe('Estimated hours'),
    actual_hours: z.number().optional().describe('Actual hours spent'),
    priority: z.number().optional().describe('Task priority'),
    status: z.number().optional().describe('Task status (numeric)'),
    billable: z.number().optional().describe('Billable flag (0=non-billable, 1=billable)'),
    task_type: z.number().optional().describe('Task type'),
  }),
  async (params) => {
    const { task_id, ...updateData } = params;
    const task = await floatApi.patch(`/tasks/${task_id}`, updateData, taskSchema);
    return task;
  }
);

// Delete task
export const deleteTask = createTool(
  'delete-task',
  'Delete a task/allocation',
  z.object({
    task_id: z.union([z.string(), z.number()]).describe('The task ID (task_id)'),
  }),
  async (params) => {
    await floatApi.delete(`/tasks/${params.task_id}`);
    return { success: true, message: 'Task deleted successfully' };
  }
);
