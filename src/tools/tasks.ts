import { z } from 'zod';
import { createTool } from './base.js';
import { floatApi } from '../services/float-api.js';
import { taskSchema, tasksResponseSchema } from '../types/float.js';

// List tasks
export const listTasks = createTool(
  'list-tasks',
  'List all tasks with optional filtering by project or status',
  z.object({
    project_id: z.string().optional().describe('Filter by project ID'),
    status: z.string().optional().describe('Filter by task status'),
  }),
  async (params) => {
    const queryParams = new URLSearchParams();
    if (params.project_id) queryParams.append('project_id', params.project_id);
    if (params.status) queryParams.append('status', params.status);

    const response = await floatApi.get(
      `/tasks?${queryParams.toString()}`,
      tasksResponseSchema
    );
    return response; // Now response is directly an array of tasks
  }
);

// Get task details
export const getTask = createTool(
  'get-task',
  'Get detailed information about a specific task',
  z.object({
    id: z.string().describe('The task ID'),
  }),
  async (params) => {
    const task = await floatApi.get(`/tasks/${params.id}`, taskSchema);
    return task;
  }
);

// Create task
export const createTask = createTool(
  'create-task',
  'Create a new task',
  z.object({
    project_id: z.string().describe('Project ID'),
    name: z.string().describe('Task name'),
    start_date: z.string().describe('Task start date (YYYY-MM-DD)'),
    end_date: z.string().optional().describe('Task end date (YYYY-MM-DD)'),
    notes: z.string().optional().describe('Task notes'),
    estimated_hours: z.number().optional().describe('Estimated hours'),
    priority: z.number().optional().describe('Task priority (1-5)'),
  }),
  async (params) => {
    const task = await floatApi.post('/tasks', params, taskSchema);
    return task;
  }
);

// Update task
export const updateTask = createTool(
  'update-task',
  'Update an existing task',
  z.object({
    id: z.string().describe('The task ID'),
    name: z.string().optional().describe('Task name'),
    project_id: z.string().optional().describe('Project ID'),
    start_date: z.string().optional().describe('Task start date (YYYY-MM-DD)'),
    end_date: z.string().optional().describe('Task end date (YYYY-MM-DD)'),
    notes: z.string().optional().describe('Task notes'),
    estimated_hours: z.number().optional().describe('Estimated hours'),
    actual_hours: z.number().optional().describe('Actual hours spent'),
    priority: z.number().optional().describe('Task priority (1-5)'),
    status: z.string().optional().describe('Task status'),
  }),
  async (params) => {
    const { id, ...updateData } = params;
    const task = await floatApi.put(`/tasks/${id}`, updateData, taskSchema);
    return task;
  }
);

// Delete task
export const deleteTask = createTool(
  'delete-task',
  'Delete a task',
  z.object({
    id: z.string().describe('The task ID'),
  }),
  async (params) => {
    await floatApi.delete(`/tasks/${params.id}`);
    return { success: true };
  }
);
