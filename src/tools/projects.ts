import { z } from 'zod';
import { createTool } from './base.js';
import { floatApi } from '../services/float-api.js';
import { projectSchema, projectsResponseSchema } from '../types/float.js';

// List projects
export const listProjects = createTool(
  'list-projects',
  'List all projects with optional filtering by status or client',
  z.object({
    status: z.string().optional().describe('Filter by project status'),
    client_id: z.string().optional().describe('Filter by client ID'),
  }),
  async (params) => {
    const queryParams = new URLSearchParams();
    if (params.status) queryParams.append('status', params.status);
    if (params.client_id) queryParams.append('client_id', params.client_id);

    const response = await floatApi.get(
      `/projects?${queryParams.toString()}`,
      projectsResponseSchema
    );
    return response;
  }
);

// Get project details
export const getProject = createTool(
  'get-project',
  'Get detailed information about a specific project',
  z.object({
    id: z.string().describe('The project ID'),
  }),
  async (params) => {
    const project = await floatApi.get(`/projects/${params.id}`, projectSchema);
    return project;
  }
);

// Create project
export const createProject = createTool(
  'create-project',
  'Create a new project',
  z.object({
    name: z.string().describe('Project name'),
    client_id: z.string().describe('Client ID'),
    start_date: z.string().describe('Project start date (YYYY-MM-DD)'),
    end_date: z.string().optional().describe('Project end date (YYYY-MM-DD)'),
    notes: z.string().optional().describe('Project notes'),
    budget: z.number().optional().describe('Project budget'),
    hourly_rate: z.number().optional().describe('Hourly rate'),
  }),
  async (params) => {
    const project = await floatApi.post('/projects', params, projectSchema);
    return project;
  }
);

// Update project
export const updateProject = createTool(
  'update-project',
  'Update an existing project',
  z.object({
    id: z.string().describe('The project ID'),
    name: z.string().optional().describe('Project name'),
    client_id: z.string().optional().describe('Client ID'),
    start_date: z.string().optional().describe('Project start date (YYYY-MM-DD)'),
    end_date: z.string().optional().describe('Project end date (YYYY-MM-DD)'),
    notes: z.string().optional().describe('Project notes'),
    budget: z.number().optional().describe('Project budget'),
    hourly_rate: z.number().optional().describe('Hourly rate'),
    status: z.string().optional().describe('Project status'),
  }),
  async (params) => {
    const { id, ...updateData } = params;
    const project = await floatApi.put(`/projects/${id}`, updateData, projectSchema);
    return project;
  }
);

// Delete project
export const deleteProject = createTool(
  'delete-project',
  'Delete a project',
  z.object({
    id: z.string().describe('The project ID'),
  }),
  async (params) => {
    await floatApi.delete(`/projects/${params.id}`);
    return { success: true };
  }
);
