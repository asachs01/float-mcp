import { z } from 'zod';
import { createTool } from './base.js';
import { floatApi } from '../services/float-api.js';
import { projectSchema, projectsResponseSchema, Project } from '../types/float.js';

// List projects
export const listProjects = createTool(
  'list-projects',
  z.object({
    status: z.string().optional(),
    client_id: z.string().optional(),
  }),
  async (params) => {
    const queryParams = new URLSearchParams();
    if (params.status) queryParams.append('status', params.status);
    if (params.client_id) queryParams.append('client_id', params.client_id);

    const response = await floatApi.get(
      `/projects?${queryParams.toString()}`,
      projectsResponseSchema
    );
    return response.projects;
  }
);

// Get project details
export const getProject = createTool(
  'get-project',
  z.object({
    id: z.string(),
  }),
  async (params) => {
    const project = await floatApi.get(`/projects/${params.id}`, projectSchema);
    return project;
  }
);

// Create project
export const createProject = createTool(
  'create-project',
  z.object({
    name: z.string(),
    client_id: z.string(),
    start_date: z.string(),
    end_date: z.string().optional(),
    notes: z.string().optional(),
    budget: z.number().optional(),
    hourly_rate: z.number().optional(),
  }),
  async (params) => {
    const project = await floatApi.post('/projects', params, projectSchema);
    return project;
  }
);

// Update project
export const updateProject = createTool(
  'update-project',
  z.object({
    id: z.string(),
    name: z.string().optional(),
    client_id: z.string().optional(),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
    notes: z.string().optional(),
    budget: z.number().optional(),
    hourly_rate: z.number().optional(),
    status: z.string().optional(),
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
  z.object({
    id: z.string(),
  }),
  async (params) => {
    await floatApi.delete(`/projects/${params.id}`);
    return { success: true };
  }
); 