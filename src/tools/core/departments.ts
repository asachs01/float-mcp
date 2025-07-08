import { z } from 'zod';
import { createTool } from '../base.js';
import { floatApi } from '../../services/float-api.js';
import { departmentSchema } from '../../types/float.js';

// List departments
export const listDepartments = createTool(
  'list-departments',
  'List all departments',
  z.object({
    active: z.number().optional().describe('Filter by active status (0=archived, 1=active)'),
    page: z.number().optional().describe('Page number for pagination'),
    'per-page': z.number().optional().describe('Number of items per page (max 200)'),
  }),
  async (params) => {
    const response = await floatApi.getPaginated('/departments', params, z.array(departmentSchema));
    return response;
  }
);

// Get department details
export const getDepartment = createTool(
  'get-department',
  'Get detailed information about a specific department',
  z.object({
    department_id: z.union([z.string(), z.number()]).describe('The department ID'),
  }),
  async (params) => {
    const department = await floatApi.get(`/departments/${params.department_id}`, departmentSchema);
    return department;
  }
);

// Create department
export const createDepartment = createTool(
  'create-department',
  'Create a new department',
  z.object({
    name: z.string().describe('Department name'),
    parent_id: z.number().optional().describe('Parent department ID'),
  }),
  async (params) => {
    const department = await floatApi.post('/departments', params, departmentSchema);
    return department;
  }
);

// Update department
export const updateDepartment = createTool(
  'update-department',
  'Update an existing department',
  z.object({
    department_id: z.union([z.string(), z.number()]).describe('The department ID'),
    name: z.string().optional().describe('Department name'),
    parent_id: z.number().optional().describe('Parent department ID'),
  }),
  async (params) => {
    const { department_id, ...updateData } = params;
    const department = await floatApi.patch(
      `/departments/${department_id}`,
      updateData,
      departmentSchema
    );
    return department;
  }
);

// Delete department
export const deleteDepartment = createTool(
  'delete-department',
  'Delete a department',
  z.object({
    department_id: z.union([z.string(), z.number()]).describe('The department ID'),
  }),
  async (params) => {
    await floatApi.delete(`/departments/${params.department_id}`);
    return { success: true, message: 'Department deleted successfully' };
  }
);
