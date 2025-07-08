import { z } from 'zod';
import { createTool } from '../base.js';
import { floatApi } from '../../services/float-api.js';
import { allocationSchema, allocationsResponseSchema } from '../../types/float.js';

// List allocations (same as tasks in Float API)
export const listAllocations = createTool(
  'list-allocations',
  'List all allocations with optional filtering (same as tasks in Float API)',
  z.object({
    project_id: z.number().optional().describe('Filter by project ID'),
    people_id: z.number().optional().describe('Filter by person ID'),
    start_date: z.string().optional().describe('Filter by start date (YYYY-MM-DD)'),
    end_date: z.string().optional().describe('Filter by end date (YYYY-MM-DD)'),
    status: z.number().optional().describe('Filter by status (numeric)'),
    page: z.number().optional().describe('Page number for pagination'),
    'per-page': z.number().optional().describe('Number of items per page (max 200)'),
  }),
  async (params) => {
    const response = await floatApi.getPaginated(
      '/tasks', // Allocations are managed through /tasks endpoint
      params,
      allocationsResponseSchema
    );
    return response;
  }
);

// Get allocation details
export const getAllocation = createTool(
  'get-allocation',
  'Get detailed information about a specific allocation',
  z.object({
    task_id: z.union([z.string(), z.number()]).describe('The allocation ID (task_id in Float API)'),
  }),
  async (params) => {
    const allocation = await floatApi.get(`/tasks/${params.task_id}`, allocationSchema);
    return allocation;
  }
);

// Create allocation
export const createAllocation = createTool(
  'create-allocation',
  'Create a new allocation',
  z.object({
    project_id: z.number().describe('Project ID'),
    people_id: z.number().describe('Person ID'),
    start_date: z.string().describe('Allocation start date (YYYY-MM-DD)'),
    end_date: z.string().optional().describe('Allocation end date (YYYY-MM-DD)'),
    hours: z.number().describe('Number of hours allocated'),
    notes: z.string().optional().describe('Allocation notes'),
    billable: z.number().optional().describe('Billable flag (0=non-billable, 1=billable)'),
    task_type: z.number().optional().describe('Task type'),
  }),
  async (params) => {
    const allocation = await floatApi.post('/tasks', params, allocationSchema);
    return allocation;
  }
);

// Update allocation
export const updateAllocation = createTool(
  'update-allocation',
  'Update an existing allocation',
  z.object({
    task_id: z.union([z.string(), z.number()]).describe('The allocation ID (task_id in Float API)'),
    project_id: z.number().optional().describe('Project ID'),
    people_id: z.number().optional().describe('Person ID'),
    start_date: z.string().optional().describe('Allocation start date (YYYY-MM-DD)'),
    end_date: z.string().optional().describe('Allocation end date (YYYY-MM-DD)'),
    hours: z.number().optional().describe('Number of hours allocated'),
    notes: z.string().optional().describe('Allocation notes'),
    billable: z.number().optional().describe('Billable flag (0=non-billable, 1=billable)'),
    task_type: z.number().optional().describe('Task type'),
    status: z.number().optional().describe('Status (numeric)'),
  }),
  async (params) => {
    const { task_id, ...updateData } = params;
    const allocation = await floatApi.patch(`/tasks/${task_id}`, updateData, allocationSchema);
    return allocation;
  }
);

// Delete allocation
export const deleteAllocation = createTool(
  'delete-allocation',
  'Delete an allocation',
  z.object({
    task_id: z.union([z.string(), z.number()]).describe('The allocation ID (task_id in Float API)'),
  }),
  async (params) => {
    await floatApi.delete(`/tasks/${params.task_id}`);
    return { success: true, message: 'Allocation deleted successfully' };
  }
);
