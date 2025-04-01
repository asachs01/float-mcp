import { z } from 'zod';
import { createTool } from './base.js';
import { floatApi } from '../services/float-api.js';
import { taskSchema, tasksResponseSchema, Task } from '../types/float.js';

// List tasks
export const listTasks = createTool(
  'list-tasks',
  z.object({
    project_id: z.string().optional(),
    status: z.string().optional(),
  }),
  async (params) => {
    const queryParams = new URLSearchParams();
    if (params.project_id) queryParams.append('project_id', params.project_id);
    if (params.status) queryParams.append('status', params.status);

    const response = await floatApi.get(
      `/tasks?${queryParams.toString()}`,
      tasksResponseSchema
    );
    return response.tasks;
  }
);

// Get task details
export const getTask = createTool(
  'get-task',
  z.object({
    id: z.string(),
  }),
  async (params) => {
    const task = await floatApi.get(`/tasks/${params.id}`, taskSchema);
    return task;
  }
);

// Create task
export const createTask = createTool(
  'create-task',
  z.object({
    project_id: z.string(),
    name: z.string(),
    start_date: z.string(),
    end_date: z.string().optional(),
    notes: z.string().optional(),
    estimated_hours: z.number().optional(),
    priority: z.number().optional(),
  }),
  async (params) => {
    const task = await floatApi.post('/tasks', params, taskSchema);
    return task;
  }
);

// Update task
export const updateTask = createTool(
  'update-task',
  z.object({
    id: z.string(),
    name: z.string().optional(),
    project_id: z.string().optional(),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
    notes: z.string().optional(),
    estimated_hours: z.number().optional(),
    actual_hours: z.number().optional(),
    priority: z.number().optional(),
    status: z.string().optional(),
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
  z.object({
    id: z.string(),
  }),
  async (params) => {
    await floatApi.delete(`/tasks/${params.id}`);
    return { success: true };
  }
); 