import { z } from 'zod';
import { createTool } from './base.js';
import { floatApi } from '../services/float-api.js';
import { allocationSchema, allocationsResponseSchema } from '../types/float.js';

// List allocations
export const listAllocations = createTool(
  'list-allocations',
  'List all allocations with optional filtering',
  z.object({
    project_id: z.string().optional().describe('Filter by project ID'),
    person_id: z.string().optional().describe('Filter by person ID'),
    start_date: z.string().optional().describe('Filter by start date (YYYY-MM-DD)'),
    end_date: z.string().optional().describe('Filter by end date (YYYY-MM-DD)'),
  }),
  async (params) => {
    const queryParams = new URLSearchParams();
    if (params.project_id) queryParams.append('project_id', params.project_id);
    if (params.person_id) queryParams.append('person_id', params.person_id);
    if (params.start_date) queryParams.append('start_date', params.start_date);
    if (params.end_date) queryParams.append('end_date', params.end_date);

    const response = await floatApi.get(
      `/allocations?${queryParams.toString()}`,
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
    id: z.string().describe('The allocation ID'),
  }),
  async (params) => {
    const allocation = await floatApi.get(`/allocations/${params.id}`, allocationSchema);
    return allocation;
  }
);

// Create allocation
export const createAllocation = createTool(
  'create-allocation',
  'Create a new allocation',
  z.object({
    project_id: z.string().describe('Project ID'),
    person_id: z.string().describe('Person ID'),
    task_id: z.string().describe('Task ID'),
    start_date: z.string().describe('Allocation start date (YYYY-MM-DD)'),
    end_date: z.string().optional().describe('Allocation end date (YYYY-MM-DD)'),
    hours: z.number().describe('Number of hours allocated'),
    notes: z.string().optional().describe('Allocation notes'),
  }),
  async (params) => {
    const allocation = await floatApi.post('/allocations', params, allocationSchema);
    return allocation;
  }
);

// Update allocation
export const updateAllocation = createTool(
  'update-allocation',
  'Update an existing allocation',
  z.object({
    id: z.string().describe('The allocation ID'),
    project_id: z.string().optional().describe('Project ID'),
    person_id: z.string().optional().describe('Person ID'),
    task_id: z.string().optional().describe('Task ID'),
    start_date: z.string().optional().describe('Allocation start date (YYYY-MM-DD)'),
    end_date: z.string().optional().describe('Allocation end date (YYYY-MM-DD)'),
    hours: z.number().optional().describe('Number of hours allocated'),
    notes: z.string().optional().describe('Allocation notes'),
  }),
  async (params) => {
    const { id, ...updateData } = params;
    const allocation = await floatApi.put(`/allocations/${id}`, updateData, allocationSchema);
    return allocation;
  }
);

// Delete allocation
export const deleteAllocation = createTool(
  'delete-allocation',
  'Delete an allocation',
  z.object({
    id: z.string().describe('The allocation ID'),
  }),
  async (params) => {
    await floatApi.delete(`/allocations/${params.id}`);
    return { success: true };
  }
);
